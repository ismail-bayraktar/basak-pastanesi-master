// API Endpoint Constants
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
  },

  // User Addresses
  ADDRESSES: {
    LIST: '/api/user/addresses',
    ADD: '/api/user/addresses',
    UPDATE: (id: string) => `/api/user/addresses/${id}`,
    DELETE: (id: string) => `/api/user/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/api/user/addresses/${id}/set-default`,
  },

  // User Favorites
  FAVORITES: {
    LIST: '/api/user/favorites',
    ADD: '/api/user/favorites/add',
    REMOVE: (productId: string) => `/api/user/favorites/${productId}`,
  },

  // Products
  PRODUCTS: {
    LIST: '/api/product/list',
    DETAIL: (id: string) => `/api/product/${id}`,
    PRICE_RANGE: '/api/product/price-range',
  },

  // Cart
  CART: {
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    GET: '/api/cart/get',
    REMOVE: '/api/cart/remove',
  },

  // Orders
  ORDERS: {
    PLACE: '/api/order/place',
    USER_ORDERS: '/api/order/userorders',
    DETAIL: (id: string) => `/api/order/${id}`,
    REORDER: (orderId: string) => `/api/order/reorder/${orderId}`,
    BANK_INFO: '/api/order/bank-info',
  },

  // Payment
  PAYMENT: {
    PAYTR_TOKEN: '/api/paytr/get-token',
    PAYTR_PAGE: '/paytr/payment',
  },

  // Settings & Configuration
  SETTINGS: {
    MAINTENANCE: '/api/settings/maintenance-status',
    DELIVERY_ZONES: '/api/delivery/zones',
    TIME_SLOTS: '/api/delivery/timeslots',
  },

  // Coupon
  COUPON: {
    VALIDATE: '/api/coupon/validate',
  },

  // Categories
  CATEGORIES: {
    ACTIVE: '/api/category/active',
    LIST: '/api/category/list',
  },

  // Sliders
  SLIDERS: {
    LIST: '/api/slider/list',
  },

  // Reviews
  REVIEWS: {
    CREATE: '/api/reviews',
    PRODUCT: (productId: string) => `/api/reviews/product/${productId}`,
    USER: '/api/reviews/user',
  },
} as const;

