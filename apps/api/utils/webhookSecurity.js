import crypto from 'crypto';
import logger from './logger.js';

/**
 * WebhookSecurity Utility
 * Centralized webhook security operations (DRY principle)
 * Provides signature verification, timestamp validation, and security helpers
 */

export class WebhookSecurity {
    /**
     * Verify HMAC-SHA256 webhook signature (timing-safe)
     *
     * @param {Object} payload - Webhook payload object
     * @param {string} signature - Received signature (with or without 'sha256=' prefix)
     * @param {string|number} timestamp - Webhook timestamp
     * @param {string} secretKey - Secret key for HMAC
     * @returns {boolean} True if signature is valid
     */
    static verifySignature(payload, signature, timestamp, secretKey) {
        try {
            if (!payload || !signature || !timestamp || !secretKey) {
                logger.warn('Missing parameters for signature verification');
                return false;
            }

            // Remove 'sha256=' prefix if present
            const cleanSignature = signature.replace(/^sha256=/, '');

            // Construct message (timestamp.payload)
            const message = `${timestamp}.${JSON.stringify(payload)}`;

            // Calculate expected signature
            const expectedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(message)
                .digest('hex');

            // Timing-safe comparison to prevent timing attacks
            return crypto.timingSafeEqual(
                Buffer.from(cleanSignature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            logger.error('Signature verification error', {
                error: error.message,
                stack: error.stack
            });
            return false;
        }
    }

    /**
     * Validate webhook timestamp
     * Prevents replay attacks and future timestamps
     *
     * @param {string|number} timestamp - Unix timestamp in milliseconds
     * @param {Object} options - Validation options
     * @param {number} options.maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
     * @param {number} options.clockSkewMs - Clock skew tolerance (default: 30 seconds)
     * @returns {Object} { valid: boolean, error?: string, age?: number }
     */
    static validateTimestamp(timestamp, options = {}) {
        const {
            maxAgeMs = 5 * 60 * 1000, // 5 minutes default
            clockSkewMs = 30000 // 30 seconds default
        } = options;

        // Convert to number
        const timestampNum = Number(timestamp);

        // Validate format
        if (isNaN(timestampNum) || timestampNum <= 0) {
            return {
                valid: false,
                error: 'Invalid timestamp format',
                code: 'INVALID_TIMESTAMP'
            };
        }

        const now = Date.now();
        const age = now - timestampNum;

        // Reject future timestamps (beyond clock skew)
        if (timestampNum > now + clockSkewMs) {
            return {
                valid: false,
                error: 'Timestamp is in the future',
                code: 'FUTURE_TIMESTAMP',
                serverTime: now,
                requestTime: timestampNum,
                difference: timestampNum - now
            };
        }

        // Reject old timestamps (replay attack prevention)
        if (age > maxAgeMs) {
            return {
                valid: false,
                error: 'Timestamp too old',
                code: 'EXPIRED_TIMESTAMP',
                maxAge: maxAgeMs,
                age: age
            };
        }

        // Valid timestamp
        return {
            valid: true,
            age: age
        };
    }

    /**
     * Generate webhook signature for outgoing webhooks
     *
     * @param {Object} payload - Webhook payload
     * @param {string|number} timestamp - Unix timestamp
     * @param {string} secretKey - Secret key for HMAC
     * @returns {string} Signature with 'sha256=' prefix
     */
    static generateSignature(payload, timestamp, secretKey) {
        try {
            const message = `${timestamp}.${JSON.stringify(payload)}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(message)
                .digest('hex');

            return `sha256=${signature}`;
        } catch (error) {
            logger.error('Signature generation error', {
                error: error.message
            });
            throw new Error(`Failed to generate signature: ${error.message}`);
        }
    }

    /**
     * Verify webhook signature and timestamp together
     * Convenience method that combines both validations
     *
     * @param {Object} payload - Webhook payload
     * @param {string} signature - Received signature
     * @param {string|number} timestamp - Webhook timestamp
     * @param {string} secretKey - Secret key for HMAC
     * @param {Object} options - Validation options
     * @returns {Object} { valid: boolean, error?: string, details?: Object }
     */
    static verifyWebhook(payload, signature, timestamp, secretKey, options = {}) {
        // Validate timestamp first
        const timestampValidation = this.validateTimestamp(timestamp, options);
        if (!timestampValidation.valid) {
            return timestampValidation;
        }

        // Verify signature
        const isValidSignature = this.verifySignature(payload, signature, timestamp, secretKey);
        if (!isValidSignature) {
            return {
                valid: false,
                error: 'Invalid signature',
                code: 'INVALID_SIGNATURE'
            };
        }

        // Both validations passed
        return {
            valid: true,
            timestampAge: timestampValidation.age
        };
    }

    /**
     * Generate idempotency key from webhook data
     * Useful for preventing duplicate webhook processing
     *
     * @param {string} webhookId - Webhook ID
     * @param {string} platform - Platform name
     * @returns {string} Idempotency key
     */
    static generateIdempotencyKey(webhookId, platform) {
        return crypto
            .createHash('sha256')
            .update(`${platform}:${webhookId}`)
            .digest('hex');
    }

    /**
     * Constant-time string comparison
     * Use this for comparing sensitive strings to prevent timing attacks
     *
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {boolean} True if strings match
     */
    static constantTimeCompare(a, b) {
        try {
            if (typeof a !== 'string' || typeof b !== 'string') {
                return false;
            }

            if (a.length !== b.length) {
                return false;
            }

            return crypto.timingSafeEqual(
                Buffer.from(a),
                Buffer.from(b)
            );
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate secure random webhook ID
     *
     * @param {number} length - Length of the ID (default: 32)
     * @returns {string} Random webhook ID
     */
    static generateWebhookId(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Hash webhook payload for logging/tracking
     * One-way hash for identifying webhooks without storing sensitive data
     *
     * @param {Object} payload - Webhook payload
     * @returns {string} SHA256 hash of payload
     */
    static hashPayload(payload) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(payload))
            .digest('hex');
    }

    /**
     * Sanitize webhook headers
     * Extract and validate webhook-related headers
     *
     * @param {Object} headers - Request headers
     * @returns {Object} Sanitized webhook headers
     */
    static sanitizeHeaders(headers) {
        return {
            signature: headers['x-webhook-signature'] || headers['x-muditakurye-signature'] || null,
            timestamp: headers['x-webhook-timestamp'] || headers['x-mudita-timestamp'] || null,
            webhookId: headers['x-webhook-id'] || headers['x-mudita-webhook-id'] || null,
            platform: headers['x-webhook-platform'] || headers['x-mudita-platform'] || null,
            contentType: headers['content-type'] || null
        };
    }

    /**
     * Validate webhook headers
     * Check if required headers are present
     *
     * @param {Object} headers - Sanitized headers from sanitizeHeaders()
     * @returns {Object} { valid: boolean, missing?: string[] }
     */
    static validateHeaders(headers) {
        const required = ['signature', 'timestamp'];
        const missing = required.filter(field => !headers[field]);

        if (missing.length > 0) {
            return {
                valid: false,
                missing,
                error: `Missing required headers: ${missing.join(', ')}`
            };
        }

        return { valid: true };
    }
}

export default WebhookSecurity;

/**
 * Usage Examples:
 *
 * // Verify webhook
 * const result = WebhookSecurity.verifyWebhook(
 *     payload,
 *     signature,
 *     timestamp,
 *     secretKey
 * );
 *
 * if (!result.valid) {
 *     return res.status(401).json({ error: result.error });
 * }
 *
 * // Generate signature for outgoing webhook
 * const signature = WebhookSecurity.generateSignature(
 *     payload,
 *     Date.now(),
 *     secretKey
 * );
 *
 * // Sanitize and validate headers
 * const headers = WebhookSecurity.sanitizeHeaders(req.headers);
 * const validation = WebhookSecurity.validateHeaders(headers);
 */
