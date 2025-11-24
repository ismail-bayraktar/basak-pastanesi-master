import DeadLetterQueueModel from '../models/DeadLetterQueueModel.js';
import orderModel from '../models/OrderModel.js';
import CourierIntegrationConfigModel from '../models/CourierIntegrationConfigModel.js';
import logger from '../utils/logger.js';
import { setInNamespace, getFromNamespace, deleteFromNamespace, isRedisAvailable, redisClient } from '../config/redis.js';

/**
 * RetryService
 * Manages retry logic with exponential backoff for failed operations
 * Handles moving to Dead Letter Queue after max retries
 *
 * Now uses Redis for distributed retry queue management:
 * - retry:queue (sorted set): retryId -> score (timestamp when to retry)
 * - retry:{retryId} (hash): full retry entry details
 * - retry:active (set): currently processing retry IDs
 */

class RetryService {
    constructor() {
        this.useRedis = isRedisAvailable();

        // In-memory retry queue (fallback when Redis unavailable)
        this.retryQueue = new Map();
        this.activeRetries = new Map();
        this.initialized = false;

        // Redis keys
        this.redisNamespace = 'retry';
        this.queueKey = 'queue'; // Sorted set for scheduled retries
        this.activeKey = 'active'; // Set for active retries

        if (this.useRedis) {
            logger.info('RetryService will use Redis for distributed queue management');
        } else {
            logger.warn('RetryService will use in-memory queue (Redis unavailable)');
        }
    }

    /**
     * Initialize retry service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load existing retry queue from Redis (if available)
            if (this.useRedis) {
                await this.loadRetryQueueFromRedis();
            }

            // Start background processor for retries
            this.startRetryProcessor();

            // Clean up old DLQ items periodically
            this.startDLQCleanup();

            this.initialized = true;
            logger.info('RetryService initialized successfully', {
                useRedis: this.useRedis
            });
        } catch (error) {
            logger.error('Failed to initialize RetryService', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Load retry queue from Redis on startup
     */
    async loadRetryQueueFromRedis() {
        try {
            const queueSize = await redisClient.zCard(`${this.redisNamespace}:${this.queueKey}`);
            logger.info('Loaded retry queue from Redis', { queueSize });
        } catch (error) {
            logger.error('Failed to load retry queue from Redis', {
                error: error.message
            });
        }
    }

    /**
     * Add retry entry to Redis queue
     */
    async addToQueue(retryId, retryEntry) {
        if (!this.useRedis) {
            this.retryQueue.set(retryId, retryEntry);
            return;
        }

        try {
            // Store retry entry details as hash
            await setInNamespace(this.redisNamespace, retryId, retryEntry, 604800); // 7 days TTL

            // Add to sorted set with retryAt as score for time-based retrieval
            await redisClient.zAdd(`${this.redisNamespace}:${this.queueKey}`, {
                score: retryEntry.retryAt,
                value: retryId
            });

            logger.debug('Retry added to Redis queue', {
                retryId,
                retryAt: new Date(retryEntry.retryAt).toISOString()
            });
        } catch (error) {
            logger.error('Failed to add retry to Redis queue', {
                retryId,
                error: error.message
            });
            // Fallback to in-memory
            this.retryQueue.set(retryId, retryEntry);
        }
    }

    /**
     * Get retry entry from queue
     */
    async getFromQueue(retryId) {
        if (!this.useRedis) {
            return this.retryQueue.get(retryId);
        }

        try {
            return await getFromNamespace(this.redisNamespace, retryId);
        } catch (error) {
            logger.error('Failed to get retry from Redis queue', {
                retryId,
                error: error.message
            });
            return this.retryQueue.get(retryId);
        }
    }

    /**
     * Remove retry entry from queue
     */
    async removeFromQueue(retryId) {
        if (!this.useRedis) {
            this.retryQueue.delete(retryId);
            return;
        }

        try {
            // Remove from sorted set
            await redisClient.zRem(`${this.redisNamespace}:${this.queueKey}`, retryId);

            // Remove details
            await deleteFromNamespace(this.redisNamespace, retryId);

            logger.debug('Retry removed from Redis queue', { retryId });
        } catch (error) {
            logger.error('Failed to remove retry from Redis queue', {
                retryId,
                error: error.message
            });
            // Fallback to in-memory
            this.retryQueue.delete(retryId);
        }
    }

