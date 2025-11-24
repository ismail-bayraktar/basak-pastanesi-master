import express from 'express';
import EmailSettings from '../models/EmailSettingsModel.js';
import EmailLog from '../models/EmailLogModel.js';
import EmailTemplate from '../models/EmailTemplateModel.js';
import emailService from '../services/EmailService.js';
import logger from '../utils/logger.js';

const emailRouter = express.Router();

// ==================== EMAIL SETTINGS ====================

// Get email settings (singleton - always returns one document)
emailRouter.get('/settings', async (req, res) => {
  try {
    let settings = await EmailSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = new EmailSettings({
        smtp: {
          enabled: false,
          host: process.env.SMTP_HOST || '',
          port: parseInt(process.env.SMTP_PORT) || 587,
          user: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASSWORD || '',
          fromEmail: process.env.SMTP_USER || '',
        },
      });
      await settings.save();
    }

    res.json({ success: true, settings });
  } catch (error) {
    logger.error('Error fetching email settings', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update email settings
emailRouter.put('/settings', async (req, res) => {
  try {
    let settings = await EmailSettings.findOne();

    if (!settings) {
      settings = new EmailSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    // Update EmailService configuration
    if (settings.smtp.enabled && settings.general.enabled) {
      emailService.updateConfiguration(settings.smtp);
    }

    logger.info('Email settings updated', { enabled: settings.general.enabled });
    res.json({ success: true, settings });
  } catch (error) {
    logger.error('Error updating email settings', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test SMTP connection
emailRouter.post('/settings/test', async (req, res) => {
  try {
    const { host, port, user, password, testEmail } = req.body;

    // Validate required fields
    if (!host || !port || !user || !password || !testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: host, port, user, password, testEmail'
      });
    }

    logger.info('Testing SMTP configuration', { host, port, user, testEmail });

    // Temporarily update configuration for testing
    emailService.updateConfiguration({ host, port, user, password, enabled: true });

    // First verify connection
    logger.info('Verifying SMTP connection before sending test email');
    const verifyResult = await emailService.verifyConnection();

    if (!verifyResult.success) {
      logger.error('SMTP connection verification failed', {
        error: verifyResult.message,
        code: verifyResult.code,
        guidance: verifyResult.guidance
      });

      return res.status(500).json({
        success: false,
        message: verifyResult.message,
        code: verifyResult.code,
        guidance: verifyResult.guidance
      });
    }

    logger.info('SMTP connection verified, proceeding with test email');

    // Send test email
    const result = await emailService.sendEmail({
      from: `"Tulumbak Baklava Test" <${user}>`,
      to: testEmail,
      subject: 'Test Email - SMTP Configuration',
      html: '<h1>Success!</h1><p>Your SMTP configuration is working correctly.</p>',
    });

    if (result.success) {
      logger.info('Test email sent successfully', { to: testEmail });
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      logger.error('Test email failed', { error: result.message });
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send test email',
        code: result.code
      });
    }
  } catch (error) {
    logger.error('Error testing SMTP', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message || 'SMTP test failed' });
  }
});

// Test React Email template rendering
emailRouter.post('/settings/test-template', async (req, res) => {
  try {
    const { templateType, testEmail } = req.body;

    // Validate required fields
    if (!templateType || !testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: templateType, testEmail'
      });
    }

    // Sample order data for testing
    const sampleData = {
      customerName: 'Test Müşteri',
      customerEmail: testEmail,
      orderId: 'TEST-' + Date.now(),
      orderDate: new Date().toLocaleDateString('tr-TR'),
      items: [
        {
          name: 'Fıstıklı Baklava',
          size: 500,
          quantity: 2,
          price: 125.00
        },
        {
          name: 'Cevizli Baklava',
          size: 250,
          quantity: 1,
          price: 75.00
        }
      ],
      subtotal: 325.00,
      shipping: 25.00,
      discount: 0,
      total: 350.00,
      shippingAddress: 'Test Mahallesi, Test Sokak No:1, İzmir',
      deliveryDate: new Date(Date.now() + 86400000).toLocaleDateString('tr-TR'),
      paymentMethod: 'Kredi Kartı'
    };

    logger.info('Sending test React Email template', { templateType, testEmail });

    // Send email using React Email renderer
    const result = await emailService.sendReactEmail(templateType, sampleData, testEmail);

    if (result.success) {
      logger.info('Test React Email sent successfully', { templateType, to: testEmail });
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      logger.error('Test React Email failed', { error: result.message, errors: result.errors });
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send test email',
        errors: result.errors
      });
    }
  } catch (error) {
    logger.error('Error testing React Email template', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message || 'Template test failed' });
  }
});

