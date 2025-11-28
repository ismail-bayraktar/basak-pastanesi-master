
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';
import { CartItem } from '../App';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';

interface FeaturedProductsProps {
  onNavigate?: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onNavigate, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        // İlk 4 ürünü al (veya bestseller olanları filtrele)
        const featured = (response.products || [])
          .filter((p: Product) => p.bestseller)
          .slice(0, 4);
        
        if (featured.length === 0 && response.products) {
          setProducts(response.products.slice(0, 4));
        } else {
          setProducts(featured);
        }
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        // Fallback: Mock data kullan
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Backend Product formatını frontend CartItem formatına çevir
  const convertToCartItem = (product: Product): Omit<CartItem, 'quantity'> => {
    return {
      id: product._id,
      title: product.name,
      price: product.basePrice,
      image: product.image?.[0] || '',
      portion: product.personCounts?.[0] || undefined,
    };
  };

  if (loading) {
    return (
      <section className="bg-basak-cream py-16 md:py-24 border-t border-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }
  return (
    <section className="bg-basak-cream py-16 md:py-24 border-t border-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
              Öne Çıkan Lezzetler
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl">
              En çok sevilen pasta ve tatlılarımızdan seçtik.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate && onNavigate('category')}
            className="hidden md:inline-flex items-center font-bold text-basak-orange hover:text-orange-700 transition-colors text-lg"
          >
            Tümünü Gör <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const cartItem = convertToCartItem(product);
            return (
              <ProductCard 
                key={product._id}
                id={product._id}
                title={product.name}
                price={product.basePrice}
                image={product.image?.[0] || ''}
                badge={product.bestseller ? "Çok Satan" : undefined}
                tagline={product.description?.substring(0, 50) || ''}
                rating={4.8}
                onClick={() => onNavigate && onNavigate('product')}
                onAddToCart={() => onAddToCart && onAddToCart(cartItem)}
              />
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <button 
            onClick={() => onNavigate && onNavigate('category')}
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-lg font-bold rounded-xl text-gray-700 bg-white hover:border-basak-orange hover:text-basak-orange transition-all w-full sm:w-auto"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
