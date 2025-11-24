import express from 'express';
import authMiddleware from '../middleware/Auth.js';
import notificationService from '../services/NotificationService.js';
import printService from '../services/PrintService.js';
import orderModel from '../models/OrderModel.js';
import logger from '../utils/logger.js';

const notificationRouter = express.Router();

/**
 * SSE Endpoint - Connect to notification stream
 * GET /api/notifications/stream
 */
notificationRouter.get('/stream', authMiddleware, (req, res) => {
  try {
    // authMiddleware sets req.body.userId
    const adminId = req.body.userId;

    logger.info('Admin connecting to notification stream', { adminId });

    // Add client to notification service
    notificationService.addClient(adminId, res);

    // Connection will be kept alive by NotificationService
    // Client disconnect will be handled automatically
  } catch (error) {
    logger.error('Error connecting to notification stream', {
      error: error.message,
      adminId: req.body?.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to connect to notification stream'
    });
  }
});

/**
 * Get notification service statistics
 * GET /api/notifications/stats
 */
notificationRouter.get('/stats', authMiddleware, (req, res) => {
  try {
    const stats = notificationService.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error getting notification stats', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats'
    });
  }
});

/**
 * Test notification - Send test notification to all connected admins
 * POST /api/notifications/test
 */
notificationRouter.post('/test', authMiddleware, (req, res) => {
  try {
    const testNotification = {
      type: 'TEST_NOTIFICATION',
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir',
      audio: true,
      timestamp: Date.now()
    };

    const result = notificationService.broadcast(testNotification);

    logger.info('Test notification sent', result);

    res.json({
      success: true,
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    logger.error('Error sending test notification', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

/**
 * Print Order Receipt
 * GET /api/notifications/print/:orderId
 * Note: Public endpoint - window.open() cannot send auth headers
 */
notificationRouter.get('/print/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate order data
    const validation = printService.validateOrderForPrinting(order);
    if (!validation.valid) {
      logger.warn('Order validation failed for printing', {
        orderId,
        errors: validation.errors
      });

      return res.status(400).json({
        success: false,
        message: 'Order data is incomplete for printing',
        errors: validation.errors
      });
    }

    // Generate receipt HTML
    const receiptHtml = printService.generateCourierReceipt(order);

    logger.info('Courier receipt generated for printing', { orderId });

    // Return HTML for printing
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(receiptHtml);
  } catch (error) {
    logger.error('Error generating print receipt', {
      orderId: req.params.orderId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate print receipt'
    });
  }
});

/**
 * Batch Print Orders
 * POST /api/notifications/print/batch
 * Body: { orderIds: ['id1', 'id2', ...] }
 * Note: Public endpoint - print window cannot send auth headers
 */
notificationRouter.post('/print/batch', async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    // Find all orders
    const orders = await orderModel.find({ _id: { $in: orderIds } });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found'
      });
    }

    // Validate all orders
    const validOrders = [];
    const invalidOrders = [];

    orders.forEach(order => {
      const validation = printService.validateOrderForPrinting(order);
      if (validation.valid) {
        validOrders.push(order);
      } else {
        invalidOrders.push({
          orderId: order._id,
          errors: validation.errors
        });
      }
    });

    if (validOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid orders for printing',
        invalidOrders
      });
    }

    // Generate batch receipt HTML
    const receiptHtml = printService.generateBatchReceipts(validOrders);

    logger.info('Batch courier receipts generated', {
      totalOrders: orderIds.length,
      validOrders: validOrders.length,
      invalidOrders: invalidOrders.length
    });

    // Return HTML for printing
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(receiptHtml);
  } catch (error) {
    logger.error('Error generating batch print receipts', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate batch print receipts'
    });
  }
});

export default notificationRouter;
