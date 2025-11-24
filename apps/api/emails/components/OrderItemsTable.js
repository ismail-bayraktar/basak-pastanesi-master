import React from 'react';
import { Section, Row, Column, Text } from '@react-email/components';

/**
 * Order Items Component - Modern Card Layout
 * Clean, modern card design for displaying order items
 */
export const OrderItemsTable = ({ items = [], brandColor = '#d4af37' }) => {
  return (
    <Section style={containerStyle}>
      {/* Section Header */}
      <Text style={sectionTitleStyle}>Sipariş Ürünleri</Text>

      {/* Items as Cards */}
      {items.map((item, index) => (
        <Section key={index} style={itemCardStyle}>
          <Row>
            {/* Product Info */}
            <Column style={{ width: '60%' }}>
              <Text style={productNameStyle}>{item.name || 'Ürün'}</Text>
              {item.size && (
                <Text style={productSizeStyle}>Gramaj: {item.size}g</Text>
              )}
              <Text style={quantityStyle}>Adet: {item.quantity || 1}</Text>
            </Column>

            {/* Pricing */}
            <Column style={{ width: '40%', textAlign: 'right' }}>
              <Text style={unitPriceStyle}>₺{(item.price || 0).toFixed(2)}</Text>
              <Text style={totalPriceStyle}>
                ₺{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}
    </Section>
  );
};

// Inline styles - Modern Card Design
const containerStyle = {
  margin: '24px 0',
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
  letterSpacing: '0.3px',
};

const itemCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '12px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
};

const productNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 6px 0',
  lineHeight: '22px',
};

const productSizeStyle = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 0 6px 0',
  lineHeight: '18px',
};

const quantityStyle = {
  fontSize: '14px',
  color: '#374151',
  margin: 0,
  lineHeight: '20px',
  fontWeight: '500',
};

const unitPriceStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px 0',
  lineHeight: '20px',
};

const totalPriceStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: 0,
  lineHeight: '24px',
};

export default OrderItemsTable;
