import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';
import { ApiResponse } from '@/types/api';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    // Backend returns { success: true, data: { token, user } }
    // AuthResponse expects { success, token, user }
    return {
      success: response.data.success,
      message: response.data.message,
      token: response.data.data?.token,
      user: response.data.data?.user
    };
  },

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return {
      success: response.data.success,
      message: response.data.message,
      token: response.data.data?.token,
      user: response.data.data?.user
    };
  },
};

