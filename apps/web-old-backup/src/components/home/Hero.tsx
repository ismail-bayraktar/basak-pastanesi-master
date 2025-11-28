'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    title: 'Geleneksel İzmir Baklavası',
    subtitle: 'Evden eve taze teslimat',
    description: 'En kaliteli malzemelerle hazırlanan, ağızda dağılan lezzet',
    image: '/images/hero-baklava-1.jpg',
    cta: 'Sipariş Ver',
    href: '/collection',
  },
  {
    id: 2,
    title: 'Her Gün Taze Üretim',
    subtitle: 'Aynı gün teslimat garantisi',
    description: 'Geleneksel tariflerle, modern hijyen standartlarında',
    image: '/images/hero-baklava-2.jpg',
    cta: 'Ürünleri Gör',
    href: '/collection',
  },
  {
    id: 3,
    title: 'Özel Günleriniz İçin',
    subtitle: 'Toplu sipariş hizmeti',
    description: 'Düğün, nişan ve organizasyonlarınız için özel fiyatlar',
    image: '/images/hero-baklava-3.jpg',
    cta: 'İletişim',
    href: '/contact',
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-neutral-100">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-100" />

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <p className="text-sm md:text-base text-neutral-600 mb-2 font-medium">
                {slide.subtitle}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-neutral-900">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-neutral-700 mb-8">
                {slide.description}
              </p>
              <Link href={slide.href}>
                <Button size="lg" className="text-lg px-8">
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === current ? 'bg-neutral-900' : 'bg-neutral-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
