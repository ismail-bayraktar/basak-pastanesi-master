import mongoose from "mongoose";

/**
 * Branch Model
 * Handles Tulumbak branch/shop management
 */
const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true, // E.g., "MENEMEN_LISE", "MENEMEN_6CADDE"
        uppercase: true
    },
    address: {
        street: { type: String, required: true },
        district: { type: String },
        city: { type: String, required: true },
        zipCode: { type: String },
        // Google Maps coordinates (optional)
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String },
        whatsapp: { type: String }
    },
    workingHours: {
        weekdays: {
            start: { type: String, default: '09:00' }, // HH:mm
            end: { type: String, default: '18:00' }
        },
        weekend: {
            start: { type: String, default: '10:00' },
            end: { type: String, default: '16:00' }
        },
        timezone: { type: String, default: 'Europe/Istanbul' }
    },
    assignedZones: [{
        type: String // Delivery zone IDs that this branch serves
    }],
    capacity: {
        dailyOrders: { type: Number, default: 100 },
        activeCouriers: { type: Number, default: 5 }
    },
    settings: {
        autoAssignment: { type: Boolean, default: true },
        hybridMode: { type: Boolean, default: false }, // öner + onay modu
        googleMapsEnabled: { type: Boolean, default: false }
    },
    managerId: {
        type: String, // User ID of branch manager
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    notes: { type: String },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now }
});

// Performance indexes
branchSchema.index({ status: 1 });
branchSchema.index({ 'address.city': 1, 'address.district': 1 });
branchSchema.index({ assignedZones: 1 });

// Update updatedAt before saving
branchSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const branchModel = mongoose.models.branch || mongoose.model("branch", branchSchema);

export default branchModel;

