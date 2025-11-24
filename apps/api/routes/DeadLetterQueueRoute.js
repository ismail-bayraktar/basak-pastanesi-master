import express from 'express';
import adminAuth from '../middleware/AdminAuth.js';
import {
    getDLQEntries,
    getDLQEntry,
    retryDLQEntry,
    bulkRetryDLQEntries,
    resolveDLQEntry,
    abandonDLQEntry,
    deleteDLQEntry,
    getDLQStatistics,
    cleanupDLQEntries
} from '../controllers/DeadLetterQueueController.js';

const router = express.Router();

// List and search DLQ entries (admin only)
router.get('/', adminAuth, getDLQEntries);
router.get('/stats', adminAuth, getDLQStatistics);
router.get('/:id', adminAuth, getDLQEntry);

// Retry operations (admin only)
router.post('/:id/retry', adminAuth, retryDLQEntry);
router.post('/bulk-retry', adminAuth, bulkRetryDLQEntries);

// Manual resolution (admin only)
router.post('/:id/resolve', adminAuth, resolveDLQEntry);
router.post('/:id/abandon', adminAuth, abandonDLQEntry);

// Cleanup operations (admin only)
router.delete('/:id', adminAuth, deleteDLQEntry);
router.post('/cleanup', adminAuth, cleanupDLQEntries);

export default router;