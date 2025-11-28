'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProductImageUrl } from '@/lib/utils/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const priceInTL = Number(product.basePrice) || 0;

  // Görsel URL (backend'den /uploads/... geliyor veya placeholder)
  const imageUrl = getProductImageUrl(product.image, 0, '/assets/tulumba.png');
  const fallbackImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

  // Stok durumu badge
  const getStockBadge = () => {
    if (product.stock === 0) {
      return <Badge variant="destructive" className="absolute top-2 left-2">Tükendi</Badge>;
    } else if (product.stock < 10) {
      return <Badge variant="secondary" className="absolute top-2 left-2 bg-orange-500 text-white">Az Kaldı</Badge>;
    }
    return null;
  };

  // Etiketler (labels)
  const renderLabels = () => {
    if (!product.labels || product.labels.length === 0) return null;

    return (
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {product.labels.slice(0, 2).map((label, idx) => (
          <Badge key={idx} className="bg-blue-500 text-white text-xs">
            {label}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {/* Gerçek Ürün Görseli */}
          <Image
            src={imageError ? fallbackImage : imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />

          {/* Stok Durumu Badge */}
          {getStockBadge()}

          {/* Etiketler (Yeni, Popüler vb.) */}
          {renderLabels()}

          {/* Bestseller Badge */}
          {product.bestseller && (
            <Badge className="absolute bottom-2 right-2 bg-orange-500">
              Çok Satan
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/product/${product._id}`}>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Fiyat */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-orange-600">
            {priceInTL.toFixed(2)} ₺
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/product/${product._id}`} className="w-full">
          <Button
            className="w-full"
            variant={product.stock === 0 ? "secondary" : "default"}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={18} className="mr-2" />
            {product.stock === 0 ? 'Tükendi' : 'İncele'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
