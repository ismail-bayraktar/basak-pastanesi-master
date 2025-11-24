import crypto from 'crypto';
import webhookConfigModel from '../models/WebhookConfigModel.js';
import webhookLogModel from '../models/WebhookLogModel.js';
import orderModel from '../models/OrderModel.js';
import CourierIntegrationService from '../services/CourierIntegrationService.js';
import WebhookSecurity from '../utils/webhookSecurity.js';
import logger from '../utils/logger.js';

/**
 * Webhook receiver endpoint
 * POST /api/webhook/courier
 */
export const receiveWebhook = async (req, res) => {
    const startTime = Date.now();
    let webhookLog = null;

    try {
        // Extract headers (support both generic and MuditaKurye-specific headers)
        const signature = req.headers['x-webhook-signature'] || req.headers['x-muditakurye-signature'];
        let platform = req.headers['x-webhook-platform'] || req.headers['x-mudita-platform'];
        const webhookId = req.headers['x-webhook-id'] || req.headers['x-mudita-webhook-id'] || crypto.randomBytes(16).toString('hex');
        const timestamp = req.headers['x-webhook-timestamp'] || req.headers['x-mudita-timestamp'];

        // Auto-detect MuditaKurye platform from URL path
        if (!platform && req.path.includes('muditakurye')) {
            platform = 'muditakurye';
        }

        // Validate required headers
        if (!signature || !timestamp) {
            return res.status(400).json({
                success: false,
                error: 'Missing required headers',
                code: 'MISSING_HEADERS',
                required: ['X-Webhook-Signature/X-MuditaKurye-Signature', 'X-Webhook-Timestamp/X-Mudita-Timestamp']
            });
        }

        // Default platform if not specified
        if (!platform) {
            platform = 'muditakurye'; // Default to MuditaKurye for now
        }

        // Validate payload (flexible for MuditaKurye format)
        const payload = req.body;
        if (!payload || (!payload.event && !payload.status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payload',
                code: 'INVALID_PAYLOAD',
                required: ['event or status field']
            });
        }

        // Normalize MuditaKurye payload format
        if (platform === 'muditakurye' && !payload.event) {
            // Map MuditaKurye status to event
            if (payload.status) {
                const statusEventMap = {
                    'VALIDATED': 'order.status.updated',
                    'ASSIGNED': 'order.assigned',
                    'PREPARED': 'order.status.updated',
                    'ON_DELIVERY': 'order.status.updated',
                    'DELIVERED': 'order.delivered',
                    'CANCELED': 'order.cancelled',
                    'FAILED': 'order.failed'
                };
                payload.event = statusEventMap[payload.status] || 'order.status.updated';
            }
            // Map MuditaKurye orderId format
            if (payload.muditaOrderId) {
                payload.orderId = payload.muditaOrderId;
            }
        }

        // Check for duplicate webhook (idempotency)
        const existingLog = await webhookLogModel.findOne({ webhookId, platform });
        if (existingLog && existingLog.status === 'success') {
            logger.info('Duplicate webhook detected', { webhookId, platform });
            return res.status(409).json({
                success: false,
                error: 'Duplicate webhook',
                code: 'DUPLICATE_WEBHOOK',
                webhookId
            });
        }

        // Get webhook config
        const config = await webhookConfigModel.findOne({ 
            platform: platform.toLowerCase(),
            enabled: true 
        });

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Webhook config not found or disabled',
                code: 'CONFIG_NOT_FOUND',
                platform
            });
        }

        // Decrypt secret key
        let secretKey;
        try {
            secretKey = config.getDecryptedSecretKey();
        } catch (error) {
            logger.error('Failed to decrypt secret key', { platform, error: error.message });
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'DECRYPTION_ERROR'
            });
        }

        // Verify webhook (timestamp + signature)
        const verification = WebhookSecurity.verifyWebhook(
            payload,
            signature,
            timestamp,
            secretKey,
            {
                maxAgeMs: 5 * 60 * 1000, // 5 minutes
                clockSkewMs: 30000 // 30 seconds
            }
        );

        if (!verification.valid) {
            // Log failed webhook
            webhookLog = new webhookLogModel({
                webhookId,
                platform: platform.toLowerCase(),
                event: payload.event,
                orderId: payload.orderId,
                courierTrackingId: payload.courierTrackingId,
                payload,
                signature,
                status: 'failed',
                statusCode: verification.code === 'INVALID_SIGNATURE' ? 401 : 400,
                error: verification.error,
                errorCode: verification.code,
                createdAt: Date.now()
            });
            await webhookLog.save();

            const statusCode = verification.code === 'INVALID_SIGNATURE' ? 401 : 400;
            return res.status(statusCode).json({
                success: false,
                error: verification.error,
                code: verification.code,
                details: verification.details || {}
            });
        }

        // Create webhook log
        webhookLog = new webhookLogModel({
            webhookId,
            platform: platform.toLowerCase(),
            event: payload.event,
            orderId: payload.orderId,
            courierTrackingId: payload.courierTrackingId,
            payload,
            signature,
            status: 'pending',
            createdAt: Date.now()
        });
        await webhookLog.save();

        // Process webhook based on platform and event type
        let processingResult;

        if (platform === 'muditakurye') {
            // Use CourierIntegrationService for MuditaKurye webhooks
            processingResult = await CourierIntegrationService.processWebhook(
                platform,
                payload,
                req.headers
            );
        } else {
            // Use legacy processing for other platforms
            processingResult = await processWebhookEvent(payload, config);
        }

        const processingTime = Date.now() - startTime;

        // Update webhook log
        webhookLog.status = processingResult.success ? 'success' : 'failed';
        webhookLog.statusCode = processingResult.statusCode || 200;
        webhookLog.response = processingResult.response;
        webhookLog.error = processingResult.error;
        webhookLog.errorCode = processingResult.errorCode;
        webhookLog.processingTime = processingTime;
        webhookLog.processedAt = Date.now();
        await webhookLog.save();

        if (processingResult.success) {
            logger.info('Webhook processed successfully', {
                webhookId,
                platform,
                event: payload.event,
                orderId: payload.orderId,
                processingTime
            });

            return res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                webhookId,
                processedAt: Date.now()
            });
        } else {
            return res.status(processingResult.statusCode || 500).json({
                success: false,
                error: processingResult.error,
                code: processingResult.errorCode,
                webhookId
            });
        }

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        logger.error('Webhook processing error', {
            error: error.message,
            stack: error.stack,
            webhookId: req.headers['x-webhook-id'],
            platform: req.headers['x-webhook-platform']
        });

        // Update webhook log if exists
        if (webhookLog) {
            webhookLog.status = 'failed';
            webhookLog.statusCode = 500;
            webhookLog.error = error.message;
            webhookLog.errorCode = 'INTERNAL_ERROR';
            webhookLog.processingTime = processingTime;
            webhookLog.processedAt = Date.now();
            await webhookLog.save();
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            requestId: req.headers['x-webhook-id']
        });
    }
};

