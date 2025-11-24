import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import EmailRenderer from './EmailRenderer.js';
import EmailLog from '../models/EmailLogModel.js';

/**
 * Email Service for sending transactional emails
 * Supports both legacy template methods and modern React Email templates
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  /**
   * Initialize SMTP transporter
   */
  init() {
    if (!process.env.SMTP_HOST) {
      logger.warn('Email service not configured. Set SMTP environment variables to enable email notifications.');
      return;
    }

    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465 (SSL), false for others (TLS)
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates in development
      },
      pool: false // Disable connection pooling for better error detection
    });

    logger.info('Email service initialized', {
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465
    });
  }

  /**
   * Update SMTP configuration from settings
   */
  updateConfiguration(smtpConfig) {
    const { host, port, user, password, enabled } = smtpConfig;

    if (enabled === false) {
      logger.info('Email service disabled in settings');
      this.transporter = null;
      return;
    }

    try {
      const portNum = parseInt(port) || parseInt(process.env.SMTP_PORT) || 587;
      const configuredHost = host || process.env.SMTP_HOST;

      this.transporter = nodemailer.createTransport({
        host: configuredHost,
        port: portNum,
        secure: portNum === 465, // true for 465, false for other ports
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 60000,     // 60 seconds
        auth: {
          user: user || process.env.SMTP_USER,
          pass: password || process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates in development
        },
        pool: false // Disable connection pooling for better error detection
      });

      logger.info('Email service configuration updated', {
        host: configuredHost,
        port: portNum,
        secure: portNum === 465,
        user: user || process.env.SMTP_USER
      });
    } catch (error) {
      logger.error('Error updating email configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify SMTP connection
   * @returns {Promise<Object>}
   */
  async verifyConnection() {
    if (!this.transporter) {
      return {
        success: false,
        message: 'Email service not configured. Please update SMTP settings.'
      };
    }

    try {
      logger.info('Verifying SMTP connection...');
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
      return { success: true, message: 'SMTP connection verified successfully' };
    } catch (error) {
      logger.error('SMTP connection verification failed', {
        error: error.message,
        code: error.code,
        command: error.command
      });

      // Provide specific guidance based on error
      let userMessage = error.message;
      let guidance = [];

      if (error.code === 'ETIMEDOUT') {
        userMessage = 'Connection timed out while connecting to SMTP server.';
        guidance = [
          'Check if the SMTP host address is correct',
          'Verify the port number (usually 587 for TLS or 465 for SSL)',
          'Ensure your firewall allows outbound SMTP connections',
          'If using Gmail, make sure you are using an App Password, not your regular password'
        ];
      } else if (error.code === 'EAUTH') {
        userMessage = 'SMTP authentication failed.';
        guidance = [
          'Check username and password',
          'For Gmail, use App Password instead of regular password',
          'Verify that SMTP authentication is enabled on your mail server'
        ];
      } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
        userMessage = 'Could not connect to SMTP server.';
        guidance = [
          'Verify the SMTP host address',
          'Check if the server is accessible from your network',
          'Ensure DNS resolution is working'
        ];
      }

      return {
        success: false,
        message: userMessage,
        code: error.code,
        guidance
      };
    }
  }

  /**
   * Send email with confirmation
   * @param {Object} mailOptions - Email options
   * @param {String} trigger - Email trigger type (e.g., 'orderCreated', 'orderStatusUpdate')
   * @returns {Promise<Object>}
   */
  async sendEmail(mailOptions, trigger = 'manual') {
    if (!this.transporter) {
      const errorMsg = 'Email service not configured. Please update SMTP settings.';
      logger.warn(errorMsg, { to: mailOptions.to });

      // Log failed attempt
      await this.createEmailLog({
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        trigger,
        status: 'failed',
        error: errorMsg
      });

      return { success: false, message: errorMsg };
    }

    try {
      logger.info('Attempting to send email', {
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject
      });

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject,
        response: info.response
      });

      // Log successful email
      await this.createEmailLog({
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        trigger,
        status: 'sent',
        messageId: info.messageId,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      logger.error('Email send error', {
        error: error.message,
        code: error.code,
        command: error.command,
        stack: error.stack,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      // Return user-friendly error messages
      let userMessage = error.message;
      if (error.code === 'EAUTH') {
        userMessage = 'SMTP authentication failed. Please check username and password.';
      } else if (error.code === 'ECONNECTION') {
        userMessage = 'Could not connect to SMTP server. Please check host and port.';
      } else if (error.code === 'ETIMEDOUT') {
        userMessage = 'Connection timed out. Please check your network and SMTP settings.';
      }

      // Log failed email
      await this.createEmailLog({
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        trigger,
        status: 'failed',
        error: userMessage,
        errorCode: error.code
      });

      return {
        success: false,
        message: userMessage,
        code: error.code
      };
    }
  }

  /**
   * Send email using React Email templates (Modern Approach)
   * @param {string} templateType - Template identifier (e.g., 'orderConfirmation')
   * @param {Object} data - Template data
   * @param {string} to - Recipient email address
   * @param {Object} options - Additional email options
   * @returns {Promise<Object>}
   */
  async sendReactEmail(templateType, data, to, options = {}) {
    try {
      // Validate template data
      const validation = EmailRenderer.validateTemplateData(templateType, data);
      if (!validation.isValid) {
        logger.error('Invalid template data', {
          templateType,
          errors: validation.errors
        });
        return {
          success: false,
          message: 'Invalid template data',
          errors: validation.errors
        };
      }

      // Render template
      logger.info('Rendering React Email template', { templateType, to });
      const { subject, html } = await EmailRenderer.renderTemplate(templateType, data);

      // Prepare mail options
      const mailOptions = {
        from: options.from || `"Tulumbak Baklava" <${process.env.SMTP_USER}>`,
        to,
        subject: options.subject || subject,
        html,
        ...options, // Allow override of any option
      };

      // Determine trigger type from templateType or options
      const trigger = options.trigger || this.mapTemplateTrigger(templateType);

      // Send email with trigger information for logging
      const result = await this.sendEmail(mailOptions, trigger);

      if (result.success) {
        logger.info('React Email sent successfully', {
          templateType,
          trigger,
          to,
          messageId: result.messageId
        });
      }

      return result;
    } catch (error) {
      logger.error('Error sending React Email', {
        templateType,
        to,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        message: `Failed to send email: ${error.message}`
      };
    }
  }

  /**
   * Map template type to trigger name for logging
   * @param {string} templateType - Template identifier
   * @returns {string} - Trigger name
   */
  mapTemplateTrigger(templateType) {
    const triggerMap = {
      'orderConfirmation': 'orderCreated',
      'orderStatusUpdate': 'orderStatusUpdate',
      'courierAssignment': 'courierAssigned',
      'deliveryCompleted': 'orderDelivered',
      'paymentReceived': 'paymentReceived'
    };

    return triggerMap[templateType] || 'reactEmailTemplate';
  }

  /**
   * Create email log entry
   * @param {Object} logData - Log data
   * @returns {Promise<void>}
   */
  async createEmailLog(logData) {
    try {
      const emailLog = new EmailLog(logData);
      await emailLog.save();
      logger.debug('Email log created', { to: logData.to, status: logData.status });
    } catch (error) {
      // Log but don't fail email sending if logging fails
      logger.error('Failed to create email log', {
        error: error.message,
        to: logData.to
      });
    }
  }

  /**
   * Get available React Email templates
   * @returns {Array<string>}
   */
  getAvailableTemplates() {
    return EmailRenderer.getAvailableTemplates();
  }

  /**
   * Send order confirmation email (Legacy - uses old template)
   * @param {Object} orderData - Order details
   * @param {String} to - Recipient email
   * @returns {Promise<Object>}
   */
  async sendOrderConfirmation(orderData, to) {
    const mailOptions = {
      from: `"Tulumbak Baklava" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Siparişiniz Alındı - #' + orderData.orderId,
      html: this.getOrderConfirmationTemplate(orderData),
    };

    return await this.sendEmail(mailOptions, 'orderCreated');
  }

  /**
   * Send order status update email
   * @param {Object} orderData - Order details
   * @param {String} status - New status
   * @param {String} to - Recipient email
   * @returns {Promise<Object>}
   */
  async sendOrderStatusUpdate(orderData, status, to) {
    const mailOptions = {
      from: `"Tulumbak Baklava" <${process.env.SMTP_USER}>`,
      to,
      subject: `Sipariş Durumunuz Güncellendi - #${orderData.orderId}`,
      html: this.getOrderStatusUpdateTemplate(orderData, status),
    };

    return await this.sendEmail(mailOptions, 'orderStatusUpdate');
  }

  /**
   * Send courier assignment email
   * @param {Object} orderData - Order details
   * @param {String} to - Recipient email
   * @returns {Promise<Object>}
   */
  async sendCourierAssignment(orderData, to) {
    const mailOptions = {
      from: `"Tulumbak Baklava" <${process.env.SMTP_USER}>`,
      to,
      subject: `Siparişiniz Yola Çıktı - #${orderData.orderId}`,
      html: this.getCourierAssignmentTemplate(orderData),
    };

    return await this.sendEmail(mailOptions, 'courierAssigned');
  }

  /**
   * Send delivery completed email
   * @param {Object} orderData - Order details
   * @param {String} to - Recipient email
   * @returns {Promise<Object>}
   */
  async sendDeliveryCompleted(orderData, to) {
    const mailOptions = {
      from: `"Tulumbak Baklava" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Siparişiniz Teslim Edildi - Tulumbak',
      html: this.getDeliveryCompletedTemplate(orderData),
    };

    return await this.sendEmail(mailOptions, 'orderDelivered');
  }

  /**
   * Get order confirmation email template
   * @param {Object} orderData - Order details
   * @returns {String}
   */
  getOrderConfirmationTemplate(orderData) {
    const itemsHtml = orderData.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₺${item.price?.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₺${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #d4af37; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; color: #d4af37; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧁 Siparişiniz Alındı!</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Siparişiniz başarıyla alındı. Sipariş numaranız: <strong>#${orderData.orderId || orderData._id}</strong></p>
              <p>Sipariş detaylarınız:</p>
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <p class="total">Toplam Tutar: ₺${orderData.amount.toFixed(2)}</p>
              <p><strong>Ödeme Yöntemi:</strong> ${orderData.paymentMethod}</p>
              <p>Teşekkür ederiz!</p>
              <p>Tulumbak İzmir Baklava</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get order status update email template
   * @param {Object} orderData - Order details
   * @param {String} status - New status
   * @returns {String}
   */
  getOrderStatusUpdateTemplate(orderData, status) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .status { background: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Sipariş Durumunuz Güncellendi</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Siparişinizin (#${orderData.orderId || orderData._id}) durumu güncellendi.</p>
              <div class="status">
                <strong>Yeni Durum: ${status}</strong>
              </div>
              <p>Siparişinizi takip etmeye devam edebilirsiniz.</p>
              <p>Teşekkür ederiz!</p>
              <p>Tulumbak İzmir Baklava</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get courier assignment email template
   * @param {Object} orderData - Order details
   * @returns {String}
   */
  getCourierAssignmentTemplate(orderData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .tracking { background: #2196F3; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Siparişiniz Yola Çıktı!</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Siparişiniz (#${orderData.orderId || orderData._id}) kuryeye teslim edildi ve yola çıktı!</p>
              ${orderData.courierTrackingId ? `<div class="tracking"><strong>Takip Numarası:</strong> ${orderData.courierTrackingId}</div>` : ''}
              <p>Siparişiniz yakında kapınızda olacak.</p>
              <p>Teşekkür ederiz!</p>
              <p>Tulumbak İzmir Baklava</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get delivery completed email template
   * @param {Object} orderData - Order details
   * @returns {String}
   */
  getDeliveryCompletedTemplate(orderData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .success { background: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Siparişiniz Teslim Edildi!</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Harika haber! Siparişiniz (#${orderData.orderId || orderData._id}) başarıyla teslim edildi.</p>
              <div class="success">
                <strong>Afiyet olsun! 🧁</strong>
              </div>
              <p>Bizimle alışveriş yaptığınız için teşekkür ederiz. Tekrar görüşmek üzere!</p>
              <p>Sevgiler,<br>Tulumbak İzmir Baklava</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

const emailService = new EmailService();

export default emailService;

