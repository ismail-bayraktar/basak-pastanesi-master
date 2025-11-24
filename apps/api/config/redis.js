import redis from 'redis';
import logger from '../utils/logger.js';

/**
 * Redis Cache Configuration
 * Provides caching layer for improved performance
 */

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
export const connectRedis = async () => {
  try {
    // If REDIS_ENABLED is explicitly false, don't connect (even if REDIS_URL is set)
    if (process.env.REDIS_ENABLED === 'false') {
      logger.info('Redis disabled (REDIS_ENABLED=false), skipping connection');
      return;
    }

    // Check if Redis is explicitly disabled or not enabled
    if (process.env.REDIS_ENABLED !== 'true' && !process.env.REDIS_URL) {
      logger.info('Redis disabled, skipping connection');
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 50, 1000);
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      isConnected = true;
    });

    await redisClient.connect();
    logger.info('✅ Redis Connected Successfully');
  } catch (error) {
    logger.error('Redis connection failed', { error: error.message });
    isConnected = false;
  }
};

/**
 * Get value from cache
 */
export const getFromCache = async (key) => {
  if (!redisClient || !isConnected) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis get error', { key, error: error.message });
    return null;
  }
};

/**
 * Set value in cache
 */
export const setInCache = async (key, value, expirySeconds = 3600) => {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error', { key, error: error.message });
    return false;
  }
};

/**
 * Delete from cache
 */
export const deleteFromCache = async (key) => {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error', { key, error: error.message });
    return false;
  }
};

/**
 * Delete multiple keys by pattern
 */
export const deletePattern = async (pattern) => {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis delete pattern error', { pattern, error: error.message });
    return false;
  }
};

/**
 * Clear all cache
 */
export const clearCache = async () => {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    await redisClient.flushAll();
    logger.info('Cache cleared');
    return true;
  } catch (error) {
    logger.error('Redis flush error', { error: error.message });
    return false;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  if (!redisClient || !isConnected) {
    return null;
  }

  try {
    const info = await redisClient.info();
    const dbSize = await redisClient.dbSize();
    const memory = await redisClient.info('memory');

    return {
      connected: isConnected,
      dbSize,
      info,
      memory
    };
  } catch (error) {
    logger.error('Redis stats error', { error: error.message });
    return null;
  }
};

/**
 * Get detailed cache information for admin panel
 */
export const getCacheInfo = async () => {
  if (!redisClient || !isConnected) {
    return {
      enabled: false,
      connected: false,
      message: 'Redis is not connected'
    };
  }

  try {
    const dbSize = await redisClient.dbSize();
    const info = await redisClient.info('server');
    const memory = await redisClient.info('memory');
    const stats = await redisClient.info('stats');

    return {
      enabled: true,
      connected: isConnected,
      keys: dbSize,
      info: {
        server: parseRedisInfo(info),
        memory: parseRedisInfo(memory),
        stats: parseRedisInfo(stats)
      }
    };
  } catch (error) {
    logger.error('Redis cache info error', { error: error.message });
    return {
      enabled: true,
      connected: false,
      error: error.message
    };
  }
};

/**
 * Get all keys matching a pattern
 */
export const getKeys = async (pattern = '*', limit = 100) => {
  if (!redisClient || !isConnected) {
    return [];
  }

  try {
    const keys = await redisClient.keys(pattern);
    return keys.slice(0, limit);
  } catch (error) {
    logger.error('Redis get keys error', { pattern, error: error.message });
    return [];
  }
};

/**
 * Get key with TTL information
 */
export const getKeyInfo = async (key) => {
  if (!redisClient || !isConnected) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    const ttl = await redisClient.ttl(key);
    const type = await redisClient.type(key);

    return {
      key,
      value: value ? JSON.parse(value) : null,
      ttl,
      type
    };
  } catch (error) {
    logger.error('Redis key info error', { key, error: error.message });
    return null;
  }
};

/**
 * Clear cache by namespace (pattern)
 */
export const clearCacheByNamespace = async (namespace) => {
  if (!redisClient || !isConnected) {
    return { success: false, message: 'Redis not connected' };
  }

  try {
    const pattern = `${namespace}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared ${keys.length} keys from namespace: ${namespace}`);
      return { success: true, deletedCount: keys.length };
    }

    return { success: true, deletedCount: 0 };
  } catch (error) {
    logger.error('Redis clear namespace error', { namespace, error: error.message });
    return { success: false, message: error.message };
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => redisClient;

/**
 * Parse Redis INFO output to object
 */
function parseRedisInfo(infoString) {
  const lines = infoString.split('\r\n');
  const info = {};

  for (const line of lines) {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split(':');
      if (key && value) {
        info[key] = value;
      }
    }
  }

  return info;
}

/**
 * Set value with namespace
 */
export const setInNamespace = async (namespace, key, value, expirySeconds = 3600) => {
  const namespacedKey = `${namespace}:${key}`;
  return await setInCache(namespacedKey, value, expirySeconds);
};

/**
 * Get value from namespace
 */
export const getFromNamespace = async (namespace, key) => {
  const namespacedKey = `${namespace}:${key}`;
  return await getFromCache(namespacedKey);
};

/**
 * Delete from namespace
 */
export const deleteFromNamespace = async (namespace, key) => {
  const namespacedKey = `${namespace}:${key}`;
  return await deleteFromCache(namespacedKey);
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = () => {
  return isConnected && redisClient !== null;
};

// Export redisClient for direct access
export { redisClient };

export default redisClient;

