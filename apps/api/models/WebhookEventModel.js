import mongoose from 'mongoose';

/**
 * WebhookEvent Model
 * Tracks outgoing webhook deliveries to external systems
 * Used for monitoring, debugging, and retry management
 */

const webhookEventSchema = new mongoose.Schema({
    // Webhook subscription reference
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebhookConfig',
        required: true,
        index: true
    },

    // Event details
    eventType: {
        type: String,
        required: true,
        enum: [
            'order.created',
            'order.updated',
            'order.status_changed',
            'order.completed',
            'order.cancelled',
            'order.failed',
            'courier.assigned',
            'courier.pickup',
            'courier.delivered',
            'courier.failed',
            'payment.completed',
            'payment.failed',
            'refund.initiated',
            'refund.completed'
        ],
        index: true
    },

    // Related entity
    entityType: {
        type: String,
        required: true,
        enum: ['order', 'courier', 'payment', 'refund'],
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    // Webhook target
    url: {
        type: String,
        required: true
    },

    // Request details
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    headers: {
        type: Map,
        of: String,
        default: {}
    },
    method: {
        type: String,
        default: 'POST',
        enum: ['POST', 'PUT', 'PATCH']
    },

    // Security
    signature: {
        type: String,
        required: true
    },
    signatureMethod: {
        type: String,
        default: 'HMAC-SHA256',
        enum: ['HMAC-SHA256', 'HMAC-SHA512']
    },

    // Delivery status
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'sending', 'delivered', 'failed', 'cancelled'],
        index: true
    },

    // Response details
    response: {
        statusCode: Number,
        headers: Map,
        body: String,
        receivedAt: Date
    },

    // Error tracking
    error: {
        message: String,
        code: String,
        stack: String,
        timestamp: Date
    },

    // Retry management
    retryCount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxRetries: {
        type: Number,
        default: 5,
        min: 0,
        max: 10
    },
    nextRetryAt: {
        type: Date,
        index: true
    },

    // Timing
    scheduledAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    failedAt: {
        type: Date
    },

    // Duration tracking
    requestDuration: {
        type: Number, // milliseconds
        min: 0
    },

    // Metadata
    metadata: {
        platform: String,
        branchId: mongoose.Schema.Types.ObjectId,
        correlationId: String,
        userAgent: String,
        serverInstance: String
    },

    // Idempotency
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    }
}, {
    timestamps: true,
    collection: 'webhook_events'
});

// Indexes for efficient queries
webhookEventSchema.index({ status: 1, nextRetryAt: 1 }); // For retry processor
webhookEventSchema.index({ eventType: 1, createdAt: -1 }); // For event filtering
webhookEventSchema.index({ entityType: 1, entityId: 1 }); // For entity lookup
webhookEventSchema.index({ subscriptionId: 1, status: 1 }); // For subscription analytics
webhookEventSchema.index({ createdAt: -1 }); // For recent events
webhookEventSchema.index({ 'metadata.correlationId': 1 }); // For correlation tracking

// TTL index - automatically delete delivered events after 30 days
webhookEventSchema.index(
    { deliveredAt: 1 },
    {
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
        partialFilterExpression: { status: 'delivered' }
    }
);

// Instance methods

/**
 * Mark event as sending
 */
webhookEventSchema.methods.markAsSending = function() {
    this.status = 'sending';
    this.sentAt = new Date();
    return this.save();
};

/**
 * Mark event as delivered
 */
webhookEventSchema.methods.markAsDelivered = function(response) {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    this.response = {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body?.substring(0, 1000), // Limit body size
        receivedAt: new Date()
    };

    if (this.sentAt) {
        this.requestDuration = Date.now() - this.sentAt.getTime();
    }

    return this.save();
};

/**
 * Mark event as failed
 */
webhookEventSchema.methods.markAsFailed = function(error, response = null) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.error = {
        message: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN',
        stack: error.stack,
        timestamp: new Date()
    };

    if (response) {
        this.response = {
            statusCode: response.statusCode,
            headers: response.headers,
            body: response.body?.substring(0, 1000),
            receivedAt: new Date()
        };
    }

    if (this.sentAt) {
        this.requestDuration = Date.now() - this.sentAt.getTime();
    }

    return this.save();
};

/**
 * Schedule next retry
 */
webhookEventSchema.methods.scheduleRetry = function(delay) {
    this.retryCount += 1;
    this.nextRetryAt = new Date(Date.now() + delay);
    this.status = 'pending';
    return this.save();
};

/**
 * Check if event can be retried
 */
webhookEventSchema.methods.canRetry = function() {
    return this.retryCount < this.maxRetries &&
           this.status !== 'delivered' &&
           this.status !== 'cancelled';
};

/**
 * Cancel event delivery
 */
webhookEventSchema.methods.cancel = function(reason) {
    this.status = 'cancelled';
    this.error = {
        message: reason || 'Delivery cancelled',
        code: 'CANCELLED',
        timestamp: new Date()
    };
    return this.save();
};

// Static methods

/**
 * Find events ready for retry
 */
webhookEventSchema.statics.findReadyForRetry = function(limit = 100) {
    return this.find({
        status: 'pending',
        nextRetryAt: { $lte: new Date() }
    })
    .sort({ nextRetryAt: 1 })
    .limit(limit);
};

/**
 * Get delivery statistics for a subscription
 */
webhookEventSchema.statics.getStatsBySubscription = async function(subscriptionId, days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return await this.aggregate([
        {
            $match: {
                subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
                createdAt: { $gte: cutoff }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgDuration: { $avg: '$requestDuration' }
            }
        }
    ]);
};

/**
 * Get recent failed events
 */
webhookEventSchema.statics.getRecentFailures = function(limit = 50) {
    return this.find({ status: 'failed' })
        .sort({ failedAt: -1 })
        .limit(limit)
        .populate('subscriptionId', 'name url platform');
};

/**
 * Clean up old events
 */
webhookEventSchema.statics.cleanOldEvents = async function(daysOld = 90) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await this.deleteMany({
        createdAt: { $lt: cutoff },
        status: { $in: ['delivered', 'cancelled', 'failed'] }
    });

    return result;
};

/**
 * Get event timeline for an entity
 */
webhookEventSchema.statics.getEntityTimeline = function(entityType, entityId) {
    return this.find({
        entityType,
        entityId: new mongoose.Types.ObjectId(entityId)
    })
    .sort({ createdAt: -1 })
    .select('eventType status createdAt deliveredAt response.statusCode error.message')
    .lean();
};

const WebhookEventModel = mongoose.model('WebhookEvent', webhookEventSchema);

export default WebhookEventModel;
