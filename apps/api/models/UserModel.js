import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String}, // Phone number for SMS notifications
    cartData: {type: Object, default: {}},
    // Favorites/Wishlist
    favorites: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'product'},
        addedAt: {type: Date, default: Date.now}
    }],
    // Loyalty Points
    loyaltyPoints: {type: Number, default: 0},
    loyaltyHistory: [{
        action: {type: String, required: true}, // 'earn', 'redeem', 'expire'
        points: {type: Number, required: true},
        description: {type: String},
        date: {type: Date, default: Date.now}
    }],
    // Address Management
    addresses: [{
        name: {type: String, required: true},
        phone: {type: String, required: true},
        address: {type: String, required: true},
        city: {type: String, required: true},
        district: {type: String},
        zipcode: {type: String},
        isDefault: {type: Boolean, default: false}
    }]
}, {minimize: false})

// Performance indexes
userSchema.index({ phone: 1 });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
