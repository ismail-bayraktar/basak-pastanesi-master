import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    // Email Details
    to: { type: String, required: true, index: true },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    textContent: { type: String },

    // Metadata
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
        'manual', // Manually sent from admin
      ],
      required: true,
      index: true,
    },

    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
    templateName: { type: String },

    // Status
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
      index: true,
    },

    // Delivery Info
    messageId: { type: String }, // SMTP message ID
    errorMessage: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },

    // Related Data
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Tracking
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    lastOpenedAt: { type: Date },
    lastClickedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ trigger: 1, status: 1 });
emailLogSchema.index({ to: 1, createdAt: -1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;