/**
 * Process webhook event based on event type
 */
const processWebhookEvent = async (payload, config) => {
    try {
        const { event, orderId, status, location, estimatedDelivery, actualDelivery, note, metadata } = payload;

        // Find order
        const order = await orderModel.findOne({ 
            $or: [
                { _id: orderId },
                { orderId: orderId },
                { trackingId: orderId }
            ]
        });

        if (!order) {
            return {
                success: false,
                statusCode: 404,
                error: 'Order not found',
                errorCode: 'ORDER_NOT_FOUND',
                response: { orderId }
            };
        }

        switch (event) {
            case 'order.status.updated':
                return await handleOrderStatusUpdate(order, { status, location, estimatedDelivery, note, metadata });

            case 'order.delivered':
                return await handleOrderDelivered(order, { actualDelivery, note, metadata });

            case 'order.failed':
                return await handleOrderFailed(order, { note, metadata });

            case 'order.cancelled':
                return await handleOrderCancelled(order, { note, metadata });

            case 'order.assigned':
                return await handleOrderAssigned(order, { metadata });

            case 'courier.location.updated':
                return await handleCourierLocationUpdate(order, { location, metadata });

            default:
                return {
                    success: false,
                    statusCode: 400,
                    error: 'Unknown event type',
                    errorCode: 'UNKNOWN_EVENT',
                    response: { event }
                };
        }
    } catch (error) {
        logger.error('Error processing webhook event', { error: error.message, stack: error.stack });
        return {
            success: false,
            statusCode: 500,
            error: error.message,
            errorCode: 'PROCESSING_ERROR'
        };
    }
};

/**
 * Handle order status update
 */
const handleOrderStatusUpdate = async (order, { status, location, estimatedDelivery, note, metadata }) => {
    try {
        // Update courier status
        if (status) {
            order.courierStatus = status;
        }

        // Update estimated delivery
        if (estimatedDelivery) {
            order.estimatedDelivery = estimatedDelivery;
        }

        // Add to status history
        const historyEntry = {
            status: status || order.courierStatus,
            timestamp: Date.now(),
            location: location?.address || '',
            note: note || '',
            updatedBy: 'courier'
        };
        
        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();

        logger.info('Order status updated via webhook', {
            orderId: order._id,
            status,
            courierStatus: order.courierStatus
        });

        return { success: true, response: { orderId: order._id, status: order.courierStatus } };
    } catch (error) {
        logger.error('Error handling order status update', { error: error.message });
        return { success: false, error: error.message, errorCode: 'UPDATE_ERROR' };
    }
};

/**
 * Handle order delivered
 */
