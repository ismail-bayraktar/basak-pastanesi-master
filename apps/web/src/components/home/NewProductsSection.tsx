'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore } from '@/stores/productStore';
import { getProductImageUrl } from '@/lib/utils/image';

export function NewProductsSection() {
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const latestProducts = products
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 w-[85%] mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
          Yeni Ürünler ve Özel Seçkiler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-lg bg-white dark:bg-neutral-dark shadow-md animate-pulse"
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
      </section>
    );
  }

  if (latestProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 w-[85%] mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
        Yeni Ürünler ve Özel Seçkiler
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {latestProducts.map((product) => {
          const displayPrice = product.sizePrices[0]?.price || product.basePrice * 100;
          const priceInTL = displayPrice / 100;
          const imageUrl = getProductImageUrl(product.image, 0, '/assets/tulumba.png');

          return (
            <div
              key={product._id}
              className="flex flex-col overflow-hidden rounded-lg bg-white dark:bg-neutral-dark shadow-md hover:shadow-xl transition-shadow"
            >
              <Link href={`/product/${product._id}`}>
                <Image
                  src={imageUrl}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 flex flex-col flex-grow">
                <Link href={`/product/${product._id}`}>
                  <h3 className="text-lg font-bold hover:text-brand-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1 flex-grow line-clamp-2">
                  {product.description || 'Özel seçilmiş lezzet'}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-brand-primary">
                    {priceInTL.toFixed(2)} TL
                  </span>
                  <Link href={`/product/${product._id}`}>
                    <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-brand-primary text-white text-sm font-bold hover:bg-opacity-90 transition-colors">
                      <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                      Sepete Ekle
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
