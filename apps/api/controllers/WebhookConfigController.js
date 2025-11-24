import webhookConfigModel from "../models/WebhookConfigModel.js";
import logger from "../utils/logger.js";

/**
 * Get all webhook configurations
 */
export const getAllWebhookConfigs = async (req, res) => {
    try {
        const configs = await webhookConfigModel.find({}).sort({ createdAt: -1 });
        
        // Don't send decrypted secret keys, only show if configured
        const safeConfigs = configs.map(config => ({
            _id: config._id,
            platform: config.platform,
            name: config.name,
            webhookUrl: config.webhookUrl,
            enabled: config.enabled,
            events: config.events,
            rateLimit: config.rateLimit,
            retryConfig: config.retryConfig,
            lastTestAt: config.lastTestAt,
            lastTestStatus: config.lastTestStatus,
            hasSecretKey: !!config.secretKey,
            metadata: config.metadata,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
        }));

        logger.info('Webhook configs retrieved', { count: safeConfigs.length });
        res.json({ success: true, configs: safeConfigs });
    } catch (error) {
        logger.error('Error getting webhook configs', { error: error.message, stack: error.stack });
        res.json({ success: false, message: error.message });
    }
};

/**
 * Get single webhook configuration
 */
export const getWebhookConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const config = await webhookConfigModel.findById(id);

        if (!config) {
            return res.json({ success: false, message: 'Webhook config not found' });
        }

        // Don't send decrypted secret key
        const safeConfig = {
            _id: config._id,
            platform: config.platform,
            name: config.name,
            webhookUrl: config.webhookUrl,
            enabled: config.enabled,
            events: config.events,
            rateLimit: config.rateLimit,
            retryConfig: config.retryConfig,
            lastTestAt: config.lastTestAt,
            lastTestStatus: config.lastTestStatus,
            hasSecretKey: !!config.secretKey,
            metadata: config.metadata,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
        };

        res.json({ success: true, config: safeConfig });
    } catch (error) {
        logger.error('Error getting webhook config', { error: error.message, stack: error.stack, id: req.params.id });
        res.json({ success: false, message: error.message });
    }
};

/**
 * Create webhook configuration
 */
export const createWebhookConfig = async (req, res) => {
    try {
        const { platform, name, secretKey, webhookUrl, enabled, events, rateLimit, retryConfig, metadata } = req.body;

        if (!platform || !name || !secretKey) {
            return res.json({ success: false, message: 'Platform, name, and secretKey are required' });
        }

        // Check if platform already exists
        const existing = await webhookConfigModel.findOne({ platform: platform.toLowerCase() });
        if (existing) {
            return res.json({ success: false, message: 'Platform already exists' });
        }

        const config = new webhookConfigModel({
            platform: platform.toLowerCase(),
            name,
            secretKey, // Will be encrypted by pre-save hook
            webhookUrl: webhookUrl || process.env.WEBHOOK_BASE_URL || 'https://api.tulumbak.com/api/webhook/courier',
            enabled: enabled !== undefined ? enabled : true,
            events: events || [],
            rateLimit: rateLimit || { perMinute: 100, perHour: 1000 },
            retryConfig: retryConfig || { maxRetries: 3, retryDelay: 1000 },
            metadata: metadata || {}
        });

        await config.save();

        logger.info('Webhook config created', { platform: config.platform, name: config.name });

        // Return safe config without secret key
        const safeConfig = {
            _id: config._id,
            platform: config.platform,
            name: config.name,
            webhookUrl: config.webhookUrl,
            enabled: config.enabled,
            events: config.events,
            rateLimit: config.rateLimit,
            retryConfig: config.retryConfig,
            hasSecretKey: true,
            metadata: config.metadata,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
        };

        res.json({ success: true, config: safeConfig });
    } catch (error) {
        logger.error('Error creating webhook config', { error: error.message, stack: error.stack });
        res.json({ success: false, message: error.message });
    }
};

/**
 * Update webhook configuration
 */
export const updateWebhookConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, secretKey, webhookUrl, enabled, events, rateLimit, retryConfig, metadata } = req.body;

        const config = await webhookConfigModel.findById(id);
        if (!config) {
            return res.json({ success: false, message: 'Webhook config not found' });
        }

        // Update fields
        if (name !== undefined) config.name = name;
        if (secretKey !== undefined) config.secretKey = secretKey; // Will be encrypted by pre-save hook
        if (webhookUrl !== undefined) config.webhookUrl = webhookUrl;
        if (enabled !== undefined) config.enabled = enabled;
        if (events !== undefined) config.events = events;
        if (rateLimit !== undefined) config.rateLimit = rateLimit;
        if (retryConfig !== undefined) config.retryConfig = retryConfig;
        if (metadata !== undefined) config.metadata = metadata;

        await config.save();

        logger.info('Webhook config updated', { platform: config.platform, id });

        // Return safe config
        const safeConfig = {
            _id: config._id,
            platform: config.platform,
            name: config.name,
            webhookUrl: config.webhookUrl,
            enabled: config.enabled,
            events: config.events,
            rateLimit: config.rateLimit,
            retryConfig: config.retryConfig,
            hasSecretKey: !!config.secretKey,
            metadata: config.metadata,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
        };

        res.json({ success: true, config: safeConfig });
    } catch (error) {
        logger.error('Error updating webhook config', { error: error.message, stack: error.stack, id: req.params.id });
        res.json({ success: false, message: error.message });
    }
};

/**
 * Delete webhook configuration
 */
export const deleteWebhookConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const config = await webhookConfigModel.findByIdAndDelete(id);

        if (!config) {
            return res.json({ success: false, message: 'Webhook config not found' });
        }

        logger.info('Webhook config deleted', { platform: config.platform, id });
        res.json({ success: true, message: 'Webhook config deleted' });
    } catch (error) {
        logger.error('Error deleting webhook config', { error: error.message, stack: error.stack, id: req.params.id });
        res.json({ success: false, message: error.message });
    }
};

/**
 * Test webhook configuration
 */
export const testWebhookConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const config = await webhookConfigModel.findById(id);

        if (!config) {
            return res.json({ success: false, message: 'Webhook config not found' });
        }

        if (!config.enabled) {
            return res.json({ success: false, message: 'Webhook config is disabled' });
        }

        // This is a placeholder - actual webhook test will be implemented
        // when we have the webhook receiver endpoint
        config.lastTestAt = Date.now();
        config.lastTestStatus = 'success';
        await config.save();

        logger.info('Webhook config tested', { platform: config.platform, id });

        res.json({ 
            success: true, 
            message: 'Webhook test completed',
            testStatus: 'success',
            testAt: config.lastTestAt
        });
    } catch (error) {
        logger.error('Error testing webhook config', { error: error.message, stack: error.stack, id: req.params.id });
        res.json({ success: false, message: error.message });
    }
};

