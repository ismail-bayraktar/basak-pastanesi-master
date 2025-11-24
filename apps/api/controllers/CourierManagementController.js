import courierModel from '../models/CourierModel.js';
import orderModel from '../models/OrderModel.js';
import logger from '../utils/logger.js';

/**
 * Create a new courier
 */
const createCourier = async (req, res) => {
    try {
        const { name, phone, email, vehicleType, vehiclePlate, workSchedule } = req.body;

        // Validation
        if (!name || !phone) {
            return res.json({ success: false, message: 'Name and phone are required' });
        }

        // Check if phone already exists
        const existingCourier = await courierModel.findOne({ phone });
        if (existingCourier) {
            return res.json({ success: false, message: 'Phone number already registered' });
        }

        const newCourier = new courierModel({
            name,
            phone,
            email: email || '',
            vehicleType: vehicleType || 'motor',
            vehiclePlate: vehiclePlate || '',
            status: 'active',
            workSchedule: workSchedule || {
                startTime: '09:00',
                endTime: '18:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
        });

        await newCourier.save();

        res.json({ 
            success: true, 
            message: 'Courier created successfully',
            courier: newCourier
        });
    } catch (error) {
        logger.error('Error creating courier', { error: error.message, stack: error.stack, body: req.body });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all couriers
 */
const getAllCouriers = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const couriers = await courierModel.find(query).sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            couriers,
            count: couriers.length
        });
    } catch (error) {
        logger.error('Error fetching couriers', { error: error.message, stack: error.stack, query: req.query });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get courier by ID
 */
const getCourierById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const courier = await courierModel.findById(id);
        
        if (!courier) {
            return res.json({ success: false, message: 'Courier not found' });
        }

        res.json({ success: true, courier });
    } catch (error) {
        logger.error('Error fetching courier', { error: error.message, stack: error.stack, courierId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update courier
 */
const updateCourier = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const courier = await courierModel.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!courier) {
            return res.json({ success: false, message: 'Courier not found' });
        }

        res.json({ 
            success: true, 
            message: 'Courier updated successfully',
            courier
        });
    } catch (error) {
        logger.error('Error updating courier', { error: error.message, stack: error.stack, courierId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete courier
 */
const deleteCourier = async (req, res) => {
    try {
        const { id } = req.params;

        const courier = await courierModel.findByIdAndDelete(id);

        if (!courier) {
            return res.json({ success: false, message: 'Courier not found' });
        }

        // Remove courier from any active orders
        await orderModel.updateMany(
            { courierTrackingId: { $exists: true } },
            { $set: { courierStatus: 'iptal' } }
        );

        res.json({ success: true, message: 'Courier deleted successfully' });
    } catch (error) {
        logger.error('Error deleting courier', { error: error.message, stack: error.stack, courierId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Assign order to courier
 */
const assignOrderToCourier = async (req, res) => {
    try {
        const { courierId, orderId } = req.body;

        if (!courierId || !orderId) {
            return res.json({ success: false, message: 'Courier ID and Order ID are required' });
        }

        // Find courier and order
        const courier = await courierModel.findById(courierId);
        const order = await orderModel.findById(orderId);

        if (!courier || !order) {
            return res.json({ success: false, message: 'Courier or order not found' });
        }

        // Check if courier is available
        if (courier.status !== 'active') {
            return res.json({ success: false, message: 'Courier is not available' });
        }

        // Zone-based validation: Check if courier serves the order's delivery zone
        if (order.delivery?.zoneId && courier.assignedZones && courier.assignedZones.length > 0) {
            if (!courier.assignedZones.includes(order.delivery.zoneId)) {
                return res.json({ 
                    success: false, 
                    message: `This courier does not serve the delivery zone for this order. Please assign a courier that serves the selected zone.` 
                });
            }
        }

        // Update order
        order.courierTrackingId = `CR-${courierId.slice(-6)}`;
        order.courierStatus = 'yolda';
        await order.save();

        // Update courier
        if (!courier.activeOrders.includes(orderId)) {
            courier.activeOrders.push(orderId);
        }
        if (courier.status === 'active') {
            courier.status = 'busy';
        }
        courier.performance.totalDeliveries += 1;
        await courier.save();

        // Add status history
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
            status: 'Kurye Ata',
            timestamp: Date.now(),
            location: '',
            note: `Assigned to courier: ${courier.name}`,
            updatedBy: 'admin'
        });
        await order.save();

        res.json({ 
            success: true, 
            message: 'Order assigned to courier successfully',
            order,
            courier
        });
    } catch (error) {
        logger.error('Error assigning order to courier', { error: error.message, stack: error.stack, courierId: req.body.courierId, orderId: req.body.orderId });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get courier performance
 */
const getCourierPerformance = async (req, res) => {
    try {
        const { id } = req.params;

        const courier = await courierModel.findById(id);
        
        if (!courier) {
            return res.json({ success: false, message: 'Courier not found' });
        }

        // Get active orders
        const activeOrders = await orderModel.find({
            _id: { $in: courier.activeOrders }
        });

        res.json({ 
            success: true, 
            performance: courier.performance,
            activeOrders: activeOrders.length,
            activeOrdersList: activeOrders
        });
    } catch (error) {
        logger.error('Error fetching courier performance', { error: error.message, stack: error.stack, courierId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update courier status
 */
const updateCourierStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'busy', 'offline'].includes(status)) {
            return res.json({ success: false, message: 'Invalid status' });
        }

        const courier = await courierModel.findByIdAndUpdate(
            id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!courier) {
            return res.json({ success: false, message: 'Courier not found' });
        }

        res.json({ 
            success: true, 
            message: 'Courier status updated',
            courier
        });
    } catch (error) {
        logger.error('Error updating courier status', { error: error.message, stack: error.stack, courierId: req.params.id, status: req.body.status });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get couriers available for a specific delivery zone
 */
const getCouriersForZone = async (req, res) => {
    try {
        const { zoneId } = req.params;

        // Find couriers that either:
        // 1. Are assigned to this zone
        // 2. Have no assigned zones (universal)
        const couriers = await courierModel.find({
            status: 'active',
            $or: [
                { assignedZones: { $in: [zoneId] } },
                { assignedZones: { $size: 0 } },
                { assignedZones: { $exists: false } }
            ]
        });

        res.json({ 
            success: true, 
            couriers,
            count: couriers.length
        });
    } catch (error) {
        logger.error('Error fetching couriers for zone', { error: error.message, stack: error.stack, zoneId: req.params.zoneId });
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    createCourier,
    getAllCouriers,
    getCourierById,
    updateCourier,
    deleteCourier,
    assignOrderToCourier,
    getCourierPerformance,
    updateCourierStatus,
    getCouriersForZone
};

