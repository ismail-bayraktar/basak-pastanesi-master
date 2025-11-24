import MuditaKuryeService from './MuditaKuryeService.js';
import RetryService from './RetryService.js';
import CircuitBreakerService from './CircuitBreakerService.js';
import CourierIntegrationConfigModel from '../models/CourierIntegrationConfigModel.js';
import DeadLetterQueueModel from '../models/DeadLetterQueueModel.js';
import orderModel from '../models/OrderModel.js';
import logger from '../utils/logger.js';

/**
 * CourierIntegrationService
 * Factory pattern implementation for managing multiple courier platforms
 * Provides abstraction layer for courier operations
 */

class CourierIntegrationService {
    constructor() {
        this.services = new Map();
        this.initialized = false;
        this.defaultPlatform = 'muditakurye';
    }

    /**
     * Initialize service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize retry service
            await RetryService.initialize();

            // Initialize circuit breaker service
            await CircuitBreakerService.initialize();

            // Register available courier services
            this.registerService('muditakurye', MuditaKuryeService);

            // Initialize registered services
            for (const [platform, service] of this.services.entries()) {
                if (service.initialize) {
                    await service.initialize();
                }
            }

            this.initialized = true;
            logger.info('CourierIntegrationService initialized', {
                platforms: Array.from(this.services.keys())
            });
        } catch (error) {
            logger.error('Failed to initialize CourierIntegrationService', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Register a courier service
     */
    registerService(platform, service) {
        this.services.set(platform, service);
        logger.info('Courier service registered', { platform });
    }

    /**
     * Get service for a platform
     */
    getService(platform) {
        const service = this.services.get(platform);
        if (!service) {
            throw new Error(`Courier service not found for platform: ${platform}`);
        }
        return service;
    }

    /**
     * Determine which platform to use for an order
     */
    async determinePlatform(order) {
        // Check if order already has a platform assigned
        if (order.courierIntegration?.platform) {
            return order.courierIntegration.platform;
        }

        // Check for branch-specific platform configuration
        if (order.branchId) {
            // TODO: Implement branch-specific platform lookup
        }

        // Check for zone-specific platform configuration
        if (order.delivery?.zoneId) {
            // TODO: Implement zone-specific platform lookup
        }

        // Use default platform
        const defaultConfig = await CourierIntegrationConfigModel.findOne({
            platform: this.defaultPlatform,
            enabled: true
        });

        if (!defaultConfig) {
            throw new Error('No enabled courier platform found');
        }

        return this.defaultPlatform;
    }

