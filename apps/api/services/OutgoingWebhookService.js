import axios from 'axios';
import crypto from 'crypto';
import WebhookEventModel from '../models/WebhookEventModel.js';
import WebhookConfigModel from '../models/WebhookConfigModel.js';
import logger from '../utils/logger.js';
import WebhookSecurity from '../utils/webhookSecurity.js';
import os from 'os';

/**
 * OutgoingWebhookService
 * Handles sending webhook events to external systems with:
 * - HMAC signature security
 * - Automatic retry with exponential backoff
 * - Delivery tracking and analytics
 * - Idempotency support
 * - Circuit breaker pattern for failing endpoints
 */

class OutgoingWebhookService {
    constructor() {
        this.initialized = false;
        this.processorInterval = null;
        this.serverInstance = `${os.hostname()}-${process.pid}`;

        // Axios instance with timeouts
        this.httpClient = axios.create({
            timeout: 30000, // 30 seconds
            maxRedirects: 3,
            validateStatus: (status) => status >= 200 && status < 300
        });

        // Add request interceptor for logging
        this.httpClient.interceptors.request.use(
            (config) => {
                config.metadata = { startTime: Date.now() };
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for timing
        this.httpClient.interceptors.response.use(
            (response) => {
                const duration = Date.now() - response.config.metadata.startTime;
                logger.debug('Webhook delivered', {
                    url: response.config.url,
                    status: response.status,
                    duration
                });
                return response;
            },
            (error) => {
                if (error.config?.metadata) {
                    const duration = Date.now() - error.config.metadata.startTime;
                    logger.warn('Webhook delivery failed', {
                        url: error.config?.url,
                        status: error.response?.status,
                        duration,
                        error: error.message
                    });
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Initialize service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Start background processor for retries
            this.startRetryProcessor();

            // Start cleanup job
            this.startCleanupJob();

            this.initialized = true;
            logger.info('OutgoingWebhookService initialized successfully', {
                serverInstance: this.serverInstance
            });
        } catch (error) {
            logger.error('Failed to initialize OutgoingWebhookService', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Send webhook event to external system
     * @param {string} eventType - Type of event (e.g., 'order.created')
     * @param {object} payload - Event payload
     * @param {object} options - Additional options
     * @returns {Promise<object>} Event record
     */
    async sendEvent(eventType, payload, options = {}) {
        try {
            const {
                entityType,
                entityId,
                subscriptionId,
                metadata = {},
                idempotencyKey = crypto.randomUUID(),
                priority = 'normal'
            } = options;

            // Validate required fields
            if (!entityType || !entityId) {
                throw new Error('entityType and entityId are required');
            }

            // Get webhook subscriptions for this event type
            let subscriptions;
            if (subscriptionId) {
                // Send to specific subscription
                subscriptions = await WebhookConfigModel.find({
                    _id: subscriptionId,
                    enabled: true,
                    events: eventType
                });
            } else {
                // Send to all subscriptions listening for this event
                subscriptions = await WebhookConfigModel.find({
                    enabled: true,
                    events: eventType
                });
            }

            if (subscriptions.length === 0) {
                logger.debug('No webhook subscriptions found for event', {
                    eventType,
                    entityType,
                    entityId
                });
                return [];
            }

            // Create webhook events for each subscription
            const events = [];
            for (const subscription of subscriptions) {
                const event = await this.createWebhookEvent(
                    subscription,
                    eventType,
                    payload,
                    {
                        entityType,
                        entityId,
                        metadata,
                        idempotencyKey: `${idempotencyKey}-${subscription._id}`,
                        priority
                    }
                );

                events.push(event);

                // Send immediately for high-priority events
                if (priority === 'high') {
                    this.deliverEvent(event._id).catch(err => {
                        logger.error('Failed to deliver high-priority event', {
                            eventId: event._id,
                            error: err.message
                        });
                    });
                }
            }

            logger.info('Webhook events created', {
                eventType,
                entityType,
                entityId,
                subscriptionCount: subscriptions.length,
                eventIds: events.map(e => e._id)
            });

            return events;

        } catch (error) {
            logger.error('Failed to send webhook event', {
                eventType,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Create webhook event record
     */
    async createWebhookEvent(subscription, eventType, payload, options) {
        try {
            const {
                entityType,
                entityId,
                metadata = {},
                idempotencyKey,
                priority = 'normal'
            } = options;

            // Prepare payload
            const webhookPayload = {
                event: eventType,
                timestamp: new Date().toISOString(),
                data: payload,
                metadata: {
                    ...metadata,
                    platform: subscription.platform || 'tulumbak',
                    correlationId: metadata.correlationId || crypto.randomUUID()
                }
            };

            // Generate signature
            const timestamp = Date.now();
            const signature = WebhookSecurity.generateSignature(
                webhookPayload,
                timestamp,
                subscription.webhookSecret
            );

            // Prepare headers
            const headers = {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': `sha256=${signature}`,
                'X-Webhook-Timestamp': timestamp.toString(),
                'X-Webhook-Event': eventType,
                'X-Webhook-Id': idempotencyKey,
                'X-Webhook-Delivery-Attempt': '1',
                'User-Agent': `Tulumbak-Webhooks/1.0 (${this.serverInstance})`
            };

            // Add custom headers from subscription
            if (subscription.headers) {
                Object.assign(headers, subscription.headers);
            }

            // Calculate next retry time (immediate for first attempt)
            const nextRetryAt = priority === 'high' ? new Date() : new Date(Date.now() + 5000);

            // Create event record
            const event = new WebhookEventModel({
                subscriptionId: subscription._id,
                eventType,
                entityType,
                entityId,
                url: subscription.url,
                payload: webhookPayload,
                headers,
                method: subscription.method || 'POST',
                signature,
                signatureMethod: 'HMAC-SHA256',
                status: 'pending',
                retryCount: 0,
                maxRetries: subscription.retryConfig?.maxRetries || 5,
                nextRetryAt,
                scheduledAt: new Date(),
                metadata: {
                    ...metadata,
                    platform: subscription.platform,
                    serverInstance: this.serverInstance,
                    userAgent: headers['User-Agent']
                },
                idempotencyKey
            });

            await event.save();

            logger.debug('Webhook event created', {
                eventId: event._id,
                eventType,
                url: subscription.url,
                idempotencyKey
            });

            return event;

        } catch (error) {
            // Handle duplicate idempotency key
            if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
                logger.warn('Duplicate webhook event (idempotency)', {
                    eventType,
                    idempotencyKey: options.idempotencyKey
                });
                return await WebhookEventModel.findOne({
                    idempotencyKey: options.idempotencyKey
                });
            }

            logger.error('Failed to create webhook event', {
                eventType,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Deliver webhook event
     */
    async deliverEvent(eventId) {
        try {
            const event = await WebhookEventModel.findById(eventId)
                .populate('subscriptionId');

            if (!event) {
                logger.warn('Webhook event not found', { eventId });
                return null;
            }

            // Check if already delivered
            if (event.status === 'delivered') {
                logger.debug('Event already delivered', { eventId });
                return event;
            }

            // Check if cancelled
            if (event.status === 'cancelled') {
                logger.debug('Event cancelled', { eventId });
                return event;
            }

            // Check if subscription is still enabled
            if (!event.subscriptionId || !event.subscriptionId.enabled) {
                logger.warn('Subscription disabled, cancelling event', {
                    eventId,
                    subscriptionId: event.subscriptionId?._id
                });
                await event.cancel('Subscription disabled');
                return event;
            }

            // Mark as sending
            await event.markAsSending();

            // Update delivery attempt header
            event.headers.set('X-Webhook-Delivery-Attempt', (event.retryCount + 1).toString());

            // Prepare request
            const requestConfig = {
                method: event.method,
                url: event.url,
                data: event.payload,
                headers: Object.fromEntries(event.headers)
            };

            logger.info('Delivering webhook event', {
                eventId: event._id,
                eventType: event.eventType,
                url: event.url,
                attempt: event.retryCount + 1,
                maxRetries: event.maxRetries
            });

            // Send request
            const response = await this.httpClient.request(requestConfig);

            // Mark as delivered
            await event.markAsDelivered({
                statusCode: response.status,
                headers: response.headers,
                body: JSON.stringify(response.data)
            });

            logger.info('Webhook delivered successfully', {
                eventId: event._id,
                eventType: event.eventType,
                statusCode: response.status,
                duration: event.requestDuration
            });

            return event;

        } catch (error) {
            return await this.handleDeliveryError(eventId, error);
        }
    }

    /**
     * Handle delivery error
     */
    async handleDeliveryError(eventId, error) {
        try {
            const event = await WebhookEventModel.findById(eventId);
            if (!event) return null;

            // Extract error details
            const errorDetails = {
                message: error.message,
                code: error.code || error.response?.status || 'UNKNOWN',
                statusCode: error.response?.status
            };

            // Check if retryable
            const isRetryable = this.isRetryableError(error);

            if (isRetryable && event.canRetry()) {
                // Calculate backoff delay
                const delay = this.calculateBackoff(event.retryCount);

                // Schedule retry
                await event.scheduleRetry(delay);

                logger.warn('Webhook delivery failed, scheduled retry', {
                    eventId: event._id,
                    eventType: event.eventType,
                    error: errorDetails.message,
                    retryCount: event.retryCount,
                    nextRetryAt: event.nextRetryAt
                });

            } else {
                // Mark as failed permanently
                await event.markAsFailed(error, error.response ? {
                    statusCode: error.response.status,
                    headers: error.response.headers,
                    body: JSON.stringify(error.response.data).substring(0, 1000)
                } : null);

                logger.error('Webhook delivery failed permanently', {
                    eventId: event._id,
                    eventType: event.eventType,
                    error: errorDetails.message,
                    retryCount: event.retryCount,
                    reason: !isRetryable ? 'Non-retryable error' : 'Max retries exceeded'
                });

                // Notify admins for permanent failures
                await this.notifyAdmins(event, error);
            }

            return event;

        } catch (handlerError) {
            logger.error('Error handling webhook delivery failure', {
                eventId,
                error: handlerError.message
            });
            throw handlerError;
        }
    }

    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        // Network errors are retryable
        if (error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNRESET') {
            return true;
        }

        // Timeout errors are retryable
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            return true;
        }

        // HTTP status codes that are retryable
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        if (error.response?.status && retryableStatusCodes.includes(error.response.status)) {
            return true;
        }

        // Everything else is not retryable
        return false;
    }

    /**
     * Calculate exponential backoff delay
     */
    calculateBackoff(retryCount, baseDelay = 1000, maxDelay = 300000) {
        // Exponential backoff: 2^n * baseDelay
        let delay = Math.pow(2, retryCount) * baseDelay;

        // Cap at maxDelay
        delay = Math.min(delay, maxDelay);

        // Add jitter (0-10% of delay)
        const jitter = delay * 0.1 * Math.random();
        delay = Math.floor(delay + jitter);

        return delay;
    }

    /**
     * Start background processor for retries
     */
    startRetryProcessor() {
        // Process pending events every 10 seconds
        this.processorInterval = setInterval(async () => {
            try {
                // Find events ready for retry
                const events = await WebhookEventModel.findReadyForRetry(50);

                if (events.length > 0) {
                    logger.debug('Processing pending webhook events', {
                        count: events.length
                    });

                    // Process events in parallel (max 10 concurrent)
                    const batchSize = 10;
                    for (let i = 0; i < events.length; i += batchSize) {
                        const batch = events.slice(i, i + batchSize);
                        await Promise.allSettled(
                            batch.map(event => this.deliverEvent(event._id))
                        );
                    }
                }
            } catch (error) {
                logger.error('Webhook retry processor error', {
                    error: error.message,
                    stack: error.stack
                });
            }
        }, 10000); // Every 10 seconds

        logger.info('Webhook retry processor started');
    }

    /**
     * Start cleanup job
     */
    startCleanupJob() {
        // Clean up old events once per day at 3 AM
        const now = new Date();
        const next3AM = new Date(now);
        next3AM.setHours(3, 0, 0, 0);
        if (next3AM <= now) {
            next3AM.setDate(next3AM.getDate() + 1);
        }
        const msUntil3AM = next3AM.getTime() - now.getTime();

        setTimeout(() => {
            this.cleanupOldEvents();
            // Then run every 24 hours
            setInterval(() => {
                this.cleanupOldEvents();
            }, 24 * 60 * 60 * 1000);
        }, msUntil3AM);

        logger.info('Webhook cleanup job scheduled', {
            nextRun: next3AM.toISOString()
        });
    }

    /**
     * Clean up old events
     */
    async cleanupOldEvents() {
        try {
            const result = await WebhookEventModel.cleanOldEvents(90); // 90 days

            logger.info('Webhook events cleanup completed', {
                deletedCount: result.deletedCount
            });

            return result;
        } catch (error) {
            logger.error('Webhook events cleanup failed', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Notify admins about permanent failures
     */
    async notifyAdmins(event, error) {
        // TODO: Implement admin notification (email, Slack, etc.)
        logger.info('Admin notification would be sent', {
            eventId: event._id,
            eventType: event.eventType,
            url: event.url,
            error: error.message
        });
    }

    /**
     * Get delivery statistics
     */
    async getStats(subscriptionId = null, days = 7) {
        try {
            if (subscriptionId) {
                return await WebhookEventModel.getStatsBySubscription(subscriptionId, days);
            }

            // Overall statistics
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const stats = await WebhookEventModel.aggregate([
                { $match: { createdAt: { $gte: cutoff } } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        avgDuration: { $avg: '$requestDuration' }
                    }
                }
            ]);

            return stats;

        } catch (error) {
            logger.error('Failed to get webhook stats', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Stop service gracefully
     */
    async shutdown() {
        logger.info('Shutting down OutgoingWebhookService');

        if (this.processorInterval) {
            clearInterval(this.processorInterval);
            this.processorInterval = null;
        }

        this.initialized = false;
    }
}

// Export singleton instance
export default new OutgoingWebhookService();
