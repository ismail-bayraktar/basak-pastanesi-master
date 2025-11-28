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

export interface CartResponse {
  success: boolean;
  cartData?: CartItems;
  message?: string;
}

