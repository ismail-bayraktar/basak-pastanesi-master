import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Rate Limiting Service
 * Protects API from abuse and brute force attacks
 * Uses Redis for distributed state in production/serverless
 */
class RateLimiterService {
  /**
   * No-op middleware
   */
  static noOpMiddleware() {
    return (req, res, next) => next();
  }

  /**
   * Create a rate limiter with optional Redis store
   */
  static createLimiter(options) {
    // If explicitly disabled via env
    if (process.env.ENABLE_RATE_LIMITING === 'false') {
      return this.noOpMiddleware();
    }

    const limiterOptions = {
      standardHeaders: true,
      legacyHeaders: false,
      ...options,
    };

    // Try to use Redis store if available
    if (isRedisAvailable()) {
      try {
        limiterOptions.store = new RedisStore({
          sendCommand: (...args) => getRedisClient().sendCommand(args),
        });
        logger.debug('Rate limiter using Redis store');
      } catch (error) {
        logger.warn('Failed to initialize Redis store for rate limiter, falling back to memory', { error: error.message });
      }
    }

    return rateLimit(limiterOptions);
  }

  /**
   * General API rate limiter
   */
  static createGeneralLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    return this.createLimiter({
      windowMs,
      max: maxRequests,
      message: {
        success: false,
        message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
      },
    });
  }

  /**
   * Authentication rate limiter
   */
  static createAuthLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 10, // Increased slightly for usability
      message: {
        success: false,
        message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
      },
      skipSuccessfulRequests: true,
    });
  }

  /**
   * Admin API rate limiter
   */
  static createAdminLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message: 'Admin API limit aşıldı. Lütfen daha sonra tekrar deneyin.',
      },
    });
  }

  /**
   * Order placement rate limiter
   */
  static createOrderLimiter() {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000,
      max: 20,
      message: {
        success: false,
        message: 'Çok fazla sipariş denemesi. Lütfen daha sonra tekrar deneyin.',
      },
    });
  }

  /**
   * File upload rate limiter
   */
  static createUploadLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 30,
      message: {
        success: false,
        message: 'Çok fazla dosya yükleme denemesi. Lütfen daha sonra tekrar deneyin.',
      },
    });
  }

  /**
   * Contact form rate limiter
   */
  static createContactLimiter() {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Çok fazla mesaj gönderme denemesi. Lütfen 1 saat sonra tekrar deneyin.',
      },
    });
  }

  /**
   * Password reset rate limiter
   */
  static createPasswordResetLimiter() {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.',
      },
    });
  }
}

export default RateLimiterService;

