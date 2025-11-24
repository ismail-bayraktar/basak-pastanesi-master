'use client';

import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { useSliderStore } from '@/stores/sliderStore';
import { getImageUrl } from '@/lib/utils/image';

export function NewHeroSection() {
  const { sliders, loading, fetchSliders } = useSliderStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  useEffect(() => {
    if (sliders.length === 0 && !loading) {
      fetchSliders();
    }
  }, [sliders.length, loading, fetchSliders]);

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

  // Sadece aktif slider'ları göster
  const activeSliders = sliders.filter((s) => s.isActive);

  const skeleton = (
    <section className="p-4 sm:p-6 lg:p-8 w-[95%] sm:w-[90%] md:w-[85%] mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-neutral-100 animate-pulse min-h-[520px] sm:min-h-[560px] md:min-h-[650px]" />
    </section>
  );

  if (loading || activeSliders.length === 0) return skeleton;

  return (
    <section className="p-4 sm:p-6 lg:p-8 w-[95%] sm:w-[90%] md:w-[85%] mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {activeSliders.map((slide, index) => (
              <div
                key={slide._id}
                className="flex-[0_0_100%] relative flex min-h-[520px] sm:min-h-[560px] md:min-h-[650px] flex-col gap-6 items-start justify-end px-4 sm:px-10 md:px-12 pb-14 sm:pb-16 md:pb-20"
              >
                {/* Background Image with Overlay */}
                <Image
                  src={getImageUrl(slide.backgroundImage || slide.image)}
                  alt={slide.altText || slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"
                  style={{ opacity: slide.overlayOpacity ? slide.overlayOpacity / 100 : 0.7 }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-5 sm:gap-6 text-left max-w-xl sm:max-w-2xl animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white/90">
                    <span className="rounded-full bg-white/15 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-widest backdrop-blur">
                      Gün içinde teslimat
                    </span>
                    <span className="rounded-full bg-brand-primary px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-white shadow-lg">
                      Taze üretim
                    </span>
                  </div>
                  {slide.subtitle && (
                    <p className="text-brand-primary text-sm sm:text-base font-semibold uppercase tracking-wider drop-shadow-lg">
                      {slide.subtitle}
                    </p>
                  )}
                  <h1
                    className={`text-3xl sm:text-5xl lg:text-6xl font-black leading-tight drop-shadow-2xl ${
                      slide.textColor === 'dark' ? 'text-neutral-800' : 'text-white'
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`text-base sm:text-xl leading-relaxed drop-shadow-lg ${
                      slide.textColor === 'dark' ? 'text-neutral-700' : 'text-white'
                    }`}
                  >
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <Link href={slide.buttonLink}>
                      <button className={`flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-lg font-bold leading-normal tracking-wide hover:scale-105 hover:shadow-2xl transition-all duration-300 ${
                        slide.buttonStyle === 'secondary'
                          ? 'bg-white/95 backdrop-blur-sm text-neutral-800'
                          : slide.buttonStyle === 'outline'
                          ? 'bg-transparent border-2 border-white text-white'
                          : 'bg-brand-primary text-white'
                      }`}>
                        <span className="truncate">{slide.buttonText}</span>
                      </button>
                    </Link>
                    <Link href="/collection">
                      <button className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-full h-14 px-8 text-lg font-semibold leading-normal tracking-wide bg-white/85 text-neutral-900 backdrop-blur hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-white/50">
                        Tüm ürünler
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all hover:scale-110"
          aria-label="Previous"
        >
          <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all hover:scale-110"
          aria-label="Next"
        >
          <span className="material-symbols-outlined text-white text-3xl">chevron_right</span>
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {activeSliders.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === selectedIndex
                  ? 'w-10 bg-white shadow-lg'
                  : 'w-2.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
