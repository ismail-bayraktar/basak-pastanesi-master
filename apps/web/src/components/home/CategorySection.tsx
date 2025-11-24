'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCategoryStore } from '@/stores/categoryStore';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

export function CategorySection() {
  const { categories, loading, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      fetchCategories();
    }
  }, [categories.length, loading, fetchCategories]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Kategoriler</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16 bg-neutral-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Kategorilerimiz</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Doğal ve özenle seçilmiş ürünlerimizi kategoriler halinde keşfedin
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/collection?category=${category.slug}`}
            className="group"
          >
            <Card className="p-6 h-40 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-orange-500 transition-all duration-300 cursor-pointer">
              {/* Kategori İkonu */}
              {category.icon && (
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
              )}

              {/* Kategori Adı */}
              <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                {category.name}
              </h3>

              {/* Ürün Sayısı (opsiyonel) */}
              {category.productCount !== undefined && category.productCount > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  {category.productCount} ürün
                </p>
              )}

              {/* Hover Efekti - Ok İkonu */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-orange-600" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tüm Ürünler Butonu */}
      <div className="text-center mt-10">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Tüm Ürünleri Gör
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
