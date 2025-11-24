import OutgoingWebhookService from '../services/OutgoingWebhookService.js';
import WebhookEventModel from '../models/WebhookEventModel.js';
import logger from '../utils/logger.js';

/**
 * OutgoingWebhookController
 * Admin endpoints for managing outgoing webhook events
 */

/**
 * GET /api/admin/webhooks/events
 * List webhook events with filtering
 */
export const listWebhookEvents = async (req, res) => {
    try {
        const {
            status,
            eventType,
            subscriptionId,
            entityType,
            entityId,
            page = 1,
            limit = 50,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (eventType) filter.eventType = eventType;
        if (subscriptionId) filter.subscriptionId = subscriptionId;
        if (entityType) filter.entityType = entityType;
        if (entityId) filter.entityId = entityId;

        // Execute query
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [events, total] = await Promise.all([
            WebhookEventModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('subscriptionId', 'name url platform')
                .lean(),
            WebhookEventModel.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                events,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        logger.error('Failed to list webhook events', {
            error: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            error: 'Failed to list webhook events',
            message: error.message
        });
    }
};

/**
 * GET /api/admin/webhooks/events/:id
 * Get webhook event details
 */
export const getWebhookEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await WebhookEventModel.findById(id)
            .populate('subscriptionId', 'name url platform enabled')
            .lean();

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Webhook event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });

    } catch (error) {
        logger.error('Failed to get webhook event', {
            eventId: req.params.id,
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to get webhook event',
            message: error.message
        });
    }
};

/**
 * POST /api/admin/webhooks/events/:id/retry
 * Manually retry a failed webhook event
 */
export const retryWebhookEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await WebhookEventModel.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Webhook event not found'
            });
        }

        if (event.status === 'delivered') {
            return res.status(400).json({
                success: false,
                error: 'Event already delivered'
            });
        }

        if (event.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Event is cancelled'
            });
        }

        // Reset retry count and schedule immediate retry
        event.retryCount = 0;
        event.nextRetryAt = new Date();
        event.status = 'pending';
        await event.save();

        // Trigger immediate delivery
        OutgoingWebhookService.deliverEvent(event._id).catch(err => {
            logger.error('Manual retry delivery failed', {
                eventId: event._id,
                error: err.message
            });
        });

        res.json({
            success: true,
            message: 'Webhook event retry scheduled',
            data: {
                eventId: event._id,
                nextRetryAt: event.nextRetryAt
            }
        });

    } catch (error) {
        logger.error('Failed to retry webhook event', {
            eventId: req.params.id,
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to retry webhook event',
            message: error.message
        });
    }
};

/**
 * POST /api/admin/webhooks/events/:id/cancel
 * Cancel a pending webhook event
 */
export const cancelWebhookEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const event = await WebhookEventModel.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Webhook event not found'
            });
        }

        if (event.status === 'delivered') {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel delivered event'
            });
        }

        await event.cancel(reason || 'Manually cancelled by admin');

        res.json({
            success: true,
            message: 'Webhook event cancelled',
            data: {
                eventId: event._id,
                status: event.status
            }
        });

    } catch (error) {
        logger.error('Failed to cancel webhook event', {
            eventId: req.params.id,
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to cancel webhook event',
            message: error.message
        });
    }
};

/**
 * GET /api/admin/webhooks/stats
 * Get webhook delivery statistics
 */
export const getWebhookStats = async (req, res) => {
    try {
        const { subscriptionId, days = 7 } = req.query;

        const stats = await OutgoingWebhookService.getStats(
            subscriptionId,
            parseInt(days)
        );

        // Get recent failures
        const recentFailures = await WebhookEventModel.getRecentFailures(10);

        // Calculate success rate
        const totalDelivered = stats.find(s => s._id === 'delivered')?.count || 0;
        const totalFailed = stats.find(s => s._id === 'failed')?.count || 0;
        const total = stats.reduce((sum, s) => sum + s.count, 0);
        const successRate = total > 0 ? ((totalDelivered / total) * 100).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                stats,
                summary: {
                    total,
                    delivered: totalDelivered,
                    failed: totalFailed,
                    successRate: parseFloat(successRate),
                    avgDuration: stats.find(s => s._id === 'delivered')?.avgDuration || 0
                },
                recentFailures: recentFailures.map(f => ({
                    id: f._id,
                    eventType: f.eventType,
                    url: f.subscriptionId?.url,
                    error: f.error?.message,
                    failedAt: f.failedAt,
                    retryCount: f.retryCount
                }))
            }
        });

    } catch (error) {
        logger.error('Failed to get webhook stats', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to get webhook stats',
            message: error.message
        });
    }
};

/**
 * GET /api/admin/webhooks/timeline/:entityType/:entityId
 * Get webhook event timeline for an entity
 */
export const getEntityTimeline = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;

        const timeline = await WebhookEventModel.getEntityTimeline(entityType, entityId);

        res.json({
            success: true,
            data: {
                entityType,
                entityId,
                events: timeline
            }
        });

    } catch (error) {
        logger.error('Failed to get entity timeline', {
            entityType: req.params.entityType,
            entityId: req.params.entityId,
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to get entity timeline',
            message: error.message
        });
    }
};

/**
 * POST /api/admin/webhooks/test
 * Send test webhook event
 */
export const sendTestWebhook = async (req, res) => {
    try {
        const { subscriptionId, eventType = 'test.event', payload = {} } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                error: 'subscriptionId is required'
            });
        }

        const testPayload = {
            test: true,
            timestamp: new Date().toISOString(),
            ...payload
        };

        const events = await OutgoingWebhookService.sendEvent(
            eventType,
            testPayload,
            {
                subscriptionId,
                entityType: 'test',
                entityId: '000000000000000000000000', // Dummy ID
                metadata: {
                    test: true,
                    triggeredBy: req.user?.email || 'admin'
                },
                priority: 'high' // Send immediately
            }
        );

        res.json({
            success: true,
            message: 'Test webhook sent',
            data: events[0]
        });

    } catch (error) {
        logger.error('Failed to send test webhook', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to send test webhook',
            message: error.message
        });
    }
};
