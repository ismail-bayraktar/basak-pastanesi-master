import express from 'express';
import adminAuth from '../middleware/AdminAuth.js';
import {
    createCourier,
    getAllCouriers,
    getCourierById,
    updateCourier,
    deleteCourier,
    assignOrderToCourier,
    getCourierPerformance,
    updateCourierStatus,
    getCouriersForZone
} from '../controllers/CourierManagementController.js';

const courierManagementRouter = express.Router();

// All routes require admin authentication
courierManagementRouter.use(adminAuth);

// CRUD operations
courierManagementRouter.post('/', createCourier);
courierManagementRouter.get('/', getAllCouriers);
courierManagementRouter.get('/:id', getCourierById);
courierManagementRouter.put('/:id', updateCourier);
courierManagementRouter.delete('/:id', deleteCourier);

// Courier-specific operations
courierManagementRouter.post('/assign', assignOrderToCourier);
courierManagementRouter.get('/zone/:zoneId', getCouriersForZone);
courierManagementRouter.get('/:id/performance', getCourierPerformance);
courierManagementRouter.put('/:id/status', updateCourierStatus);

export default courierManagementRouter;

