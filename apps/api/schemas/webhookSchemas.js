import Joi from 'joi';

/**
 * Webhook Validation Schemas
 * Provides comprehensive input validation for webhook payloads
 */

/**
 * Common webhook headers schema
 */
export const webhookHeadersSchema = Joi.object({
    'x-webhook-signature': Joi.string().optional(),
    'x-muditakurye-signature': Joi.string().optional(),
    'x-webhook-timestamp': Joi.string().optional(),
    'x-mudita-timestamp': Joi.string().optional(),
    'x-webhook-id': Joi.string().optional(),
    'x-mudita-webhook-id': Joi.string().optional(),
    'x-webhook-platform': Joi.string().optional(),
    'x-mudita-platform': Joi.string().optional(),
    'content-type': Joi.string().optional()
}).unknown(true).or(
    'x-webhook-signature',
    'x-muditakurye-signature'
).and(
    'x-webhook-timestamp',
    'x-mudita-timestamp'
);

/**
 * Generic webhook payload schema
 */
export const genericWebhookPayloadSchema = Joi.object({
    // Event type
    event: Joi.string().valid(
        'order.status.updated',
        'order.delivered',
        'order.failed',
        'order.cancelled',
        'order.assigned',
        'courier.location.updated'
    ).optional(),

    // Order identifiers
    orderId: Joi.alternatives().try(
        Joi.string().required(),
        Joi.number().required()
    ).required(),

    muditaOrderId: Joi.string().optional(),
    externalOrderId: Joi.string().optional(),
    trackingId: Joi.string().optional(),

    // Status
    status: Joi.string().optional(),
    previousStatus: Joi.string().optional(),

    // Timestamps
    timestamp: Joi.alternatives().try(
        Joi.number().positive(),
        Joi.string().isoDate()
    ).optional(),

    // Location data
    location: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
        address: Joi.string().max(500).optional()
    }).optional(),

    // Courier information
    courierInfo: Joi.object({
        courierId: Joi.string().optional(),
        courierName: Joi.string().max(200).optional(),
        courierPhone: Joi.string().max(50).optional(),
        vehicleType: Joi.string().max(50).optional()
    }).optional(),

    // Delivery information
    estimatedDelivery: Joi.alternatives().try(
        Joi.number().positive(),
        Joi.string().isoDate()
    ).optional(),

    actualDelivery: Joi.alternatives().try(
        Joi.number().positive(),
        Joi.string().isoDate()
    ).optional(),

    // Additional data
    note: Joi.string().max(1000).optional(),
    reason: Joi.string().max(500).optional(),
    metadata: Joi.object().optional()
}).or('event', 'status'); // Must have either event or status

/**
 * MuditaKurye specific webhook payload schema
 */
export const muditaKuryeWebhookSchema = Joi.object({
    // Event (may not be present in MuditaKurye format)
    event: Joi.string().valid(
        'order.status_changed',
        'order.canceled',
        'order.delivered',
        'order.assigned'
    ).optional(),

    // Order identifiers
    orderId: Joi.string().optional(),
    muditaKuryeOrderId: Joi.string().uuid().optional(),
    orderNumber: Joi.string().max(100).optional(),

    // Status (required in MuditaKurye format)
    status: Joi.string().valid(
        'NEW',
        'VALIDATED',
        'ROUTED',
        'ASSIGNED',
        'ACCEPTED',
        'PREPARED',
        'ON_DELIVERY',
        'DELIVERED',
        'CANCELED',
        'FAILED'
    ).required(),

    previousStatus: Joi.string().optional(),

    // Timestamps
    timestamp: Joi.string().isoDate().required(),

    // Provider information
    provider: Joi.string().valid('THIRD_PARTY', 'DIRECT').optional(),
    providerRestaurantId: Joi.string().optional(),

    // Cancellation info
    reason: Joi.string().max(500).optional(),
    canceledBy: Joi.string().valid('RESTAURANT', 'CUSTOMER', 'COURIER', 'SYSTEM').optional(),

    // Additional data
    metadata: Joi.object().optional()
});

/**
 * Webhook config schema (for admin endpoints)
 */
export const webhookConfigSchema = Joi.object({
    platform: Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Platform name is required',
            'string.min': 'Platform name must be at least 2 characters',
            'string.max': 'Platform name cannot exceed 50 characters'
        }),

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required'
        }),

    secretKey: Joi.string()
        .min(32)
        .max(500)
        .required()
        .messages({
            'string.min': 'Secret key must be at least 32 characters for security',
            'string.empty': 'Secret key is required'
        }),

    webhookUrl: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .optional()
        .messages({
            'string.uri': 'Webhook URL must be a valid HTTP/HTTPS URL'
        }),

    enabled: Joi.boolean().optional(),

    events: Joi.array()
        .items(
            Joi.string().valid(
                'order.status.updated',
                'order.delivered',
                'order.failed',
                'order.cancelled',
                'order.assigned',
                'courier.location.updated'
            )
        )
        .optional(),

    rateLimit: Joi.object({
        perMinute: Joi.number().integer().min(1).max(1000).optional(),
        perHour: Joi.number().integer().min(1).max(10000).optional()
    }).optional(),

    retryConfig: Joi.object({
        maxRetries: Joi.number().integer().min(0).max(10).optional(),
        retryDelay: Joi.number().integer().min(100).max(60000).optional()
    }).optional(),

    metadata: Joi.object().optional()
});

/**
 * Order submission schema (for courier integration)
 */
export const orderSubmissionSchema = Joi.object({
    orderId: Joi.alternatives().try(
        Joi.string().required(),
        Joi.object().required()
    ).required().messages({
        'any.required': 'Order ID is required'
    }),

    platform: Joi.string()
        .valid('muditakurye', 'aras', 'yurtici')
        .optional()
        .messages({
            'any.only': 'Invalid courier platform'
        }),

    force: Joi.boolean().optional() // Force resubmission
});

/**
 * Validation middleware factory
 * Creates middleware that validates request body/headers against schema
 */
export function createValidationMiddleware(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown fields
            convert: true // Convert types when possible
        });

        if (error) {
            const errorMessages = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errorMessages
            });
        }

        // Replace request property with validated and sanitized value
        req[property] = value;
        next();
    };
}

/**
 * Validate webhook payload
 */
export const validateWebhookPayload = createValidationMiddleware(genericWebhookPayloadSchema, 'body');

/**
 * Validate MuditaKurye webhook
 */
export const validateMuditaKuryeWebhook = createValidationMiddleware(muditaKuryeWebhookSchema, 'body');

/**
 * Validate webhook config
 */
export const validateWebhookConfig = createValidationMiddleware(webhookConfigSchema, 'body');

/**
 * Validate order submission
 */
export const validateOrderSubmission = createValidationMiddleware(orderSubmissionSchema, 'body');

export default {
    genericWebhookPayloadSchema,
    muditaKuryeWebhookSchema,
    webhookConfigSchema,
    orderSubmissionSchema,
    webhookHeadersSchema,
    validateWebhookPayload,
    validateMuditaKuryeWebhook,
    validateWebhookConfig,
    validateOrderSubmission,
    createValidationMiddleware
};
