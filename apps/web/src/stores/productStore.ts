import { create } from 'zustand';
import { ProductState, Product, ProductListResponse } from '@/types/product';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  initialized: false,
  error: null,
  search: '',
  showSearch: false,

  setProducts: (products: Product[]) => set({ products }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setSearch: (search: string) => set({ search }),
  setShowSearch: (showSearch: boolean) => set({ showSearch }),

  fetchProducts: async () => {
    const { initialized, loading } = get();
    if (initialized || loading) return;

    set({ loading: true, error: null });
    try {
      // Use the service which handles the response structure parsing
      const { productService } = await import('@/services/productService');
      const response = await productService.getAllProducts();

      if (response.success) {
        set({
          products: response.products,
          loading: false,
          initialized: true
        });
      } else {
        set({
          error: response.message || 'Ürünler yüklenemedi',
          loading: false,
          initialized: true
        });
      }
    } catch (error: unknown) {
      console.error('Fetch products error:', error);
      set({
        error: 'Ürünler yüklenirken bir hata oluştu.',
        loading: false,
        initialized: true
      });
    }
  },
}));
