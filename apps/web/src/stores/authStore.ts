import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import toast from 'react-hot-toast';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setToken: (token: string | null) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.data.success && response.data.token) {
        get().setToken(response.data.token);
        if (response.data.user) {
          get().setUser(response.data.user);
        }
        toast.success('Giriş başarılı!');
      }

      return response.data;
    } catch (error: unknown) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Giriş yapılırken bir hata oluştu.',
      };
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );

      if (response.data.success && response.data.token) {
        get().setToken(response.data.token);
        if (response.data.user) {
          get().setUser(response.data.user);
        }
        toast.success('Kayıt başarılı!');
      }

      return response.data;
    } catch (error: unknown) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Kayıt olurken bir hata oluştu.',
      };
    }
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false });
    localStorage.removeItem('token');
    toast.success('Çıkış yapıldı.');
  },

  loadTokenFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        set({ token, isAuthenticated: true });
      }
    }
  },
}));
