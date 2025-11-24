import jwt from 'jsonwebtoken';
import adminModel from '../models/AdminModel.js';
import logger from '../utils/logger.js';

/**
 * Permission-based Authorization Middleware
 * Checks if admin has required permission for the action
 */

export const checkPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const { token } = req.headers;
      
      if (!token) {
        return res.json({ success: false, message: 'Not authorized' });
      }

      // Verify JWT
      const token_decode = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get admin from database
      const admin = await adminModel.findOne({ 
        email: token_decode.email,
        isActive: true 
      });

      if (!admin) {
        logger.warn('Invalid admin token', { email: token_decode.email });
        return res.json({ success: false, message: 'Invalid admin credentials' });
      }

      // Check if admin has super_admin role
      if (admin.role === 'super_admin') {
        req.admin = admin;
        return next();
      }

      // Check if admin has required permissions
      const hasPermission = requiredPermissions.some(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn('Permission denied', { 
          email: admin.email,
          required: requiredPermissions,
          has: admin.permissions
        });
        return res.json({ 
          success: false, 
          message: 'Permission denied' 
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      logger.error('Permission check error', { error: error.message });
      res.json({ success: false, message: error.message });
    }
  };
};

/**
 * Role-based Authorization Middleware
 * Checks if admin has required role
 */
export const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { token } = req.headers;
      
      if (!token) {
        return res.json({ success: false, message: 'Not authorized' });
      }

      const token_decode = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await adminModel.findOne({ 
        email: token_decode.email,
        isActive: true 
      });

      if (!admin) {
        return res.json({ success: false, message: 'Invalid credentials' });
      }

      if (!allowedRoles.includes(admin.role)) {
        logger.warn('Role check failed', { 
          email: admin.email,
          role: admin.role,
          allowed: allowedRoles
        });
        return res.json({ success: false, message: 'Insufficient privileges' });
      }

      req.admin = admin;
      next();
    } catch (error) {
      logger.error('Role check error', { error: error.message });
      res.json({ success: false, message: error.message });
    }
  };
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (email) => {
  try {
    await adminModel.updateOne(
      { email },
      { $set: { lastLogin: new Date() } }
    );
  } catch (error) {
    logger.error('Failed to update last login', { error: error.message });
  }
};

