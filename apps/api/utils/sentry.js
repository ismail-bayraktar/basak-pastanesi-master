import * as Sentry from "@sentry/node";
import logger from "./logger.js";

/**
 * Sentry Configuration
 * Error tracking and monitoring
 */

const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    logger.info('Sentry DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });

  logger.info('Sentry initialized successfully', { environment: process.env.NODE_ENV });
};

/**
 * Capture exception
 */
export const captureException = (error, context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        additional: context
      }
    });
  }
};

/**
 * Capture message
 */
export const captureMessage = (message, level = 'info') => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level: level
    });
  }
};

/**
 * Set user context
 */
export const setUser = (user) => {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: user._id || user.id,
      email: user.email,
      username: user.name || user.username
    });
  }
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (message, data = {}, level = 'info') => {
  if (process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: level,
      timestamp: Date.now() / 1000
    });
  }
};

export { initSentry };
export default Sentry;

