import React from 'react';
import { Text, Section, Row, Column } from '@react-email/components';
import { EmailLayout } from '../../components/EmailLayout.js';
import { OrderItemsTable } from '../../components/OrderItemsTable.js';
import { Button } from '../../components/Button.js';

/**
 * Order Confirmation Email Template
 * Sent when customer places an order
 */
export const OrderConfirmation = ({
  // Customer data
  customerName = 'Müşteri',
  customerEmail,

  // Order data
  orderId,
  orderDate = new Date().toLocaleDateString('tr-TR'),
  items = [],

  // Pricing
  subtotal = 0,
  shipping = 0,
  discount = 0,
  total = 0,

  // Delivery
  shippingAddress = '',
  deliveryDate,

  // Payment
  paymentMethod = 'Kredi Kartı',

  // Branding (from EmailSettings)
  brandColor = '#d4af37',
  logoUrl,
  storeName = 'Basak Pastanesi İzmir Baklava',
  storeEmail = 'info@basakpastanesi.com',
  storePhone = '0232 XXX XXXX',
}) => {
  return (
    <EmailLayout
      logoUrl={logoUrl}
      brandColor={brandColor}
      storeName={storeName}
      storeEmail={storeEmail}
      storePhone={storePhone}
      showKVKK={true}
      isMarketing={false}
    >
      {/* Greeting */}
      <Section>
        <Text style={titleStyle}>Siparişiniz Alındı!</Text>
        <Text style={greetingStyle}>Merhaba {customerName},</Text>
        <Text style={paragraphStyle}>
          Siparişiniz başarıyla alındı ve hazırlanmaya başlandı. Sipariş detaylarınız aşağıdadır.
        </Text>
      </Section>

      {/* Order Info */}
      <Section style={infoBoxStyle}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={infoLabelStyle}>Sipariş Numarası</Text>
            <Text style={infoValueStyle}>#{orderId}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={infoLabelStyle}>Sipariş Tarihi</Text>
            <Text style={infoValueStyle}>{orderDate}</Text>
          </Column>
        </Row>
        {deliveryDate && (
          <Row style={{ marginTop: '12px' }}>
            <Column>
              <Text style={infoLabelStyle}>Tahmini Teslimat</Text>
              <Text style={infoValueStyle}>{deliveryDate}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Order Items Table */}
      <OrderItemsTable items={items} brandColor={brandColor} />

      {/* Order Summary */}
      <Section style={summaryStyle}>
        <Row>
          <Column style={{ width: '70%' }}>
            <Text style={summaryLabelStyle}>Ara Toplam:</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={summaryValueStyle}>₺{subtotal.toFixed(2)}</Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: '70%' }}>
            <Text style={summaryLabelStyle}>Kargo:</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={summaryValueStyle}>₺{shipping.toFixed(2)}</Text>
          </Column>
        </Row>

        {discount > 0 && (
          <Row>
            <Column style={{ width: '70%' }}>
              <Text style={summaryLabelStyle}>İndirim:</Text>
            </Column>
            <Column style={{ width: '30%', textAlign: 'right' }}>
              <Text style={{...summaryValueStyle, color: '#22c55e'}}>-₺{discount.toFixed(2)}</Text>
            </Column>
          </Row>
        )}

        <Row style={totalRowStyle}>
          <Column style={{ width: '70%' }}>
            <Text style={totalLabelStyle}>Toplam:</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={totalValueStyle}>₺{total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Delivery & Payment Info */}
      <Section style={detailsBoxStyle}>
        <Text style={detailsTitleStyle}>Teslimat Adresi</Text>
        <Text style={detailsTextStyle}>{shippingAddress}</Text>

        <Text style={{ ...detailsTitleStyle, marginTop: '20px' }}>Ödeme Yöntemi</Text>
        <Text style={detailsTextStyle}>{paymentMethod}</Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={`https://basakpastanesi.com/orders/${orderId}`}
          brandColor={brandColor}
        >
          Siparişimi Takip Et
        </Button>
      </Section>

      {/* Thank You Message */}
      <Section>
        <Text style={paragraphStyle}>
          Siparişiniz için teşekkür ederiz! Afiyet olsun.
        </Text>
      </Section>
    </EmailLayout>
  );
};

// Inline styles
const titleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 24px 0',
  lineHeight: '36px',
};

const greetingStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 16px 0',
  lineHeight: '24px',
};

const paragraphStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555555',
  margin: '0 0 16px 0',
};

const infoBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '4px',
  margin: '24px 0',
};

const infoLabelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#666666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
};

const infoValueStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: 0,
};

const summaryStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
  margin: '24px 0',
};

const summaryLabelStyle = {
  fontSize: '15px',
  lineHeight: '20px',
  color: '#555555',
  margin: '8px 0',
};

const summaryValueStyle = {
  fontSize: '15px',
  lineHeight: '20px',
  color: '#333333',
  fontWeight: '500',
  margin: '8px 0',
};

const totalRowStyle = {
  borderTop: '2px solid #333333',
  paddingTop: '12px',
  marginTop: '12px',
};

const totalLabelStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '8px 0',
};

const totalValueStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '8px 0',
};

const detailsBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '4px',
  margin: '24px 0',
};

const detailsTitleStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 8px 0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const detailsTextStyle = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#555555',
  margin: 0,
};

export default OrderConfirmation;
