import express from 'express';
import {
    getCacheOverview,
    getCacheKeys,
    getKeyDetails,
    clearAllCache,
    clearNamespaceCache,
    deleteKey,
    getCacheStatistics
} from '../controllers/CacheManagementController.js';
import adminAuth from '../middleware/AdminAuth.js';

const router = express.Router();

/**
 * Cache Management Routes
 * All routes require admin authentication
 *
 * These endpoints are designed for the admin panel to manage Redis cache
 */

// All cache management routes require admin authentication
router.use(adminAuth);

/**
 * GET /api/admin/cache
 * Get cache overview with statistics and namespaces
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     status: 'connected',
 *     totalKeys: 150,
 *     namespaces: { 'courier': 45, 'webhook': 30, 'retry': 25 },
 *     server: { version: '7.0.0', uptime: 123456 },
 *     memory: { used: '1.2MB', peak: '2.5MB' },
 *     stats: { connections: 100, commands: 5000 }
 *   }
 * }
 */
router.get('/', getCacheOverview);

/**
 * GET /api/admin/cache/stats
 * Get detailed cache statistics
 *
 * Response includes hit/miss ratios, command statistics, etc.
 */
router.get('/stats', getCacheStatistics);

/**
 * GET /api/admin/cache/keys
 * Get all cache keys with optional pattern filtering
 *
 * Query Parameters:
 * - pattern: Redis pattern (default: '*')
 * - limit: Maximum number of keys to return (default: 100)
 *
 * Examples:
 * - /api/admin/cache/keys?pattern=courier:*&limit=50
 * - /api/admin/cache/keys?pattern=webhook:*
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     pattern: 'courier:*',
 *     total: 45,
 *     keys: [
 *       { key: 'courier:config:123', type: 'string', ttl: 3600, size: 256 },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/keys', getCacheKeys);

/**
 * GET /api/admin/cache/keys/:key
 * Get specific key details
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     key: 'courier:config:123',
 *     type: 'string',
 *     ttl: 3600,
 *     size: 256,
 *     value: { ... } // if type is string/hash
 *   }
 * }
 */
router.get('/keys/:key', getKeyDetails);

/**
 * POST /api/admin/cache/clear
 * Clear all cache (use with caution!)
 *
 * Response:
 * {
 *   success: true,
 *   message: 'All cache cleared successfully'
 * }
 */
router.post('/clear', clearAllCache);

/**
 * POST /api/admin/cache/clear/:namespace
 * Clear cache by namespace
 *
 * Examples:
 * - POST /api/admin/cache/clear/courier
 * - POST /api/admin/cache/clear/webhook
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Cleared 45 keys from namespace: courier',
 *   deletedCount: 45
 * }
 */
router.post('/clear/:namespace', clearNamespaceCache);

/**
 * DELETE /api/admin/cache/keys/:key
 * Delete specific cache key
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Key deleted: courier:config:123'
 * }
 */
router.delete('/keys/:key', deleteKey);

export default router;
