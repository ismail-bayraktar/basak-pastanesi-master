import orderModel from "../models/OrderModel.js";
import userModel from "../models/UserModel.js";
import deliveryZoneModel from "../models/DeliveryZoneModel.js";
import branchModel from "../models/BranchModel.js";
import { reduceStock, checkLowStockAlert } from "../middleware/StockCheck.js";
import AssignmentService, { assignBranch, suggestBranch } from "../services/AssignmentService.js";
import settingsModel from "../models/SettingsModel.js";
import CourierIntegrationService from "../services/CourierIntegrationService.js";
import eventEmitter from "../utils/eventEmitter.js";
import logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { placeOrderSchema, updateStatusSchema, assignBranchSchema, orderIdSchema } from "../schemas/orderSchema.js";

// Generate unique tracking ID
const generateTrackingId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
        logger.error('Error adding status history', { error: error.message, orderId, stack: error.stack });
    }
};

// placing orders using cod method
const placeOrder = async (req, res) => {
    try {
        const validation = placeOrderSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { userId, items, amount, address, paymentMethod, delivery, codFee, giftNote, isGuest } = validation.data;

        // Validate delivery zone if provided
        if (delivery?.zoneId) {
            const zone = await deliveryZoneModel.findById(delivery.zoneId);
            if (!zone) {
                return errorResponse(res, 'Seçilen teslimat bölgesi geçersiz', 400);
            }

            // Validate minimum order amount
            if (Number(amount) < zone.minOrder) {
                return errorResponse(res, `Bu bölgeye teslimat için minimum ${zone.minOrder}₺ tutarında sipariş gerekiyor. Sepetiniz toplamı: ${amount}₺`, 400);
            }

            // Validate same day delivery availability
            if (delivery.sameDay && !zone.sameDayAvailable) {
                return errorResponse(res, 'Bu bölge için aynı gün teslimat mevcut değil', 400);
            }
        }

        // Generate tracking ID
        const trackingId = generateTrackingId();
        const trackingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${trackingId}`;

        // Get branch assignment settings
        let assignmentMode = 'auto';
        let assignmentEnabled = true;
        try {
            const assignmentEnabledSetting = await settingsModel.findOne({ key: 'branch_assignment_enabled' });
            const assignmentModeSetting = await settingsModel.findOne({ key: 'branch_assignment_mode' });

            if (assignmentEnabledSetting) {
                assignmentEnabled = assignmentEnabledSetting.value !== false;
            }
            if (assignmentModeSetting && ['auto', 'hybrid', 'manual'].includes(assignmentModeSetting.value)) {
                assignmentMode = assignmentModeSetting.value;
            }
        } catch (error) {
            logger.warn('Error reading branch assignment settings', { error: error.message });
        }

        // Find best branch (suggestion or direct assignment)
        let bestBranch = assignmentEnabled ? await AssignmentService.findBestBranch({ delivery, address }) : null;

        // FALLBACK: If no branch found, use default branch (BASAK_PASTANESI_MAIN)
        if (!bestBranch) {
            try {
                bestBranch = await branchModel.findOne({ code: 'BASAK_PASTANESI_MAIN', status: 'active' });
                if (bestBranch) {
                    logger.info('Using default branch for new order', { branchCode: 'BASAK_PASTANESI_MAIN' });
                }
            } catch (error) {
                logger.warn('Could not find default branch', { error: error.message });
            }
        }

        // Build assignment object based on mode
        let assignmentObj = {};
        let branchAssignment = {};

        if (bestBranch) {
            if (assignmentMode === 'auto') {
                branchAssignment = {
                    branchId: bestBranch._id.toString(),
                    branchCode: bestBranch.code
                };
                assignmentObj = {
                    mode: 'auto',
                    status: 'assigned',
                    decidedBy: 'system',
                    decidedAt: Date.now()
                };
            } else if (assignmentMode === 'hybrid') {
                assignmentObj = {
                    mode: 'hybrid',
                    status: 'suggested',
                    suggestedBranchId: bestBranch._id.toString(),
                    decidedBy: 'system'
                };
            } else if (assignmentMode === 'manual') {
                assignmentObj = {
                    mode: 'manual',
                    status: 'pending',
                    suggestedBranchId: bestBranch._id.toString(),
                    decidedBy: 'system'
                };
            }
        }

        const orderData = {
            ...(userId && { userId }), // Only include userId if authenticated
            isGuest: isGuest || !userId,
            items,
            address,
            amount,
            paymentMethod: paymentMethod || "KAPIDA",
            payment: false,
            date: Date.now(),
            delivery: delivery || {},
            codFee: Number(codFee || 0),
            giftNote,
            trackingId,
            trackingLink,
            ...branchAssignment,
            ...(Object.keys(assignmentObj).length > 0 ? { assignment: assignmentObj } : {}),
            statusHistory: [{
                status: 'Siparişiniz Alındı',
                timestamp: Date.now(),
                location: address?.address || '',
                note: bestBranch
                    ? (assignmentMode === 'auto'
                        ? `Siparişiniz ${bestBranch.name} şubesine atandı`
                        : `Önerilen şube: ${bestBranch.name}`)
                    : 'Siparişiniz sisteme kaydedildi',
                updatedBy: 'system'
            }]
        }

        const newOrder = new orderModel(orderData);

        // Reduce stock for all items
        await reduceStock(items);

        await newOrder.save();

        // Clear cart only for authenticated users
        if (userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        // Check for low stock alerts
        for (const item of items) {
            await checkLowStockAlert(item.id);
        }

        // Get user data or use guest info from address
        const user = userId ? await userModel.findById(userId) : null;

        // Determine email and phone for notifications
        const notificationEmail = user?.email || address?.email;
        const notificationPhone = user?.phone || address?.phone;

        // Send notifications
        // Email notification
        if (notificationEmail) {
            const { default: emailService } = await import("../services/EmailService.js");
            await emailService.sendOrderConfirmation(
                { ...orderData, orderId: newOrder._id.toString() },
                notificationEmail
            );
        }

        // SMS notification
        if (notificationPhone && process.env.SMS_ENABLED === 'true') {
            const { default: smsService } = await import("../services/SmsService.js");
            await smsService.sendOrderConfirmation(notificationPhone, {
                ...orderData,
                orderId: newOrder._id.toString(),
                trackingLink
            });
        }

        // Emit order created event for real-time notification to admin panel
        try {
            eventEmitter.emit('order:created', newOrder);
            logger.info('Order created event emitted', { orderId: newOrder._id });
        } catch (eventError) {
            logger.error('Error emitting order created event', {
                error: eventError.message,
                orderId: newOrder._id
            });
            // Don't fail the order creation if event emission fails
        }

        successResponse(res, { order: newOrder, trackingId, trackingLink });
    } catch (error) {
        logger.error('Error placing order', { error: error.message, stack: error.stack, userId: req.body.userId });
        errorResponse(res, error.message);
    }
}

// all order data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        successResponse(res, { orders });
    } catch (error) {
        logger.error('Error fetching all orders', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
}

// user order data for frontend (my orders page)
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return errorResponse(res, "User ID is required", 400);
        }
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        successResponse(res, { orders });
    } catch (error) {
        logger.error('Error fetching user orders', { error: error.message, stack: error.stack, userId: req.body.userId });
        errorResponse(res, error.message);
    }
}

// update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const validation = updateStatusSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { orderId, status } = validation.data;

        // Get order before update
        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, "Order not found", 404);
        }

        // Add to status history
        await addStatusHistory(orderId, status, order.address?.address || '', `Durum güncellendi: ${status}`, 'admin');

        await orderModel.findByIdAndUpdate(orderId, { status });

        // Get user data
        const user = await userModel.findById(order.userId);

        if (user) {
            // Email notifications
            if (user.email) {
                const { default: emailService } = await import("../services/EmailService.js");

                await emailService.sendOrderStatusUpdate(
                    { ...order.toObject(), orderId: order._id.toString() },
                    status,
                    user.email
                );

                // Send special emails based on status
                if (status === 'Hazırlanıyor') {
                    await emailService.sendCourierAssignment(
                        { ...order.toObject(), orderId: order._id.toString() },
                        user.email
                    );
                } else if (status === 'Teslim Edildi') {
                    await emailService.sendDeliveryCompleted(
                        { ...order.toObject(), orderId: order._id.toString() },
                        user.email
                    );
                }
            }

            // SMS notifications
            if (user.phone && process.env.SMS_ENABLED === 'true') {
                const { default: smsService } = await import("../services/SmsService.js");

                // Send SMS based on status
                if (status === 'Hazırlanıyor') {
                    await smsService.sendCourierAssigned(user.phone, {
                        ...order.toObject(),
                        orderId: order._id.toString()
                    });
                } else if (status === 'Teslim Edildi') {
                    await smsService.sendDeliveryCompleted(user.phone, order._id.toString());
                } else {
                    await smsService.sendOrderStatusUpdate(
                        user.phone,
                        status,
                        order._id.toString()
                    );
                }
            }
        }

        successResponse(res, null, "Order status successfully updated");
    } catch (error) {
        logger.error('Error updating order status', { error: error.message, stack: error.stack, orderId: req.body.orderId });
        errorResponse(res, error.message);
    }
}

// Bank info (havale/EFT)
const bankInfo = async (_req, res) => {
    try {
        logger.info('Bank info requested');
        successResponse(res, {
            bank: {
                iban: process.env.BANK_IBAN || 'TR00 0000 0000 0000 0000 0000 00',
                accountName: process.env.BANK_ACCOUNT_NAME || 'Basak Pastanesi Gıda',
                bankName: process.env.BANK_NAME || 'Banka'
            }
        });
    } catch (error) {
        logger.error('Error getting bank info', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
}

// Get order status by ID
const getOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        successResponse(res, {
            status: order.status || order.courierStatus,
            lastUpdate: order.statusHistory?.[order.statusHistory.length - 1] || {},
            nextSteps: getNextSteps(order.status || order.courierStatus)
        });
    } catch (error) {
        logger.error('Error getting order status', { error: error.message, stack: error.stack, orderId: req.params.orderId });
        errorResponse(res, error.message);
    }
};

// Get order history
const getOrderHistory = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        successResponse(res, {
            history: order.statusHistory || []
        });
    } catch (error) {
        logger.error('Error getting order history', { error: error.message, stack: error.stack, orderId: req.params.orderId });
        errorResponse(res, error.message);
    }
};

// Get order timeline
const getOrderTimeline = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        const statusSteps = [
            { status: 'Siparişiniz Alındı', completed: false, current: false },
            { status: 'Siparişiniz Hazırlanıyor', completed: false, current: false },
            { status: 'Kuryeye Verildi', completed: false, current: false },
            { status: 'Siparişiniz Yola Çıktı', completed: false, current: false },
            { status: 'Teslim Edildi', completed: false, current: false }
        ];

        const history = order.statusHistory || [];
        const completedSteps = [];
        let currentStep = null;

        statusSteps.forEach((step, index) => {
            const found = history.find(h => h.status === step.status);
            if (found) {
                completedSteps.push(step);
                step.completed = true;

                // Find current step (last completed)
                if (!currentStep || (found.timestamp > (currentStep.timestamp || 0))) {
                    currentStep = { ...step, index, found };
                }
            }
        });

        // Set current step
        if (currentStep && statusSteps[currentStep.index + 1]) {
            statusSteps[currentStep.index + 1].current = true;
        }

        successResponse(res, {
            completedSteps: completedSteps.length,
            currentStep: currentStep ? currentStep.status : statusSteps[0].status,
            upcomingSteps: statusSteps.filter(s => !s.completed && !s.current),
            timeline: statusSteps
        });
    } catch (error) {
        logger.error('Error getting order timeline', { error: error.message, stack: error.stack, orderId: req.params.orderId });
        errorResponse(res, error.message);
    }
};

// Helper function for next steps
const getNextSteps = (status) => {
    const steps = {
        'Siparişiniz Alındı': ['Siparişiniz Hazırlanıyor', 'Siparişiniz Kuryeye Verilecek'],
        'Siparişiniz Hazırlanıyor': ['Kuryeye Verildi', 'Teslim İçin Hazır'],
        'Kuryeye Verildi': ['Yola Çıkacak', 'Teslim Edilecek'],
        'Siparişiniz Yola Çıktı': ['Teslim Edilecek', 'Müşteriye Ulaşacak'],
        'Teslim Edildi': []
    };
    return steps[status] || [];
};

// Assign branch to order
const assignBranchToOrder = async (req, res) => {
    try {
        const validation = assignBranchSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { orderId, branchId } = validation.data;

        const result = await assignBranch(orderId, branchId);

        if (result.success) {
            // Add status history
            await addStatusHistory(orderId, 'Şube Atandı', '', result.message, 'admin');
            successResponse(res, { branch: result.branch }, result.message);
        } else {
            errorResponse(res, result.message, 400);
        }
    } catch (error) {
        logger.error('Error assigning branch to order', { error: error.message, stack: error.stack, orderId: req.body.orderId, branchId: req.body.branchId });
        errorResponse(res, error.message);
    }
};

// Get branch suggestion for order
const getBranchSuggestion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, "Order ID is required", 400);
        }

        const result = await suggestBranch(id);

        if (result.success) {
            successResponse(res, { branch: result.branch });
        } else {
            errorResponse(res, result.message, 400);
        }
    } catch (error) {
        logger.error('Error getting branch suggestion', { error: error.message, stack: error.stack, orderId: req.params.id });
        errorResponse(res, error.message);
    }
};

// Prepare order (mark as preparing)
const prepareOrder = async (req, res) => {
    try {
        const validation = orderIdSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { orderId } = validation.data;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        // Validate: must have branch assigned
        if (!order.branchId) {
            return errorResponse(res, 'Order must have a branch assigned before preparation', 400);
        }

        // Validate: status must be 'Siparişiniz Alındı' or 'Hazırlanıyor'
        if (order.status !== 'Siparişiniz Alındı' && order.status !== 'Hazırlanıyor') {
            return errorResponse(res, `Cannot prepare order with status: ${order.status}`, 400);
        }

        order.status = 'Hazırlanıyor';
        order.preparationStartedAt = order.preparationStartedAt || Date.now();

        await addStatusHistory(orderId, 'Hazırlanıyor', '', 'Sipariş hazırlanmaya başlandı', 'admin');
        await order.save();

        successResponse(res, { order }, 'Order marked as preparing');
    } catch (error) {
        logger.error('Error preparing order', { error: error.message, stack: error.stack, orderId: req.body.orderId });
        errorResponse(res, error.message);
    }
};

// Send order to courier
const sendToCourier = async (req, res) => {
    try {
        const validation = orderIdSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { orderId } = validation.data;

        logger.info('🚚 sendToCourier - Request received', { orderId, body: req.body });

        const order = await orderModel.findById(orderId);
        if (!order) {
            logger.warn('❌ sendToCourier - Order not found', { orderId });
            return errorResponse(res, 'Order not found', 404);
        }

        logger.info('📋 sendToCourier - Order details', {
            orderId,
            orderNumber: order.orderNumber,
            status: order.status,
            branchId: order.branchId,
            courierStatus: order.courierStatus,
            hasAddress: !!order.address
        });

        // Validate: must have branch assigned
        if (!order.branchId) {
            logger.warn('❌ sendToCourier - No branch assigned', { orderId });
            return errorResponse(res, 'Order must have a branch assigned before sending to courier', 400);
        }

        // Validate: status must be 'Hazırlanıyor'
        if (order.status !== 'Hazırlanıyor') {
            logger.warn('❌ sendToCourier - Invalid status', {
                orderId,
                currentStatus: order.status,
                requiredStatus: 'Hazırlanıyor'
            });
            return errorResponse(res, `Order must be in 'Hazırlanıyor' status. Current status: ${order.status}`, 400);
        }

        // Update order status
        order.status = 'Kuryeye Verildi';
        order.courierStatus = 'yolda';
        order.sentToCourierAt = Date.now();

        // Generate courier tracking ID if not exists
        if (!order.courierTrackingId) {
            order.courierTrackingId = `CR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        }

        // Initialize CourierIntegrationService if not done
        await CourierIntegrationService.initialize();

        // Submit order to courier platform (MuditaKurye)
        const courierResult = await CourierIntegrationService.submitOrder(orderId);

        if (courierResult.success) {
            // Order successfully submitted to courier
            order.courierIntegration = order.courierIntegration || {};
            order.courierIntegration.externalOrderId = courierResult.externalOrderId;
            order.courierIntegration.platform = courierResult.platform;
            order.courierIntegration.submittedAt = Date.now();
            order.courierIntegration.syncStatus = 'synced';

            logger.info('Order successfully submitted to courier', {
                orderId,
                externalOrderId: courierResult.externalOrderId,
                platform: courierResult.platform
            });

            await addStatusHistory(orderId, 'Kuryeye Verildi', '',
                `Sipariş ${courierResult.platform} sistemine başarıyla gönderildi`, 'admin');
        } else {
            // Failed to submit to courier, but continue with local status update
            logger.warn('Failed to submit order to courier platform', {
                orderId,
                error: courierResult.error,
                retryable: courierResult.retryable
            });

            await addStatusHistory(orderId, 'Kuryeye Verildi', '',
                'Sipariş kuryeye teslim edildi (manuel gönderim gerekebilir)', 'admin');
        }

        await order.save();

        // Emit courier assigned event for real-time notification
        try {
            eventEmitter.emit('order:courierAssigned', order);
            logger.info('Courier assigned event emitted', { orderId: order._id });
        } catch (eventError) {
            logger.error('Error emitting courier assigned event', {
                error: eventError.message,
                orderId: order._id
            });
        }

        successResponse(res, {
            order,
            courierTrackingId: order.courierTrackingId,
            courierIntegration: courierResult
        }, 'Order sent to courier');
    } catch (error) {
        logger.error('Error sending order to courier', { error: error.message, stack: error.stack, orderId: req.body.orderId });
        errorResponse(res, error.message);
    }
};

