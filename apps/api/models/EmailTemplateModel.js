import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema(
  {
    // Template Identity
    name: { type: String, required: true, unique: true },
    description: { type: String },

    // Template Type
    trigger: {
      type: String,
      enum: [
        'userRegistration',
        'orderCreated',
        'orderStatusUpdate',
        'orderPreparing',
        'courierAssigned',
        'orderDelivered',
        'paymentReceived',
        'paymentFailed',
        'lowStock',
        'newReview',
        'custom',
      ],
      required: true,
      index: true,
    },

    // Email Content
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    textContent: { type: String },

    // Template Variables (placeholders)
    variables: [
      {
        name: { type: String }, // e.g., "orderId", "customerName"
        description: { type: String }, // e.g., "Order number"
        example: { type: String }, // e.g., "#12345"
      },
    ],

    // Design Settings
    design: {
      primaryColor: { type: String, default: '#d4af37' }, // Gold
      secondaryColor: { type: String, default: '#333333' },
      headerImage: { type: String },
      footerText: { type: String, default: 'Tulumbak İzmir Baklava' },
    },

    // Status
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false }, // Can't delete default templates

    // Usage Stats
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default template per trigger
emailTemplateSchema.index({ trigger: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;