    /**
     * Mark retry as active (being processed)
     */
    async markAsActive(retryId) {
        if (!this.useRedis) {
            this.activeRetries.set(retryId, Date.now());
            return;
        }

        try {
            await redisClient.sAdd(`${this.redisNamespace}:${this.activeKey}`, retryId);
            logger.debug('Retry marked as active', { retryId });
        } catch (error) {
            logger.error('Failed to mark retry as active', {
                retryId,
                error: error.message
            });
            this.activeRetries.set(retryId, Date.now());
        }
    }

    /**
     * Check if retry is active
     */
    async isActive(retryId) {
        if (!this.useRedis) {
            return this.activeRetries.has(retryId);
        }

        try {
            return await redisClient.sIsMember(`${this.redisNamespace}:${this.activeKey}`, retryId);
        } catch (error) {
            logger.error('Failed to check if retry is active', {
                retryId,
                error: error.message
            });
            return this.activeRetries.has(retryId);
        }
    }

    /**
     * Mark retry as no longer active
     */
    async markAsInactive(retryId) {
        if (!this.useRedis) {
            this.activeRetries.delete(retryId);
            return;
        }

        try {
            await redisClient.sRem(`${this.redisNamespace}:${this.activeKey}`, retryId);
            logger.debug('Retry marked as inactive', { retryId });
        } catch (error) {
            logger.error('Failed to mark retry as inactive', {
                retryId,
                error: error.message
            });
            this.activeRetries.delete(retryId);
        }
    }

    /**
     * Get retries ready to be executed (score <= current timestamp)
     */
    async getReadyRetries(limit = 10) {
        if (!this.useRedis) {
            const now = Date.now();
            const ready = [];
            for (const [retryId, entry] of this.retryQueue.entries()) {
                if (entry.retryAt <= now && entry.status !== 'processing' && ready.length < limit) {
                    ready.push(retryId);
                }
            }
            return ready;
        }

        try {
            const now = Date.now();
            // Get all retries with score (retryAt) <= now
            const retryIds = await redisClient.zRangeByScore(
                `${this.redisNamespace}:${this.queueKey}`,
                0,
                now,
                { LIMIT: { offset: 0, count: limit } }
            );

            return retryIds;
        } catch (error) {
            logger.error('Failed to get ready retries from Redis', {
                error: error.message
            });
            return [];
        }
    }

    /**
     * Calculate exponential backoff delay with jitter
     * @param {number} retryCount - Current retry attempt
     * @param {object} config - Retry configuration
     * @returns {number} Delay in milliseconds
     */
    calculateBackoff(retryCount, config = {}) {
        const baseDelay = config.baseDelay || 1000; // 1 second default
        const maxDelay = config.maxDelay || 300000; // 5 minutes default
        const jitterFactor = config.jitterFactor || 0.1; // 10% jitter

        // Exponential backoff: 2^n * baseDelay
        let delay = Math.pow(2, retryCount) * baseDelay;

        // Cap at maxDelay
        delay = Math.min(delay, maxDelay);

        // Add jitter to prevent thundering herd
        const jitter = delay * jitterFactor * Math.random();
        delay = Math.floor(delay + jitter);

        logger.debug('Calculated backoff delay', {
            retryCount,
            delay,
            baseDelay,
            maxDelay
        });

        return delay;
    }

