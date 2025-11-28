'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { Order, OrderListResponse } from '@/types/order';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post<OrderListResponse>(
        API_ENDPOINTS.ORDERS.USER_ORDERS
      );

      if (response.data.success && response.data.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Beklemede', variant: 'secondary' },
      confirmed: { label: 'Onaylandı', variant: 'default' },
      preparing: { label: 'Hazırlanıyor', variant: 'default' },
      shipped: { label: 'Kargoda', variant: 'default' },
      delivered: { label: 'Teslim Edildi', variant: 'outline' },
      cancelled: { label: 'İptal Edildi', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: string | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    return dateObj.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Siparişlerim</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag size={64} className="mx-auto text-neutral-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Henüz Siparişiniz Yok</h1>
          <p className="text-neutral-600 mb-6">
            Sipariş geçmişiniz burada görünecektir.
          </p>
          <Link href="/collection">
            <Button size="lg">Alışverişe Başla</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Siparişlerim</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const orderDate = formatDate(order.date);
          const totalAmount = (order.amount / 100).toFixed(2);

          return (
            <div
              key={order._id}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-neutral-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-xs text-neutral-600">Sipariş No</p>
                    <p className="font-mono font-semibold">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600">Sipariş Tarihi</p>
                    <p className="font-medium">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600">Toplam Tutar</p>
                    <p className="font-semibold text-orange-600">
                      {totalAmount} ₺
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={18} className="text-neutral-600" />
                  <span className="font-semibold">
                    {order.items.length} Ürün
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xs text-neutral-400">
                            Ürün
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-neutral-600">
                          {item.size}g × {item.quantity} adet
                        </p>
                      </div>
                      <div className="font-semibold">
                        {((item.price * item.quantity) / 100).toFixed(2)} ₺
                      </div>
                    </div>
                  ))}

                  {order.items.length > 3 && (
                    <p className="text-sm text-neutral-600">
                      ve {order.items.length - 3} ürün daha...
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Delivery Address */}
                <div className="mb-4">
                  <p className="font-semibold mb-2">Teslimat Adresi</p>
                  <p className="text-sm text-neutral-600">
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {order.address.street}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {order.address.state}, {order.address.city}{' '}
                    {order.address.zipcode}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {order.address.phone}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <p className="font-semibold mb-1">Ödeme Yöntemi</p>
                  <p className="text-sm text-neutral-600">
                    {order.paymentMethod === 'cash_on_delivery'
                      ? 'Kapıda Ödeme'
                      : order.paymentMethod === 'credit_card'
                      ? 'Kredi Kartı'
                      : 'Havale / EFT'}
                  </p>
                  {order.payment && (
                    <Badge variant="outline" className="mt-1">
                      Ödendi
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/orders/${order._id}`)}
                  >
                    Sipariş Detayı
                    <ChevronRight size={16} className="ml-1" />
                  </Button>

                  {order.status === 'delivered' && (
                    <Button variant="outline">Tekrar Sipariş Ver</Button>
                  )}

                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <Button variant="destructive" className="ml-auto">
                      Siparişi İptal Et
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
