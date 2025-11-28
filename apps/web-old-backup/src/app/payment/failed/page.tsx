'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, ArrowRight, Mail } from 'lucide-react';

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    totalAmount: '',
    errorMessage: '',
  });

  useEffect(() => {
    // Get order details from URL parameters
    const merchant_oid = searchParams.get('merchant_oid');
    const total_amount = searchParams.get('total_amount');
    const failed_reason_code = searchParams.get('failed_reason_code');
    const failed_reason_msg = searchParams.get('failed_reason_msg');

    if (merchant_oid) {
      setOrderDetails({
        orderNumber: merchant_oid,
        totalAmount: total_amount || '',
        errorMessage: failed_reason_msg || 'Ödeme işlemi tamamlanamadı',
      });
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Failed Icon */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-red-100 p-6">
            <XCircle className="w-24 h-24 text-red-600" />
          </div>
        </div>

        {/* Failed Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-red-600">
            Ödeme Başarısız
          </h1>
          <p className="text-xl text-neutral-600">
            Ödeme işlemi tamamlanamadı
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Hata Detayları</h2>

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

            {orderDetails.errorMessage && (
              <div className="py-2">
                <span className="text-neutral-600 block mb-1">Hata Mesajı:</span>
                <span className="text-red-600 font-medium">
                  {orderDetails.errorMessage}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-orange-900 mb-2">Ne yapmalıyım?</h3>
          <ul className="space-y-2 text-orange-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Kart bilgilerinizi kontrol edin ve tekrar deneyin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Kartınızda yeterli bakiye olduğundan emin olun</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Farklı bir ödeme yöntemi deneyebilirsiniz</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Sorun devam ederse müşteri hizmetleri ile iletişime geçin</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => router.push('/checkout')}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            <RefreshCw className="mr-2" />
            Tekrar Dene
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

        {/* Support Contact */}
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600 mb-2">
            Yardıma mı ihtiyacınız var?
          </p>
          <Link
            href="/contact"
            className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Müşteri Hizmetleri ile İletişime Geçin
          </Link>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-6">
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

export default function PaymentFailedPage() {
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
      <PaymentFailedContent />
    </Suspense>
  );
}
