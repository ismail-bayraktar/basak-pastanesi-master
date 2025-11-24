'use client';

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MapPin, Clock, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function DeliveryFeature() {
    return (
        <section className="py-24 bg-tulumbak-cream overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tulumbak-golden via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="text-tulumbak-golden font-bold tracking-wider uppercase text-sm">Özel Kurye Sistemi</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900">
                        Sıcacık Baklava, <br />
                        <span className="text-tulumbak-pistachio">Kapınızda.</span>
                    </h2>
                    <p className="text-neutral-600 text-lg">
                        İzmir içi siparişlerinizde kendi kurye ekibimizle hizmet veriyoruz.
                        Fırından çıktığı gibi, sıcak ve taze teslimat garantisi.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visualization / Timeline */}
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-neutral-200 rounded-full" />

                        <div className="space-y-12 relative z-10">
                            {/* Step 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex gap-8 items-start"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border-4 border-tulumbak-golden flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Clock className="w-8 h-8 text-tulumbak-golden" />
                                </div>
                                <div className="pt-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex-1">
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Siparişiniz Alınır</h3>
                                    <p className="text-neutral-500">Siparişiniz sisteme düştüğü an, fırınımızdaki ustalarımız hazırlığa başlar.</p>
                                </div>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-8 items-start"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border-4 border-tulumbak-pistachio flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Truck className="w-8 h-8 text-tulumbak-pistachio" />
                                </div>
                                <div className="pt-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex-1">
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Özel Kurye Yola Çıkar</h3>
                                    <p className="text-neutral-500">Sadece Tulumbak ürünlerini taşıyan özel araçlarımızla, sarsmadan ve soğutmadan yola çıkarız.</p>
                                </div>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="flex gap-8 items-start"
                            >
                                <div className="w-16 h-16 rounded-full bg-tulumbak-golden text-white flex items-center justify-center shadow-lg flex-shrink-0">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div className="pt-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex-1">
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Sıcak Teslimat</h3>
                                    <p className="text-neutral-500">Kapınız çaldığında, baklavanız hala ılıktır. Afiyet olsun!</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Map / Coverage Area Placeholder */}
                    <div className="relative h-[500px] bg-neutral-50 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                        {/* Abstract Map Graphic */}
                        <div className="absolute inset-0">
                            <Image
                                src="/assets/delivery_map_topo.png"
                                alt="İzmir Teslimat Bölgesi Haritası"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />

                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-6 h-6 text-tulumbak-pistachio" />
                                <span className="font-bold text-lg">Hizmet Bölgeleri</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Alsancak', 'Karşıyaka', 'Bornova', 'Göztepe', 'Buca', 'Konak'].map((district) => (
                                    <span key={district} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm backdrop-blur-sm">
                                        {district}
                                    </span>
                                ))}
                                <span className="px-3 py-1 rounded-full bg-tulumbak-golden/20 border border-tulumbak-golden/40 text-sm text-tulumbak-golden backdrop-blur-sm">
                                    + Tüm İzmir
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
