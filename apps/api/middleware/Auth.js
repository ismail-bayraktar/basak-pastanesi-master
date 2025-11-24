import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const authUser = async (req, res, next) => {
    // 🔍 DEV MODE: Detailed logging for debugging
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        logger.info('🔐 Auth Middleware - Request Headers:', {
            path: req.path,
            method: req.method,
            hasToken: !!req.headers.token,
            hasAuthorization: !!req.headers.authorization,
            authorizationPreview: req.headers.authorization?.substring(0, 30) + '...',
            allHeaders: Object.keys(req.headers)
        });
    }

    // Support multiple token formats:
    // 1. Legacy header (token)
    // 2. Standard header (Authorization: Bearer)
    // 3. Query parameter (token) - for SSE where headers aren't supported
    let token = req.headers.token;

    if (!token && req.headers.authorization) {
        // Extract token from "Bearer {token}" format
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
            if (isDev) {
                logger.info('✅ Token extracted from Authorization header', {
                    tokenPreview: token.substring(0, 20) + '...'
                });
            }
        }
    }

    // For SSE and other scenarios where headers can't be customized
    if (!token && req.query.token) {
        token = req.query.token;
        if (isDev) {
            logger.info('✅ Token extracted from query parameter', {
                tokenPreview: token.substring(0, 20) + '...',
                path: req.path
            });
        }
    }

    if (!token) {
        logger.warn('❌ Auth Failed: No token provided', {
            path: req.path,
            method: req.method,
            headers: {
                hasToken: !!req.headers.token,
                hasAuthorization: !!req.headers.authorization
            }
        });
        return res.json({success: false, message: "Not authorized login again!"});
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;

        if (isDev) {
            logger.info('✅ Auth Success', {
                userId: token_decode.id,
                path: req.path
            });
        }

        next();
    } catch (error) {
        logger.error('❌ Auth middleware error', {
            error: error.message,
            stack: error.stack,
            tokenPreview: token?.substring(0, 20) + '...',
            path: req.path,
            method: req.method
        });
        res.status(401).json({success: false, message: error.message});
    }
}

export default authUser;