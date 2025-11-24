import logger from '../utils/logger.js';
import eventEmitter from '../utils/eventEmitter.js';

/**
 * Server-Sent Events (SSE) Notification Service
 * Handles real-time order notifications to admin panel
 */
class NotificationService {
  constructor() {
    // Map of connected admin clients: adminId -> response object
    this.clients = new Map();

    // Keep-alive interval (every 30 seconds)
    this.keepAliveInterval = null;

    this.initializeEventListeners();
    this.startKeepAlive();
  }

  /**
   * Initialize event listeners for order events
   */
  initializeEventListeners() {
    // Listen for new order events
    eventEmitter.on('order:created', (orderData) => {
      this.notifyNewOrder(orderData);
    });

    // Listen for order status updates
    eventEmitter.on('order:statusChanged', (orderData) => {
      this.notifyOrderStatusChange(orderData);
    });

    // Listen for courier assignment
    eventEmitter.on('order:courierAssigned', (orderData) => {
      this.notifyCourierAssignment(orderData);
    });

    logger.info('NotificationService event listeners initialized');
  }

  /**
   * Start keep-alive ping to prevent connection timeout
   */
  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      this.broadcast({
        type: 'ping',
        timestamp: Date.now()
      });
    }, 30000); // 30 seconds
  }

  /**
   * Stop keep-alive interval
   */
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Add new SSE client connection
   * @param {string} adminId - Admin user identifier
   * @param {object} response - Express response object
   */
  addClient(adminId, response) {
    // Set SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Add client to connections map
    this.clients.set(adminId, response);

    logger.info('SSE client connected', { adminId, totalClients: this.clients.size });

    // Send initial connection success message
    this.sendToClient(adminId, {
      type: 'connected',
      message: 'Bildirim sistemi bağlandı',
      timestamp: Date.now()
    });

    // Handle client disconnect
    response.on('close', () => {
      this.removeClient(adminId);
    });
  }

  /**
   * Remove disconnected client
   * @param {string} adminId - Admin user identifier
   */
  removeClient(adminId) {
    const removed = this.clients.delete(adminId);
    if (removed) {
      logger.info('SSE client disconnected', { adminId, totalClients: this.clients.size });
    }
  }

  /**
   * Send message to specific admin client
   * @param {string} adminId - Target admin identifier
   * @param {object} data - Data to send
   */
  sendToClient(adminId, data) {
    const response = this.clients.get(adminId);
    if (!response) {
      logger.warn('Attempted to send to non-existent client', { adminId });
      return false;
    }

    try {
      response.write(`data: ${JSON.stringify(data)}\n\n`);
      return true;
    } catch (error) {
      logger.error('Error sending SSE message to client', {
        adminId,
        error: error.message
      });
      this.removeClient(adminId);
      return false;
    }
  }

  /**
   * Broadcast message to all connected admin clients
   * @param {object} data - Data to broadcast
   */
  broadcast(data) {
    let successCount = 0;
    let failCount = 0;

    this.clients.forEach((response, adminId) => {
      const success = this.sendToClient(adminId, data);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    if (successCount > 0) {
      logger.debug('Broadcast sent', {
        type: data.type,
        successCount,
        failCount
      });
    }

    return { successCount, failCount };
  }

  /**
   * Notify all admins about new order
   * @param {object} orderData - Order information
   */
  notifyNewOrder(orderData) {
    const notification = {
      type: 'NEW_ORDER',
      title: 'Yeni Sipariş',
      message: `Sipariş #${orderData.orderNumber || orderData._id} alındı`,
      order: {
        id: orderData._id,
        orderNumber: orderData.orderNumber,
        customer: {
          name: orderData.address?.name || 'Müşteri',
          phone: orderData.address?.phone || orderData.phone,
          address: orderData.address?.address || ''
        },
        items: orderData.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })) || [],
        total: orderData.amount,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.giftNote || '',
        createdAt: orderData.createdAt || Date.now()
      },
      audio: true, // Trigger audio alert in admin panel
      timestamp: Date.now()
    };

    logger.info('Broadcasting new order notification', {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber
    });

    return this.broadcast(notification);
  }

  /**
   * Notify about order status change
   * @param {object} orderData - Order information with new status
   */
  notifyOrderStatusChange(orderData) {
    const notification = {
      type: 'ORDER_STATUS_CHANGED',
      title: 'Sipariş Durumu Güncellendi',
      message: `Sipariş #${orderData.orderNumber} durumu: ${orderData.status}`,
      order: {
        id: orderData._id,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        previousStatus: orderData.previousStatus
      },
      audio: false, // No audio for status changes
      timestamp: Date.now()
    };

    logger.info('Broadcasting order status change', {
      orderId: orderData._id,
      status: orderData.status
    });

    return this.broadcast(notification);
  }

  /**
   * Notify about courier assignment
   * @param {object} orderData - Order information with courier details
   */
  notifyCourierAssignment(orderData) {
    const notification = {
      type: 'COURIER_ASSIGNED',
      title: 'Kurye Atandı',
      message: `Sipariş #${orderData.orderNumber} kuryeye atandı`,
      order: {
        id: orderData._id,
        orderNumber: orderData.orderNumber,
        courierTrackingId: orderData.courierTrackingId,
        courierIntegration: orderData.courierIntegration
      },
      audio: false,
      timestamp: Date.now()
    };

    logger.info('Broadcasting courier assignment', {
      orderId: orderData._id,
      courierTrackingId: orderData.courierTrackingId
    });

    return this.broadcast(notification);
  }

  /**
   * Get current connection statistics
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      clients: Array.from(this.clients.keys())
    };
  }

  /**
   * Clean up on service shutdown
   */
  shutdown() {
    this.stopKeepAlive();

    // Close all client connections
    this.clients.forEach((response, adminId) => {
      try {
        response.end();
      } catch (error) {
        logger.error('Error closing SSE connection', { adminId, error: error.message });
      }
    });

    this.clients.clear();
    logger.info('NotificationService shutdown complete');
  }
}

// Export singleton instance
const notificationService = new NotificationService();

export default notificationService;