// Approve suggested branch assignment (hybrid mode)
const approveBranchAssignment = async (req, res) => {
    try {
        const validation = orderIdSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { orderId } = validation.data;
        const order = await orderModel.findById(orderId);
        if (!order) return errorResponse(res, 'Order not found', 404);

        if (order.assignment?.mode !== 'hybrid' || order.assignment?.status !== 'suggested') {
            return errorResponse(res, 'This order has no pending suggestion', 400);
        }

        const branchId = order.assignment.suggestedBranchId;
        if (!branchId) return errorResponse(res, 'Suggested branch not found', 404);

        order.branchId = branchId;
        order.branchCode = order.branchCode || undefined; // keep if set later
        order.assignment.status = 'assigned';
        order.assignment.decidedBy = 'admin';
        order.assignment.decidedAt = Date.now();

        await order.save();
        await addStatusHistory(orderId, order.status || 'Siparişiniz Alındı', order.address?.address || '', 'Önerilen şube onaylandı', 'admin');

        successResponse(res, { order }, 'Branch assignment approved');
    } catch (error) {
        logger.error('Error approving branch assignment', { error: error.message, stack: error.stack, orderId: req.body.orderId });
        errorResponse(res, error.message);
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const validation = orderIdSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { orderId } = validation.data;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        // Delete the order
        await orderModel.findByIdAndDelete(orderId);

        logger.info('Order deleted successfully', { orderId, orderNumber: order._id });

        successResponse(res, { orderId }, 'Sipariş başarıyla silindi');
    } catch (error) {
        logger.error('Error deleting order', {
            error: error.message,
            stack: error.stack,
            orderId: req.body.orderId
        });
        errorResponse(res, 'Sipariş silinirken hata oluştu: ' + error.message);
    }
};

