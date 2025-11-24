import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type: String, required: false}, // Optional for guest checkout
    isGuest: {type: Boolean, default: false}, // Flag for guest orders
    items: {type: Array, required: true},
    amount: {type: Number, required: true},
    address: {type: Object, required: true},
    status: {type: String, required: true , default: 'Siparişiniz Alındı'},
    courierStatus: { type: String, default: 'hazırlanıyor' }, // hazırlanıyor | yolda | teslim edildi | iptal
    courierTrackingId: { type: String },
    statusHistory: [{
        status: { type: String, required: true },
        timestamp: { type: Number, default: Date.now },
        location: { type: String },
        note: { type: String },
        updatedBy: { type: String, enum: ['system', 'admin', 'courier'], default: 'system' }
    }],
    estimatedDelivery: { type: Number },
    actualDelivery: { type: Number },
    paymentMethod: {type: String, required: true},
    codFee: { type: Number, default: 0 },
    delivery: {
        zoneId: { type: String },
        timeSlotId: { type: String },
        sameDay: { type: Boolean, default: false }
    },
    payment: { type: Boolean, required: true , default: false },
    date: {type: Number, required:true},
    orderId: {type: String},
    phone: {type: String}, // Customer phone for SMS notifications
    trackingId: { type: String, unique: true }, // Public tracking ID (ABC123)
    trackingLink: { type: String },
    // Branch assignment
    branchId: { type: String },
    branchCode: { type: String },
    assignment: {
        mode: { type: String, enum: ['auto', 'hybrid', 'manual'], default: 'auto' },
        status: { type: String, enum: ['assigned', 'suggested', 'pending'], default: 'assigned' },
        suggestedBranchId: { type: String },
        decidedBy: { type: String, enum: ['system', 'admin'], default: 'system' },
        decidedAt: { type: Number }
    },
    // Order processing timestamps
    preparationStartedAt: { type: Number },
    sentToCourierAt: { type: Number },
    // EsnafExpress integration (DEPRECATED - will be removed in v2.0)
    esnafExpressOrderId: { type: String },

    // Courier integration tracking - MuditaKurye and other platforms
    courierIntegration: {
        platform: {
            type: String,
            enum: ['muditakurye', 'aras', 'yurtici', null],
            default: null
        },
        externalOrderId: {
            type: String, // MuditaKurye's order ID
            index: true
        },
        submittedAt: {
            type: Number // Unix timestamp when submitted to courier
        },
        lastSyncAt: {
            type: Number // Last status sync time
        },
        syncStatus: {
            type: String,
            enum: ['pending', 'synced', 'failed'],
            default: 'pending'
        },
        failureReason: {
            type: String
        },
        retryCount: {
            type: Number,
            default: 0
        },
        metadata: {
            type: Object,
            default: {}
        }
    },

    // MuditaKurye specific fields
    muditaRestaurantId: { type: String }, // Restaurant ID for MuditaKurye
    scheduledDeliveryTime: { type: Date } // For scheduled deliveries
});

// Performance indexes
orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ courierStatus: 1 });
orderSchema.index({ courierTrackingId: 1 });
orderSchema.index({ date: -1 });
orderSchema.index({ payment: 1 });
orderSchema.index({ 'delivery.zoneId': 1 });
orderSchema.index({ branchId: 1 });
orderSchema.index({ branchCode: 1 });

// Courier integration indexes
orderSchema.index({ 'courierIntegration.platform': 1 });
// externalOrderId already has index: true in schema definition
orderSchema.index({ 'courierIntegration.syncStatus': 1 });

// Compound indexes for dashboard performance optimization
// These indexes significantly speed up aggregation queries
orderSchema.index({ 'courierIntegration.platform': 1, 'courierIntegration.syncStatus': 1 }); // Stats by platform+status
orderSchema.index({ date: -1, status: 1 }); // Dashboard stats: orders by date and status
orderSchema.index({ date: -1, amount: 1 }); // Revenue calculations

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;