import mongoose from "mongoose";

/**
 * WebhookLog Model
 * Logs all incoming webhooks for tracking and debugging
 */

const webhookLogSchema = new mongoose.Schema({
    webhookId: {
        type: String,
        required: true,
        index: true
    },
    platform: {
        type: String,
        required: true,
        index: true
    },
    event: {
        type: String,
        required: true,
        index: true
    },
    orderId: {
        type: String,
        index: true
    },
    courierTrackingId: {
        type: String,
        index: true
    },
    payload: {
        type: Object,
        required: true
    },
    signature: {
        type: String
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending',
        index: true
    },
    statusCode: {
        type: Number
    },
    response: {
        type: Object
    },
    error: {
        type: String
    },
    errorCode: {
        type: String
    },
    retryCount: {
        type: Number,
        default: 0
    },
    processingTime: {
        type: Number // milliseconds
    },
    processedAt: {
        type: Number
    },
    createdAt: {
        type: Number,
        default: Date.now,
        index: true
    }
});

// Indexes for performance
webhookLogSchema.index({ webhookId: 1, platform: 1 });
webhookLogSchema.index({ orderId: 1, createdAt: -1 });
webhookLogSchema.index({ platform: 1, status: 1, createdAt: -1 });
webhookLogSchema.index({ createdAt: -1 });

const webhookLogModel = mongoose.models.webhook_log || mongoose.model("webhook_log", webhookLogSchema);

export default webhookLogModel;

