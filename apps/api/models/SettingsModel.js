import mongoose from "mongoose";

/**
 * System Settings Model
 * Stores configuration for email, security, stock, and other system settings
 */
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  category: {
    type: String,
    enum: ['email', 'security', 'stock', 'general', 'payment', 'delivery', 'whatsapp', 'media', 'seo', 'social', 'currency'],
    required: true
  },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// Performance indexes
settingsSchema.index({ category: 1 });

const settingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);

export default settingsModel;

