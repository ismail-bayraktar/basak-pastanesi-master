'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Leaf, ShieldCheck } from "lucide-react";

export function CorporateSection() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-8 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="text-basak-golden font-bold tracking-wider uppercase text-sm flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-basak-golden"></span>
                                Kurumsal Kimlik
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                                1985'ten Beri <br />
                                <span className="text-basak-pistachio">Ustalık ve Güven.</span>
                            </h2>
                            <p className="text-neutral-600 leading-relaxed text-lg">
                                Basak Pastanesi olarak, dededen toruna geçen baklava ustalığını modern gıda güvenliği standartlarıyla birleştiriyoruz.
                                İzmir'deki üretim tesisimizde, Gaziantep'ten gelen 1. sınıf fıstık ve %100 doğal pancar şekeri kullanarak,
                                hiçbir katkı maddesi içermeyen saf lezzetler üretiyoruz.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-full bg-basak-pistachio/10 flex items-center justify-center flex-shrink-0">
                                    <Leaf className="w-6 h-6 text-basak-pistachio" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 mb-1">Doğal Malzemeler</h4>
                                    <p className="text-sm text-neutral-500">Glikoz şurubu yok, %100 pancar şekeri.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-full bg-basak-golden/10 flex items-center justify-center flex-shrink-0">
                                    <Award className="w-6 h-6 text-basak-golden" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 mb-1">Ödüllü Lezzet</h4>
                                    <p className="text-sm text-neutral-500">Yılların verdiği tecrübe ile tescilli tatlar.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 mb-1">Hijyenik Üretim</h4>
                                    <p className="text-sm text-neutral-500">ISO 22000 standartlarında modern tesis.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="link" className="text-basak-pistachio p-0 h-auto font-bold text-lg group">
                                Hikayemizi Keşfedin <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Image Composition */}
                    <div className="relative order-1 lg:order-2">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/assets/hero-baklava.png"
                                alt="Basak Pastanesi Kurumsal"
                                fill
                                className="object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating Stats Card */}
                        <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl max-w-[200px] hidden md:block">
                            <div className="text-4xl font-bold text-basak-golden mb-1">35+</div>
                            <div className="text-sm text-neutral-600 font-medium">Yıllık Tecrübe ve Lezzet Mirası</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