    /**
     * Schedule a retry for a failed operation
     */
    async scheduleRetry(orderId, platform, operation, payload, currentRetryCount = 0) {
        try {
            // Get retry configuration
            const config = await this.getRetryConfig(platform);

            // Check if we've exhausted retries
            if (currentRetryCount >= config.maxRetries) {
                logger.warn('Max retries exhausted, moving to DLQ', {
                    orderId,
                    platform,
                    operation,
                    retryCount: currentRetryCount,
                    maxRetries: config.maxRetries
                });

                return await this.moveToDeadLetterQueue(
                    orderId,
                    platform,
                    operation,
                    payload,
                    new Error(`Max retries (${config.maxRetries}) exhausted`)
                );
            }

            // Calculate backoff delay
            const delay = this.calculateBackoff(currentRetryCount, config);

            // Create retry entry
            const retryId = `${platform}_${orderId}_${operation}_${Date.now()}`;
            const retryAt = Date.now() + delay;

            const retryEntry = {
                retryId,
                orderId,
                platform,
                operation,
                payload,
                retryCount: currentRetryCount + 1,
                maxRetries: config.maxRetries,
                scheduledAt: Date.now(),
                retryAt,
                status: 'scheduled'
            };

            // Add to retry queue (Redis or in-memory)
            await this.addToQueue(retryId, retryEntry);

            // Update order with retry info
            await orderModel.findByIdAndUpdate(orderId, {
                'courierIntegration.retryCount': currentRetryCount + 1,
                'courierIntegration.syncStatus': 'pending',
                'courierIntegration.lastSyncAt': Date.now()
            });

            logger.info('Retry scheduled', {
                orderId,
                platform,
                operation,
                retryCount: currentRetryCount + 1,
                delay,
                retryAt: new Date(retryAt).toISOString()
            });

            return {
                success: true,
                retryId,
                retryAt,
                retryCount: currentRetryCount + 1
            };

        } catch (error) {
            logger.error('Failed to schedule retry', {
                orderId,
                platform,
                operation,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Execute a retry
     */
    async executeRetry(retryId) {
        const retryEntry = await this.getFromQueue(retryId);
        if (!retryEntry) {
            logger.warn('Retry entry not found', { retryId });
            return null;
        }

        // Check if already being processed
        const isCurrentlyActive = await this.isActive(retryId);
        if (isCurrentlyActive) {
            logger.warn('Retry already in progress', { retryId });
            return null;
        }

        try {
            // Mark as active
            await this.markAsActive(retryId);
            retryEntry.status = 'processing';

            const { orderId, platform, operation, payload, retryCount } = retryEntry;

            logger.info('Executing retry', {
                orderId,
                platform,
                operation,
                retryCount,
                retryId
            });

            // Import dynamically to avoid circular dependencies
            const MuditaKuryeService = (await import('./MuditaKuryeService.js')).default;

            // Execute operation based on type
            let result;
            switch (operation) {
                case 'submit_order':
                    if (platform === 'muditakurye') {
                        result = await MuditaKuryeService.createOrder(payload);
                    } else {
                        throw new Error(`Unknown platform: ${platform}`);
                    }
                    break;

                case 'update_status':
                    if (platform === 'muditakurye') {
                        result = await MuditaKuryeService.updateOrderStatus(
                            payload.externalOrderId,
                            payload.status,
                            payload.additionalData
                        );
                    } else {
                        throw new Error(`Unknown platform: ${platform}`);
                    }
                    break;

                case 'cancel_order':
                    if (platform === 'muditakurye') {
                        result = await MuditaKuryeService.cancelOrder(
                            payload.externalOrderId,
                            payload.reason
                        );
                    } else {
                        throw new Error(`Unknown platform: ${platform}`);
                    }
                    break;

                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            // Check if operation succeeded
            if (result.success) {
                // Success! Clean up and update order
                await this.removeFromQueue(retryId);
                await this.markAsInactive(retryId);

                await orderModel.findByIdAndUpdate(orderId, {
                    'courierIntegration.syncStatus': 'synced',
                    'courierIntegration.retryCount': 0,
                    'courierIntegration.lastSyncAt': Date.now(),
                    'courierIntegration.externalOrderId': result.externalOrderId || payload.externalOrderId
                });

                logger.info('Retry succeeded', {
                    orderId,
                    platform,
                    operation,
                    retryCount,
                    retryId
                });

                return { success: true, result };

            } else {
                // Failed again
                await this.markAsInactive(retryId);
                await this.removeFromQueue(retryId);

                // Check if error is retryable
                if (result.error?.retryable) {
                    // Schedule next retry
                    return await this.scheduleRetry(
                        orderId,
                        platform,
                        operation,
                        payload,
                        retryCount
                    );
                } else {
                    // Non-retryable error, move to DLQ
                    logger.warn('Non-retryable error, moving to DLQ', {
                        orderId,
                        error: result.error
                    });

                    return await this.moveToDeadLetterQueue(
                        orderId,
                        platform,
                        operation,
                        payload,
                        result.error
                    );
                }
            }

        } catch (error) {
            // Execution error
            await this.markAsInactive(retryId);
            await this.removeFromQueue(retryId);

            logger.error('Retry execution failed', {
                retryId,
                error: error.message,
                stack: error.stack
            });

            // Schedule next retry or move to DLQ
            if (retryEntry.retryCount < retryEntry.maxRetries) {
                return await this.scheduleRetry(
                    retryEntry.orderId,
                    retryEntry.platform,
                    retryEntry.operation,
                    retryEntry.payload,
                    retryEntry.retryCount
                );
            } else {
                return await this.moveToDeadLetterQueue(
                    retryEntry.orderId,
                    retryEntry.platform,
                    retryEntry.operation,
                    retryEntry.payload,
                    error
                );
            }
        }
    }

    /**
     * Move failed operation to Dead Letter Queue
     */
    async moveToDeadLetterQueue(orderId, platform, operation, payload, error) {
        try {
            // Create DLQ entry
            const dlqItem = new DeadLetterQueueModel({
                orderId,
                platform,
                operation,
                payload,
                lastError: {
                    message: error.message || 'Unknown error',
                    code: error.code || 'UNKNOWN',
                    statusCode: error.statusCode,
                    timestamp: Date.now(),
                    stack: error.stack
                },
                retryCount: payload.retryCount || 0,
                status: 'pending',
                priority: this.determinePriority(operation, payload),
                metadata: {
                    orderNumber: payload.orderId,
                    customerName: payload.customerName || payload.address?.name,
                    customerPhone: payload.customerPhone || payload.address?.phone,
                    amount: payload.amount,
                    branchId: payload.branchId,
                    correlationId: payload.correlationId
                },
                lastAttemptAt: Date.now()
            });

            await dlqItem.save();

            // Update order status
            await orderModel.findByIdAndUpdate(orderId, {
                'courierIntegration.syncStatus': 'failed',
                'courierIntegration.failureReason': error.message
            });

            // Send admin notification
            this.notifyAdmins(dlqItem);

            logger.error('Operation moved to Dead Letter Queue', {
                orderId,
                platform,
                operation,
                dlqId: dlqItem._id,
                error: error.message
            });

            return {
                success: false,
                dlqId: dlqItem._id,
                error: error.message
            };

        } catch (dlqError) {
            logger.error('Failed to move to DLQ', {
                orderId,
                error: dlqError.message
            });
            throw dlqError;
        }
    }

    /**
     * Get retry configuration for a platform
     */
    async getRetryConfig(platform) {
        try {
            const config = await CourierIntegrationConfigModel.findOne({ platform });

            return {
                maxRetries: config?.retryConfig?.maxRetries || 5,
                baseDelay: config?.retryConfig?.baseDelay || 1000,
                maxDelay: config?.retryConfig?.maxDelay || 300000,
                jitterFactor: 0.1
            };
        } catch (error) {
            // Return defaults if config fetch fails
            return {
                maxRetries: 5,
                baseDelay: 1000,
                maxDelay: 300000,
                jitterFactor: 0.1
            };
        }
    }

    /**
     * Determine priority for DLQ item
     */
    determinePriority(operation, payload) {
        // High priority for large orders or critical operations
        if (payload.amount > 500) return 'high';
        if (operation === 'submit_order' && payload.paymentMethod === 'ONLINE_PREPAID') return 'high';
        if (operation === 'cancel_order') return 'high';

        // Medium priority for most operations
        if (operation === 'submit_order') return 'medium';
        if (operation === 'update_status') return 'medium';

        // Low priority for others
        return 'low';
    }

    /**
     * Notify admins about DLQ entry
     */
    async notifyAdmins(dlqItem) {
        // TODO: Implement admin notification
        // This could be email, SMS, or in-app notification
        logger.info('Admin notification would be sent', {
            dlqId: dlqItem._id,
            orderId: dlqItem.orderId,
            platform: dlqItem.platform
        });
    }

    /**
     * Start background processor for retries
     */
    startRetryProcessor() {
        setInterval(async () => {
            try {
                // Get retries ready for execution
                const readyRetries = await this.getReadyRetries(10); // Process up to 10 at a time

                for (const retryId of readyRetries) {
                    // Execute retry asynchronously
                    this.executeRetry(retryId).catch(error => {
                        logger.error('Background retry execution failed', {
                            retryId,
                            error: error.message
                        });
                    });
                }

                if (readyRetries.length > 0) {
                    logger.debug('Retry processor batch completed', {
                        processed: readyRetries.length
                    });
                }
            } catch (error) {
                logger.error('Retry processor error', {
                    error: error.message,
                    stack: error.stack
                });
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Start DLQ cleanup job
     */
    startDLQCleanup() {
        // Run daily at 2 AM
        setInterval(async () => {
            try {
                const result = await DeadLetterQueueModel.cleanOldItems(30); // Clean items older than 30 days
                logger.info('DLQ cleanup completed', {
                    deletedCount: result.deletedCount
                });
            } catch (error) {
                logger.error('DLQ cleanup failed', {
                    error: error.message
                });
            }
        }, 24 * 60 * 60 * 1000); // Run once per day
    }

    /**
     * Get retry queue statistics
     */
    async getStats() {
        const stats = {
            queueSize: 0,
            activeRetries: 0,
            queuedItems: [],
            activeItems: [],
            useRedis: this.useRedis
        };

        if (!this.useRedis) {
            // In-memory stats
            stats.queueSize = this.retryQueue.size;
            stats.activeRetries = this.activeRetries.size;

            for (const [retryId, entry] of this.retryQueue.entries()) {
                stats.queuedItems.push({
                    retryId,
                    orderId: entry.orderId,
                    platform: entry.platform,
                    operation: entry.operation,
                    retryCount: entry.retryCount,
                    retryAt: entry.retryAt,
                    status: entry.status
                });
            }

            for (const [retryId, startTime] of this.activeRetries.entries()) {
                stats.activeItems.push({
                    retryId,
                    startTime,
                    duration: Date.now() - startTime
                });
            }
        } else {
            // Redis stats
            try {
                stats.queueSize = await redisClient.zCard(`${this.redisNamespace}:${this.queueKey}`);
                stats.activeRetries = await redisClient.sCard(`${this.redisNamespace}:${this.activeKey}`);

                // Get sample of queued items (up to 50)
                const retryIds = await redisClient.zRange(`${this.redisNamespace}:${this.queueKey}`, 0, 49);
                for (const retryId of retryIds) {
                    const entry = await this.getFromQueue(retryId);
                    if (entry) {
                        stats.queuedItems.push({
                            retryId,
                            orderId: entry.orderId,
                            platform: entry.platform,
                            operation: entry.operation,
                            retryCount: entry.retryCount,
                            retryAt: entry.retryAt,
                            status: entry.status
                        });
                    }
                }

                // Get active retries
                const activeRetries = await redisClient.sMembers(`${this.redisNamespace}:${this.activeKey}`);
                for (const retryId of activeRetries) {
                    stats.activeItems.push({
                        retryId
                    });
                }
            } catch (error) {
                logger.error('Failed to get Redis stats', {
                    error: error.message
                });
            }
        }

        return stats;
    }

    /**
     * Manually retry a DLQ item
     */
    async retryDLQItem(dlqId) {
        try {
            const dlqItem = await DeadLetterQueueModel.findById(dlqId);
            if (!dlqItem) {
                throw new Error('DLQ item not found');
            }

            // Mark as retrying
            await dlqItem.markForRetry();

            // Schedule retry
            const result = await this.scheduleRetry(
                dlqItem.orderId,
                dlqItem.platform,
                dlqItem.operation,
                dlqItem.payload,
                0 // Reset retry count for manual retry
            );

            return result;
        } catch (error) {
            logger.error('Failed to retry DLQ item', {
                dlqId,
                error: error.message
            });
            throw error;
        }
    }
}

// Export singleton instance
export default new RetryService();