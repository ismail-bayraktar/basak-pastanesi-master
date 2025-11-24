import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔍 DEV MODE: Detailed logging
    const isDev = process.env.NODE_ENV === 'development';

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (isDev) {
        console.log('📡 [API Client] Request Interceptor:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
        });
      }

      if (token && config.headers) {
        // Use Bearer format (improved from legacy)
        config.headers.Authorization = `Bearer ${token}`;

        if (isDev) {
          console.log('✅ [API Client] Authorization header set:', {
            authHeaderPreview: config.headers.Authorization.substring(0, 40) + '...'
          });
        }
      } else if (isDev && !token) {
        console.warn('⚠️  [API Client] No token found in localStorage');
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [API Client] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Suppress notification stream errors (likely from browser extensions)
    const isNotificationStream = error.config?.url?.includes('/api/notifications/stream');

    // Handle errors globally
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string };

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('Bu işlem için yetkiniz yok.');
          break;
        case 404:
          // Don't show toast for notification stream endpoint (likely browser extension)
          if (!isNotificationStream) {
            toast.error('Kaynak bulunamadı.');
          }
          break;
        case 500:
          toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
          break;
        default:
          toast.error(data.message || 'Bir hata oluştu.');
      }
    } else if (error.request) {
      // Network error
      if (!isNotificationStream) {
        toast.error('İnternet bağlantınızı kontrol edin.');
      }
    } else {
      if (!isNotificationStream) {
        toast.error('Beklenmeyen bir hata oluştu.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
