export interface OrderItem {
  id: string;  // Backend expects 'id' field for stock validation
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  address: DeliveryInfo;
  status: string;
  paymentMethod: string;
  payment: boolean;
  date: string | number;
}

export interface PlaceOrderRequest {
  items: OrderItem[];
  amount: number;
  address: DeliveryInfo;
  paymentMethod: string;
  couponCode?: string;
}

export interface OrderResponse {
  success: boolean;
  order?: Order;
  message?: string;
}

export interface OrderListResponse {
  success: boolean;
  orders?: Order[];
  message?: string;
}
