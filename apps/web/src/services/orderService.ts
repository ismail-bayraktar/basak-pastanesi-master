import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order, PlaceOrderRequest } from '@/types/order';
import { ApiResponse } from '@/types/api';

interface OrderResponse {
  success: boolean;
  message?: string;
  order?: Order;
  orders?: Order[];
}

interface BankInfoResponse {
  success: boolean;
  message?: string;
  bankInfo?: {
    bankName: string;
    accountHolder: string;
    iban: string;
    accountNumber: string;
  };
}

export const orderService = {
  /**
   * Place new order
   */
  async placeOrder(orderData: PlaceOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      API_ENDPOINTS.ORDERS.PLACE,
      orderData
    );
    return {
      success: response.data.success,
      message: response.data.message,
      order: response.data.data?.order
    };
  },

  /**
   * Get user's order history
   */
  async getUserOrders(): Promise<Order[]> {
    const response = await apiClient.post<ApiResponse<{ orders: Order[] }>>(
      API_ENDPOINTS.ORDERS.USER_ORDERS,
      {}
    );
    return response.data.data?.orders || [];
  },

  /**
   * Get bank information for bank transfer payment
   */
  async getBankInfo(): Promise<BankInfoResponse> {
    const response = await apiClient.get<ApiResponse<{ bankInfo: BankInfoResponse['bankInfo'] }>>(
      API_ENDPOINTS.ORDERS.BANK_INFO
    );
    return {
      success: response.data.success,
      message: response.data.message,
      bankInfo: response.data.data?.bankInfo
    };
  },

  /**
   * Update PayTR order status
   */
  async updatePaytrOrder(orderId: string, paymentStatus: boolean): Promise<OrderResponse> {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      API_ENDPOINTS.ORDERS.UPDATE_PAYTR,
      { orderId, paymentStatus }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      order: response.data.data?.order
    };
  },
};
