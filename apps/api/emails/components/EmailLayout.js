import React from 'react';
import { Html, Head, Body, Container, Section, Text, Img, Hr } from '@react-email/components';

/**
 * Base Email Layout Component
 * Provides professional header/footer structure for all emails
 */
export const EmailLayout = ({
  children,
  logoUrl = 'https://tulumbak.com/logo.png',
  brandColor = '#d4af37',
  storeName = 'Tulumbak İzmir Baklava',
  storeEmail = 'info@tulumbak.com',
  storePhone = '0232 XXX XXXX',
  showKVKK = true,
  isMarketing = false
}) => {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={{ ...headerStyle, backgroundColor: brandColor }}>
            {logoUrl && (
              <Img
                src={logoUrl}
                alt={storeName}
                width="180"
                style={logoStyle}
              />
            )}
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={hrStyle} />

            <Text style={footerTextStyle}>
              <strong>{storeName}</strong>
            </Text>
            <Text style={footerTextStyle}>
              Email: {storeEmail} | Telefon: {storePhone}
            </Text>

            {showKVKK && (
              <>
                <Hr style={hrStyle} />
                <Text style={kvkkTextStyle}>
                  Kişisel verileriniz KVKK kapsamında işlenmektedir.{' '}
                  <a href="https://tulumbak.com/privacy" style={linkStyle}>
                    Gizlilik Politikası
                  </a>
                  {isMarketing && (
                    <>
                      {' | '}
                      <a href="https://tulumbak.com/email-preferences" style={linkStyle}>
                        Email Tercihlerim
                      </a>
                      {' | '}
                      <a href="https://tulumbak.com/unsubscribe" style={linkStyle}>
                        Abonelikten Çık
                      </a>
                    </>
                  )}
                </Text>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Inline styles (required for email client compatibility)
const bodyStyle = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
  WebkitFontSmoothing: 'antialiased',
  WebkitTextSizeAdjust: '100%'
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const headerStyle = {
  padding: '40px 20px',
  textAlign: 'center',
};

const logoStyle = {
  display: 'block',
  margin: '0 auto',
};

const contentStyle = {
  padding: '32px 24px',
};

const footerStyle = {
  padding: '24px',
  backgroundColor: '#f9f9f9',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e0e0e0',
  margin: '20px 0',
};

const footerTextStyle = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#666666',
  textAlign: 'center',
  margin: '8px 0',
};

const kvkkTextStyle = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#999999',
  textAlign: 'center',
  margin: '12px 0 0 0',
};

const linkStyle = {
  color: '#d4af37',
  textDecoration: 'none',
};

export default EmailLayout;
