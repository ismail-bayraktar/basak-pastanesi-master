import mongoose from "mongoose";
import encryptionService from '../utils/encryption.js';

/**
 * WebhookConfig Model
 * Stores webhook configuration for different courier platforms
 * Secret keys are encrypted before storage using AES-256-GCM
 */

const webhookConfigSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    secretKey: {
        type: String,
        required: true
        // Encrypted before save
    },
    webhookUrl: {
        type: String,
        default: process.env.WEBHOOK_BASE_URL || 'https://api.tulumbak.com/api/webhook/courier'
    },
    enabled: {
        type: Boolean,
        default: true
    },
    events: [{
        type: String,
        enum: [
            'order.status.updated',
            'order.delivered',
            'order.failed',
            'order.cancelled',
            'order.assigned',
            'courier.location.updated'
        ]
    }],
    rateLimit: {
        perMinute: {
            type: Number,
            default: 100
        },
        perHour: {
            type: Number,
            default: 1000
        }
    },
    retryConfig: {
        maxRetries: {
            type: Number,
            default: 3
        },
        retryDelay: {
            type: Number,
            default: 1000 // milliseconds
        }
    },
    lastTestAt: {
        type: Number
    },
    lastTestStatus: {
        type: String,
        enum: ['success', 'failed', null],
        default: null
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    updatedAt: {
        type: Number,
        default: Date.now
    }
});

// Encrypt secret key before saving
webhookConfigSchema.pre('save', function(next) {
    try {
        if (this.isModified('secretKey') && this.secretKey) {
            this.secretKey = encryptionService.encrypt(this.secretKey);
        }
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to decrypt secret key
webhookConfigSchema.methods.getDecryptedSecretKey = function() {
    return encryptionService.decrypt(this.secretKey);
};

// Indexes
// Note: platform already has index from unique: true
webhookConfigSchema.index({ enabled: 1 });

const webhookConfigModel = mongoose.models.webhook_config || mongoose.model("webhook_config", webhookConfigSchema);

export default webhookConfigModel;

