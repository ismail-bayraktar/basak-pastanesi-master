import express from 'express';
import adminAuth from '../middleware/AdminAuth.js';
import {
    getConfigurations,
    getConfiguration,
    updateConfiguration,
    testConnection,
    getStatistics,
    getCircuitBreakerStatus,
    resetCircuitBreaker,
    submitOrder,
    cancelOrder,
    getOrderTracking,
    getDashboard,
    validateConfiguration,
    sendTestOrder,
    testIncomingWebhook,
    getIntegrationHealth
} from '../controllers/CourierIntegrationController.js';
import {
    getCourierLogs,
    clearCourierLogs,
    streamCourierLogs
} from '../controllers/LogController.js';

const router = express.Router();

/**
 * Integration Dashboard & Testing Routes
 * All routes require admin authentication
 */

// Dashboard and overview
router.get('/dashboard', adminAuth, getDashboard);
router.get('/health/:platform', adminAuth, getIntegrationHealth);

// Configuration management
router.get('/configs', adminAuth, getConfigurations);
router.get('/configs/:platform', adminAuth, getConfiguration);
router.put('/configs/:platform', adminAuth, updateConfiguration);
router.post('/validate/:platform', adminAuth, validateConfiguration);

// Connection testing
router.post('/test/:platform', adminAuth, testConnection);

// Testing endpoints
router.post('/test-order/:platform', adminAuth, sendTestOrder);
router.post('/test-webhook/:platform', adminAuth, testIncomingWebhook);

// Statistics and monitoring
router.get('/stats', adminAuth, getStatistics);
router.get('/circuit-breakers', adminAuth, getCircuitBreakerStatus);
router.post('/circuit-breakers/:platform/reset', adminAuth, resetCircuitBreaker);

// Order operations
router.post('/submit-order', adminAuth, submitOrder);
router.post('/cancel-order', adminAuth, cancelOrder);
router.get('/tracking/:orderId', adminAuth, getOrderTracking);

// Log management
router.get('/logs', adminAuth, getCourierLogs);
router.delete('/logs', adminAuth, clearCourierLogs);
router.get('/logs/stream', adminAuth, streamCourierLogs);

export default router;