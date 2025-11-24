import { getFromCache, setInCache } from '../config/redis.js';

/**
 * Cache Middleware
 * Automatically caches GET requests for specified duration
 */
export const cache = (durationSeconds = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Don't cache if explicitly disabled
    if (req.query.noCache === 'true') {
      return next();
    }

    const cacheKey = `${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Try to get from cache
      const cachedData = await getFromCache(cacheKey);

      if (cachedData) {
        // Add cache header
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Cache miss - override res.json to capture response
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        // Only cache successful responses
        if (data.success && durationSeconds > 0) {
          setInCache(cacheKey, data, durationSeconds);
        }
        
        // Add cache header
        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Clears related cache when data is updated
 */
export const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end.bind(res);

    res.end = function(chunk, encoding) {
      // Only invalidate on successful response
      if (res.statusCode === 200 || res.statusCode === 201) {
        import('../config/redis.js').then(({ deletePattern }) => {
          deletePattern(pattern);
        });
      }
      return originalEnd(chunk, encoding);
    };

    next();
  };
};

