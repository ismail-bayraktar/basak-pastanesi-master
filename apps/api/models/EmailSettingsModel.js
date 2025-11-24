import mongoose from 'mongoose';

const emailSettingsSchema = new mongoose.Schema(
  {
    // SMTP Configuration
    smtp: {
      enabled: { type: Boolean, default: false },
      host: { type: String, required: true },
      port: { type: Number, required: true, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, required: true },
      password: { type: String, required: true },
      fromName: { type: String, default: 'Başak Pastanesi' },
      fromEmail: { type: String, required: true },
    },

    // Email Triggers - Toggle on/off individually
    triggers: {
      userRegistration: { type: Boolean, default: true },
      orderCreated: { type: Boolean, default: true },
      orderStatusUpdate: { type: Boolean, default: true },
      orderPreparing: { type: Boolean, default: true },
      courierAssigned: { type: Boolean, default: true },
      orderDelivered: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      paymentFailed: { type: Boolean, default: false },
      lowStock: { type: Boolean, default: true },
      newReview: { type: Boolean, default: false },
    },

    // Logging Configuration
    logging: {
      enabled: { type: Boolean, default: true },
      retentionDays: { type: Number, default: 30 }, // How long to keep logs
      logSuccessful: { type: Boolean, default: true },
      logFailed: { type: Boolean, default: true },
    },

    // General Settings
    general: {
      enabled: { type: Boolean, default: true }, // Master on/off switch
      bccAdmin: { type: Boolean, default: false }, // BCC admin on all emails
      adminEmail: { type: String, default: '' },
    },

    // Design Settings for Email Templates
    design: {
      logoUrl: { type: String, default: 'https://basakpastanesi.com/logo.png' },
      brandColor: { type: String, default: '#d4af37' },
      storeName: { type: String, default: 'Başak Pastanesi' },
      storeEmail: { type: String, default: 'info@basakpastanesi.com' },
      storePhone: { type: String, default: '0212 XXX XXXX' },
      fontFamily: { type: String, default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
      // KVKK compliance links
      privacyPolicyUrl: { type: String, default: 'https://basakpastanesi.com/privacy' },
      emailPreferencesUrl: { type: String, default: 'https://basakpastanesi.com/email-preferences' },
      unsubscribeUrl: { type: String, default: 'https://basakpastanesi.com/unsubscribe' },
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB automatically creates a unique index on _id, no need to define it manually
// For singleton pattern, you can use a fixed _id value when creating the document

const EmailSettings = mongoose.model('EmailSettings', emailSettingsSchema);

export default EmailSettings;
