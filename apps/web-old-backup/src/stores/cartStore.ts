import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, CartItems } from '@/types/cart';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useProductStore } from './productStore';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      currency: '₺',
      deliveryFee: 90,
      isMiniCartOpen: false,

      setMiniCartOpen: (open: boolean) => set({ isMiniCartOpen: open }),

      addToCart: (itemId: string, size: string = 'standard') => {
        const items = { ...get().items };
        const sizeKey = size || 'standard';

        if (items[itemId]) {
          if (items[itemId][sizeKey]) {
            items[itemId][sizeKey] += 1;
          } else {
            items[itemId][sizeKey] = 1;
          }
        } else {
          items[itemId] = { [sizeKey]: 1 };
        }

        set({ items, isMiniCartOpen: true });
      },

      updateQuantity: (itemId: string, size: string = 'standard', quantity: number) => {
        const items = { ...get().items };

        if (quantity <= 0) {
          get().removeFromCart(itemId, size);
          return;
        }

        if (items[itemId]) {
          items[itemId][size] = quantity;
          set({ items });
        }
      },

      removeFromCart: (itemId: string, size: string = 'standard') => {
        const items = { ...get().items };

        if (items[itemId]) {
          delete items[itemId][size];
          if (Object.keys(items[itemId]).length === 0) {
            delete items[itemId];
          }
        }

        set({ items });
      },

      getCartCount: () => {
        const items = get().items;
        let totalCount = 0;

        for (const productId in items) {
          for (const size in items[productId]) {
            totalCount += items[productId][size];
          }
        }

        return totalCount;
      },

      getCartAmount: () => {
        const items = get().items;
        const products = useProductStore.getState().products;
        let totalAmount = 0;

        for (const productId in items) {
          const product = products.find((p) => p._id === productId);
          if (!product) continue;

          for (const size in items[productId]) {
            const quantity = items[productId][size];
            const price = product.basePrice;
            totalAmount += price * quantity;
          }
        }

        return totalAmount;
      },

      getShippingFee: () => {
        const amount = get().getCartAmount();
        const minimumForFreeShipping = 1000;
        return amount >= minimumForFreeShipping ? 0 : get().deliveryFee;
      },

      clearCart: () => {
        set({ items: {} });
      },

      syncWithBackend: async (token: string) => {
        if (!token) return;

        try {
          const response = await apiClient.post(API_ENDPOINTS.CART.GET, {});

          if (response.data.success && response.data.cartData) {
            // Merge backend cart with local cart or overwrite?
            // For now, let's trust the backend if it has data, or maybe merge?
            // Simple strategy: If local is empty, take backend.
            // If local has items, maybe keep local?
            // Let's just set it for now as per original logic.
            set({ items: response.data.cartData });
          }
        } catch (error) {
          console.error('Cart sync error:', error);
        }
      },
    }),
    {
      name: 'basak-pastanesi-cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
