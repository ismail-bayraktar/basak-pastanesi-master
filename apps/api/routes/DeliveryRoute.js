import express from 'express';
import adminAuth from "../middleware/AdminAuth.js";
import { createZone, listZones, updateZone, removeZone, createTimeSlot, listTimeSlots, updateTimeSlot, removeTimeSlot, quoteDelivery } from "../controllers/DeliveryController.js";

const deliveryRouter = express.Router();

// Zones
deliveryRouter.get('/zones', adminAuth, listZones);
deliveryRouter.post('/zones', adminAuth, createZone);
deliveryRouter.put('/zones', adminAuth, updateZone);
deliveryRouter.delete('/zones', adminAuth, removeZone);

// TimeSlots
deliveryRouter.get('/timeslots', adminAuth, listTimeSlots);
deliveryRouter.post('/timeslots', adminAuth, createTimeSlot);
deliveryRouter.put('/timeslots', adminAuth, updateTimeSlot);
deliveryRouter.delete('/timeslots', adminAuth, removeTimeSlot);

// Quote (public/frontend)
deliveryRouter.get('/quote', quoteDelivery);

export default deliveryRouter;


