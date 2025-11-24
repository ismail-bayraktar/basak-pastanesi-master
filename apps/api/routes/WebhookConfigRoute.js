import express from 'express';
import adminAuth from '../middleware/AdminAuth.js';
import { checkPermission } from '../middleware/PermissionMiddleware.js';
import {
    getAllWebhookConfigs,
    getWebhookConfig,
    createWebhookConfig,
    updateWebhookConfig,
    deleteWebhookConfig,
    testWebhookConfig
} from '../controllers/WebhookConfigController.js';

const router = express.Router();

// All routes require admin authentication and courier permission
router.use(adminAuth);
router.use(checkPermission('courier:read', 'courier:update'));

// Get all webhook configs
router.get('/list', getAllWebhookConfigs);

// Get single webhook config
router.get('/:id', getWebhookConfig);

// Create webhook config
router.post('/create', checkPermission('courier:update'), createWebhookConfig);

// Update webhook config
router.put('/update/:id', checkPermission('courier:update'), updateWebhookConfig);

// Delete webhook config
router.delete('/delete/:id', checkPermission('courier:update'), deleteWebhookConfig);

// Test webhook config
router.post('/test/:id', checkPermission('courier:update'), testWebhookConfig);

export default router;