// Get available React Email templates
emailRouter.get('/settings/available-templates', async (req, res) => {
  try {
    const templates = emailService.getAvailableTemplates();
    res.json({ success: true, templates });
  } catch (error) {
    logger.error('Error fetching available templates', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EMAIL TEMPLATES ====================

// Get all templates
emailRouter.get('/templates', async (req, res) => {
  try {
    const { trigger, isActive } = req.query;
    const filter = {};

    if (trigger) filter.trigger = trigger;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const templates = await EmailTemplate.find(filter).sort({ trigger: 1, createdAt: -1 });

    res.json({ success: true, templates });
  } catch (error) {
    logger.error('Error fetching templates', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single template
emailRouter.get('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    logger.error('Error fetching template', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create template
emailRouter.post('/templates', async (req, res) => {
  try {
    const template = new EmailTemplate(req.body);
    await template.save();

    logger.info('Email template created', { name: template.name, trigger: template.trigger });
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Error creating template', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update template
emailRouter.put('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    logger.info('Email template updated', { id: template._id, name: template.name });
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Error updating template', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete template
emailRouter.delete('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete default template' });
    }

    await template.deleteOne();

    logger.info('Email template deleted', { id: template._id, name: template.name });
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    logger.error('Error deleting template', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Preview template with sample data
emailRouter.post('/templates/:id/preview', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const { sampleData } = req.body;

    // Replace variables in template
    let htmlPreview = template.htmlContent;
    let subjectPreview = template.subject;

    if (sampleData) {
      Object.keys(sampleData).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlPreview = htmlPreview.replace(regex, sampleData[key]);
        subjectPreview = subjectPreview.replace(regex, sampleData[key]);
      });
    }

    res.json({ success: true, html: htmlPreview, subject: subjectPreview });
  } catch (error) {
    logger.error('Error previewing template', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EMAIL LOGS ====================

// Get all email logs with filtering
emailRouter.get('/logs', async (req, res) => {
  try {
    const { trigger, status, to, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (trigger) filter.trigger = trigger;
    if (status) filter.status = status;
    if (to) filter.to = { $regex: to, $options: 'i' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-htmlContent') // Exclude full HTML for list view
        .lean(),
      EmailLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching email logs', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single log with full content
emailRouter.get('/logs/:id', async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    res.json({ success: true, log });
  } catch (error) {
    logger.error('Error fetching email log', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete old logs (cleanup)
emailRouter.delete('/logs/cleanup', async (req, res) => {
  try {
    const settings = await EmailSettings.findOne();
    const retentionDays = settings?.logging?.retentionDays || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await EmailLog.deleteMany({ createdAt: { $lt: cutoffDate } });

    logger.info('Email logs cleaned up', { deletedCount: result.deletedCount, retentionDays });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    logger.error('Error cleaning up logs', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get log statistics
emailRouter.get('/logs/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [statusStats, triggerStats, totalSent] = await Promise.all([
      EmailLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      EmailLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$trigger', count: { $sum: 1 } } },
      ]),
      EmailLog.countDocuments(dateFilter),
    ]);

    res.json({
      success: true,
      stats: {
        total: totalSent,
        byStatus: statusStats,
        byTrigger: triggerStats,
      },
    });
  } catch (error) {
    logger.error('Error fetching log stats', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

export default emailRouter;
