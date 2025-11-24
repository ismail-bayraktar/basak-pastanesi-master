// Product Constants
export const PRODUCT_SIZES = [250, 500, 1000, 2000] as const;

export const FRESH_TYPES = {
  FRESH: 'taze',
  DRY: 'kuru',
} as const;

export const PACKAGING_TYPES = {
  STANDARD: 'standart',
  SPECIAL: 'özel',
} as const;

export const PRODUCT_LABELS = {
  NEW: 'Yeni',
  POPULAR: 'Popüler',
  SALE: 'İndirimde',
  BESTSELLER: 'Çok Satan',
} as const;
