import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String}, // Phone number for SMS notifications
    cartData: {type: Object, default: {}},
}, {minimize: false})

// Performance indexes
userSchema.index({ phone: 1 });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
