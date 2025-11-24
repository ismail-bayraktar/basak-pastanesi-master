import mongoose from "mongoose";

const deliveryTimeSlotSchema = new mongoose.Schema({
    label: { type: String, required: true },
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true },   // HH:mm
    isWeekend: { type: Boolean, default: false },
    capacity: { type: Number, default: 0 }
});

const deliveryTimeSlotModel = mongoose.models.delivery_time_slot || mongoose.model("delivery_time_slot", deliveryTimeSlotSchema);

export default deliveryTimeSlotModel;