const handleOrderDelivered = async (order, { actualDelivery, note, metadata }) => {
    try {
        order.courierStatus = 'teslim edildi';
        order.payment = true; // Mark as paid when delivered
        if (actualDelivery) {
            order.actualDelivery = actualDelivery;
        }

        const historyEntry = {
            status: 'teslim edildi',
            timestamp: Date.now(),
            location: order.address?.address || '',
            note: note || 'Sipariş teslim edildi',
            updatedBy: 'courier'
        };
        
        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();

        logger.info('Order delivered via webhook', { orderId: order._id });

        return { success: true, response: { orderId: order._id, delivered: true } };
    } catch (error) {
        logger.error('Error handling order delivered', { error: error.message });
        return { success: false, error: error.message, errorCode: 'UPDATE_ERROR' };
    }
};

/**
 * Handle order failed
 */
const handleOrderFailed = async (order, { note, metadata }) => {
    try {
        order.courierStatus = 'iptal';

        const historyEntry = {
            status: 'iptal',
            timestamp: Date.now(),
            location: order.address?.address || '',
            note: note || 'Sipariş teslim edilemedi',
            updatedBy: 'courier'
        };
        
        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();

        logger.info('Order failed via webhook', { orderId: order._id });

        return { success: true, response: { orderId: order._id, failed: true } };
    } catch (error) {
        logger.error('Error handling order failed', { error: error.message });
        return { success: false, error: error.message, errorCode: 'UPDATE_ERROR' };
    }
};

/**
 * Handle order cancelled
 */
const handleOrderCancelled = async (order, { note, metadata }) => {
    try {
        order.courierStatus = 'iptal';

        const historyEntry = {
            status: 'iptal',
            timestamp: Date.now(),
            location: order.address?.address || '',
            note: note || 'Sipariş iptal edildi',
            updatedBy: 'courier'
        };
        
        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();

        logger.info('Order cancelled via webhook', { orderId: order._id });

        return { success: true, response: { orderId: order._id, cancelled: true } };
    } catch (error) {
        logger.error('Error handling order cancelled', { error: error.message });
        return { success: false, error: error.message, errorCode: 'UPDATE_ERROR' };
    }
};

/**
 * Handle order assigned
 */
const handleOrderAssigned = async (order, { metadata }) => {
    try {
        if (metadata?.courierTrackingId) {
            order.courierTrackingId = metadata.courierTrackingId;
        }

        const historyEntry = {
            status: order.courierStatus || 'hazırlanıyor',
            timestamp: Date.now(),
            location: order.address?.address || '',
            note: metadata?.courierName ? `Kurye atandı: ${metadata.courierName}` : 'Kurye atandı',
            updatedBy: 'courier'
        };
        
        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();

        logger.info('Order assigned via webhook', { orderId: order._id });

        return { success: true, response: { orderId: order._id, assigned: true } };
    } catch (error) {
        logger.error('Error handling order assigned', { error: error.message });
        return { success: false, error: error.message, errorCode: 'UPDATE_ERROR' };
    }
};

/**
 * Handle courier location update
 */
const handleCourierLocationUpdate = async (order, { location, metadata }) => {
    try {
        // Update status history with location
        const historyEntry = {
            status: order.courierStatus || 'yolda',
            timestamp: Date.now(),
            location: location?.address || `${location?.latitude}, ${location?.longitude}`,
            note: 'Kurye konumu güncellendi',
            updatedBy: 'courier'
        };

        if (!order.statusHistory) {
            order.statusHistory = [historyEntry];
        } else {
            order.statusHistory.push(historyEntry);
        }

        await order.save();

        logger.info('Courier location updated via webhook', { orderId: order._id });

        return { success: true, response: { orderId: order._id, locationUpdated: true } };
    } catch (error) {
        logger.error('Error handling courier location update', { error: error.message });
        return { success: false, error: error.message, errorCode: 'UPDATE_ERROR' };
    }
};

/**
 * MuditaKurye-specific webhook endpoint
 * POST /api/webhook/muditakurye
 */
export const receiveMuditaKuryeWebhook = async (req, res) => {
    const startTime = Date.now();

    try {
        // Initialize CourierIntegrationService if not already done
        await CourierIntegrationService.initialize();

        // Log incoming webhook
        logger.info('MuditaKurye webhook received', {
            method: req.method,
            path: req.path,
            headers: Object.keys(req.headers),
            bodyKeys: Object.keys(req.body || {}),
            timestamp: Date.now()
        });

        // Set platform header for unified processing
        req.headers['x-webhook-platform'] = 'muditakurye';

        // Forward to main webhook receiver
        return await receiveWebhook(req, res);

    } catch (error) {
        logger.error('MuditaKurye webhook processing error', {
            error: error.message,
            stack: error.stack,
            duration: Date.now() - startTime
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            code: 'MUDITA_WEBHOOK_ERROR'
        });
    }
};

