/**
 * Input Validation Middleware
 * Provides validation and sanitization for API endpoints
 * Uses express-validator for validation
 */

import { body, param, query, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Validation error handler
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors', { errors: errors.array(), path: req.path });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Product validation rules
 */
export const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description too long (max 1000 characters)')
    .escape(),
  body('basePrice')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .escape(),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),
  body('sizes')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(v => typeof v === 'number' && v > 0);
      }
      return true;
    }).withMessage('Sizes must be an array of positive numbers'),
  handleValidationErrors
];

/**
 * Product update validation (all fields optional)
 */
export const validateProductUpdate = [
  body('id')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters')
    .escape(),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),
  handleValidationErrors
];

/**
 * User registration validation
 */
export const validateUserRegistration = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .escape(),
  handleValidationErrors
];

/**
 * User login validation
 */
export const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Admin login validation
 */
export const validateAdminLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Order validation
 */
export const validateOrder = [
  body('items')
    .notEmpty().withMessage('Order items are required')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt(),
  body('address')
    .notEmpty().withMessage('Delivery address is required')
    .isObject().withMessage('Address must be an object'),
  body('address.address')
    .trim()
    .notEmpty().withMessage('Address line is required')
    .escape(),
  body('amount')
    .notEmpty().withMessage('Order amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number')
    .toFloat(),
  handleValidationErrors
];

/**
 * MongoDB ID parameter validation
 */
export const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

/**
 * Query parameter validation
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  handleValidationErrors
];

/**
 * Sanitize string input (remove dangerous characters)
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Sanitize request body middleware
 */
export const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

