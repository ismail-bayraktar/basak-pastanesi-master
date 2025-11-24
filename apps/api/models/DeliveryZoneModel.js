import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema({
    district: { type: String, required: true, unique: true },
    fee: { type: Number, required: true, default: 0 },
    minOrder: { type: Number, required: true, default: 0 },
    weekendAvailable: { type: Boolean, default: true },
    sameDayAvailable: { type: Boolean, default: false }
});

const deliveryZoneModel = mongoose.models.delivery_zone || mongoose.model("delivery_zone", deliveryZoneSchema);

export default deliveryZoneModel;


