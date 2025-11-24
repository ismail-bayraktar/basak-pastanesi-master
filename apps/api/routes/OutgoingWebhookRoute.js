import express from 'express';
import {
    listWebhookEvents,
    getWebhookEvent,
    retryWebhookEvent,
    cancelWebhookEvent,
    getWebhookStats,
    getEntityTimeline,
    sendTestWebhook
} from '../controllers/OutgoingWebhookController.js';
import adminAuth from '../middleware/AdminAuth.js';

const router = express.Router();

/**
 * Outgoing Webhook Management Routes
 * All routes require admin authentication
 *
 * These endpoints manage outgoing webhook events sent to external systems
 */

// All webhook management routes require admin authentication
router.use(adminAuth);

/**
 * GET /api/admin/webhooks/events
 * List webhook events with filtering
 *
 * Query Parameters:
 * - status: Filter by status (pending, sending, delivered, failed, cancelled)
 * - eventType: Filter by event type (order.created, order.updated, etc.)
 * - subscriptionId: Filter by subscription
 * - entityType: Filter by entity type (order, courier, payment)
 * - entityId: Filter by entity ID
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 * - sortBy: Sort field (default: createdAt)
 * - sortOrder: Sort order (asc/desc, default: desc)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     events: [...],
 *     pagination: { page, limit, total, pages }
 *   }
 * }
 */
router.get('/events', listWebhookEvents);

/**
 * GET /api/admin/webhooks/events/:id
 * Get webhook event details
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     _id, eventType, status, url, payload, response, error, ...
 *   }
 * }
 */
router.get('/events/:id', getWebhookEvent);

/**
 * POST /api/admin/webhooks/events/:id/retry
 * Manually retry a failed webhook event
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Webhook event retry scheduled',
 *   data: { eventId, nextRetryAt }
 * }
 */
router.post('/events/:id/retry', retryWebhookEvent);

/**
 * POST /api/admin/webhooks/events/:id/cancel
 * Cancel a pending webhook event
 *
 * Body:
 * {
 *   reason: 'Cancellation reason'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Webhook event cancelled',
 *   data: { eventId, status }
 * }
 */
router.post('/events/:id/cancel', cancelWebhookEvent);

/**
 * GET /api/admin/webhooks/stats
 * Get webhook delivery statistics
 *
 * Query Parameters:
 * - subscriptionId: Filter by subscription (optional)
 * - days: Number of days to analyze (default: 7)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     stats: [...],
 *     summary: { total, delivered, failed, successRate, avgDuration },
 *     recentFailures: [...]
 *   }
 * }
 */
router.get('/stats', getWebhookStats);

/**
 * GET /api/admin/webhooks/timeline/:entityType/:entityId
 * Get webhook event timeline for an entity (order, courier, etc.)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     entityType, entityId,
 *     events: [...]
 *   }
 * }
 */
router.get('/timeline/:entityType/:entityId', getEntityTimeline);

/**
 * POST /api/admin/webhooks/test
 * Send test webhook event
 *
 * Body:
 * {
 *   subscriptionId: 'webhook_config_id',
 *   eventType: 'test.event',
 *   payload: { ... }
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Test webhook sent',
 *   data: { eventId, status, ... }
 * }
 */
router.post('/test', sendTestWebhook);

export default router;
