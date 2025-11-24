import {
    getCacheInfo,
    getCacheStats,
    getKeys,
    getKeyInfo,
    clearCache,
    clearCacheByNamespace,
    deleteFromCache,
    isRedisAvailable
} from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Cache Management Controller
 * Admin endpoints for managing Redis cache
 */

/**
 * Get cache overview and statistics
 * GET /api/admin/cache
 */
export const getCacheOverview = async (req, res) => {
    try {
        const info = await getCacheInfo();

        if (!info || !info.connected) {
            return res.status(503).json({
                success: false,
                message: 'Cache is not available',
                data: info || { enabled: false, connected: false }
            });
        }

        // Get namespaces
        const allKeys = await getKeys('*', 1000);
        const namespaces = {};

        allKeys.forEach(key => {
            const namespace = key.split(':')[0];
            namespaces[namespace] = (namespaces[namespace] || 0) + 1;
        });

        const overview = {
            status: 'connected',
            totalKeys: info.keys,
            namespaces,
            server: {
                version: info.info?.server?.redis_version,
                uptime: info.info?.server?.uptime_in_seconds,
                os: info.info?.server?.os
            },
            memory: {
                used: info.info?.memory?.used_memory_human,
                peak: info.info?.memory?.used_memory_peak_human,
                fragmentation: info.info?.memory?.mem_fragmentation_ratio
            },
            stats: {
                connections: info.info?.stats?.total_connections_received,
                commands: info.info?.stats?.total_commands_processed,
                keyspaceHits: info.info?.stats?.keyspace_hits,
                keyspaceMisses: info.info?.stats?.keyspace_misses
            }
        };

        res.json({
            success: true,
            data: overview
        });

    } catch (error) {
        logger.error('Get cache overview error', {
            error: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get all cache keys with optional filtering
 * GET /api/admin/cache/keys?pattern=*&limit=100
 */
export const getCacheKeys = async (req, res) => {
    try {
        if (!isRedisAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'Cache is not available'
            });
        }

        const { pattern = '*', limit = 100 } = req.query;
        const keys = await getKeys(pattern, parseInt(limit));

        // Get details for each key
        const keysWithDetails = await Promise.all(
            keys.slice(0, 50).map(async (key) => {
                try {
                    const info = await getKeyInfo(key);
                    return info;
                } catch (error) {
                    return { key, error: error.message };
                }
            })
        );

        res.json({
            success: true,
            data: {
                pattern,
                total: keys.length,
                keys: keysWithDetails
            }
        });

    } catch (error) {
        logger.error('Get cache keys error', {
            error: error.message,
            pattern: req.query.pattern
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get specific key details
 * GET /api/admin/cache/keys/:key
 */
export const getKeyDetails = async (req, res) => {
    try {
        if (!isRedisAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'Cache is not available'
            });
        }

        const { key } = req.params;
        const keyInfo = await getKeyInfo(key);

        if (!keyInfo) {
            return res.status(404).json({
                success: false,
                error: 'Key not found'
            });
        }

        res.json({
            success: true,
            data: keyInfo
        });

    } catch (error) {
        logger.error('Get key details error', {
            error: error.message,
            key: req.params.key
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Clear all cache
 * POST /api/admin/cache/clear
 */
export const clearAllCache = async (req, res) => {
    try {
        if (!isRedisAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'Cache is not available'
            });
        }

        const result = await clearCache();

        if (!result) {
            return res.status(500).json({
                success: false,
                error: 'Failed to clear cache'
            });
        }

        logger.info('All cache cleared', {
            userId: req.user?.userId,
            admin: req.user?.email
        });

        res.json({
            success: true,
            message: 'All cache cleared successfully'
        });

    } catch (error) {
        logger.error('Clear all cache error', {
            error: error.message,
            userId: req.user?.userId
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Clear cache by namespace
 * POST /api/admin/cache/clear/:namespace
 */
export const clearNamespaceCache = async (req, res) => {
    try {
        if (!isRedisAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'Cache is not available'
            });
        }

        const { namespace } = req.params;
        const result = await clearCacheByNamespace(namespace);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.message || 'Failed to clear namespace cache'
            });
        }

        logger.info('Namespace cache cleared', {
            namespace,
            deletedCount: result.deletedCount,
            userId: req.user?.userId
        });

        res.json({
            success: true,
            message: `Cleared ${result.deletedCount} keys from namespace: ${namespace}`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        logger.error('Clear namespace cache error', {
            error: error.message,
            namespace: req.params.namespace
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Delete specific key
 * DELETE /api/admin/cache/keys/:key
 */
export const deleteKey = async (req, res) => {
    try {
        if (!isRedisAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'Cache is not available'
            });
        }

        const { key } = req.params;
        const result = await deleteFromCache(key);

        if (!result) {
            return res.status(500).json({
                success: false,
                error: 'Failed to delete key'
            });
        }

        logger.info('Cache key deleted', {
            key,
            userId: req.user?.userId
        });

        res.json({
            success: true,
            message: `Key deleted: ${key}`
        });

    } catch (error) {
        logger.error('Delete key error', {
            error: error.message,
            key: req.params.key
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get cache statistics
 * GET /api/admin/cache/stats
 */
export const getCacheStatistics = async (req, res) => {
    try {
        if (!isRedisAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'Cache is not available'
            });
        }

        const stats = await getCacheStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get cache stats error', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export default {
    getCacheOverview,
    getCacheKeys,
    getKeyDetails,
    clearAllCache,
    clearNamespaceCache,
    deleteKey,
    getCacheStatistics
};
