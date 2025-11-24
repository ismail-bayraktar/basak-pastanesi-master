// Order Status Constants
export const ORDER_STATUS = {
  PENDING: 'Sipariş Alındı',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
} as const;

// Payment Method Constants
export const PAYMENT_METHODS = {
  COD: 'Kapıda Ödeme',
  BANK_TRANSFER: 'Banka Havalesi',
  PAYTR: 'Kredi Kartı (PayTR)',
} as const;

// Delivery Constants
export const DELIVERY = {
  FREE_SHIPPING_THRESHOLD: 500, // TL
  DEFAULT_FEE: 50, // TL
} as const;
