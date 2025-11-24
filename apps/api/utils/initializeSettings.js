import settingsModel from '../models/SettingsModel.js';
import logger from './logger.js';

/**
 * Initialize default system settings if they don't exist
 */
export const initializeSettings = async () => {
    try {
        const defaultSettings = [
            // Media Settings
            {
                key: 'media.useCloudinary',
                value: true,
                category: 'media',
                description: 'Use Cloudinary CDN for media storage'
            },
            {
                key: 'media.autoOptimize',
                value: true,
                category: 'media',
                description: 'Automatically optimize images (Sharp.js or Cloudinary)'
            },
            {
                key: 'media.generateResponsive',
                value: true,
                category: 'media',
                description: 'Generate responsive image sizes'
            },
            {
                key: 'media.quality',
                value: 80,
                category: 'media',
                description: 'Image optimization quality (1-100)'
            },
            {
                key: 'media.maxFileSize',
                value: 10485760, // 10MB in bytes
                category: 'media',
                description: 'Maximum file size for uploads in bytes'
            }
        ];

        for (const setting of defaultSettings) {
            const exists = await settingsModel.findOne({ key: setting.key });
            if (!exists) {
                await settingsModel.create(setting);
                logger.info(`Initialized setting: ${setting.key}`, { value: setting.value });
            }
        }

        logger.info('Settings initialization completed');
    } catch (error) {
        logger.error('Settings initialization failed', {
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Get a setting value by key
 * @param {String} key - Setting key
 * @param {*} defaultValue - Default value if setting doesn't exist
 * @returns {Promise<*>} Setting value
 */
export const getSetting = async (key, defaultValue = null) => {
    try {
        const setting = await settingsModel.findOne({ key });
        return setting ? setting.value : defaultValue;
    } catch (error) {
        logger.error(`Failed to get setting: ${key}`, { error: error.message });
        return defaultValue;
    }
};

/**
 * Set a setting value
 * @param {String} key - Setting key
 * @param {*} value - Setting value
 * @param {String} category - Setting category
 * @param {String} description - Setting description
 * @returns {Promise<Object>} Updated setting
 */
export const setSetting = async (key, value, category = 'general', description = '') => {
    try {
        const setting = await settingsModel.findOneAndUpdate(
            { key },
            { value, category, description, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
        logger.info(`Setting updated: ${key}`, { value });
        return setting;
    } catch (error) {
        logger.error(`Failed to set setting: ${key}`, { error: error.message });
        throw error;
    }
};

/**
 * Get all settings by category
 * @param {String} category - Setting category
 * @returns {Promise<Object>} Settings object
 */
export const getSettingsByCategory = async (category) => {
    try {
        const settings = await settingsModel.find({ category });
        const result = {};
        settings.forEach(setting => {
            // Remove category prefix from key for easier access
            const cleanKey = setting.key.replace(`${category}.`, '');
            result[cleanKey] = setting.value;
        });
        return result;
    } catch (error) {
        logger.error(`Failed to get settings for category: ${category}`, { error: error.message });
        return {};
    }
};
