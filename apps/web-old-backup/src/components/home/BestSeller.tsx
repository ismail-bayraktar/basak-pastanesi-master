'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/stores/productStore';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function BestSeller() {
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchProducts();
    }
  }, [products.length, loading, fetchProducts]);

  const bestSellerProducts = products
    .filter((p) => p.bestseller)
    .slice(0, 4);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Çok Satanlar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bestSellerProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Çok Satanlar</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            En çok tercih edilen baklava çeşitlerimiz
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/collection">
            <Button size="lg" variant="outline">
              Tüm Ürünleri Gör
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
