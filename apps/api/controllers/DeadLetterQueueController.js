import DeadLetterQueueModel from '../models/DeadLetterQueueModel.js';
import RetryService from '../services/RetryService.js';
import logger from '../utils/logger.js';

/**
 * Get all DLQ entries with filtering
 * GET /api/dlq?status=pending&platform=muditakurye&priority=high&limit=50&offset=0
 */
export const getDLQEntries = async (req, res) => {
    try {
        const {
            status = null,
            platform = null,
            priority = null,
            operation = null,
            limit = 50,
            offset = 0
        } = req.query;

        // Build filter query
        const filter = {};
        if (status) filter.status = status;
        if (platform) filter.platform = platform;
        if (priority) filter.priority = priority;
        if (operation) filter.operation = operation;

        // Get entries with pagination
        const entries = await DeadLetterQueueModel
            .find(filter)
            .sort({ priority: -1, createdAt: -1 }) // High priority first, then newest
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .populate('orderId', 'trackingId address.name address.phone');

        // Get total count for pagination
        const totalCount = await DeadLetterQueueModel.countDocuments(filter);

        // Get statistics
        const stats = await DeadLetterQueueModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            entries,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < totalCount
            },
            statistics: stats
        });
    } catch (error) {
        logger.error('Failed to get DLQ entries', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get DLQ entries'
        });
    }
};

/**
 * Get single DLQ entry
 * GET /api/dlq/:id
 */
export const getDLQEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await DeadLetterQueueModel
            .findById(id)
            .populate('orderId');

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'DLQ entry not found'
            });
        }

        res.json({
            success: true,
            entry
        });
    } catch (error) {
        logger.error('Failed to get DLQ entry', {
            id: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get DLQ entry'
        });
    }
};

/**
 * Retry a failed operation from DLQ
 * POST /api/dlq/:id/retry
 */
export const retryDLQEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { forceRetry = false } = req.body;

        const entry = await DeadLetterQueueModel.findById(id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'DLQ entry not found'
            });
        }

        // Check if already processing
        if (entry.status === 'retrying' && !forceRetry) {
            return res.status(400).json({
                success: false,
                message: 'Entry is already being retried'
            });
        }

        // Check if resolved
        if (entry.status === 'resolved' && !forceRetry) {
            return res.status(400).json({
                success: false,
                message: 'Entry has already been resolved'
            });
        }

        // Update status to retrying
        entry.status = 'retrying';
        entry.lastRetryAt = Date.now();
        entry.retryCount++;
        await entry.save();

        // Retry the operation
        const result = await RetryService.retryDLQEntry(entry);

        if (result.success) {
            // Update status to resolved
            entry.status = 'resolved';
            entry.resolvedAt = Date.now();
            entry.resolutionDetails = result.details || {};
            await entry.save();

            logger.info('DLQ entry retry successful', {
                id,
                orderId: entry.orderId,
                operation: entry.operation,
                retryCount: entry.retryCount
            });

            res.json({
                success: true,
                message: 'Operation retried successfully',
                result
            });
        } else {
            // Update status back to pending or abandoned
            const maxRetries = parseInt(process.env.RETRY_MAX_ATTEMPTS) || 5;
            entry.status = entry.retryCount >= maxRetries ? 'abandoned' : 'pending';
            entry.lastError = {
                message: result.error || 'Retry failed',
                code: result.errorCode,
                statusCode: result.statusCode,
                timestamp: Date.now()
            };
            await entry.save();

            logger.warn('DLQ entry retry failed', {
                id,
                orderId: entry.orderId,
                operation: entry.operation,
                error: result.error,
                retryCount: entry.retryCount
            });

            res.status(400).json({
                success: false,
                message: 'Retry failed',
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Failed to retry DLQ entry', {
            id: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to retry operation',
            error: error.message
        });
    }
};

/**
 * Bulk retry multiple DLQ entries
 * POST /api/dlq/bulk-retry
 */
export const bulkRetryDLQEntries = async (req, res) => {
    try {
        const { ids, filter } = req.body;

        let entries = [];

        if (ids && ids.length > 0) {
            // Retry specific entries by ID
            entries = await DeadLetterQueueModel.find({
                _id: { $in: ids },
                status: { $in: ['pending', 'abandoned'] }
            });
        } else if (filter) {
            // Retry entries based on filter
            const queryFilter = {
                status: 'pending',
                ...filter
            };
            entries = await DeadLetterQueueModel
                .find(queryFilter)
                .limit(100); // Limit bulk retry to 100 entries
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either ids or filter must be provided'
            });
        }

        if (entries.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No eligible entries found for retry'
            });
        }

        // Update all entries to retrying status
        await DeadLetterQueueModel.updateMany(
            { _id: { $in: entries.map(e => e._id) } },
            {
                status: 'retrying',
                lastRetryAt: Date.now(),
                $inc: { retryCount: 1 }
            }
        );

        // Process retries in background
        const results = {
            total: entries.length,
            successful: 0,
            failed: 0,
            errors: []
        };

        // Process in batches to avoid overwhelming the system
        const batchSize = 10;
        for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);
            const batchPromises = batch.map(async (entry) => {
                try {
                    const result = await RetryService.retryDLQEntry(entry);
                    if (result.success) {
                        results.successful++;
                        await DeadLetterQueueModel.findByIdAndUpdate(entry._id, {
                            status: 'resolved',
                            resolvedAt: Date.now(),
                            resolutionDetails: result.details || {}
                        });
                    } else {
                        results.failed++;
                        results.errors.push({
                            id: entry._id,
                            error: result.error
                        });
                        const maxRetries = parseInt(process.env.RETRY_MAX_ATTEMPTS) || 5;
                        await DeadLetterQueueModel.findByIdAndUpdate(entry._id, {
                            status: entry.retryCount >= maxRetries ? 'abandoned' : 'pending',
                            lastError: {
                                message: result.error || 'Retry failed',
                                timestamp: Date.now()
                            }
                        });
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        id: entry._id,
                        error: error.message
                    });
                }
            });

            await Promise.all(batchPromises);
        }

        logger.info('Bulk DLQ retry completed', results);

        res.json({
            success: true,
            message: 'Bulk retry completed',
            results
        });
    } catch (error) {
        logger.error('Failed to bulk retry DLQ entries', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to bulk retry operations',
            error: error.message
        });
    }
};