/**
 * Reorder - Add items from previous order to cart
 */
const reorder = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { orderId } = req.params;

        if (!userId) {
            return errorResponse(res, 'Kullanıcı kimliği gereklidir', 401);
        }

        // Get the order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Sipariş bulunamadı', 404);
        }

        // Verify order belongs to user (if order has userId)
        if (order.userId && order.userId.toString() !== userId) {
            return errorResponse(res, 'Bu sipariş size ait değil', 403);
        }

        // Get user
        const user = await userModel.findById(userId);
        if (!user) {
            return errorResponse(res, 'Kullanıcı bulunamadı', 404);
        }

        // Get current cart
        let cartData = user.cartData || {};

        // Add order items to cart
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const itemId = item.id || item.productId;
                const size = item.size || 'default';
                const quantity = item.quantity || 1;

                if (!cartData[itemId]) {
                    cartData[itemId] = {};
                }

                // Add to existing quantity or set new quantity
                if (cartData[itemId][size]) {
                    cartData[itemId][size] += quantity;
                } else {
                    cartData[itemId][size] = quantity;
                }
            });

            // Update user cart
            await userModel.findByIdAndUpdate(userId, { cartData });

            logger.info('Order reordered', { userId, orderId, itemsCount: order.items.length });
            successResponse(res, { 
                cartData,
                message: `${order.items.length} ürün sepete eklendi`
            });
        } else {
            return errorResponse(res, 'Siparişte ürün bulunamadı', 400);
        }
    } catch (error) {
        logger.error('Error reordering', {
            error: error.message,
            stack: error.stack,
            orderId: req.params.orderId,
            userId: req.body.userId
        });
        errorResponse(res, 'Tekrar sipariş verilirken hata oluştu: ' + error.message);
    }
};

export {
    placeOrder,
    allOrders,
    userOrders,
    updateStatus,
    bankInfo,
    getOrderStatus,
    getOrderHistory,
    getOrderTimeline,
    approveBranchAssignment,
    assignBranchToOrder,
    getBranchSuggestion,
    prepareOrder,
    sendToCourier,
    deleteOrder,
    reorder
};