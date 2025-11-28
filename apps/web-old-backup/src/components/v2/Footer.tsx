'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCategoryStore } from '@/stores/categoryStore';
import { useProductStore } from '@/stores/productStore';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const { categories, fetchCategories } = useCategoryStore();
    const { products, fetchProducts } = useProductStore();

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
        if (products.length === 0) {
            fetchProducts();
        }
    }, [categories.length, products.length, fetchCategories, fetchProducts]);

    // Get top 5 products
    const topProducts = products.filter(p => p.isActive).slice(0, 5);

    return (
        <footer className="bg-neutral-900 text-neutral-400 border-t border-white/10">
            {/* Newsletter Section */}
            <div className="border-b border-white/10">
                <div className="container mx-auto px-4 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">Lezzet Bültenine Katılın</h3>
                            <p className="text-neutral-400">Yeni ürünler ve özel kampanyalardan ilk siz haberdar olun.</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-basak-golden w-full md:w-80"
                            />
                            <Button className="rounded-full bg-basak-golden hover:bg-orange-600 text-white px-6">
                                Abone Ol
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="text-2xl font-bold text-white tracking-tight block">
                            BAŞAK PASTANESİ
                        </Link>
                        <p className="leading-relaxed text-sm">
                            1985'ten beri İzmir'in en tatlı geleneği. Doğal malzemeler, günlük üretim ve değişmeyen lezzet garantisiyle sofralarınızdayız.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-basak-golden hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-basak-golden hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-basak-golden hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Kategoriler</h4>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/collection" className="hover:text-basak-golden transition-colors flex items-center gap-2 group">
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Tüm Ürünler
                                </Link>
                            </li>
                            {categories.slice(0, 5).map((category) => (
                                <li key={category._id}>
                                    <Link
                                        href={`/collection?category=${category.slug}`}
                                        className="hover:text-basak-golden transition-colors flex items-center gap-2 group"
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Popular Products */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Öne Çıkan Ürünler</h4>
                        <ul className="space-y-4 text-sm">
                            {topProducts.map((product) => (
                                <li key={product._id}>
                                    <Link
                                        href={`/product/${product.slug}`}
                                        className="hover:text-basak-golden transition-colors"
                                    >
                                        {product.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6">İletişim</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-basak-golden shrink-0" />
                                <span>Alsancak Mah. Kıbrıs Şehitleri Cad. No:144, Konak/İzmir</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-basak-golden shrink-0" />
                                <span>+90 (232) 464 12 34</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-basak-golden shrink-0" />
                                <span>info@basakpastanesi.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 bg-black/20">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <p>&copy; {currentYear} Basak Pastanesi İzmir Baklava. Tüm hakları saklıdır.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
                        <Link href="#" className="hover:text-white transition-colors">Kullanım Şartları</Link>
                        <Link href="#" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
