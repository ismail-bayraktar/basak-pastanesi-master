'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { getProductImageUrl } from '@/lib/utils/image';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { products, fetchProducts, loading: productsLoading } = useProductStore();
  const {
    items,
    updateQuantity,
    removeFromCart,
    getCartAmount,
    getShippingFee,
    currency,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const cartItems = Object.keys(items).flatMap((productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return [];

    return Object.keys(items[productId]).map((size) => ({
      product,
      size,
      quantity: items[productId][size],
    }));
  });

  const subtotal = getCartAmount();
  const shipping = getShippingFee();
  const total = subtotal + shipping;

  const handleUpdateQuantity = (productId: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size);
      toast.success('Ürün sepetten kaldırıldı');
    } else {
      updateQuantity(productId, size, newQuantity);
    }
  };

  const handleRemove = (productId: string, size: string) => {
    removeFromCart(productId, size);
    toast.success('Ürün sepetten kaldırıldı');
  };

  if (!mounted || (productsLoading && products.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-basak-golden"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag size={64} className="mx-auto text-neutral-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sepetiniz Boş</h1>
          <p className="text-neutral-600 mb-6">
            Henüz sepetinize ürün eklemediniz.
          </p>
          <Link href="/collection">
            <Button size="lg">Ürünleri İncele</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, size, quantity }) => {
            const price = Number(product.basePrice) || 0;
            const itemTotal = price * quantity;

            return (
              <div
                key={`${product._id}-${size}`}
                className="flex gap-4 p-4 bg-white border rounded-lg"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <Image
                    src={getProductImageUrl(product.image, 0)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    href={`/product/${product._id}`}
                    className="font-semibold hover:text-orange-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-neutral-600 mt-1">
                    Sunum: {size === 'standard' ? 'Standart' : size}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Birim Fiyat: {price.toFixed(2)} {currency}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleRemove(product._id, size)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Ürünü kaldır"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(product._id, size, quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border rounded hover:bg-neutral-100 transition-colors"
                      aria-label="Azalt"
                    >
                      <Minus size={16} />
                    </button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          product._id,
                          size,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 text-center"
                      min="1"
                    />
                    <button
                      onClick={() =>
                        handleUpdateQuantity(product._id, size, quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border rounded hover:bg-neutral-100 transition-colors"
                      aria-label="Arttır"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <p className="font-bold text-lg">
                    {itemTotal.toFixed(2)} {currency}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

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
                <p className="text-sm text-orange-600">
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
              className="w-full mb-3"
              onClick={() => router.push('/checkout')}
            >
              Siparişi Tamamla
            </Button>

            <Link href="/collection">
              <Button variant="outline" size="lg" className="w-full">
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
