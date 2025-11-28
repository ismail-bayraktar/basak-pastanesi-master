import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001';

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
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
            window.location.href = '/#account';
          }
          break;
        case 403:
          toast.error('Bu işlem için yetkiniz yok.');
          break;
        case 404:
          toast.error('Kaynak bulunamadı.');
          break;
        case 500:
          toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
          break;
        default:
          toast.error(data.message || 'Bir hata oluştu.');
      }
    } else if (error.request) {
      // Network error
      toast.error('İnternet bağlantınızı kontrol edin.');
    } else {
      toast.error('Beklenmeyen bir hata oluştu.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

