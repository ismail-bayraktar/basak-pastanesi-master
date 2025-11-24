import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * SMS Service for sending transactional SMS
 * Supports multiple Turkish SMS providers (Netgsm, MesajPanel, etc.)
 */
class SmsService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'netgsm'; // netgsm, mesajpanel, etc.
    this.apiUrl = process.env.SMS_API_URL;
    this.apiKey = process.env.SMS_API_KEY;
    this.sender = process.env.SMS_SENDER || 'TULUMBAK';
    this.enabled = process.env.SMS_ENABLED === 'true';
  }

  /**
   * Initialize SMS service
   */
  init() {
    if (!this.enabled) {
      logger.warn('SMS service is disabled. Set SMS_ENABLED=true to enable.');
      return;
    }

    if (!this.apiUrl || !this.apiKey) {
      logger.warn('SMS service not configured. Set SMS_API_URL and SMS_API_KEY.');
      return;
    }

    logger.info('SMS service initialized', { provider: this.provider });
  }

  /**
   * Send SMS via Netgsm
   * @param {String} phoneNumber - Phone number (e.g. 05551234567)
   * @param {String} message - SMS message
   * @returns {Promise<Object>}
   */
  async sendNetgsm(phoneNumber, message) {
    try {
      const url = `${this.apiUrl}`;
      const params = new URLSearchParams({
        usercode: this.apiKey,
        password: process.env.SMS_PASSWORD || '',
        gsmno: phoneNumber,
        message: message,
        msgheader: this.sender,
        dil: 'TR'
      });

      const response = await axios.get(`${url}?${params.toString()}`);
      
      // Netgsm response format: "00 OK" for success
      if (response.data.includes('00 OK')) {
        logger.info('SMS sent successfully via Netgsm', { phoneNumber });
        return { success: true, message: 'SMS sent successfully' };
      } else {
        logger.error('SMS failed via Netgsm', { phoneNumber, response: response.data });
        return { success: false, message: response.data };
      }
    } catch (error) {
      logger.error('SMS send error (Netgsm)', { error: error.message, stack: error.stack, phoneNumber });
      return { success: false, message: error.message };
    }
  }

  /**
   * Send SMS via MesajPanel
   * @param {String} phoneNumber - Phone number
   * @param {String} message - SMS message
   * @returns {Promise<Object>}
   */
  async sendMesajPanel(phoneNumber, message) {
    try {
      const response = await axios.post(this.apiUrl, {
        username: this.apiKey,
        password: process.env.SMS_PASSWORD || '',
        header: this.sender,
        message: message,
        gsm: phoneNumber
      });

      if (response.data.status === 'success') {
        logger.info('SMS sent successfully via MesajPanel', { phoneNumber });
        return { success: true, message: 'SMS sent successfully' };
      } else {
        logger.error('SMS failed via MesajPanel', { phoneNumber, response: response.data });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      logger.error('SMS send error (MesajPanel)', { error: error.message, stack: error.stack, phoneNumber });
      return { success: false, message: error.message };
    }
  }

  /**
   * Send SMS (main method)
   * @param {String} phoneNumber - Phone number
   * @param {String} message - SMS message
   * @returns {Promise<Object>}
   */
  async sendSms(phoneNumber, message) {
    if (!this.enabled) {
      logger.debug('SMS service disabled. Skipping SMS send.', { phoneNumber });
      return { success: false, message: 'SMS service disabled' };
    }

    if (!phoneNumber || !message) {
      return { success: false, message: 'Phone number and message are required' };
    }

    // Format phone number (remove spaces, add +90 if needed)
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    switch (this.provider) {
      case 'netgsm':
        return await this.sendNetgsm(formattedPhone, message);
      case 'mesajpanel':
        return await this.sendMesajPanel(formattedPhone, message);
      default:
        logger.warn('Unknown SMS provider', { provider: this.provider, phoneNumber });
        return { success: false, message: 'Unknown SMS provider' };
    }
  }

  /**
   * Format phone number for Turkish carriers
   * @param {String} phoneNumber - Phone number in various formats
   * @returns {String} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all spaces, dashes, parentheses
    let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Remove +90 or 0090 prefix if exists
    if (formatted.startsWith('+90')) {
      formatted = formatted.substring(3);
    } else if (formatted.startsWith('0090')) {
      formatted = formatted.substring(4);
    } else if (formatted.startsWith('90')) {
      formatted = formatted.substring(2);
    }
    
    // Should now be 10 digits (like 05551234567)
    return formatted;
  }

  /**
   * Send order confirmation SMS
   * @param {String} phoneNumber - Customer phone number
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>}
   */
  async sendOrderConfirmation(phoneNumber, orderData) {
    const message = `Siparişiniz alındı! Sipariş No: #${orderData.orderId || orderData._id}. Teşekkürler - Tulumbak`;
    return await this.sendSms(phoneNumber, message);
  }

  /**
   * Send order status update SMS
   * @param {String} phoneNumber - Customer phone number
   * @param {String} status - Order status
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>}
   */
  async sendOrderStatusUpdate(phoneNumber, status, orderId) {
    const message = `Sipariş #${orderId} durumu: ${status} - Tulumbak`;
    return await this.sendSms(phoneNumber, message);
  }

  /**
   * Send courier assignment SMS
   * @param {String} phoneNumber - Customer phone number
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>}
   */
  async sendCourierAssigned(phoneNumber, orderData) {
    const tracking = orderData.courierTrackingId ? ` Takip No: ${orderData.courierTrackingId}` : '';
    const message = `Siparişiniz yola çıktı!${tracking} - Tulumbak`;
    return await this.sendSms(phoneNumber, message);
  }

  /**
   * Send delivery completed SMS
   * @param {String} phoneNumber - Customer phone number
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>}
   */
  async sendDeliveryCompleted(phoneNumber, orderId) {
    const message = `Siparişiniz #${orderId} teslim edildi! Afiyet olsun 🧁 - Tulumbak`;
    return await this.sendSms(phoneNumber, message);
  }
}

const smsService = new SmsService();
smsService.init();

export default smsService;

