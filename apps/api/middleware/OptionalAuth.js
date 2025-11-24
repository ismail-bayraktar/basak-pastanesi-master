import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Optional authentication middleware
 * - If token is provided and valid, sets userId in request body
 * - If no token or invalid token, continues as guest (no userId)
 * - Never blocks the request, allows guest checkout
 */
const optionalAuth = async (req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        logger.info('🔐 OptionalAuth - Request Headers:', {
            path: req.path,
            method: req.method,
            hasToken: !!req.headers.token,
            hasAuthorization: !!req.headers.authorization
        });
    }

    // Support multiple token formats
    let token = req.headers.token;

    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token && req.query.token) {
        token = req.query.token;
    }

    // No token - continue as guest
    if (!token) {
        if (isDev) {
            logger.info('👤 OptionalAuth - Proceeding as guest (no token)', {
                path: req.path
            });
        }
        req.body.isGuest = true;
        return next();
    }

    // Try to verify token
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        req.body.isGuest = false;

        if (isDev) {
            logger.info('✅ OptionalAuth - Authenticated user', {
                userId: token_decode.id,
                path: req.path
            });
        }

        next();
    } catch (error) {
        // Invalid token - continue as guest
        if (isDev) {
            logger.info('👤 OptionalAuth - Invalid token, proceeding as guest', {
                error: error.message,
                path: req.path
            });
        }
        req.body.isGuest = true;
        next();
    }
}

export default optionalAuth;