/**
 * Mark DLQ entry as resolved manually
 * POST /api/dlq/:id/resolve
 */
export const resolveDLQEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, details } = req.body;

        const entry = await DeadLetterQueueModel.findById(id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'DLQ entry not found'
            });
        }

        if (entry.status === 'resolved') {
            return res.status(400).json({
                success: false,
                message: 'Entry is already resolved'
            });
        }

        entry.status = 'resolved';
        entry.resolvedAt = Date.now();
        entry.resolutionDetails = {
            manual: true,
            reason: reason || 'Manually resolved',
            details: details || {},
            resolvedBy: req.user?.id || 'admin'
        };
        await entry.save();

        logger.info('DLQ entry manually resolved', {
            id,
            orderId: entry.orderId,
            reason
        });

        res.json({
            success: true,
            message: 'Entry marked as resolved',
            entry
        });
    } catch (error) {
        logger.error('Failed to resolve DLQ entry', {
            id: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to resolve entry',
            error: error.message
        });
    }
};

/**
 * Abandon DLQ entry (stop retrying)
 * POST /api/dlq/:id/abandon
 */
export const abandonDLQEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const entry = await DeadLetterQueueModel.findById(id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'DLQ entry not found'
            });
        }

        if (entry.status === 'abandoned') {
            return res.status(400).json({
                success: false,
                message: 'Entry is already abandoned'
            });
        }

        entry.status = 'abandoned';
        entry.abandonedAt = Date.now();
        entry.abandonReason = reason || 'Manually abandoned';
        await entry.save();

        logger.info('DLQ entry abandoned', {
            id,
            orderId: entry.orderId,
            reason
        });

        res.json({
            success: true,
            message: 'Entry marked as abandoned',
            entry
        });
    } catch (error) {
        logger.error('Failed to abandon DLQ entry', {
            id: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to abandon entry',
            error: error.message
        });
    }
};

/**
 * Delete DLQ entry
 * DELETE /api/dlq/:id
 */
export const deleteDLQEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await DeadLetterQueueModel.findById(id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'DLQ entry not found'
            });
        }

        await entry.remove();

        logger.info('DLQ entry deleted', {
            id,
            orderId: entry.orderId,
            operation: entry.operation
        });

        res.json({
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        logger.error('Failed to delete DLQ entry', {
            id: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to delete entry',
            error: error.message
        });
    }
};

/**
 * Get DLQ statistics
 * GET /api/dlq/stats
 */
export const getDLQStatistics = async (req, res) => {
    try {
        const stats = await DeadLetterQueueModel.getStats();

        // Additional detailed statistics
        const platformStats = await DeadLetterQueueModel.aggregate([
            {
                $group: {
                    _id: {
                        platform: '$platform',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.platform',
                    statuses: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            }
        ]);

        const operationStats = await DeadLetterQueueModel.aggregate([
            {
                $group: {
                    _id: '$operation',
                    count: { $sum: 1 },
                    avgRetries: { $avg: '$retryCount' },
                    maxRetries: { $max: '$retryCount' }
                }
            }
        ]);

        const priorityStats = await DeadLetterQueueModel.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            statistics: {
                ...stats,
                byPlatform: platformStats,
                byOperation: operationStats,
                byPriority: priorityStats
            }
        });
    } catch (error) {
        logger.error('Failed to get DLQ statistics', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: error.message
        });
    }
};

/**
 * Clear resolved/abandoned entries older than X days
 * POST /api/dlq/cleanup
 */
export const cleanupDLQEntries = async (req, res) => {
    try {
        const { daysOld = 30, status = ['resolved', 'abandoned'] } = req.body;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await DeadLetterQueueModel.deleteMany({
            status: { $in: status },
            $or: [
                { resolvedAt: { $lt: cutoffDate } },
                { abandonedAt: { $lt: cutoffDate } }
            ]
        });

        logger.info('DLQ cleanup completed', {
            daysOld,
            status,
            deletedCount: result.deletedCount
        });

        res.json({
            success: true,
            message: `Cleaned up ${result.deletedCount} entries`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error('Failed to cleanup DLQ entries', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to cleanup entries',
            error: error.message
        });
    }
};