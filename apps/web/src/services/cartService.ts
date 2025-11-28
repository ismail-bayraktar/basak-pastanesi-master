import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CartItems } from '@/types/cart';
import { ApiResponse } from '@/types/api';

interface CartResponse {
  success: boolean;
  message?: string;
  cartData?: CartItems;
}

export const cartService = {
  /**
   * Add item to cart on backend
   */
  async addToCart(itemId: string, size: string): Promise<CartResponse> {
    const response = await apiClient.post<ApiResponse<{ cartData: CartItems }>>(
      API_ENDPOINTS.CART.ADD,
      { itemId, size }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      cartData: response.data.data?.cartData
    };
  },

  /**
   * Update cart item quantity on backend
   */
  async updateCart(itemId: string, size: string, quantity: number): Promise<CartResponse> {
    const response = await apiClient.post<ApiResponse<{ cartData: CartItems }>>(
      API_ENDPOINTS.CART.UPDATE,
      { itemId, size, quantity }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      cartData: response.data.data?.cartData
    };
  },

  /**
   * Get user's cart from backend
   */
  async getCart(): Promise<CartResponse> {
    const response = await apiClient.post<ApiResponse<{ cartData: CartItems }>>(
      API_ENDPOINTS.CART.GET,
      {}
    );
    return {
      success: response.data.success,
      message: response.data.message,
      cartData: response.data.data?.cartData
    };
  },
};

