'use client';

import { useEffect } from 'react';
import { useSliderStore } from '@/stores/sliderStore';
import { Hero } from '@/components/v2/Hero';
import { CorporateSection } from '@/components/v2/CorporateSection';
import { ProductGrid } from '@/components/v2/ProductGrid';
import { DeliveryFeature } from '@/components/v2/DeliveryFeature';
import { StickyCart } from '@/components/v2/StickyCart';
import { NewHeroSection } from '@/components/home/NewHeroSection';
import { NewCategorySection } from '@/components/home/NewCategorySection';
import { NewBestSellers } from '@/components/home/NewBestSellers';
import { DailySpecial } from '@/components/home/DailySpecial';
import { PromoSection } from '@/components/home/PromoSection';
import { ValuePropsSection } from '@/components/home/ValuePropsSection';
import { MissionSection } from '@/components/home/MissionSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CTASection } from '@/components/home/CTASection';
import { getImageUrl } from '@/lib/utils/image';

export default function Home() {
  const { sliders, loading, fetchSliders } = useSliderStore();

  useEffect(() => {
    if (sliders.length === 0 && !loading) {
      fetchSliders();
    }
  }, [sliders.length, loading, fetchSliders]);

  // Filter active sliders
  const activeSliders = sliders.filter((s) => s.isActive);

  // Check if there's a V2 Premium slider
  const v2PremiumSlider = activeSliders.find((s) => s.template === 'v2-premium');

  // TEMPORARY: Always use V2 Design for testing
  // Remove this and uncomment below line when V2 slider is created in admin
  const useV2Design = true; // !!v2PremiumSlider;

  // V2 Premium Design - Clean Storytelling
  if (useV2Design) {
    // Use V2 slider data if available, otherwise use defaults
    const heroData = v2PremiumSlider || {
      title: 'Geleneksel Lezzet, Modern Dokunuş.',
      description: "1985'ten beri değişmeyen kalite. Günlük üretim, bol fıstık ve doğal pancar şekeri ile hazırlanan eşsiz baklava deneyimi.",
      buttonText: 'Sipariş Ver',
      buttonLink: '/collection',
      image: '/assets/hero-baklava.png'
    };

    return (
      <div className="bg-white">
        <Hero
          title={heroData.title}
          subtitle={v2PremiumSlider ? v2PremiumSlider.description : heroData.description}
          ctaPrimary={heroData.buttonText}
          ctaSecondary="Hikayemiz"
          backgroundImage={getImageUrl(v2PremiumSlider ? (v2PremiumSlider.backgroundImage || v2PremiumSlider.image) : heroData.image)}
          buttonLink={heroData.buttonLink}
        />
        <CorporateSection />
        <ProductGrid />
        <DeliveryFeature />
        <StickyCart />
      </div>
    );
  }

  // Classic Design - All Sections
  return (
    <>
      <NewHeroSection />
      <NewCategorySection />
      <NewBestSellers />
      <DailySpecial />
      <PromoSection />
      <ValuePropsSection />
      <MissionSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
