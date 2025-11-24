import React from 'react';
import { Button as EmailButton } from '@react-email/components';

/**
 * Professional CTA Button Component
 * Accessible, touch-friendly button for emails
 */
export const Button = ({
  children,
  href = '#',
  brandColor = '#d4af37',
  textColor = '#ffffff',
  fullWidth = false
}) => {
  const buttonStyle = {
    backgroundColor: brandColor,
    color: textColor,
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    borderRadius: '4px',
    display: fullWidth ? 'block' : 'inline-block',
    textAlign: 'center',
    width: fullWidth ? '100%' : 'auto',
    minWidth: '200px',
    lineHeight: '20px',
  };

  return (
    <EmailButton href={href} style={buttonStyle}>
      {children}
    </EmailButton>
  );
};

export default Button;
