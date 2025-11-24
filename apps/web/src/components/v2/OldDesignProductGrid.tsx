'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore } from '@/stores/productStore';
import { getProductImageUrl } from '@/lib/utils/image';
import { Product } from '@/types/product';
import { useCartStore } from '@/stores/cartStore';

// Mock data (same as ProductGrid to ensure consistency)
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

export function OldDesignProductGrid() {
    const { products, loading, fetchProducts } = useProductStore();
    const { addToCart } = useCartStore();

    useEffect(() => {
        if (products.length === 0 && !loading) {
            fetchProducts();
        }
    }, [products.length, loading, fetchProducts]);

    const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;
    const bestSellerProducts = displayProducts.slice(0, 4);

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 w-full bg-white border-t border-neutral-200">
            <div className="w-[85%] mx-auto">
                <div className="flex flex-col items-center gap-3 mb-8">
                    <span className="rounded-full bg-brand-primary/10 text-brand-primary px-4 py-1 text-sm font-semibold tracking-wide">
                        Eski Tasarım
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-center">Klasik Kart Görünümü</h2>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary text-center max-w-2xl">
                        Önceki tasarımda kullanılan ürün kartları.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellerProducts.map((product) => {
                        // Price logic adjusted for TL
                        const priceInTL = product.basePrice;
                        const imageUrl = getProductImageUrl(product.image, 0, '/assets/tulumba.png');

                        return (
                            <div
                                key={product._id}
                                className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#fff8f2] to-white dark:from-bg-dark dark:via-bg-dark/90 dark:to-bg-dark shadow-md hover:shadow-2xl transition-all border border-white/60"
                            >
                                <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-brand-primary text-white px-3 py-1 text-xs font-semibold shadow-lg">
                                    <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                    Çok Satan
                                </div>
                                <Link href={`/product/${product._id}`}>
                                    <Image
                                        src={imageUrl}
                                        alt={product.name}
                                        width={400}
                                        height={300}
                                        className="h-52 w-full object-cover hover:scale-105 transition-transform duration-400"
                                    />
                                </Link>
                                <div className="p-4 flex flex-col flex-grow">
                                    <Link href={`/product/${product._id}`}>
                                        <h3 className="text-lg font-bold hover:text-brand-primary transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1 flex-grow line-clamp-2">
                                        {product.description || 'Lezzetli baklava çeşitleri'}
                                    </p>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-brand-primary font-semibold">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-base">local_shipping</span>
                                            Hızlı teslimat
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <span className="material-symbols-outlined text-base">verified</span>
                                            Günlük üretim
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-brand-primary">
                                            {priceInTL.toFixed(2)} TL
                                        </span>
                                        <button
                                            onClick={() => {
                                                const defaultSize = product.sizes?.[0] ? String(product.sizes[0]) : '1000';
                                                addToCart(product._id, defaultSize);
                                            }}
                                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-brand-primary text-white text-sm font-bold hover:bg-opacity-90 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                                            Sepete Ekle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
