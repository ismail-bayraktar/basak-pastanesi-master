import settingsModel from "../models/SettingsModel.js";
import { validateWhatsAppSettings, sanitizeSvg, defaultWhatsAppSettings } from "../schemas/WhatsAppSettingsSchema.js";
import logger from "../utils/logger.js";

/**
 * Get all settings or by category
 */
const getSettings = async (req, res) => {
  try {
    // Category can come from URL params or query params
    const category = req.params.category || req.query.category;

    let query = {};
    if (category) {
      query.category = category;
    }

    const settings = await settingsModel.find(query);

    // Convert to key-value object (removing category prefix for cleaner keys)
    const settingsObject = {};
    settings.forEach(setting => {
      // Remove category prefix from key if filtering by category (e.g., "media.useCloudinary" → "useCloudinary")
      const cleanKey = category ? setting.key.replace(`${category}.`, '') : setting.key;
      settingsObject[cleanKey] = setting.value;
    });

    res.json({ success: true, settings: settingsObject });
  } catch (error) {
    logger.error('Error fetching settings', {
      error: error.message,
      stack: error.stack,
      category: req.params.category || req.query.category
    });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single setting by key
 */
const getSetting = async (req, res) => {
  try {
    const { key } = req.body;
    const setting = await settingsModel.findOne({ key });
    
    if (!setting) {
      return res.json({ success: false, message: "Setting not found" });
    }
    
    res.json({ success: true, setting });
  } catch (error) {
    logger.error('Error fetching setting', { error: error.message, stack: error.stack, key: req.body.key });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create or update setting
 */
const updateSetting = async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    
    if (!key || value === undefined) {
      return res.json({ success: false, message: "Key and value are required" });
    }
    
    const setting = await settingsModel.findOneAndUpdate(
      { key },
      { 
        value, 
        category: category || 'general',
        description,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, setting, message: "Setting updated successfully" });
  } catch (error) {
    logger.error('Error updating setting', { error: error.message, stack: error.stack, key: req.body.key });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update multiple settings at once
 */
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of {key, value, category}
    
    if (!Array.isArray(settings)) {
      return res.json({ success: false, message: "Settings must be an array" });
    }
    
    const updatePromises = settings.map(async ({ key, value, category, description }) => {
      return await settingsModel.findOneAndUpdate(
        { key },
        { 
          value, 
          category: category || 'general',
          description,
          updatedAt: Date.now()
        },
        { upsert: true, new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    logger.error('Error updating multiple settings', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete setting
 */
const deleteSetting = async (req, res) => {
  try {
    const { key } = req.body;
    
    await settingsModel.findOneAndDelete({ key });
    
    res.json({ success: true, message: "Setting deleted successfully" });
  } catch (error) {
    logger.error('Error deleting setting', { error: error.message, stack: error.stack, key: req.params.key });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Test email configuration
 */
const testEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    if (!email) {
      return res.json({ success: false, message: "Email address is required" });
    }

    // Import emailService dynamically to avoid circular dependency
    const { default: emailService } = await import("../services/EmailService.js");
    
    const result = await emailService.sendEmail({
      from: `"Tulumbak Baklava" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject || 'Test Email - Tulumbak',
      html: message || `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>Bu bir test email'idir.</p>
          <p>Email ayarlarınız doğru yapılandırılmış!</p>
        </div>
      `
    });

    if (result.success) {
      res.json({ success: true, message: "Test email sent successfully" });
      } else {
      res.json({ success: false, message: result.message || "Failed to send test email" });
      }
    } catch (error) {
    logger.error('Error sending test email', { error: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Initialize default settings if not exists
 */
const initDefaultSettings = async () => {
  try {
    const defaultSettings = [
      {
        key: 'email_enabled',
        value: true,
        category: 'email',
        description: 'Enable email notifications'
      },
      {
        key: 'email_smtp_host',
        value: process.env.SMTP_HOST || '',
        category: 'email',
        description: 'SMTP host'
      },
      {
        key: 'email_smtp_port',
        value: parseInt(process.env.SMTP_PORT) || 587,
        category: 'email',
        description: 'SMTP port'
      },
      {
        key: 'email_smtp_user',
        value: process.env.SMTP_USER || '',
        category: 'email',
        description: 'SMTP username'
      },
      {
        key: 'stock_min_threshold',
        value: 10,
        category: 'stock',
        description: 'Minimum stock threshold for alerts'
      },
      {
        key: 'stock_enable_alerts',
        value: true,
        category: 'stock',
        description: 'Enable low stock alerts'
      },
      {
        key: 'rate_limit_max_requests',
        value: 100,
        category: 'security',
        description: 'Maximum requests per window'
      },
      {
        key: 'rate_limit_window_ms',
        value: 900000, // 15 minutes
        category: 'security',
        description: 'Rate limit window in milliseconds'
      }
    ];
    
    for (const setting of defaultSettings) {
      await settingsModel.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true }
      );
    }
    
      logger.info('Default settings initialized');
    } catch (error) {
      logger.error('Error initializing default settings', { error: error.message, stack: error.stack });
    }
};

/**
 * Get WhatsApp support settings
 */
const getWhatsAppSettings = async (req, res) => {
  try {
    const setting = await settingsModel.findOne({ key: 'whatsapp_support' });
    
    if (!setting) {
      // Return default settings if not exists
      return res.json({ 
        success: true, 
        settings: defaultWhatsAppSettings 
      });
    }
    
    res.json({ success: true, settings: setting.value });
  } catch (error) {
    logger.error('Error fetching WhatsApp settings', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update WhatsApp support settings
 */
const updateWhatsAppSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.json({ success: false, message: "Settings are required" });
    }
    
    // Sanitize custom SVG if provided
    if (settings.iconType === 'customSvg' && settings.iconSvg) {
      settings.iconSvg = sanitizeSvg(settings.iconSvg);
    }
    
    // Validate settings
    const validation = validateWhatsAppSettings(settings);
    if (!validation.success) {
      return res.json({ 
        success: false, 
        message: `Validation error: ${validation.error}` 
      });
    }
    
    // Save to database
    const setting = await settingsModel.findOneAndUpdate(
      { key: 'whatsapp_support' },
      { 
        value: validation.data,
        category: 'whatsapp',
        description: 'WhatsApp müşteri desteği ayarları',
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      settings: setting.value,
      message: "WhatsApp ayarları başarıyla güncellendi" 
    });
  } catch (error) {
    logger.error('Error updating WhatsApp settings', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get branch assignment settings
 */
const getBranchAssignmentSettings = async (req, res) => {
  try {
    const enabledSetting = await settingsModel.findOne({ key: 'branch_assignment_enabled' });
    const modeSetting = await settingsModel.findOne({ key: 'branch_assignment_mode' });
    
    res.json({
      success: true,
      settings: {
        enabled: enabledSetting?.value !== false, // Default true
        mode: modeSetting?.value || 'auto' // Default auto
      }
    });
  } catch (error) {
    logger.error('Error fetching branch assignment settings', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update branch assignment settings
 */
const updateBranchAssignmentSettings = async (req, res) => {
  try {
    const { enabled, mode } = req.body;
    
    if (mode && !['auto', 'hybrid', 'manual'].includes(mode)) {
      return res.json({ 
        success: false, 
        message: 'Invalid assignment mode. Must be: auto, hybrid, or manual' 
      });
    }
    
    const updatePromises = [];
    
    if (enabled !== undefined) {
      updatePromises.push(
        settingsModel.findOneAndUpdate(
          { key: 'branch_assignment_enabled' },
          { 
            value: enabled,
            category: 'delivery',
            description: 'Enable/disable automatic branch assignment',
            updatedAt: Date.now()
          },
          { upsert: true, new: true }
        )
      );
    }
    
    if (mode) {
      updatePromises.push(
        settingsModel.findOneAndUpdate(
          { key: 'branch_assignment_mode' },
          { 
            value: mode,
            category: 'delivery',
            description: 'Branch assignment mode: auto (automatic), hybrid (suggest + approve), manual (admin assigns)',
            updatedAt: Date.now()
          },
          { upsert: true, new: true }
        )
      );
    }
    
    await Promise.all(updatePromises);
    
    res.json({ success: true, message: 'Branch assignment settings updated successfully' });
  } catch (error) {
    logger.error('Error updating branch assignment settings', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
};

export { 
  getSettings, 
  getSetting, 
  updateSetting, 
  updateSettings, 
  deleteSetting, 
  testEmail, 
  initDefaultSettings,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  getBranchAssignmentSettings,
  updateBranchAssignmentSettings
};

