import logger from '../utils/logger.js';
import { captureException } from '../utils/sentry.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized error responses
 */

export const errorHandler = (err, req, res, next) => {
  const error = {
    status: err.status || err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Log error
  logger.error(err.message, {
    error: err.stack,
    status: error.status,
    path: error.path,
    method: error.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture in Sentry
  if (process.env.SENTRY_DSN) {
    captureException(err, {
      path: error.path,
      method: error.method,
      user: req.user || null
    });
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Internal Server Error';
    error.stack = undefined;
  }

  res.status(error.status).json({
    success: false,
    error: error
  });
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  const error = {
    status: 404,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  };

  logger.warn(`404 - ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(404).json({
    success: false,
    error: error
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

