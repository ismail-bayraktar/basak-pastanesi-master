'use client';

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function StickyCart() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 100px
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
                >
                    <div className="bg-neutral-900/90 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10">
                        <div className="flex flex-col">
                            <span className="text-xs text-neutral-400">Toplam Tutar</span>
                            <span className="font-bold text-lg">₺0.00</span>
                        </div>

                        <Button className="bg-basak-pistachio hover:bg-green-600 text-white rounded-full px-6 gap-2 shadow-lg shadow-green-900/20">
                            <ShoppingBag className="w-4 h-4" />
                            Sipariş Ver
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
