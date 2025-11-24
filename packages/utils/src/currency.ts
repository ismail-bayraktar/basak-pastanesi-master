/**
 * Format a number as Turkish Lira currency
 */
export function formatCurrency(amount: number, currency: string = '₺'): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}

/**
 * Format price with Turkish Lira formatting
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}
