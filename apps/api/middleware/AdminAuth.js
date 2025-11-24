import jwt from 'jsonwebtoken';
import adminModel from '../models/AdminModel.js';
import logger from '../utils/logger.js';

/**
 * Admin Authentication Middleware
 * Updated to work with new database-based admin system
 */
const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            logger.warn('Admin auth: No token provided', { path: req.path });
            return res.json({success: false, message: 'Not authorized login again'});
        }

        // Verify JWT token
        let token_decode;
        try {
            token_decode = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            logger.error('Admin auth: JWT verification failed', {
                error: jwtError.message,
                path: req.path,
                tokenPreview: token.substring(0, 20) + '...'
            });
            return res.json({success: false, message: 'Not authorized login again'});
        }

        // Check if token has required fields (new system)
        if (!token_decode.email) {
            // Fallback to old system for backward compatibility
            if (token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
                return next();
            }
            logger.warn('Admin auth: Token missing email field', {
                tokenFields: Object.keys(token_decode),
                path: req.path
            });
            return res.json({success: false, message: 'Not authorized login again'});
        }

        // Get admin from database
        const admin = await adminModel.findOne({
            email: token_decode.email,
            isActive: true
        });

        if (!admin) {
            logger.warn('Admin auth: Admin not found in database', {
                email: token_decode.email,
                path: req.path
            });
            return res.json({success: false, message: 'Not authorized login again'});
        }

        // Attach admin to request object
        req.admin = admin;
        logger.info('Admin auth successful', { email: admin.email, path: req.path });
        next();
    } catch (error) {
        logger.error('Admin auth error', { error: error.message, stack: error.stack, path: req.path });
        res.json({success: false, message: 'Not authorized login again'});
    }
}

export default adminAuth;