import winston from 'winston';

/**
 * Logger Service
 * Centralized logging with Winston
 * 
 * Log Levels: error, warn, info, http, debug
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Serverless-safe transports configuration
const transports = [];

// In production/serverless (Vercel), only use console logging
// File system is read-only in serverless environments
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  transports.push(
    new winston.transports.Console({
      format: logFormat
    })
  );
} else {
  // Development: Use file transports
  transports.push(
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    }),
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'basak-pastanesi-backend' },
  transports
});

/**
 * Helper function to log with context
 */
export const logError = (error, context = {}) => {
  logger.error(error.message, {
    error: error.stack,
    ...context
  });
};

export const logInfo = (message, context = {}) => {
  logger.info(message, context);
};

export const logWarn = (message, context = {}) => {
  logger.warn(message, context);
};

export const logHttp = (req, res, responseTime) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('user-agent')
  });
};

export default logger;

