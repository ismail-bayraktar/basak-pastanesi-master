'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/stores/productStore';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function LatestCollection() {
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchProducts();
    }
  }, [products.length, loading, fetchProducts]);

  const latestProducts = products
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 8);

  if (loading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Son Eklenenler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (latestProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Son Eklenenler</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Yeni lezzetlerimizi keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {latestProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/collection">
            <Button size="lg" variant="outline">
              Tüm Koleksiyonu Gör
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
