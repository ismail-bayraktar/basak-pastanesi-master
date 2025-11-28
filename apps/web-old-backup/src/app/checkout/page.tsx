'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Building2, Wallet, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { DeliveryInfo, OrderItem } from '@/types/order';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getProductImageUrl } from '@/lib/utils/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { products } = useProductStore();
  const { items, getCartAmount, getShippingFee, clearCart, currency } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('KAPIDA');
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [showPaytrIframe, setShowPaytrIframe] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'Türkiye',
    phone: '',
  });

  const cartItems = Object.keys(items).flatMap((productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return [];
    return Object.keys(items[productId]).map((size) => ({
      product,
      size,
      quantity: items[productId][size],
    }));
  });

  // Guest checkout is now allowed - no authentication required
  // Users can optionally login for order history tracking

  const subtotal = getCartAmount();
  const shipping = getShippingFee();
  const total = subtotal + shipping;

  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!deliveryInfo.firstName.trim()) {
      toast.error('Lütfen adınızı girin');
      return false;
    }
    if (!deliveryInfo.lastName.trim()) {
      toast.error('Lütfen soyadınızı girin');
      return false;
    }
    if (!deliveryInfo.email.trim() || !deliveryInfo.email.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin');
      return false;
    }
    if (!deliveryInfo.phone.trim()) {
      toast.error('Lütfen telefon numaranızı girin');
      return false;
    }
    if (!deliveryInfo.street.trim()) {
      toast.error('Lütfen adres bilgilerinizi girin');
      return false;
    }
    if (!deliveryInfo.city.trim()) {
      toast.error('Lütfen şehir bilgisini girin');
      return false;
    }
    if (!deliveryInfo.zipcode.trim()) {
      toast.error('Lütfen posta kodunu girin');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Sepetiniz boş');
      return;
    }

    // If PayTR online payment, get PayTR token first
    if (paymentMethod === 'PAYTR') {
      await handlePaytrPayment();
      return;
    }

    setLoading(true);

    // 🔍 DEV MODE: Detailed logging
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      const token = localStorage.getItem('token');
      console.log('🛒 [Checkout] Place Order Started:', {
        timestamp: new Date().toISOString(),
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
        isAuthenticated,
        cartItemsCount: cartItems.length,
        totalAmount: total,
        paymentMethod,
        deliveryInfo: {
          name: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
          email: deliveryInfo.email,
          city: deliveryInfo.city
        }
      });
    }

    try {
      const orderItems: OrderItem[] = cartItems.map(({ product, size, quantity }) => {
        const price = Number(product.basePrice) || 0;

        return {
          id: product._id,  // Backend expects 'id' field for stock validation
          name: product.name,
          size: size,
          quantity: quantity,
          price: price,
          image: getProductImageUrl(product.image, 0, ''),
        };
      });

      // Map deliveryInfo to backend address format and include email
      const addressData = {
        firstName: deliveryInfo.firstName,
        lastName: deliveryInfo.lastName,
        email: deliveryInfo.email, // Include email for guest notifications
        phone: deliveryInfo.phone,
        address: deliveryInfo.street,
        city: deliveryInfo.city,
        district: deliveryInfo.state,
        zipcode: deliveryInfo.zipcode,
        country: deliveryInfo.country,
      };

      const orderData = {
        items: orderItems,
        amount: total,
        address: addressData,
        paymentMethod: paymentMethod,
      };

      if (isDev) {
        console.log('📤 [Checkout] Sending Order Request:', {
          endpoint: API_ENDPOINTS.ORDERS.PLACE,
          itemsCount: orderItems.length,
          totalAmount: total,
          paymentMethod
        });
      }

      const response = await apiClient.post(API_ENDPOINTS.ORDERS.PLACE, orderData);

      if (isDev) {
        console.log('📥 [Checkout] Order Response:', {
          success: response.data.success,
          message: response.data.message,
          status: response.status,
          hasData: !!response.data
        });
      }

      if (response.data.success) {
        clearCart();
        toast.success('Siparişiniz başarıyla oluşturuldu!');

        // Redirect based on authentication status
        if (isAuthenticated) {
          console.log('✅ [Checkout] Order Success - Redirecting to /orders');
          router.push('/orders');
        } else {
          // Guest users - redirect to home with success message
          console.log('✅ [Checkout] Guest Order Success - Redirecting to home');
          router.push('/?order=success');
        }
      } else {
        console.error('❌ [Checkout] Order Failed:', response.data.message);
        toast.error(response.data.message || 'Sipariş oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('❌ [Checkout] Place Order Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: isDev ? error.stack : undefined
      });

      // More specific error messages based on response
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
      } else {
        toast.error('Sipariş oluşturulurken bir hata oluştu');
      }
    } finally {
      setLoading(false);
      if (isDev) {
        console.log('🏁 [Checkout] Place Order Finished');
      }
    }
  };

  const handlePaytrPayment = async () => {
    setLoading(true);

    try {
      const orderItems: OrderItem[] = cartItems.map(({ product, size, quantity }) => {
        const price = Number(product.basePrice) || 0;

        return {
          id: product._id,
          name: product.name,
          size: size,
          quantity: quantity,
          price: price,
          image: getProductImageUrl(product.image, 0, ''),
        };
      });

      const paymentData = {
        items: orderItems,
        amount: total,
        address: deliveryInfo,
        user_name: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
        user_email: deliveryInfo.email,
        user_phone: deliveryInfo.phone,
        user_address: `${deliveryInfo.street}, ${deliveryInfo.city}/${deliveryInfo.state} ${deliveryInfo.zipcode}`,
      };

      const response = await apiClient.post('/api/paytr/get-token', paymentData);

      if (response.data.success && response.data.token) {
        setPaytrToken(response.data.token);
        setShowPaytrIframe(true);
        toast.success('Ödeme sayfasına yönlendiriliyorsunuz...');
      } else {
        toast.error(response.data.message || 'Ödeme başlatılamadı');
      }
    } catch (error: any) {
      console.error('PayTR Payment Error:', error);
      toast.error(error.response?.data?.message || 'Ödeme işlemi başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Sepetiniz Boş</h1>
          <p className="text-neutral-600 mb-6">
            Sipariş vermek için önce ürün eklemelisiniz.
          </p>
          <Button onClick={() => router.push('/collection')}>
            Ürünlere Git
          </Button>
        </div>
      </div>
    );
  }

  // PayTR iframe Modal
  if (showPaytrIframe && paytrToken) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Güvenli Ödeme</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPaytrIframe(false);
                setPaytrToken(null);
              }}
            >
              İptal
            </Button>
          </div>
          <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
              id="paytriframe"
              frameBorder="0"
              scrolling="yes"
              className="w-full h-full min-h-[600px]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft size={20} />
        Geri Dön
      </button>

      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Information Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">İletişim Bilgileri</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={deliveryInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Adınız"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={deliveryInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Soyadınız"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  value={deliveryInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={deliveryInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="05XX XXX XX XX"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Teslimat Adresi</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Adres *</Label>
                <Textarea
                  id="street"
                  value={deliveryInfo.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Mahalle, sokak, bina no, daire no"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Şehir *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="İstanbul"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">İlçe *</Label>
                  <Input
                    id="state"
                    type="text"
                    value={deliveryInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Kadıköy"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipcode">Posta Kodu *</Label>
                  <Input
                    id="zipcode"
                    type="text"
                    value={deliveryInfo.zipcode}
                    onChange={(e) => handleInputChange('zipcode', e.target.value)}
                    placeholder="34XXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Ülke</Label>
                  <Input
                    id="country"
                    type="text"
                    value={deliveryInfo.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Ödeme Yöntemi</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <RadioGroupItem value="KAPIDA" id="KAPIDA" />
                  <Label
                    htmlFor="KAPIDA"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <Wallet className="text-orange-600" size={24} />
                    <div>
                      <div className="font-medium">Kapıda Ödeme</div>
                      <div className="text-sm text-neutral-600">
                        Teslimat sırasında nakit veya kart ile ödeme
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <RadioGroupItem value="PAYTR" id="PAYTR" />
                  <Label
                    htmlFor="PAYTR"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <CreditCard className="text-blue-600" size={24} />
                    <div>
                      <div className="font-medium">Kredi Kartı (PayTR)</div>
                      <div className="text-sm text-neutral-600">
                        Online kredi kartı ile güvenli ödeme
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <RadioGroupItem value="HAVALE" id="HAVALE" />
                  <Label
                    htmlFor="HAVALE"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <Building2 className="text-green-600" size={24} />
                    <div>
                      <div className="font-medium">Havale / EFT</div>
                      <div className="text-sm text-neutral-600">
                        Banka havalesi ile ödeme (Sipariş sonrası bilgi verilecektir)
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map(({ product, size, quantity }) => {
                const price = Number(product.basePrice) || 0;
                const itemTotal = price * quantity;

                return (
                  <div
                    key={`${product._id}-${size}`}
                    className="flex gap-3 text-sm"
                  >
                    <div className="relative w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <Image
                        src={getProductImageUrl(product.image, 0)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-neutral-600">
                        {size === 'standard' ? 'Standart' : size} × {quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {itemTotal.toFixed(2)} {currency}
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Price Summary */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Ara Toplam</span>
                <span className="font-medium">
                  {subtotal.toFixed(2)} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600">Kargo</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Ücretsiz</span>
                  ) : (
                    `${shipping.toFixed(2)} ${currency}`
                  )}
                </span>
              </div>

              {subtotal < 1000 && (
                <p className="text-xs text-orange-600">
                  1000 TL ve üzeri siparişlerde kargo ücretsiz!
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between mb-6">
              <span className="text-lg font-bold">Toplam</span>
              <span className="text-2xl font-bold text-orange-600">
                {total.toFixed(2)} {currency}
              </span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
            </Button>

            <p className="text-xs text-neutral-600 text-center mt-4">
              Siparişi tamamlayarak{' '}
              <a href="#" className="underline">
                Kullanım Koşulları
              </a>{' '}
              ve{' '}
              <a href="#" className="underline">
                Gizlilik Politikası
              </a>
              'nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
