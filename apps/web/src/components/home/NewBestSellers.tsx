'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore } from '@/stores/productStore';
import { getProductImageUrl } from '@/lib/utils/image';
import { ProductCard } from '@/components/v2/ProductCard';

export function NewBestSellers() {
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchProducts();
    }
  }, [products.length, loading, fetchProducts]);

  const bestSellerProducts = products.filter((p) => p.bestseller).slice(0, 4);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-[85%] mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Çok Satanlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-lg bg-bg-light dark:bg-bg-dark shadow-md animate-pulse"
              >
                <div className="h-48 w-full bg-neutral-light dark:bg-neutral-dark" />
                <div className="p-4 flex flex-col flex-grow space-y-3">
                  <div className="h-6 bg-neutral-light dark:bg-neutral-dark rounded" />
                  <div className="h-4 bg-neutral-light dark:bg-neutral-dark rounded w-3/4" />
                  <div className="h-10 bg-neutral-light dark:bg-neutral-dark rounded mt-auto" />
                </div>
              </div>
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[85%] mx-auto">
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="rounded-full bg-brand-primary/10 text-brand-primary px-4 py-1 text-sm font-semibold tracking-wide">
            En çok tercih edilenler
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-center">Çok Satanlar</h2>
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary text-center max-w-2xl">
            Her gün taze çıkan, en hızlı tüketilen lezzetler. Hızlı teslimat ve özenli paketleme ile kapınızda.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellerProducts.map((product) => (
            <div key={product._id} className="h-full">
              <ProductCard product={product} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

