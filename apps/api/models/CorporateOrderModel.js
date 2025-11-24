import mongoose from "mongoose";

const corporateOrderSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    orderDetails: { type: String, required: true },
    requestedDate: { type: String, required: true },
    estimatedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
    notes: { type: String },
    date: { type: Number, required: true }
});

const corporateOrderModel = mongoose.models.corporate_order || mongoose.model("corporate_order", corporateOrderSchema);

export default corporateOrderModel;

