'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { getProductImageUrl } from '@/lib/utils/image';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Trash2, Plus, Minus, X, Bike, Check } from 'lucide-react';

export function MiniCart() {
    const router = useRouter();
    const {
        items,
        isMiniCartOpen,
        setMiniCartOpen,
        removeFromCart,
        updateQuantity,
        getCartAmount,
        currency,
    } = useCartStore();
    const { products } = useProductStore();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const cartItems = Object.keys(items).flatMap((productId) => {
        const product = products.find((p) => p._id === productId);
        if (!product) return [];
        return Object.keys(items[productId]).map((size) => ({
            product,
            size,
            quantity: items[productId][size],
        }));
    });

    const subtotal = getCartAmount();
    const freeShippingThreshold = 1000;
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

    const handleCheckout = () => {
        setMiniCartOpen(false);
        router.push('/checkout');
    };

    return (
        <Sheet open={isMiniCartOpen} onOpenChange={setMiniCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Sepetim ({cartItems.length})
                        </SheetTitle>
                        {/* Close button is handled by Sheet primitive usually, but we can add custom if needed */}
                    </div>
                </SheetHeader>

                {/* Free Shipping Progress */}
                <div className="px-6 py-4 bg-neutral-50/50">
                    {remainingForFreeShipping > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Bike className="w-4 h-4 text-[#56bd38]" />
                                <p className="text-sm text-neutral-600">
                                    Ücretsiz kurye için <span className="font-semibold text-basak-golden">{remainingForFreeShipping.toFixed(2)} {currency}</span> daha ekleyin
                                </p>
                            </div>
                            <Progress value={progress} className="h-2 bg-neutral-200/70" indicatorClassName="bg-[#56bd38]" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[#56bd38] font-medium">
                            <div className="w-5 h-5 rounded-full bg-[#56bd38]/10 flex items-center justify-center">
                                <Check className="w-3 h-3" />
                            </div>
                            Kurye Ücretsiz!
                        </div>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Sepetiniz Boş</h3>
                            <p className="text-neutral-500 text-sm mt-1">
                                Henüz sepetinize ürün eklemediniz.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setMiniCartOpen(false);
                                router.push('/collection');
                            }}
                        >
                            Alışverişe Başla
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6">
                            <div className="py-4 space-y-6">
                                {cartItems.map(({ product, size, quantity }) => {
                                    const price = Number(product.basePrice) || 0;
                                    const itemTotal = price * quantity;

                                    return (
                                        <div key={`${product._id}-${size}`} className="flex gap-4">
                                            <div className="relative w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                                                <Image
                                                    src={getProductImageUrl(product.image, 0)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm line-clamp-2">
                                                            {product.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeFromCart(product._id, size)}
                                                            className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {size === 'standard' ? 'Standart' : size}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border border-neutral-100 rounded-lg bg-neutral-50/50">
                                                        <button
                                                            onClick={() => updateQuantity(product._id, size, quantity - 1)}
                                                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 transition-colors rounded-l-lg"
                                                            disabled={quantity <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium text-neutral-700">
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(product._id, size, quantity + 1)}
                                                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 transition-colors rounded-r-lg"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="font-semibold text-sm">
                                                        {itemTotal.toFixed(2)} {currency}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Ara Toplam</span>
                                    <span className="font-medium">{subtotal.toFixed(2)} {currency}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Kurye</span>
                                    <span className="font-medium text-[#56bd38]">
                                        {remainingForFreeShipping <= 0 ? 'Ücretsiz' : 'Hesaplanacak'}
                                    </span>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Toplam</span>
                                <span className="font-bold text-xl text-brand-primary">
                                    {subtotal.toFixed(2)} {currency}
                                </span>
                            </div>
                            <Button className="w-full h-12 text-lg font-semibold" onClick={handleCheckout}>
                                Sepeti Onayla
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
