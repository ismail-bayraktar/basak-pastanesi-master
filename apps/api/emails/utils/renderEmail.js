import { render } from '@react-email/render';
import React from 'react';

/**
 * Render React Email component to HTML string
 * @param {React.Component} EmailComponent - React Email component
 * @param {Object} props - Component props
 * @returns {Promise<string>} HTML string
 */
export async function renderEmailToHTML(EmailComponent, props) {
  try {
    const html = render(React.createElement(EmailComponent, props));
    return html;
  } catch (error) {
    console.error('Email rendering error:', error);
    throw new Error(`Failed to render email: ${error.message}`);
  }
}

/**
 * Generate email subject based on template type and data
 * @param {string} type - Email type (orderConfirmation, orderStatusUpdate, etc.)
 * @param {Object} data - Email data
 * @returns {string} Email subject
 */
export function generateEmailSubject(type, data) {
  const subjects = {
    orderConfirmation: `Siparişiniz Alındı - #${data.orderId}`,
    orderStatusUpdate: `Sipariş Durumu Güncellendi - #${data.orderId}`,
    courierAssignment: `Siparişiniz Yola Çıktı - #${data.orderId}`,
    orderDelivered: `Siparişiniz Teslim Edildi - #${data.orderId}`,
    orderCancelled: `Siparişiniz İptal Edildi - #${data.orderId}`,
  };

  return subjects[type] || `Tulumbak - Bildirim`;
}

export default { renderEmailToHTML, generateEmailSubject };
