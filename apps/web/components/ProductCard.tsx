
import React from 'react';
import { ShoppingBag, Star, Heart } from 'lucide-react';

interface ProductCardProps {
  id: number | string;
  title: string;
  price: number;
  image: string;
  tagline?: string;
  badge?: string;
  rating?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  price, 
  image, 
  tagline = "Günlük Taze Üretim", 
  badge,
  rating,
  isFavorite,
  onToggleFavorite,
  onClick,
  onAddToCart
}) => {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col bg-white rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 overflow-hidden h-full cursor-pointer relative"
    >
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        
        {/* Badge (Top Left if favorite exists, otherwise Top Right) */}
        {badge && (
          <div className={`absolute top-4 ${onToggleFavorite ? 'left-4' : 'right-4'} z-10`}>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-basak-green text-white shadow-md">
              {badge}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white text-gray-400 hover:text-red-500 transition-colors group/fav"
          >
            <Heart 
              className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/fav:text-red-500'}`} 
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Rating or Category Label */}
        <div className="flex items-center space-x-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-500">{rating ? rating.toFixed(1) : "5.0"}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-heading font-bold text-gray-900 leading-tight mb-2 group-hover:text-basak-orange transition-colors">
          {title}
        </h3>

        {/* Tagline */}
        <p className="text-sm text-gray-500 mb-4 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-basak-green mr-2"></span>
          {tagline}
        </p>

        {/* Price & Spacer */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-gray-900 font-sans tracking-tight">
              {price}
            </span>
            <span className="text-sm font-semibold text-gray-500 ml-1">TL</span>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button 
              className="w-full flex items-center justify-center px-6 py-3.5 bg-basak-orange text-white text-base font-bold rounded-full hover:bg-orange-600 transition-colors shadow-sm active:transform active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) {
                  onAddToCart();
                } else if (onClick) {
                  onClick();
                }
              }}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Sepete Ekle
            </button>
            
            <button className="w-full text-center text-sm font-semibold text-gray-500 hover:text-basak-orange transition-colors">
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
