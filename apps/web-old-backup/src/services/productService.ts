import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ProductListResponse, Product } from '@/types/product';

export const productService = {
  /**
   * Fetch all products
   */
  async getAllProducts(): Promise<ProductListResponse> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.PRODUCTS.LIST
    );
    // Backend returns { success: true, data: { products: [] } }
    // We need to return { products: [], success: true }
    return {
      success: response.data.success,
      products: response.data.data?.products || [],
      message: response.data.message
    };
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<{ success: boolean; data: Product }>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.PRODUCTS.LIST}?search=${encodeURIComponent(query)}`
    );
    return response.data.data?.products || [];
  },

  /**
   * Filter products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.PRODUCTS.LIST}?category=${encodeURIComponent(category)}`
    );
    return response.data.data?.products || [];
  },
};
