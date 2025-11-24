export interface CartItems {
  [productId: string]: {
    [size: string]: number; // quantity
  };
}

export interface CartItemData {
  productId: string;
  size: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface CartState {
  items: CartItems;
  currency: string;
  deliveryFee: number;
  addToCart: (itemId: string, size: string) => void;
  updateQuantity: (itemId: string, size: string, quantity: number) => void;
  removeFromCart: (itemId: string, size: string) => void;
  getCartCount: () => number;
  getCartAmount: () => number;
  getShippingFee: () => number;
  clearCart: () => void;
  syncWithBackend: (token: string) => Promise<void>;
}

export interface AddToCartRequest {
  itemId: string;
  size: string;
}

export interface UpdateCartRequest {
  itemId: string;
  size: string;
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  cartData?: CartItems;
  message?: string;
}
