import mongoose from 'mongoose';
import dotenv from 'dotenv';
import webhookConfigModel from '../models/WebhookConfigModel.js';
import CourierIntegrationConfigModel from '../models/CourierIntegrationConfigModel.js';

// Load environment variables
dotenv.config();

const setupWebhookConfig = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Check if MuditaKurye webhook config exists
        const existingConfig = await webhookConfigModel.findOne({ platform: 'muditakurye' });

        if (!existingConfig) {
            console.log('📋 Creating MuditaKurye webhook configuration...');

            const webhookConfig = new webhookConfigModel({
                platform: 'muditakurye',
                name: 'MuditaKurye Webhook',
                enabled: true,
                secretKey: process.env.MUDITA_WEBHOOK_SECRET || 'wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4',
                eventTypes: [
                    'order.status.updated',
                    'order.delivered',
                    'order.failed',
                    'order.cancelled',
                    'order.assigned',
                    'courier.location.updated'
                ],
                retryConfig: {
                    maxRetries: 5,
                    baseDelay: 1000,
                    maxDelay: 300000
                },
                rateLimits: {
                    perMinute: 100,
                    perHour: 2000
                },
                authentication: {
                    type: 'signature',
                    signatureHeader: 'X-MuditaKurye-Signature',
                    timestampHeader: 'X-Mudita-Timestamp',
                    algorithm: 'sha256'
                },
                metadata: {
                    apiUrl: 'https://api.muditakurye.com.tr',
                    environment: process.env.MUDITA_TEST_MODE === 'true' ? 'test' : 'production',
                    webhookOnlyMode: process.env.MUDITA_WEBHOOK_ONLY_MODE === 'true'
                }
            });

            await webhookConfig.save();
            console.log('✅ MuditaKurye webhook configuration created successfully');

            // Also check CourierIntegrationConfig
            const courierConfig = await CourierIntegrationConfigModel.findOne({ platform: 'muditakurye' });
            if (!courierConfig) {
                console.log('📋 Creating MuditaKurye courier integration configuration...');

                const muditaConfig = new CourierIntegrationConfigModel({
                    platform: 'muditakurye',
                    name: 'MuditaKurye Integration',
                    apiUrl: process.env.MUDITA_API_URL || 'https://api.muditakurye.com.tr',
                    apiKey: process.env.MUDITA_API_KEY || 'pending_api_key',
                    apiSecret: process.env.MUDITA_API_SECRET || 'pending_api_secret',
                    restaurantId: process.env.MUDITA_RESTAURANT_ID || 'pending_restaurant_id',
                    authType: 'bearer',
                    enabled: process.env.MUDITA_ENABLED === 'true',
                    testMode: process.env.MUDITA_TEST_MODE === 'true',
                    webhookConfig: {
                        enabled: true,
                        url: `${process.env.WEBHOOK_BASE_URL || 'https://api.tulumbak.com'}/api/webhook/muditakurye`,
                        secretKey: process.env.MUDITA_WEBHOOK_SECRET || 'wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4',
                        events: [
                            'order.status.updated',
                            'order.delivered',
                            'order.failed',
                            'order.cancelled',
                            'order.assigned',
                            'courier.location.updated'
                        ]
                    },
                    rateLimits: {
                        perMinute: 60,
                        perHour: 1000
                    },
                    retryConfig: {
                        maxRetries: 5,
                        baseDelay: 1000,
                        maxDelay: 300000
                    },
                    circuitBreaker: {
                        enabled: true,
                        failureThreshold: 5,
                        timeout: 60000,
                        halfOpenRequests: 1
                    }
                });

                await muditaConfig.save();
                console.log('✅ MuditaKurye courier integration configuration created successfully');
            } else {
                console.log('✔️ MuditaKurye courier integration configuration already exists');
            }

        } else {
            console.log('✔️ MuditaKurye webhook configuration already exists');

            // Update the secret key if it's different
            if (existingConfig.secretKey !== process.env.MUDITA_WEBHOOK_SECRET) {
                existingConfig.secretKey = process.env.MUDITA_WEBHOOK_SECRET;
                await existingConfig.save();
                console.log('✅ Updated webhook secret key');
            }
        }

        // Display current configuration
        const finalConfig = await webhookConfigModel.findOne({ platform: 'muditakurye' });
        console.log('\n📊 Current MuditaKurye Webhook Configuration:');
        console.log('- Platform:', finalConfig.platform);
        console.log('- Enabled:', finalConfig.enabled);
        console.log('- Secret Key:', finalConfig.secretKey ? '***' + finalConfig.secretKey.slice(-4) : 'Not set');
        console.log('- Event Types:', finalConfig.eventTypes);

        console.log('\n✅ Setup completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error setting up webhook config:', error);
        process.exit(1);
    }
};

// Run the setup
setupWebhookConfig();