import mongoose from "mongoose";

/**
 * Admin Model
 * Supports multi-admin with role-based access control (RBAC)
 */

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'moderator'], 
    default: 'admin' 
  },
  permissions: [{
    type: String,
    enum: [
      'products:create',
      'products:read',
      'products:update',
      'products:delete',
      'orders:read',
      'orders:update',
      'users:read',
      'users:update',
      'coupons:create',
      'coupons:read',
      'coupons:update',
      'coupons:delete',
      'settings:read',
      'settings:update',
      'reports:read',
      'courier:read',
      'courier:update'
    ]
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;

