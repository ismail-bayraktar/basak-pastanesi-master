import mongoose from 'mongoose';

/**
 * DeadLetterQueue Model
 * Stores failed operations that exhausted retry attempts
 * Allows for manual intervention and monitoring
 */

const deadLetterQueueSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: true,
        index: true
    },
    platform: {
        type: String,
        required: true,
        index: true
    },
    operation: {
        type: String,
        enum: ['submit_order', 'update_status', 'cancel_order', 'webhook_process'],
        required: true
    },
    payload: {
        type: Object,
        required: true
    },
    lastError: {
        message: String,
        code: String,
        statusCode: Number,
        timestamp: Number,
        stack: String
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 5
    },
    status: {
        type: String,
        enum: ['pending', 'retrying', 'resolved', 'abandoned', 'manual_review'],
        default: 'pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    createdAt: {
        type: Number,
        default: Date.now,
        index: true
    },
    lastAttemptAt: {
        type: Number,
        index: true
    },
    nextRetryAt: {
        type: Number,
        index: true
    },
    resolvedAt: {
        type: Number
    },
    resolvedBy: {
        type: String // 'system' or admin ID
    },
    resolutionNotes: {
        type: String
    },
    metadata: {
        orderNumber: String,
        customerName: String,
        customerPhone: String,
        amount: Number,
        branchId: String,
        webhookId: String,
        correlationId: String
    },
    tags: [{
        type: String
    }]
});

// Compound indexes for efficient queries
deadLetterQueueSchema.index({ status: 1, createdAt: -1 });
deadLetterQueueSchema.index({ status: 1, platform: 1 });
deadLetterQueueSchema.index({ status: 1, priority: 1, createdAt: 1 });
deadLetterQueueSchema.index({ nextRetryAt: 1, status: 1 });

// Instance methods

/**
 * Mark item for retry
 */
deadLetterQueueSchema.methods.markForRetry = function(delayMs = 60000) {
    this.status = 'retrying';
    this.lastAttemptAt = Date.now();
    this.nextRetryAt = Date.now() + delayMs;
    this.retryCount += 1;
    return this.save();
};

/**
 * Mark as resolved
 */
deadLetterQueueSchema.methods.resolve = function(userId, notes) {
    this.status = 'resolved';
    this.resolvedAt = Date.now();
    this.resolvedBy = userId;
    this.resolutionNotes = notes;
    return this.save();
};

/**
 * Mark as abandoned (won't retry anymore)
 */
deadLetterQueueSchema.methods.abandon = function(reason) {
    this.status = 'abandoned';
    this.resolutionNotes = reason;
    this.resolvedAt = Date.now();
    return this.save();
};

/**
 * Check if eligible for auto-retry
 */
deadLetterQueueSchema.methods.isEligibleForRetry = function() {
    return this.status === 'pending' &&
           this.retryCount < this.maxRetries &&
           (!this.nextRetryAt || this.nextRetryAt <= Date.now());
};

// Static methods

/**
 * Find items ready for retry
 */
deadLetterQueueSchema.statics.findRetryableItems = function(limit = 10) {
    const now = Date.now();
    return this.find({
        status: { $in: ['pending', 'retrying'] },
        $or: [
            { nextRetryAt: { $lte: now } },
            { nextRetryAt: { $exists: false } }
        ]
    })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit);
};

/**
 * Get statistics
 */
deadLetterQueueSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const byPlatform = await this.aggregate([
        {
            $match: { status: 'pending' }
        },
        {
            $group: {
                _id: '$platform',
                count: { $sum: 1 }
            }
        }
    ]);

    const oldestPending = await this.findOne({ status: 'pending' })
        .sort({ createdAt: 1 })
        .select('createdAt');

    return {
        byStatus: stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        byPlatform: byPlatform.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        oldestPendingAge: oldestPending ? Date.now() - oldestPending.createdAt : null,
        total: await this.countDocuments()
    };
};

/**
 * Clean old resolved items
 */
deadLetterQueueSchema.statics.cleanOldItems = function(daysOld = 30) {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    return this.deleteMany({
        status: { $in: ['resolved', 'abandoned'] },
        resolvedAt: { $lt: cutoffDate }
    });
};

// Virtual for age in milliseconds
deadLetterQueueSchema.virtual('age').get(function() {
    return Date.now() - this.createdAt;
});

// Virtual for human-readable age
deadLetterQueueSchema.virtual('ageHuman').get(function() {
    const ageMs = this.age;
    const hours = Math.floor(ageMs / (1000 * 60 * 60));
    const minutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
});

const DeadLetterQueueModel = mongoose.models.dead_letter_queue || mongoose.model('dead_letter_queue', deadLetterQueueSchema);

export default DeadLetterQueueModel;