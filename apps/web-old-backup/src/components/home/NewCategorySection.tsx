'use client';

import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';

export function NewCategorySection() {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      fetchCategories();
    }
  }, [categories.length, loading, fetchCategories]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (loading || categories.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-[85%] mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white shadow-md animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[85%] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Kategoriler</h2>
          <div className="hidden md:flex gap-3">
            <button
              onClick={scrollPrev}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
              aria-label="Previous"
            >
              <span className="material-symbols-outlined text-brand-primary">chevron_left</span>
            </button>
            <button
              onClick={scrollNext}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
              aria-label="Next"
            >
              <span className="material-symbols-outlined text-brand-primary">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/collection?category=${category.slug}`}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%] xl:flex-[0_0_18%] group"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* Icon/Image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {category.icon && (
                      <span className="material-symbols-outlined text-7xl text-brand-primary/30 group-hover:text-brand-primary/50 transition-colors">
                        {category.icon}
                      </span>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Category Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-bold text-center drop-shadow-lg">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-white/80 text-xs text-center mt-1 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-primary rounded-2xl transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? 'w-8 bg-brand-primary'
                  : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
