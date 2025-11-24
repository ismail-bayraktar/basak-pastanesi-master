import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Webhook-specific rate limiter
 * Prevents abuse and DDoS attacks on webhook endpoints
 */

/**
 * Create rate limiter for webhook endpoints
 * Uses combination of IP + webhook signature for more accurate limiting
 */
export const webhookRateLimiter = rateLimit({
    // Time window: 1 minute
    windowMs: 1 * 60 * 1000,

    // Max requests per window
    max: 100, // 100 requests per minute per IP

    // Response headers
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers

    // Custom key generator: IP + webhook platform
    keyGenerator: (req) => {
        const ip = req.ip || req.connection.remoteAddress;
        const platform = req.headers['x-webhook-platform'] ||
                        req.headers['x-mudita-platform'] ||
                        'unknown';

        // Combine IP and platform for more granular limiting
        return `${ip}_${platform}`;
    },

    // Handler when rate limit is exceeded
    handler: (req, res) => {
        const platform = req.headers['x-webhook-platform'] ||
                        req.headers['x-mudita-platform'] ||
                        'unknown';

        logger.warn('Webhook rate limit exceeded', {
            ip: req.ip,
            platform,
            path: req.path,
            webhookId: req.headers['x-webhook-id']
        });

        res.status(429).json({
            success: false,
            error: 'Too many webhook requests',
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        });
    },

    // Skip rate limiting for certain conditions
    skip: (req) => {
        // Skip for internal requests (if needed)
        const isInternal = req.ip === '127.0.0.1' || req.ip === '::1';

        if (isInternal && process.env.NODE_ENV === 'development') {
            return true; // Skip rate limiting for localhost in dev
        }

        return false;
    }
});

/**
 * Strict rate limiter for suspicious activity
 * Triggered when signature verification fails multiple times
 */
export const strictWebhookRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Only 10 failed attempts per 15 minutes
    skipSuccessfulRequests: true, // Only count failed requests

    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
    },

    handler: (req, res) => {
        logger.error('Strict webhook rate limit exceeded - possible attack', {
            ip: req.ip,
            path: req.path,
            userAgent: req.headers['user-agent']
        });

        res.status(429).json({
            success: false,
            error: 'Too many failed webhook attempts',
            code: 'SECURITY_RATE_LIMIT',
            message: 'Your IP has been temporarily blocked due to suspicious activity.',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        });
    }
});

/**
 * Admin webhook management rate limiter
 * For admin endpoints that manage webhook configs
 */
export const adminWebhookRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute

    keyGenerator: (req) => {
        // Use user ID from auth token if available
        const userId = req.user?.userId || req.user?.id || 'anonymous';
        return `admin_${userId}`;
    },

    handler: (req, res) => {
        logger.warn('Admin webhook rate limit exceeded', {
            userId: req.user?.userId,
            path: req.path
        });

        res.status(429).json({
            success: false,
            error: 'Too many requests',
            code: 'ADMIN_RATE_LIMIT',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        });
    }
});

/**
 * DLQ (Dead Letter Queue) endpoint rate limiter
 * For retry operations
 */
export const dlqRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 retries per minute max

    keyGenerator: (req) => {
        const userId = req.user?.userId || req.user?.id || 'anonymous';
        return `dlq_${userId}`;
    },

    handler: (req, res) => {
        logger.warn('DLQ rate limit exceeded', {
            userId: req.user?.userId,
            path: req.path
        });

        res.status(429).json({
            success: false,
            error: 'Too many retry requests',
            code: 'DLQ_RATE_LIMIT',
            message: 'Please wait before retrying more items',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        });
    }
});

export default {
    webhookRateLimiter,
    strictWebhookRateLimiter,
    adminWebhookRateLimiter,
    dlqRateLimiter
};
