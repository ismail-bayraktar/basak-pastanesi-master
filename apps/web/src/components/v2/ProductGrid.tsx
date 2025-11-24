'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/productStore';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

// Mock data for when API is empty or not running
const MOCK_PRODUCTS: Product[] = [
    {
        _id: '1',
        name: 'Fıstıklı Baklava',
        description: 'Bol Antep fıstıklı, ince hamurlu klasik lezzet.',
        basePrice: 650,
        image: ['/assets/baklava.png'],
        category: { _id: 'c1', name: 'Baklava', active: true, slug: 'baklava' },
        sizes: [1000],
        sizePrices: [{ size: 1000, price: 650 }],
        personCounts: ['4-6'],
        freshType: 'taze',
        packaging: 'standart',
        giftWrap: false,
        labels: ['Popüler'],
        bestseller: true,
        stock: 100,
        date: Date.now()
    },
    {
        _id: '2',
        name: 'Cevizli Baklava',
        description: 'Yerli ceviz içi ile hazırlanan geleneksel lezzet.',
        basePrice: 550,
        image: ['/assets/baklava.png'],
        category: { _id: 'c1', name: 'Baklava', active: true, slug: 'baklava' },
        sizes: [1000],
        sizePrices: [{ size: 1000, price: 550 }],
        personCounts: ['4-6'],
        freshType: 'taze',
        packaging: 'standart',
        giftWrap: false,
        labels: [],
        bestseller: false,
        stock: 100,
        date: Date.now()
    },
    {
        _id: '3',
        name: 'Fıstıklı Dürüm',
        description: 'İncecik yufka ve bol fıstığın muhteşem uyumu.',
        basePrice: 750,
        image: ['/assets/baklava.png'],
        category: { _id: 'c1', name: 'Baklava', active: true, slug: 'baklava' },
        sizes: [1000],
        sizePrices: [{ size: 1000, price: 750 }],
        personCounts: ['4-6'],
        freshType: 'taze',
        packaging: 'standart',
        giftWrap: false,
        labels: ['Yeni'],
        bestseller: true,
        stock: 50,
        date: Date.now()
    },
    {
        _id: '4',
        name: 'Şöbiyet',
        description: 'Kaymak ve fıstığın eşsiz buluşması.',
        basePrice: 700,
        image: ['/assets/baklava.png'],
        category: { _id: 'c1', name: 'Baklava', active: true, slug: 'baklava' },
        sizes: [1000],
        sizePrices: [{ size: 1000, price: 700 }],
        personCounts: ['4-6'],
        freshType: 'taze',
        packaging: 'standart',
        giftWrap: false,
        labels: [],
        bestseller: false,
        stock: 80,
        date: Date.now()
    },
    {
        _id: '5',
        name: 'Sütlü Nuriye',
        description: 'Hafif ve sütlü şerbetiyle ferahlatıcı bir tat.',
        basePrice: 580,
        image: ['/assets/baklava.png'],
        category: { _id: 'c1', name: 'Baklava', active: true, slug: 'baklava' },
        sizes: [1000],
        sizePrices: [{ size: 1000, price: 580 }],
        personCounts: ['4-6'],
        freshType: 'taze',
        packaging: 'standart',
        giftWrap: false,
        labels: [],
        bestseller: false,
        stock: 60,
        date: Date.now()
    },
    {
        _id: '6',
        name: 'Midye Baklava',
        description: 'Özel şekli ve bol malzemesiyle görsel şölen.',
        basePrice: 680,
        image: ['/assets/baklava.png'],
        category: { _id: 'c1', name: 'Baklava', active: true, slug: 'baklava' },
        sizes: [1000],
        sizePrices: [{ size: 1000, price: 680 }],
        personCounts: ['4-6'],
        freshType: 'taze',
        packaging: 'standart',
        giftWrap: false,
        labels: ['Özel'],
        bestseller: true,
        stock: 40,
        date: Date.now()
    }
];

export function ProductGrid() {
    const { products, loading, fetchProducts } = useProductStore();

    useEffect(() => {
        if (products.length === 0 && !loading) {
            fetchProducts();
        }
    }, [products.length, loading, fetchProducts]);

    // Use mock products if API returns empty or fails, to ensure design is visible
    const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;

    // Show only first 6 products for homepage
    const featuredProducts = displayProducts.slice(0, 6);

    // Only show loading if we don't have any products (including mock)
    if (loading && products.length === 0 && displayProducts.length === 0) {
        return (
            <section className="py-20 bg-neutral-50">
                <div className="container mx-auto px-4">
                    <div className="text-center">Loading...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-neutral-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-tulumbak-golden/10 text-tulumbak-golden border border-tulumbak-golden/30 text-sm font-medium tracking-wider uppercase mb-4">
                        Öne Çıkan Ürünler
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                        En Sevilen Lezzetlerimiz
                    </h2>
                    <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                        Günlük taze üretim, doğal malzemeler ve geleneksel tariflerle hazırlanan özel ürünlerimiz
                    </p>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredProducts.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>

                {/* View All Link */}
                <div className="text-center mt-12">
                    <Link href="/collection">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-tulumbak-golden text-tulumbak-golden hover:bg-tulumbak-golden hover:text-white rounded-full px-10 h-14 text-lg font-bold transition-all hover:scale-105"
                        >
                            Tüm Ürünleri Gör
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
