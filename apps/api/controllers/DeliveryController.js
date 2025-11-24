import deliveryZoneModel from "../models/DeliveryZoneModel.js";
import deliveryTimeSlotModel from "../models/DeliveryTimeSlotModel.js";
import logger from "../utils/logger.js";

// Zones CRUD
const createZone = async (req, res) => {
    try {
        const zone = new deliveryZoneModel(req.body);
        await zone.save();
        res.json({ success: true, zone });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

const listZones = async (_req, res) => {
    try {
        const zones = await deliveryZoneModel.find({});
        res.json({ success: true, zones });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateZone = async (req, res) => {
    try {
        const { id, ...payload } = req.body;
        await deliveryZoneModel.findByIdAndUpdate(id, payload);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

const removeZone = async (req, res) => {
    try {
        const { id } = req.body;
        await deliveryZoneModel.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

// TimeSlots CRUD
const createTimeSlot = async (req, res) => {
    try {
        const slot = new deliveryTimeSlotModel(req.body);
        await slot.save();
        res.json({ success: true, slot });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

const listTimeSlots = async (_req, res) => {
    try {
        const slots = await deliveryTimeSlotModel.find({});
        res.json({ success: true, slots });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateTimeSlot = async (req, res) => {
    try {
        const { id, ...payload } = req.body;
        await deliveryTimeSlotModel.findByIdAndUpdate(id, payload);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

const removeTimeSlot = async (req, res) => {
    try {
        const { id } = req.body;
        await deliveryTimeSlotModel.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

// Quote: district & cartTotal & sameDay -> fee or error
const quoteDelivery = async (req, res) => {
    try {
        const { district, cartTotal, sameDay } = req.query;
        const zone = await deliveryZoneModel.findOne({ district });
        if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
        if (Number(cartTotal) < zone.minOrder) return res.status(422).json({ success: false, message: 'Minimum sipariş tutarı altında' });
        if (sameDay === 'true' && !zone.sameDayAvailable) return res.status(422).json({ success: false, message: 'Aynı gün teslimat bu bölge için uygun değil' });
        res.json({ success: true, fee: zone.fee });
    } catch (error) {
        logger.error('Error in delivery controller', { error: error.message, stack: error.stack, endpoint: req.path });
        res.status(500).json({ success: false, message: error.message });
    }
}

export { createZone, listZones, updateZone, removeZone, createTimeSlot, listTimeSlots, updateTimeSlot, removeTimeSlot, quoteDelivery };


