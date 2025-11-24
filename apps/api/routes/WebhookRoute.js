import express from 'express';
import { receiveWebhook, receiveMuditaKuryeWebhook } from '../controllers/WebhookController.js';
import { webhookRateLimiter } from '../middleware/webhookRateLimiter.js';
import { validateWebhookPayload, validateMuditaKuryeWebhook } from '../schemas/webhookSchemas.js';

const router = express.Router();

// Generic webhook receiver endpoint (public, no auth required)
// Rate limiting: 100 requests per minute per IP + platform combination
// Input validation: Validates webhook payload structure
router.post(
    '/courier',
    webhookRateLimiter,
    validateWebhookPayload,
    receiveWebhook
);

// MuditaKurye-specific webhook endpoint
// This endpoint is specifically for MuditaKurye webhook callbacks
// Validates MuditaKurye-specific payload format
router.post(
    '/muditakurye',
    webhookRateLimiter,
    validateMuditaKuryeWebhook,
    receiveMuditaKuryeWebhook
);

// Third-party integration webhook endpoint (MuditaKurye format)
router.post(
    '/third-party/order',
    webhookRateLimiter,
    validateMuditaKuryeWebhook,
    receiveMuditaKuryeWebhook
);

export default router;

