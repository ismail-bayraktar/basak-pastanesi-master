'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useCartStore } from '@/stores/cartStore';
import { getProductImageUrl } from '@/lib/utils/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Truck, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { addToCart } = useCartStore();
    const [imageError, setImageError] = useState(false);

    // Price logic adjusted for TL
    const priceInTL = product.basePrice;
    const imageUrl = getProductImageUrl(product.image, 0, '/assets/tulumba.png');
    const fallbackImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        const defaultSize = product.sizes?.[0] ? String(product.sizes[0]) : '1000';
        addToCart(product._id, defaultSize);
    };

    return (
        <Card className={cn("group relative overflow-hidden border-neutral-200/60 dark:border-neutral-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-neutral-900", className)}>
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.bestseller && (
                    <Badge className="bg-[#56bd38] hover:bg-[#4ca832] text-white border-none shadow-sm">
                        Çok Satan
                    </Badge>
                )}
                {product.stock < 10 && product.stock > 0 && (
                    <Badge variant="destructive" className="shadow-sm">
                        Son {product.stock} Ürün
                    </Badge>
                )}
            </div>

            <Link href={`/product/${product._id}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 dark:bg-neutral-800/50 p-4">
                    <Image
                        src={imageError ? fallbackImage : imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImageError(true)}
                    />
                </div>
            </Link>

            <CardContent className="p-4">
                <Link href={`/product/${product._id}`}>
                    <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-brand-primary transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                        ))}
                    </div>
                    <span className="text-xs text-neutral-500 font-medium">(4.8)</span>
                </div>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-3">
                    {product.description || 'Eşsiz lezzet, günlük üretim.'}
                </p>

                {/* Features */}
                <div className="flex items-center gap-3 mb-4 text-xs font-medium text-[#56bd38]">
                    <div className="flex items-center gap-1">
                        <Truck size={14} />
                        <span>Hızlı Teslimat</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ShieldCheck size={14} />
                        <span>Günlük Üretim</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-neutral-400 line-through">
                            {(priceInTL * 1.2).toFixed(2)} TL
                        </span>
                        <span className="text-xl font-bold text-brand-primary">
                            {priceInTL.toFixed(2)} TL
                        </span>
                    </div>

                    <Button
                        size="sm"
                        className="rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                    >
                        <ShoppingCart size={16} className="mr-2" />
                        {product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
