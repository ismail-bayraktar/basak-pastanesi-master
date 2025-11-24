import orderModel from "../models/OrderModel.js";
import logger from "../utils/logger.js";

// Generate unique tracking ID
const generateTrackingId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid similar chars
    let trackingId = '';
    for (let i = 0; i < 8; i++) {
        trackingId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return trackingId;
};

// Add status to order history
const addStatusHistory = async (orderId, status, location = '', note = '', updatedBy = 'system') => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order) return;

        const historyEntry = {
            status,
            timestamp: Date.now(),
            location,
            note,
            updatedBy
        };

        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();
    } catch (error) {
        logger.error('Error adding status history', { error: error.message, stack: error.stack, orderId });
    }
};

// Request courier pickup - Create courier order
const requestCourierPickup = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        // Generate courier tracking ID
        const courierTrackingId = `CR-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
        
        // Generate public tracking ID if not exists
        if (!order.trackingId) {
            order.trackingId = generateTrackingId();
        }

        // Update courier status
        order.courierStatus = 'yolda';
        order.courierTrackingId = courierTrackingId;
        order.trackingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${order.trackingId}`;

        // Add status history
        await addStatusHistory(orderId, 'Kuryeye Verildi', order.address?.address || '', 'Siparişiniz kuryeye teslim edildi', 'system');

        await order.save();

        res.json({ 
            success: true, 
            courierTrackingId,
            trackingId: order.trackingId,
            trackingLink: order.trackingLink
        });
    } catch (error) {
        logger.error('Error in courier controller', { error: error.message, stack: error.stack, endpoint: req.path, orderId: req.body.orderId });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get order tracking info (public)
const getOrderTracking = async (req, res) => {
    try {
        const { trackingId } = req.params;
        
        const order = await orderModel.findOne({ trackingId });
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            order: {
                id: order._id,
                trackingId: order.trackingId,
                status: order.courierStatus,
                mainStatus: order.status,
                statusHistory: order.statusHistory || [],
                items: order.items,
                address: order.address,
                amount: order.amount,
                date: order.date,
                estimatedDelivery: order.estimatedDelivery,
                actualDelivery: order.actualDelivery
            }
        });
    } catch (error) {
        logger.error('Error in courier controller', { error: error.message, stack: error.stack, endpoint: req.path, orderId: req.body.orderId });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update courier status (webhook from courier service)
const updateCourierStatus = async (req, res) => {
    try {
        const { courierTrackingId, status, location, note } = req.body;

        const order = await orderModel.findOne({ courierTrackingId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update courier status
        order.courierStatus = status;
        
        // Update main status based on courier status
        switch (status) {
            case 'yolda':
                order.status = 'Siparişiniz Yola Çıktı';
                break;
            case 'teslim edildi':
                order.status = 'Teslim Edildi';
                order.actualDelivery = Date.now();
                break;
            case 'iptal':
                order.status = 'İptal Edildi';
                break;
        }

        // Add status history
        await addStatusHistory(order._id, status, location, note, 'courier');

        await order.save();

        res.json({ success: true });
    } catch (error) {
        logger.error('Error in courier controller', { error: error.message, stack: error.stack, endpoint: req.path, orderId: req.body.orderId });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Courier webhook handler (legacy support)
const courierWebhook = updateCourierStatus;

export { requestCourierPickup, courierWebhook, getOrderTracking, updateCourierStatus };
