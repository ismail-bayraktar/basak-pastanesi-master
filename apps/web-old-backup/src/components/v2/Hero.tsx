'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeroProps {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    backgroundImage?: string;
    buttonLink?: string;
}

export function Hero({
    title = "Geleneksel Lezzet, Modern Dokunuş.",
    subtitle = "1985'ten beri değişmeyen kalite. Günlük üretim, bol fıstık ve doğal pancar şekeri ile hazırlanan eşsiz baklava deneyimi.",
    ctaPrimary = "Sipariş Ver",
    ctaSecondary = "Hikayemiz",
    backgroundImage = "/assets/hero-baklava.png",
    buttonLink = "/collection"
}: HeroProps) {
    // Helper to safely split title
    const getTitleParts = (text: string) => {
        if (!text) return ["Geleneksel Lezzet", "Modern Dokunuş."];
        const parts = text.split(',');
        if (parts.length >= 2) return parts;
        return [text, ""];
    };

    const titleParts = getTitleParts(title);

    return (
        <section className="relative h-[90vh] w-full overflow-hidden bg-neutral-900">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-neutral-900/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full container mx-auto px-4 flex flex-col justify-center items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8 max-w-4xl"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-basak-golden/20 text-basak-golden border border-basak-golden/30 text-sm font-medium tracking-wider uppercase backdrop-blur-sm">
                        İzmir'in Efsane Lezzeti
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-tight">
                        {titleParts[0]}
                        {titleParts[1] && ','} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-basak-golden to-yellow-200">
                            {titleParts[1] || ""}
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-200 max-w-2xl mx-auto font-light leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 relative z-20">
                        <Link href={buttonLink}>
                            <Button
                                size="lg"
                                className="bg-basak-golden hover:bg-orange-600 text-white px-10 h-16 text-lg rounded-full shadow-lg shadow-orange-900/20 transition-all hover:scale-105 border-2 border-transparent"
                            >
                                {ctaPrimary}
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-neutral-900 px-10 h-16 text-lg rounded-full backdrop-blur-sm transition-all hover:scale-105"
                            >
                                {ctaSecondary}
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 z-10"
            >
                <span className="text-xs uppercase tracking-widest">Keşfet</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
            </motion.div>
        </section>
    );
}
