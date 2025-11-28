'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    totalAmount: '',
    paymentMethod: 'PayTR',
  });

  useEffect(() => {
    // Get order details from URL parameters
    const merchant_oid = searchParams.get('merchant_oid');
    const total_amount = searchParams.get('total_amount');

    if (merchant_oid) {
      setOrderDetails({
        orderNumber: merchant_oid,
        totalAmount: total_amount || '',
        paymentMethod: 'PayTR - Kredi Kartı',
      });
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle2 className="w-24 h-24 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-green-600">
            Ödeme Başarılı!
          </h1>
          <p className="text-xl text-neutral-600">
            Siparişiniz başarıyla oluşturuldu
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sipariş Detayları</h2>

          <div className="space-y-3">
            {orderDetails.orderNumber && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Sipariş Numarası:</span>
                <span className="font-medium">{orderDetails.orderNumber}</span>
              </div>
            )}

            {orderDetails.totalAmount && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Toplam Tutar:</span>
                <span className="font-medium text-lg">
                  {(parseFloat(orderDetails.totalAmount) / 100).toFixed(2)} TL
                </span>
              </div>
            )}

            <div className="flex justify-between py-2">
              <span className="text-neutral-600">Ödeme Yöntemi:</span>
              <span className="font-medium">{orderDetails.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">Ne olacak?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Sipariş onayı e-posta adresinize gönderildi</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Siparişiniz hazırlanmaya başlandı</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Kargoya verildiğinde bilgilendirileceksiniz</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/orders')}
            className="flex-1"
            size="lg"
          >
            <Package className="mr-2" />
            Siparişlerimi Görüntüle
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Home className="mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <Link
            href="/collection"
            className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
          >
            Alışverişe Devam Et
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-24 w-24 bg-neutral-200 rounded-full mx-auto mb-8"></div>
            <div className="h-8 bg-neutral-200 rounded mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
