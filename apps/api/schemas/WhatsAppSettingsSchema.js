import { z } from 'zod';

/**
 * WhatsApp Support Settings Schema (Zod)
 * Validates WhatsApp support widget configuration
 */

// E.164 phone number validation
const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

// HEX color validation
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Position enum
const positionEnum = z.enum([
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
  'right-center',
  'left-center'
]);

// Icon type enum
const iconTypeEnum = z.enum(['reactIcon', 'customSvg']);

// Device-specific settings schema
const deviceSettingsSchema = z.object({
  showOnProduct: z.boolean().default(false),
  buttonText: z.string().min(1).max(50).default('WhatsApp\'tan Sor'),
  position: positionEnum.default('bottom-right'),
  offsetX: z.number().int().min(0).max(120).default(20),
  offsetY: z.number().int().min(0).max(120).default(20),
  bgColor: z.string().regex(hexColorRegex, 'Invalid HEX color format').default('#25D366'),
  iconColor: z.string().regex(hexColorRegex, 'Invalid HEX color format').default('#FFFFFF'),
  textColor: z.string().regex(hexColorRegex, 'Invalid HEX color format').default('#FFFFFF')
});

// Main WhatsApp settings schema
export const whatsAppSettingsSchema = z.object({
  // Global settings
  enabled: z.boolean().default(false),
  phoneE164: z.string()
    .regex(e164PhoneRegex, 'Phone number must be in E.164 format (e.g., +905551234567)')
    .default('+905551234567'),
  iconType: iconTypeEnum.default('reactIcon'),
  iconName: z.string().optional(), // For reactIcon: 'MessageCircle', 'Phone', etc.
  iconSvg: z.string().optional(), // For customSvg: sanitized SVG string
  
  // Desktop settings
  desktop: deviceSettingsSchema.default({
    showOnProduct: false,
    buttonText: 'WhatsApp\'tan Sor',
    position: 'bottom-right',
    offsetX: 20,
    offsetY: 20,
    bgColor: '#25D366',
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF'
  }),
  
  // Mobile settings
  mobile: deviceSettingsSchema.default({
    showOnProduct: false,
    buttonText: 'WhatsApp',
    position: 'bottom-right',
    offsetX: 16,
    offsetY: 16,
    bgColor: '#25D366',
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF'
  })
});

/**
 * TypeScript-like interface (JSDoc for IDE support)
 * @typedef {Object} WhatsAppSettings
 * @property {boolean} enabled
 * @property {string} phoneE164 - E.164 format phone number
 * @property {'reactIcon'|'customSvg'} iconType
 * @property {string} [iconName] - React icon name
 * @property {string} [iconSvg] - Custom SVG string
 * @property {DeviceSettings} desktop
 * @property {DeviceSettings} mobile
 * 
 * @typedef {Object} DeviceSettings
 * @property {boolean} showOnProduct
 * @property {string} buttonText
 * @property {'bottom-right'|'bottom-left'|'top-right'|'top-left'|'right-center'|'left-center'} position
 * @property {number} offsetX - 0-120
 * @property {number} offsetY - 0-120
 * @property {string} bgColor - HEX color
 * @property {string} iconColor - HEX color
 * @property {string} textColor - HEX color
 */

/**
 * Default WhatsApp settings
 */
export const defaultWhatsAppSettings = {
  enabled: false,
  phoneE164: '+905551234567',
  iconType: 'reactIcon',
  iconName: 'MessageCircle',
  desktop: {
    showOnProduct: false,
    buttonText: 'WhatsApp\'tan Sor',
    position: 'bottom-right',
    offsetX: 20,
    offsetY: 20,
    bgColor: '#25D366',
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF'
  },
  mobile: {
    showOnProduct: false,
    buttonText: 'WhatsApp',
    position: 'bottom-right',
    offsetX: 16,
    offsetY: 16,
    bgColor: '#25D366',
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF'
  }
};

/**
 * Validate WhatsApp settings
 * @param {any} data - Settings data to validate
 * @returns {{success: boolean, data?: WhatsAppSettings, error?: string}}
 */
export const validateWhatsAppSettings = (data) => {
  try {
    const validated = whatsAppSettingsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: error.message };
  }
};

/**
 * Sanitize custom SVG string
 * @param {string} svg - SVG string to sanitize
 * @returns {string} - Sanitized SVG
 */
export const sanitizeSvg = (svg) => {
  if (!svg || typeof svg !== 'string') return '';
  
  // Remove script tags and event handlers
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

