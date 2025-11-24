import axios from 'axios'

// Backend URL from environment or default
export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

// Create axios instance with default config
const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/api/report/dashboard'),

  // Get daily sales
  getDailySales: (date) => api.get(`/api/report/daily-sales?date=${date}`),

  // Get weekly sales
  getWeeklySales: () => api.get('/api/report/weekly-sales'),

  // Get delivery status
  getDeliveryStatus: () => api.get('/api/report/delivery-status'),
}

// Order API calls
export const orderAPI = {
  // Get all orders
  getAll: () => api.post('/api/order/list'),

  // Update order status
  updateStatus: (orderId, status) =>
    api.post('/api/order/status', { orderId, status }),

  // Assign branch
  assignBranch: (orderId, branchId) =>
    api.post('/api/order/assign-branch', { orderId, branchId }),

  // Send to courier
  sendToCourier: (orderId) =>
    api.post('/api/order/send-to-courier', { orderId }),

  // Prepare order
  prepareOrder: (orderId) =>
    api.post('/api/order/prepare', { orderId }),

  // Delete order
  deleteOrder: (orderId) =>
    api.post('/api/order/delete', { orderId }),
}

// Courier Integration API calls
export const courierAPI = {
  // Dashboard & Stats
  getDashboard: () => api.get('/api/admin/courier-integration/dashboard'),
  getStats: () => api.get('/api/admin/courier-integration/stats'),
  getHealth: (platform) => api.get(`/api/admin/courier-integration/health/${platform}`),

  // Configuration
  getConfigs: () => api.get('/api/admin/courier-integration/configs'),
  getConfig: (platform) => api.get(`/api/admin/courier-integration/configs/${platform}`),
  updateConfig: (platform, data) => api.put(`/api/admin/courier-integration/configs/${platform}`, data),
  validateConfig: (platform, data) => api.post(`/api/admin/courier-integration/validate/${platform}`, data),

  // Testing
  testConnection: (platform) => api.post(`/api/admin/courier-integration/test/${platform}`),
  testOrder: (platform, data) => api.post(`/api/admin/courier-integration/test-order/${platform}`, data),
  testWebhook: (platform, data) => api.post(`/api/admin/courier-integration/test-webhook/${platform}`, data),

  // Circuit Breaker
  getCircuitBreakers: () => api.get('/api/admin/courier-integration/circuit-breakers'),
  resetCircuitBreaker: (platform) => api.post(`/api/admin/courier-integration/circuit-breakers/${platform}/reset`),

  // Order Operations
  submitOrder: (data) => api.post('/api/admin/courier-integration/submit-order', data),
  cancelOrder: (data) => api.post('/api/admin/courier-integration/cancel-order', data),
  getTracking: (orderId) => api.get(`/api/admin/courier-integration/tracking/${orderId}`),

  // Log Management
  getLogs: (params) => api.get('/api/admin/courier-integration/logs', { params }),
  clearLogs: (type = 'all') => api.delete(`/api/admin/courier-integration/logs?type=${type}`),
}

// Dead Letter Queue (DLQ) API calls
export const dlqAPI = {
  // List & Get
  getAll: (params) => api.get('/api/dlq', { params }),
  getById: (id) => api.get(`/api/dlq/${id}`),
  getStats: () => api.get('/api/dlq/stats'),

  // Retry Operations
  retry: (id) => api.post(`/api/dlq/${id}/retry`),
  bulkRetry: (data) => api.post('/api/dlq/bulk-retry', data),

  // Status Management
  resolve: (id) => api.post(`/api/dlq/${id}/resolve`),
  abandon: (id) => api.post(`/api/dlq/${id}/abandon`),
  remove: (id) => api.delete(`/api/dlq/${id}`),

  // Cleanup
  cleanup: (data) => api.post('/api/dlq/cleanup', data),
}