    /**
     * Submit order to courier platform
     */
    async submitOrder(orderId, platform = null) {
        const startTime = Date.now();

        try {
            // Load order
            const order = await orderModel.findById(orderId);
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }

            // Determine platform if not specified
            if (!platform) {
                platform = await this.determinePlatform(order);
            }

            // Get service for platform
            const service = this.getService(platform);

            // Check if already submitted
            if (order.courierIntegration?.externalOrderId &&
                order.courierIntegration?.syncStatus === 'synced') {
                logger.warn('Order already submitted to courier', {
                    orderId,
                    platform,
                    externalOrderId: order.courierIntegration.externalOrderId
                });
                return {
                    success: true,
                    alreadySubmitted: true,
                    externalOrderId: order.courierIntegration.externalOrderId
                };
            }

            // Update order with platform info
            order.courierIntegration = order.courierIntegration || {};
            order.courierIntegration.platform = platform;
            order.courierIntegration.submittedAt = Date.now();
            order.courierIntegration.syncStatus = 'pending';
            await order.save();

            logger.info('Submitting order to courier', {
                orderId,
                platform,
                customerName: order.address?.name,
                amount: order.amount
            });

            // Execute with circuit breaker protection
            const result = await CircuitBreakerService.execute(
                platform,
                async () => await service.createOrder(order),
                { orderId, operation: 'submit_order' }
            );

            const duration = Date.now() - startTime;

            if (result.success) {
                // Update order with success info
                await orderModel.findByIdAndUpdate(orderId, {
                    'courierIntegration.externalOrderId': result.externalOrderId,
                    'courierIntegration.syncStatus': 'synced',
                    'courierIntegration.lastSyncAt': Date.now(),
                    'courierIntegration.retryCount': 0,
                    'courierIntegration.metadata': result.response || {}
                });

                // Add status history
                await this.addStatusHistory(
                    orderId,
                    'Kuryeye Gönderildi',
                    `${platform} sistemine başarıyla gönderildi`,
                    'system'
                );

                logger.info('Order submitted to courier successfully', {
                    orderId,
                    platform,
                    externalOrderId: result.externalOrderId,
                    duration
                });

                return {
                    success: true,
                    platform,
                    externalOrderId: result.externalOrderId,
                    duration,
                    ...result
                };

            } else {
                // Handle failure
                const error = result.error;

                // Update order with failure info
                await orderModel.findByIdAndUpdate(orderId, {
                    'courierIntegration.syncStatus': 'failed',
                    'courierIntegration.failureReason': error.message,
                    'courierIntegration.lastSyncAt': Date.now()
                });

                // Check if retryable
                if (error.retryable) {
                    // Schedule retry
                    const retryResult = await RetryService.scheduleRetry(
                        orderId,
                        platform,
                        'submit_order',
                        order,
                        0
                    );

                    logger.warn('Order submission failed, retry scheduled', {
                        orderId,
                        platform,
                        error: error.message,
                        retryAt: retryResult.retryAt
                    });
                } else {
                    // Non-retryable, move to DLQ
                    await RetryService.moveToDeadLetterQueue(
                        orderId,
                        platform,
                        'submit_order',
                        order,
                        error
                    );

                    logger.error('Order submission failed (non-retryable)', {
                        orderId,
                        platform,
                        error: error.message
                    });
                }

                return {
                    success: false,
                    platform,
                    error: error.message,
                    retryable: error.retryable,
                    duration
                };
            }

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error('Unexpected error submitting order to courier', {
                orderId,
                platform,
                error: error.message,
                stack: error.stack,
                duration
            });

            // Update order status
            await orderModel.findByIdAndUpdate(orderId, {
                'courierIntegration.syncStatus': 'failed',
                'courierIntegration.failureReason': error.message,
                'courierIntegration.lastSyncAt': Date.now()
            });

            // Schedule retry for unexpected errors
            if (!error.code || error.code !== 'CIRCUIT_OPEN') {
                await RetryService.scheduleRetry(
                    orderId,
                    platform || this.defaultPlatform,
                    'submit_order',
                    { orderId },
                    0
                );
            }

            throw error;
        }
    }

    /**
     * Update order status from webhook
     */
    async updateOrderStatus(platform, externalOrderId, status, additionalData = {}) {
        try {
            // Find order by external ID
            const order = await orderModel.findOne({
                'courierIntegration.externalOrderId': externalOrderId,
                'courierIntegration.platform': platform
            });

            if (!order) {
                logger.warn('Order not found for status update', {
                    platform,
                    externalOrderId,
                    status
                });
                return {
                    success: false,
                    error: 'Order not found'
                };
            }

            // Get service for platform
            const service = this.getService(platform);

            // Update status through service
            const result = await service.updateOrderStatus(
                externalOrderId,
                status,
                additionalData
            );

            if (result.success) {
                // Update order status
                const updateData = {
                    courierStatus: result.tulumbakStatus,
                    'courierIntegration.lastSyncAt': Date.now()
                };

                // Update main status for specific events
                if (status === 'DELIVERED') {
                    updateData.status = 'Teslim Edildi';
                    updateData.actualDelivery = Date.now();
                    updateData.payment = true;
                } else if (status === 'CANCELED' || status === 'FAILED') {
                    updateData.status = 'İptal Edildi';
                }

                await orderModel.findByIdAndUpdate(order._id, updateData);

                // Add status history
                await this.addStatusHistory(
                    order._id,
                    result.tulumbakStatus,
                    additionalData.note || `Durum güncellendi: ${status}`,
                    'courier',
                    additionalData.location
                );

                logger.info('Order status updated from webhook', {
                    orderId: order._id,
                    platform,
                    externalOrderId,
                    status,
                    tulumbakStatus: result.tulumbakStatus
                });

                return {
                    success: true,
                    orderId: order._id,
                    status: result.tulumbakStatus
                };
            }

            return result;

        } catch (error) {
            logger.error('Failed to update order status', {
                platform,
                externalOrderId,
                status,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, reason) {
        try {
            const order = await orderModel.findById(orderId);
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }

            const platform = order.courierIntegration?.platform;
            if (!platform) {
                throw new Error('Order not submitted to any courier platform');
            }

            const externalOrderId = order.courierIntegration?.externalOrderId;
            if (!externalOrderId) {
                throw new Error('Order does not have external courier ID');
            }

            const service = this.getService(platform);

            // Execute with circuit breaker
            const result = await CircuitBreakerService.execute(
                platform,
                async () => await service.cancelOrder(externalOrderId, reason),
                { orderId, operation: 'cancel_order' }
            );

            if (result.success) {
                // Update order
                await orderModel.findByIdAndUpdate(orderId, {
                    status: 'İptal Edildi',
                    courierStatus: 'iptal',
                    'courierIntegration.lastSyncAt': Date.now()
                });

                // Add status history
                await this.addStatusHistory(
                    orderId,
                    'İptal Edildi',
                    reason || 'Sipariş iptal edildi',
                    'system'
                );

                logger.info('Order cancelled successfully', {
                    orderId,
                    platform,
                    externalOrderId,
                    reason
                });

                return result;
            }

            return result;

        } catch (error) {
            logger.error('Failed to cancel order', {
                orderId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get order tracking information
     */
    async getOrderTracking(orderId) {
        try {
            const order = await orderModel.findById(orderId);
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }

            const platform = order.courierIntegration?.platform;
            const externalOrderId = order.courierIntegration?.externalOrderId;

            if (!platform || !externalOrderId) {
                // Return local tracking info
                return {
                    success: true,
                    tracking: {
                        orderId,
                        trackingId: order.trackingId,
                        status: order.courierStatus || order.status,
                        statusHistory: order.statusHistory || [],
                        estimatedDelivery: order.estimatedDelivery,
                        actualDelivery: order.actualDelivery
                    }
                };
            }

            // Get tracking from courier service
            const service = this.getService(platform);
            const result = await service.getOrderStatus(externalOrderId);

            if (result.success) {
                return {
                    success: true,
                    tracking: {
                        ...result.order,
                        orderId,
                        trackingId: order.trackingId,
                        platform
                    }
                };
            }

            // Fallback to local data
            return {
                success: true,
                tracking: {
                    orderId,
                    trackingId: order.trackingId,
                    status: order.courierStatus || order.status,
                    statusHistory: order.statusHistory || [],
                    estimatedDelivery: order.estimatedDelivery,
                    actualDelivery: order.actualDelivery,
                    platform
                }
            };

        } catch (error) {
            logger.error('Failed to get order tracking', {
                orderId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Test connection for a platform
     */
    async testConnection(platform) {
        try {
            const service = this.getService(platform);
            return await service.testConnection();
        } catch (error) {
            logger.error('Connection test failed', {
                platform,
                error: error.message
            });
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Add status history to order
     */
    async addStatusHistory(orderId, status, note = '', updatedBy = 'system', location = '') {
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
            logger.error('Error adding status history', {
                error: error.message,
                orderId
            });
        }
    }

    /**
     * Get statistics for all platforms
     * Optimized with aggregation pipeline for better performance
     */
    async getStatistics() {
        try {
            // Execute all queries in parallel for maximum performance
            const [platformStats, configs, retryStats, circuitBreakers, dlqStats] = await Promise.all([
                // Single aggregation query instead of multiple countDocuments
                orderModel.aggregate([
                    {
                        $match: {
                            'courierIntegration.platform': { $exists: true, $ne: null }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                platform: '$courierIntegration.platform',
                                syncStatus: '$courierIntegration.syncStatus'
                            },
                            count: { $sum: 1 }
                        }
                    }
                ]),
                // Get all configs in one query
                CourierIntegrationConfigModel.find({}).lean(),
                // Other stats
                Promise.resolve(RetryService.getStats()),
                Promise.resolve(CircuitBreakerService.getAllStatus()),
                DeadLetterQueueModel.getStats()
            ]);

            // Build config map for quick lookup
            const configMap = {};
            configs.forEach(config => {
                configMap[config.platform] = config;
            });

            // Process aggregation results into platform stats
            const platformData = {};

            // Initialize platforms from registered services
            for (const [platform] of this.services.entries()) {
                platformData[platform] = {
                    enabled: configMap[platform]?.enabled || false,
                    testMode: configMap[platform]?.testMode || false,
                    orders: 0,
                    synced: 0,
                    failed: 0,
                    pending: 0,
                    successRate: 0
                };
            }

            // Fill in counts from aggregation results
            platformStats.forEach(stat => {
                const platform = stat._id.platform;
                const syncStatus = stat._id.syncStatus;

                if (platformData[platform]) {
                    platformData[platform].orders += stat.count;

                    if (syncStatus === 'synced') {
                        platformData[platform].synced = stat.count;
                    } else if (syncStatus === 'failed') {
                        platformData[platform].failed = stat.count;
                    } else if (syncStatus === 'pending') {
                        platformData[platform].pending = stat.count;
                    }
                }
            });

            // Calculate success rates
            for (const platform in platformData) {
                const data = platformData[platform];
                data.successRate = data.orders > 0 ? (data.synced / data.orders) * 100 : 0;
            }

            return {
                platforms: platformData,
                retry: retryStats,
                circuitBreakers: circuitBreakers,
                dlq: dlqStats
            };
        } catch (error) {
            logger.error('Failed to get statistics', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Process webhook for a platform
     */
    async processWebhook(platform, payload, headers) {
        try {
            const service = this.getService(platform);

            // Verify signature if service supports it
            if (service.verifyWebhookSignature) {
                const signature = headers['x-webhook-signature'] || headers['x-muditakurye-signature'];
                const timestamp = headers['x-webhook-timestamp'];

                const isValid = service.verifyWebhookSignature(payload, signature, timestamp);
                if (!isValid) {
                    logger.warn('Invalid webhook signature', {
                        platform,
                        webhookId: headers['x-webhook-id']
                    });
                    return {
                        success: false,
                        error: 'Invalid signature'
                    };
                }
            }

            // Process based on event type
            const event = payload.event;

            switch (event) {
                case 'order.status.updated':
                case 'order.assigned':
                case 'order.delivered':
                case 'order.failed':
                case 'order.cancelled':
                    return await this.updateOrderStatus(
                        platform,
                        payload.orderId || payload.muditaOrderId,
                        payload.status,
                        payload.metadata || {}
                    );

                default:
                    logger.warn('Unknown webhook event', {
                        platform,
                        event
                    });
                    return {
                        success: false,
                        error: `Unknown event: ${event}`
                    };
            }

        } catch (error) {
            logger.error('Failed to process webhook', {
                platform,
                error: error.message
            });
            throw error;
        }
    }
}

// Export singleton instance
export default new CourierIntegrationService();