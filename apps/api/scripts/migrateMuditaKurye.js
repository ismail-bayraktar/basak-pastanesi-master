import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import orderModel from '../models/OrderModel.js';
import CourierIntegrationConfigModel from '../models/CourierIntegrationConfigModel.js';
import DeadLetterQueueModel from '../models/DeadLetterQueueModel.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

/**
 * Migration script for MuditaKurye integration
 * This script:
 * 1. Sets up initial courier integration configuration
 * 2. Migrates existing orders to new structure
 * 3. Creates indexes for better performance
 * 4. Cleans up deprecated EsnafExpress fields
 */

// Encryption helper
const encrypt = (text) => {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
};

const runMigration = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Step 1: Create MuditaKurye configuration if not exists
        console.log('\n📋 Step 1: Setting up MuditaKurye configuration...');

        const existingConfig = await CourierIntegrationConfigModel.findOne({ platform: 'muditakurye' });

        if (!existingConfig) {
            const muditaConfig = new CourierIntegrationConfigModel({
                platform: 'muditakurye',
                apiUrl: process.env.MUDITA_API_URL || 'https://api.muditakurye.com.tr',
                apiKey: encrypt(process.env.MUDITA_API_KEY || 'test_api_key'),
                apiSecret: encrypt(process.env.MUDITA_API_SECRET || 'test_api_secret'),
                webhookSecret: encrypt(process.env.MUDITA_WEBHOOK_SECRET || 'test_webhook_secret'),
                restaurantId: process.env.MUDITA_RESTAURANT_ID || 'test_restaurant_id',
                testMode: process.env.MUDITA_TEST_MODE === 'true' || true,
                enabled: process.env.MUDITA_ENABLED === 'true' || true,
                authType: 'bearer',
                retryConfig: {
                    maxRetries: parseInt(process.env.RETRY_MAX_ATTEMPTS) || 5,
                    baseDelay: parseInt(process.env.RETRY_BASE_DELAY) || 1000,
                    maxDelay: parseInt(process.env.RETRY_MAX_DELAY) || 300000,
                    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
                },
                circuitBreaker: {
                    enabled: process.env.CIRCUIT_BREAKER_ENABLED === 'true' || true,
                    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5,
                    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000,
                    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 120000
                },
                statusMapping: {
                    'VALIDATED': 'Sipariş Onaylandı',
                    'ASSIGNED': 'Kurye Atandı',
                    'PREPARED': 'Hazırlandı',
                    'ON_DELIVERY': 'Yolda',
                    'DELIVERED': 'Teslim Edildi',
                    'CANCELED': 'İptal Edildi',
                    'FAILED': 'Başarısız'
                },
                metadata: {
                    supportEmail: 'destek@muditakurye.com',
                    supportPhone: '+90 212 123 45 67',
                    webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:4001'}/api/webhook/muditakurye`
                },
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            await muditaConfig.save();
            console.log('✅ MuditaKurye configuration created');
        } else {
            console.log('ℹ️ MuditaKurye configuration already exists');
        }

        // Step 2: Migrate existing orders
        console.log('\n📋 Step 2: Migrating existing orders...');

        const ordersToMigrate = await orderModel.find({
            $or: [
                { 'courierIntegration.platform': { $exists: false } },
                { 'courierIntegration': { $exists: false } }
            ]
        });

        console.log(`Found ${ordersToMigrate.length} orders to migrate`);

        let migratedCount = 0;
        for (const order of ordersToMigrate) {
            // Add courier integration structure if missing
            if (!order.courierIntegration) {
                order.courierIntegration = {
                    platform: null,
                    externalOrderId: null,
                    submittedAt: null,
                    lastSyncAt: null,
                    syncStatus: 'pending',
                    failureReason: null,
                    retryCount: 0,
                    metadata: {}
                };
            }

            // Migrate EsnafExpress orders to MuditaKurye format
            if (order.esnafExpressOrderId) {
                order.courierIntegration.platform = 'muditakurye';
                order.courierIntegration.externalOrderId = order.esnafExpressOrderId;
                order.courierIntegration.submittedAt = order.sentToCourierAt || order.date;
                order.courierIntegration.syncStatus = 'migrated';
                order.courierIntegration.metadata = {
                    migratedFrom: 'esnafexpress',
                    migratedAt: Date.now()
                };
            }

            await order.save();
            migratedCount++;

            if (migratedCount % 100 === 0) {
                console.log(`Migrated ${migratedCount} orders...`);
            }
        }

        console.log(`✅ Migrated ${migratedCount} orders`);

        // Step 3: Create indexes for performance
        console.log('\n📋 Step 3: Creating indexes...');

        // Order indexes
        await orderModel.collection.createIndex({ 'courierIntegration.platform': 1 });
        await orderModel.collection.createIndex({ 'courierIntegration.externalOrderId': 1 });
        await orderModel.collection.createIndex({ 'courierIntegration.syncStatus': 1 });
        await orderModel.collection.createIndex({ 'courierIntegration.submittedAt': -1 });
        console.log('✅ Order indexes created');

        // DeadLetterQueue indexes
        await DeadLetterQueueModel.collection.createIndex({ platform: 1, status: 1 });
        await DeadLetterQueueModel.collection.createIndex({ priority: -1, createdAt: 1 });
        await DeadLetterQueueModel.collection.createIndex({ retryCount: 1 });
        await DeadLetterQueueModel.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // TTL: 30 days
        console.log('✅ DeadLetterQueue indexes created');

        // CourierIntegrationConfig indexes
        await CourierIntegrationConfigModel.collection.createIndex({ platform: 1 }, { unique: true });
        await CourierIntegrationConfigModel.collection.createIndex({ enabled: 1 });
        console.log('✅ CourierIntegrationConfig indexes created');

        // Step 4: Clean up deprecated fields (optional)
        console.log('\n📋 Step 4: Cleaning up deprecated fields...');

        const cleanupDeprecated = process.env.CLEANUP_DEPRECATED === 'true';

        if (cleanupDeprecated) {
            // Remove esnafExpressOrderId field from all orders
            await orderModel.updateMany(
                { esnafExpressOrderId: { $exists: true } },
                { $unset: { esnafExpressOrderId: '' } }
            );
            console.log('✅ Removed deprecated esnafExpressOrderId field');
        } else {
            console.log('ℹ️ Skipping deprecated field cleanup (set CLEANUP_DEPRECATED=true to enable)');
        }

        // Step 5: Verify migration
        console.log('\n📋 Step 5: Verifying migration...');

        const totalOrders = await orderModel.countDocuments();
        const migratedOrders = await orderModel.countDocuments({ 'courierIntegration': { $exists: true } });
        const muditaOrders = await orderModel.countDocuments({ 'courierIntegration.platform': 'muditakurye' });

        console.log(`
        ✅ Migration Summary:
        - Total orders: ${totalOrders}
        - Orders with courier integration: ${migratedOrders}
        - MuditaKurye orders: ${muditaOrders}
        - Migration completion: ${Math.round((migratedOrders / totalOrders) * 100)}%
        `);

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        logger.error('Migration failed', { error: error.message, stack: error.stack });
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(`
    ========================================
    MuditaKurye Integration Migration Script
    ========================================
    `);

    runMigration();
}

export default runMigration;