import cron from 'node-cron';
import productModel from '../models/ProductModel.js';
import Media from '../models/MediaModel.js';
import logger from '../utils/logger.js';

/**
 * Cleanup Job - Auto-delete soft deleted products after 30 days
 * Runs daily at 3:00 AM (Istanbul timezone)
 *
 * This prevents database bloat from accumulating soft-deleted products
 * while giving admins enough time to restore accidentally deleted items.
 */

const cleanupDeletedProducts = async () => {
    try {
        logger.info('Starting deleted products cleanup job');

        // Calculate 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find products deleted more than 30 days ago
        const productsToDelete = await productModel.find({
            active: false,
            deletedAt: { $lt: thirtyDaysAgo }
        });

        if (productsToDelete.length === 0) {
            logger.info('No products to cleanup (none older than 30 days)');
            return;
        }

        let deletedCount = 0;
        let mediaDeletedCount = 0;

        for (const product of productsToDelete) {
            // Delete associated media files
            if (product.image && product.image.length > 0) {
                try {
                    const result = await Media.deleteMany({
                        'usedIn.type': 'product',
                        'usedIn.id': product._id.toString()
                    });
                    mediaDeletedCount += result.deletedCount || 0;
                } catch (mediaError) {
                    logger.error('Error deleting media files during cleanup', {
                        error: mediaError.message,
                        productId: product._id,
                        productName: product.name
                    });
                    // Continue with product deletion even if media deletion fails
                }
            }

            // Permanent delete from database
            await productModel.findByIdAndDelete(product._id);
            deletedCount++;

            logger.info('Product auto-deleted by cleanup job', {
                productId: product._id,
                productName: product.name,
                deletedAt: product.deletedAt,
                daysOld: Math.floor((new Date() - product.deletedAt) / (1000 * 60 * 60 * 24))
            });
        }

        logger.info('Cleanup job completed successfully', {
            deletedCount,
            mediaDeletedCount,
            cutoffDate: thirtyDaysAgo
        });
    } catch (error) {
        logger.error('Cleanup job failed', {
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Schedule cleanup job
 * Cron format: minute hour day month weekday
 * '0 3 * * *' = Every day at 3:00 AM
 */
const cleanupJob = cron.schedule('0 3 * * *', cleanupDeletedProducts, {
    scheduled: true,
    timezone: "Europe/Istanbul"
});

// Export for manual execution and testing
export { cleanupDeletedProducts, cleanupJob };
export default cleanupJob;
