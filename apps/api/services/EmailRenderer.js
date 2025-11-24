// TEMPORARILY DISABLED: JSX templates not compatible with Vercel serverless without transpilation
// import { renderEmailToHTML, generateEmailSubject } from '../emails/utils/renderEmail.js';
// import { OrderConfirmation } from '../emails/templates/customer/OrderConfirmation.js';
import EmailSettings from '../models/EmailSettingsModel.js';

/**
 * EmailRenderer Class - TEMPORARILY DISABLED
 * JSX email templates require build-time compilation for Vercel serverless
 * Email rendering is disabled until JSX transpilation is configured
 *
 * TODO: Implement one of:
 * - Option A: Pre-compile JSX templates during build
 * - Option B: Convert templates to string-based approach
 * - Option C: Configure runtime JSX transformation
 */
class EmailRenderer {
  constructor() {
    this.disabled = true;
    this.templateMap = {
      // Templates temporarily disabled
      // orderConfirmation: OrderConfirmation,
    };
    console.warn('⚠️ EmailRenderer: Email rendering is temporarily disabled (JSX compilation required)');
  }

  /**
   * Get email design settings from database
   * @returns {Promise<Object>} Design settings object
   */
  async getDesignSettings() {
    try {
      const settings = await EmailSettings.findOne();

      // Default settings fallback
      const defaults = {
        brandColor: '#d4af37',
        logoUrl: 'https://basakpastanesi.com/logo.png',
        storeName: 'Başak Pastanesi',
        storeEmail: 'info@basakpastanesi.com',
        storePhone: '0212 XXX XXXX',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        privacyPolicyUrl: 'https://basakpastanesi.com/privacy',
        emailPreferencesUrl: 'https://basakpastanesi.com/email-preferences',
        unsubscribeUrl: 'https://basakpastanesi.com/unsubscribe',
      };

      if (!settings || !settings.design) {
        return defaults;
      }

      // Merge database settings with defaults
      return {
        brandColor: settings.design.brandColor || defaults.brandColor,
        logoUrl: settings.design.logoUrl || defaults.logoUrl,
        storeName: settings.design.storeName || defaults.storeName,
        storeEmail: settings.design.storeEmail || defaults.storeEmail,
        storePhone: settings.design.storePhone || defaults.storePhone,
        fontFamily: settings.design.fontFamily || defaults.fontFamily,
        privacyPolicyUrl: settings.design.privacyPolicyUrl || defaults.privacyPolicyUrl,
        emailPreferencesUrl: settings.design.emailPreferencesUrl || defaults.emailPreferencesUrl,
        unsubscribeUrl: settings.design.unsubscribeUrl || defaults.unsubscribeUrl,
      };
    } catch (error) {
      console.error('Error fetching email design settings:', error);
      // Return defaults on error
      return {
        brandColor: '#d4af37',
        logoUrl: 'https://basakpastanesi.com/logo.png',
        storeName: 'Başak Pastanesi',
        storeEmail: 'info@basakpastanesi.com',
        storePhone: '0212 XXX XXXX',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        privacyPolicyUrl: 'https://basakpastanesi.com/privacy',
        emailPreferencesUrl: 'https://basakpastanesi.com/email-preferences',
        unsubscribeUrl: 'https://basakpastanesi.com/unsubscribe',
      };
    }
  }

  /**
   * Render React Email template to HTML - TEMPORARILY DISABLED
   * @param {string} templateType - Template identifier (e.g., 'orderConfirmation')
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Disabled response
   */
  async renderTemplate(templateType, data) {
    console.warn(`⚠️ EmailRenderer: Attempted to render '${templateType}' but email system is disabled`);

    // Return a disabled response instead of throwing error
    return {
      subject: `[Email Disabled] ${templateType}`,
      html: '<p>Email rendering is temporarily disabled. JSX compilation configuration required.</p>',
      templateType,
      disabled: true,
    };
  }

  /**
   * Validate template data
   * @param {string} templateType - Template identifier
   * @param {Object} data - Template data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateTemplateData(templateType, data) {
    const errors = [];

    switch (templateType) {
      case 'orderConfirmation':
        if (!data.customerName) errors.push('customerName is required');
        if (!data.customerEmail) errors.push('customerEmail is required');
        if (!data.orderId) errors.push('orderId is required');
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
          errors.push('items array is required and must not be empty');
        }
        if (typeof data.total !== 'number') errors.push('total must be a number');
        if (!data.shippingAddress) errors.push('shippingAddress is required');
        if (!data.paymentMethod) errors.push('paymentMethod is required');
        break;

      // Future template validations
      default:
        errors.push(`Unknown template type: ${templateType}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available templates
   * @returns {Array<string>} List of available template identifiers
   */
  getAvailableTemplates() {
    return Object.keys(this.templateMap);
  }
}

// Export singleton instance
export default new EmailRenderer();
