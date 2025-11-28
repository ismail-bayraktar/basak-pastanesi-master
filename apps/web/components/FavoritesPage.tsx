
import React, { useState } from 'react';
import { Heart, ChevronRight, Home, Search, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { CartItem } from '../App';

interface FavoritesPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
}

// Mock Initial Favorites
const INITIAL_FAVORITES = [
  {
    id: 101,
    title: "Fıstıklı Çikolatalı Pasta",
    price: 650,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop",
    badge: "Çok Satan",
    tagline: "Bol fıstıklı, günlük üretim",
    rating: 4.9
  },
  {
    id: 103,
    title: "Çilekli Magnolia",
    price: 95,
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=600&auto=format&fit=crop",
    tagline: "Hafif ve sütlü tatlı",
    rating: 4.8
  },
  {
    id: 104,
    title: "Kuru Pasta (1 Kg)",
    price: 380,
    image: "https://images.unsplash.com/photo-1597528662465-5bcbf96f497a?q=80&w=600&auto=format&fit=crop",
    tagline: "Tazelik garantisi",
    rating: 4.7
  },
  {
    id: 208,
    title: "Profiterollü Pasta",
    price: 680,
    image: "https://images.unsplash.com/photo-1551879400-111a9087cd86?q=80&w=600&auto=format&fit=crop",
    badge: "Özel",
    tagline: "İçi krema dolgulu toplar",
    rating: 4.9
  }
];

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate, onAddToCart }) => {
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  const handleToggleFavorite = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-20">
      
      {/* 1) HEADER SECTION */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <button onClick={() => onNavigate('home')} className="hover:text-basak-orange transition-colors">Anasayfa</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <button onClick={() => onNavigate('account')} className="hover:text-basak-orange transition-colors">Hesabım</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="font-bold text-gray-900">Favorilerim</span>
          </nav>

          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-3">
              Favori Ürünlerim
            </h1>
            <p className="text-lg text-gray-600 font-medium max-w-2xl">
              En sevdiğiniz lezzetlere buradan hızlıca ulaşabilir ve sepetinize ekleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* 2) PRODUCT GRID & EMPTY STATE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {favorites.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-soft border border-orange-50 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <Heart className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              Henüz favori ürün eklemediniz
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Lezzet dünyamızı keşfedip beğendiğiniz ürünleri buraya ekleyebilirsiniz.
            </p>
            <button 
              onClick={() => onNavigate('category')}
              className="inline-flex items-center justify-center px-8 py-4 bg-basak-orange text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5"
            >
              Lezzetleri Keşfet
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((product) => (
              <ProductCard 
                key={product.id}
                {...product}
                isFavorite={true}
                onToggleFavorite={(e) => handleToggleFavorite(e, product.id)}
                onClick={() => onNavigate('product')}
                onAddToCart={() => onAddToCart && onAddToCart(product)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default FavoritesPage;
