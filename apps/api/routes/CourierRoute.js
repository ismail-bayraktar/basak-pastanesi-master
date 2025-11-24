import express from 'express';
import { requestCourierPickup, courierWebhook, getOrderTracking, updateCourierStatus } from "../controllers/CourierController.js";
import adminAuth from "../middleware/AdminAuth.js";

const courierRouter = express.Router();

// Public: Get order tracking (no auth required)
courierRouter.get('/track/:trackingId', getOrderTracking);

// Admin: Request courier pickup
courierRouter.post('/request-pickup', adminAuth, requestCourierPickup);

// Courier service: Status update webhook
courierRouter.post('/webhook', updateCourierStatus);

// Legacy support
courierRouter.post('/update-status', updateCourierStatus);

/**
 * @swagger
 * /api/courier/track/{trackingId}:
 *   get:
 *     summary: Get order tracking by tracking ID
 *     tags: [Courier]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order tracking ID
 *     responses:
 *       200:
 *         description: Order tracking information
 *       404:
 *         description: Order not found
 */
courierRouter.get('/track/:trackingId', getOrderTracking);

export default courierRouter;