// Product API calls
export const productAPI = {
  // Get all products with optional filters
  getAll: (params) => api.get('/api/product/list', { params }),

  // Get all including deleted (admin view)
  getAllIncludingDeleted: (params) =>
    api.get('/api/product/list', { params: { ...params, includeDeleted: 'true' } }),

  // Get single product by ID
  getById: (id) => api.post('/api/product/single', { id }),

  // Add new product
  add: (formData) =>
    api.post('/api/product/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update existing product
  update: (formData) =>
    api.post('/api/product/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Remove product (hard delete)
  remove: (id) => api.post('/api/product/remove', { id }),

  // Soft delete (set active: false)
  softDelete: (id) => api.post('/api/product/soft-delete', { id }),

  // Restore deleted product
  restore: (id) => api.post('/api/product/restore', { id }),

  // Permanent delete
  permanentDelete: (id) => api.post('/api/product/permanent-delete', { id }),

  // Quick update single field (for inline editing)
  quickUpdate: (id, field, value) =>
    api.post('/api/product/quick-update', { id, field, value }),
}

// Category API calls
export const categoryAPI = {
  // Get all categories (admin - includes inactive)
  getAll: (params) => api.get('/api/category/list', { params }),

  // Get only active categories (for product forms)
  getActive: () => api.get('/api/category/active'),

  // Get single category by ID
  getById: (id) => api.post('/api/category/single', { id }),

  // Add new category
  add: (data) => api.post('/api/category/add', data),

  // Update existing category
  update: (data) => api.post('/api/category/update', data),

  // Remove category
  remove: (id) => api.post('/api/category/remove', { id }),

  // Toggle active status
  toggleActive: (id) => api.post('/api/category/toggle-active', { id }),

  // Reorder categories
  reorder: (categories) => api.post('/api/category/reorder', { categories }),
}

// Slider API calls
export const sliderAPI = {
  // Get all sliders (admin - includes inactive)
  getAll: () => api.get('/api/slider/admin/list'),

  // Get public sliders (active only)
  getPublic: () => api.get('/api/slider/list'),

  // Add new slider
  add: (formData) =>
    api.post('/api/slider/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update existing slider
  update: (id, formData) =>
    api.put(`/api/slider/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete slider
  remove: (id) => api.delete(`/api/slider/delete/${id}`),

  // Update slider order
  updateOrder: (sliders) => api.put('/api/slider/reorder', { sliders }),
}

// Media API calls
export const mediaAPI = {
  // Get all media with filtering
  getAll: (params) => api.get('/api/media-enhanced/list', { params }),

  // Get single media
  getById: (id) => api.get(`/api/media-enhanced/${id}`),

  // Get upload signature for direct Cloudinary upload
  getUploadSignature: (folder = 'basak-pastanesi/general') =>
    api.get('/api/media-enhanced/upload-signature', { params: { folder } }),

  // Register media after direct Cloudinary upload
  registerUpload: (cloudinaryData) =>
    api.post('/api/media-enhanced/register', cloudinaryData),

  // Legacy: Upload media (backward compatibility)
  upload: (formData) =>
    api.post('/api/media-enhanced/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Legacy: Upload media to specific folder
  uploadToFolder: (folder, formData) =>
    api.post(`/api/media-enhanced/upload/${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Legacy: Bulk upload
  bulkUpload: (formData) =>
    api.post('/api/media-enhanced/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update media metadata
  update: (id, data) => api.put(`/api/media-enhanced/${id}`, data),

  // Delete media (supports force option)
  remove: (id, options = {}) => {
    const params = options.force ? { force: 'true' } : {}
    return api.delete(`/api/media-enhanced/${id}`, { params })
  },

  // Track usage
  trackUsage: (id, data) => api.post(`/api/media-enhanced/${id}/usage`, data),

  // Get optimized image
  getOptimized: (id, params) => api.get(`/api/media-enhanced/${id}/optimize`, { params }),
}

export default api
