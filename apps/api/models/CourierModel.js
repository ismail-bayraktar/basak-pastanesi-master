import mongoose from "mongoose";

/**
 * Courier Model
 * Handles courier management with performance tracking
 */

const courierSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String,
        trim: true,
        lowercase: true
    },
    vehicleType: { 
        type: String, 
        enum: ['motor', 'araba', 'bisiklet', 'yaya'],
        default: 'motor'
    },
    vehiclePlate: { 
        type: String,
        trim: true
    },
    status: { 
        type: String,
        enum: ['active', 'inactive', 'busy', 'offline'],
        default: 'active'
    },
    workSchedule: {
        startTime: { type: String, default: '09:00' }, // HH:mm format
        endTime: { type: String, default: '18:00' },
        days: [{ 
            type: String, 
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }]
    },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        lastUpdate: { type: Number }
    },
    performance: {
        totalDeliveries: { type: Number, default: 0 },
        successfulDeliveries: { type: Number, default: 0 },
        averageDeliveryTime: { type: Number, default: 0 }, // in minutes
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalEarnings: { type: Number, default: 0 }
    },
    activeOrders: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'order' 
    }],
    assignedZones: [{
        type: String // Delivery zone IDs that this courier services
    }],
    notes: { type: String },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now }
});

// Performance indexes
courierSchema.index({ phone: 1 });
courierSchema.index({ status: 1 });
courierSchema.index({ vehicleType: 1 });

// Update updatedAt before saving
courierSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const courierModel = mongoose.models.courier || mongoose.model("courier", courierSchema);

export default courierModel;

