import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  active: boolean;
  order: number;
  productCount?: number;
}

export const categoryService = {
  /**
   * Fetch all categories
   */
  async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; categories: Category[] }>(
      API_ENDPOINTS.CATEGORIES.LIST
    );
    return response.data.categories || [];
  },

  /**
   * Fetch active categories (public)
   */
  async getActiveCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; categories: Category[] }>(
      API_ENDPOINTS.CATEGORIES.ACTIVE
    );
    return response.data.categories || [];
  },
};
