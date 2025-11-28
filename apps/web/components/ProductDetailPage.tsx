
import React, { useState } from 'react';
import { 
  Star, Minus, Plus, Heart, ShoppingBag, 
  Clock, Check, ArrowLeft 
} from 'lucide-react';
import { CartItem } from '../App';

interface ProductDetailPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
}

// Mock Data for the specific product
const PRODUCT = {
  id: 201,
  title: "Çilekli Çikolatalı Pasta",
  category: "Pastalar",
  price: 650,
  oldPrice: 750, // Discount example
  description: "Yoğun Belçika çikolatalı pandispanya katları arasında özel pastacı kreması ve günlük taze çilekler. Üzeri çikolata ganaj ve bütün çileklerle süslenmiştir.",
  rating: 4.9,
  reviews: 128,
  images: [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop", // Main
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000&auto=format&fit=crop", // Slice
    "https://images.unsplash.com/photo-1626803775151-61d756612fcd?q=80&w=1000&auto=format&fit=crop", // Top view
  ],
  portions: [
    { label: "6-8 Kişilik", priceMod: 0 },
    { label: "10-12 Kişilik", priceMod: 150 },
    { label: "14-16 Kişilik", priceMod: 300 },
  ],
  ingredients: ["Belçika Çikolatası", "Taze Çilek", "Pastacı Kreması", "Yumurta", "Un", "Şeker", "Süt"],
  nutrition: { kcal: 320, fat: "12g", sugar: "18g" } // per slice
};

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onNavigate, onAddToCart }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPortion, setSelectedPortion] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Derived state
  const currentPrice = PRODUCT.price + PRODUCT.portions[selectedPortion].priceMod;
  
  const handleQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    // Add logic to loop for quantity if API allows bulk add, or just add logic in App.tsx handles summing
    // For simplicity, we trigger add multiple times or modify App.tsx to accept quantity.
    // Our App.tsx addToCart adds 1. Let's make it simple and just add 1 'item' representing the stack, or loop.
    // Actually, let's just add one item with the total quantity? 
    // The App.tsx `addToCart` logic: "return [...prev, { ...product, quantity: 1 }];" -> It assumes quantity is 1.
    // Let's loop for now to be safe without changing App.tsx signature too much, OR better:
    // Update App.tsx `addToCart` to handle initial quantity?
    // User didn't ask to refactor App.tsx logic deeply, so I will loop for this specific interaction 
    // or just assume the user adds 1 "unit" of this configuration.
    // Actually, I can pass quantity in the object if I change App.tsx slightly.
    // But to respect the defined interface in App.tsx (Omit<CartItem, 'quantity'>), 
    // I will call it 'quantity' times.
    
    for(let i=0; i<quantity; i++) {
        onAddToCart({
            id: PRODUCT.id,
            title: PRODUCT.title,
            price: currentPrice,
            image: PRODUCT.images[0],
            portion: PRODUCT.portions[selectedPortion].label
        });
    }
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-20">
      
      {/* Navbar Placeholder/Padding if needed */}
      <div className="h-4 md:h-8"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => onNavigate('category')}
            className="flex items-center text-gray-500 hover:text-basak-orange transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ürünlere Dön
          </button>
          <div className="text-sm text-gray-400 hidden sm:block">
            Ana Sayfa / {PRODUCT.category} / <span className="text-gray-900">{PRODUCT.title}</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-soft border border-orange-50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Gallery */}
            <div className="p-6 md:p-8 lg:p-10 bg-white">
              <div className="aspect-square rounded-3xl overflow-hidden mb-4 relative group">
                <img 
                  src={PRODUCT.images[selectedImage]} 
                  alt={PRODUCT.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {PRODUCT.oldPrice && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                    %{(100 - (PRODUCT.price / PRODUCT.oldPrice * 100)).toFixed(0)} İndirim
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                {PRODUCT.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-basak-orange ring-2 ring-orange-100 ring-offset-2' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="p-6 md:p-8 lg:p-12 lg:bg-gray-50/30 flex flex-col h-full">
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-basak-orange font-bold uppercase tracking-wide text-xs bg-orange-50 px-3 py-1 rounded-full">
                    {PRODUCT.category}
                  </span>
                  <div className="flex items-center text-yellow-500 font-bold text-sm">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {PRODUCT.rating} <span className="text-gray-400 font-medium ml-1">({PRODUCT.reviews} Değerlendirme)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-4 leading-tight">
                  {PRODUCT.title}
                </h1>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {PRODUCT.description}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-6 mb-8 flex-grow">
                
                {/* Portions */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Porsiyon Seçimi</label>
                  <div className="flex flex-wrap gap-3">
                    {PRODUCT.portions.map((portion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPortion(idx)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedPortion === idx 
                            ? 'border-basak-orange bg-white text-basak-orange shadow-md' 
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {portion.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-5 h-5 text-basak-green mr-2" />
                    Günlük Taze Üretim
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-5 h-5 text-basak-green mr-2" />
                    45 Dk. Hazırlık Süresi
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mt-auto">
                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="block text-gray-500 text-sm font-medium mb-1">Toplam Tutar</span>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-heading font-extrabold text-basak-orange">
                        {currentPrice * quantity}
                      </span>
                      <span className="text-lg font-bold text-gray-400 ml-1">TL</span>
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                    <button 
                      onClick={() => handleQuantity(-1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-basak-orange hover:bg-white rounded-lg transition-all"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-xl text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => handleQuantity(1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-basak-orange hover:bg-white rounded-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center bg-basak-orange text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Sepete Ekle
                  </button>
                  <button className="flex items-center justify-center p-4 rounded-xl border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
