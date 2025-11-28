'use client';

import { useState } from 'react';
import { Hero } from "@/components/v2/Hero";
import { CorporateSection } from "@/components/v2/CorporateSection";
import { ProductGrid } from "@/components/v2/ProductGrid";
import { DeliveryFeature } from "@/components/v2/DeliveryFeature";
import { StickyCart } from "@/components/v2/StickyCart";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function V2Page() {
    // Admin Panel Simulation State
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [sliderMode, setSliderMode] = useState<'default' | 'seasonal' | 'promo'>('default');

    // Mock Slider Configurations
    const sliderConfigs = {
        default: {
            title: "Geleneksel Lezzet, Modern Dokunuş.",
            subtitle: "1985'ten beri değişmeyen kalite. Günlük üretim, bol fıstık ve doğal pancar şekeri ile hazırlanan eşsiz baklava deneyimi.",
            backgroundImage: "/assets/hero-baklava.png"
        },
        seasonal: {
            title: "Ramazan Sofralarının, Vazgeçilmezi.",
            subtitle: "İftar sofralarınızı tatlandıracak, bol fıstıklı ve hafif şerbetli özel Ramazan koleksiyonumuz hazır.",
            backgroundImage: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?q=80&w=2050&auto=format&fit=crop" // Placeholder for seasonal
        },
        promo: {
            title: "Haftanın Fırsatı, %20 İndirim.",
            subtitle: "Sadece bu haftaya özel, 1kg ve üzeri Fıstıklı Baklava siparişlerinizde %20 indirim fırsatını kaçırmayın.",
            backgroundImage: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?q=80&w=2070&auto=format&fit=crop" // Placeholder for promo
        }
    };

    const currentConfig = sliderConfigs[sliderMode];

    return (
        <div className="bg-white relative">
            {/* Admin Panel Toggle (Simulation) */}
            <div className="fixed top-24 right-4 z-50">
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-white border border-neutral-200"
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                >
                    <Settings className="w-5 h-5 text-neutral-700" />
                </Button>
            </div>

            {/* Admin Panel (Simulation) */}
            {isAdminOpen && (
                <div className="fixed top-36 right-4 z-50 bg-white p-4 rounded-xl shadow-2xl border border-neutral-200 w-64 animate-in slide-in-from-right-10">
                    <h3 className="font-bold text-sm mb-3 text-neutral-900">Slider Yöneticisi (Demo)</h3>
                    <div className="space-y-2">
                        <Button
                            variant={sliderMode === 'default' ? 'default' : 'outline'}
                            className={`w-full justify-start ${sliderMode === 'default' ? 'bg-basak-golden hover:bg-orange-600' : ''}`}
                            onClick={() => setSliderMode('default')}
                        >
                            Varsayılan Mod
                        </Button>
                        <Button
                            variant={sliderMode === 'seasonal' ? 'default' : 'outline'}
                            className={`w-full justify-start ${sliderMode === 'seasonal' ? 'bg-basak-golden hover:bg-orange-600' : ''}`}
                            onClick={() => setSliderMode('seasonal')}
                        >
                            Ramazan / Sezonluk
                        </Button>
                        <Button
                            variant={sliderMode === 'promo' ? 'default' : 'outline'}
                            className={`w-full justify-start ${sliderMode === 'promo' ? 'bg-basak-golden hover:bg-orange-600' : ''}`}
                            onClick={() => setSliderMode('promo')}
                        >
                            Kampanya Modu
                        </Button>
                    </div>
                </div>
            )}

            <Hero
                title={currentConfig.title}
                subtitle={currentConfig.subtitle}
                backgroundImage={currentConfig.backgroundImage}
            />
            <CorporateSection />
            <ProductGrid />
            <DeliveryFeature />
            <StickyCart />
        </div>
    );
}
