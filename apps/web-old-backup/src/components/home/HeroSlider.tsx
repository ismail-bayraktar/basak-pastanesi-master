'use client';

import { useEffect, useState } from 'react';
import { useSliderStore } from '@/stores/sliderStore';
import { Slider } from '@/types/slider';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function HeroSlider() {
  const { sliders, fetchSliders, loading } = useSliderStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  useEffect(() => {
    if (sliders.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sliders.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 animate-pulse flex items-center justify-center">
        <div className="text-orange-600 text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (sliders.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slider Content */}
      {sliders.map((slider, index) => (
        <div
          key={slider._id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? 'opacity-100 translate-x-0'
              : index < currentIndex
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
          }`}
        >
          <SliderTemplate slider={slider} />
        </div>
      ))}

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center transition-all hover:scale-110 z-20 backdrop-blur-sm"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={24} className="text-orange-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center transition-all hover:scale-110 z-20 backdrop-blur-sm"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={24} className="text-orange-600" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {sliders.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-orange-600 w-10 h-3'
                  : 'bg-white/60 hover:bg-white/90 w-3 h-3'
              }`}
              aria-label={`Slayt ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Template Router
function SliderTemplate({ slider }: { slider: Slider }) {
  switch (slider.template) {
    case 'split-left':
      return <SplitLeftTemplate slider={slider} />;
    case 'split-right':
      return <SplitRightTemplate slider={slider} />;
    case 'centered':
      return <CenteredTemplate slider={slider} />;
    case 'full-width':
      return <FullWidthTemplate slider={slider} />;
    case 'overlay':
      return <OverlayTemplate slider={slider} />;
    default:
      return <SplitLeftTemplate slider={slider} />;
  }
}

// Helper: Get text color classes based on backend setting
function getTextColorClasses(textColor: 'light' | 'dark' | 'auto') {
  if (textColor === 'light') {
    return {
      subtitle: 'text-orange-300',
      title: 'text-white',
      description: 'text-white/90',
    };
  } else if (textColor === 'dark') {
    return {
      subtitle: 'text-orange-600',
      title: 'text-neutral-900',
      description: 'text-neutral-700',
    };
  } else {
    // auto - default to dark
    return {
      subtitle: 'text-orange-600',
      title: 'text-neutral-900',
      description: 'text-neutral-600',
    };
  }
}

// Helper: Get button classes based on backend setting
function getButtonClasses(buttonStyle: 'primary' | 'secondary' | 'outline') {
  if (buttonStyle === 'secondary') {
    return 'bg-neutral-900 hover:bg-neutral-800 text-white';
  } else if (buttonStyle === 'outline') {
    return 'border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-transparent';
  } else {
    return 'bg-orange-600 hover:bg-orange-700 text-white';
  }
}

// Template 1: Split Left (Text left, Image right)
function SplitLeftTemplate({ slider }: { slider: Slider }) {
  const textColors = getTextColorClasses(slider.textColor);
  const buttonClass = getButtonClasses(slider.buttonStyle);

  return (
    <div className="relative h-full bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="container mx-auto h-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full items-center">
          {/* Text Content - Left */}
          <div className="space-y-6 max-w-xl animate-fade-in">
            <p className={`${textColors.subtitle} font-semibold uppercase tracking-wider text-sm`}>
              {slider.subtitle}
            </p>
            <h1 className={`${textColors.title} text-5xl lg:text-6xl font-bold leading-tight`}>
              {slider.title}
            </h1>
            <p className={`${textColors.description} text-lg lg:text-xl leading-relaxed`}>
              {slider.description}
            </p>
            <Link href={slider.buttonLink}>
              <Button size="lg" className={`${buttonClass} text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all`}>
                {slider.buttonText}
              </Button>
            </Link>
          </div>

          {/* Image - Right */}
          <div className="relative h-[400px] lg:h-[500px] animate-slide-in-right">
            <Image
              src={slider.image}
              alt={slider.altText || slider.title}
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 2: Split Right (Image left, Text right)
function SplitRightTemplate({ slider }: { slider: Slider }) {
  const textColors = getTextColorClasses(slider.textColor);
  const buttonClass = getButtonClasses(slider.buttonStyle);

  return (
    <div className="relative h-full bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="container mx-auto h-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full items-center">
          {/* Image - Left */}
          <div className="relative h-[400px] lg:h-[500px] order-2 lg:order-1 animate-slide-in-left">
            <Image
              src={slider.image}
              alt={slider.altText || slider.title}
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text Content - Right */}
          <div className="space-y-6 max-w-xl order-1 lg:order-2 animate-fade-in">
            <p className={`${textColors.subtitle} font-semibold uppercase tracking-wider text-sm`}>
              {slider.subtitle}
            </p>
            <h1 className={`${textColors.title} text-5xl lg:text-6xl font-bold leading-tight`}>
              {slider.title}
            </h1>
            <p className={`${textColors.description} text-lg lg:text-xl leading-relaxed`}>
              {slider.description}
            </p>
            <Link href={slider.buttonLink}>
              <Button size="lg" className={`${buttonClass} text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all`}>
                {slider.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 3: Centered
function CenteredTemplate({ slider }: { slider: Slider }) {
  const textColors = getTextColorClasses(slider.textColor);
  const buttonClass = getButtonClasses(slider.buttonStyle);

  return (
    <div className="relative h-full bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="container mx-auto h-full flex items-center justify-center px-6">
        <div className="text-center max-w-4xl space-y-8 animate-fade-in">
          <p className={`${textColors.subtitle} font-semibold uppercase tracking-wider text-sm`}>
            {slider.subtitle}
          </p>
          <h1 className={`${textColors.title} text-5xl lg:text-7xl font-bold leading-tight`}>
            {slider.title}
          </h1>
          <p className={`${textColors.description} text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto`}>
            {slider.description}
          </p>
          <div className="pt-4">
            <Link href={slider.buttonLink}>
              <Button size="lg" className={`${buttonClass} text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all`}>
                {slider.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 4: Full Width Background
function FullWidthTemplate({ slider }: { slider: Slider }) {
  const textColors = getTextColorClasses('light'); // Full width always uses light text
  const buttonClass = getButtonClasses(slider.buttonStyle);

  return (
    <div className="relative h-full">
      <Image
        src={slider.backgroundImage || slider.image}
        alt={slider.altText || slider.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent">
        <div className="container mx-auto h-full flex items-center px-6 lg:px-12">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <p className={`${textColors.subtitle} font-semibold uppercase tracking-wider text-sm`}>
              {slider.subtitle}
            </p>
            <h1 className={`${textColors.title} text-5xl lg:text-7xl font-bold leading-tight`}>
              {slider.title}
            </h1>
            <p className={`${textColors.description} text-xl lg:text-2xl leading-relaxed`}>
              {slider.description}
            </p>
            <Link href={slider.buttonLink}>
              <Button size="lg" className={`${buttonClass} text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all`}>
                {slider.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 5: Overlay
function OverlayTemplate({ slider }: { slider: Slider }) {
  const opacity = slider.overlayOpacity / 100;
  const textColors = getTextColorClasses(slider.textColor);
  const buttonClass = getButtonClasses(slider.buttonStyle);

  return (
    <div className="relative h-full">
      <Image
        src={slider.image}
        alt={slider.altText || slider.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${opacity})` }}
      >
        <div className="container mx-auto h-full flex items-center justify-center px-6">
          <div className="text-center max-w-4xl space-y-8 animate-fade-in">
            <p className={`${textColors.subtitle} font-semibold uppercase tracking-wider text-sm`}>
              {slider.subtitle}
            </p>
            <h1 className={`${textColors.title} text-5xl lg:text-7xl font-bold leading-tight`}>
              {slider.title}
            </h1>
            <p className={`${textColors.description} text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto`}>
              {slider.description}
            </p>
            <Link href={slider.buttonLink}>
              <Button size="lg" className={`${buttonClass} text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all`}>
                {slider.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
