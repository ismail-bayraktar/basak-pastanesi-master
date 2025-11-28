
import React, { useState } from 'react';
import { Filter, ChevronDown, Check, X, ArrowUpDown, ChevronRight, Home } from 'lucide-react';
import ProductCard from './ProductCard';
import { CartItem } from '../App';

interface CategoryPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
}

// Mock Data for "Pastalar"
const PRODUCTS = [
  {
    id: 201,
    title: "Fıstıklı Çikolatalı Yaş Pasta",
    price: 650,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop",
    badge: "Çok Satan",
    tagline: "Bol fıstıklı, günlük üretim",
    rating: 4.9,
    category: "Çikolatalı"
  },
  {
    id: 202,
    title: "Çilekli Magnolia Pasta",
    price: 580,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600&auto=format&fit=crop",
    badge: "Mevsimsel",
    tagline: "Taze çileklerle",
    rating: 4.8,
    category: "Meyveli"
  },
  {
    id: 203,
    title: "Klasik Karaorman Meyveli",
    price: 600,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop",
    tagline: "Vişne ve çikolata uyumu",
    rating: 4.7,
    category: "Çikolatalı"
  },
  {
    id: 204,
    title: "Muzlu Rulo Pasta (Bütün)",
    price: 450,
    image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?q=80&w=600&auto=format&fit=crop",
    tagline: "Hafif lezzet sevenlere",
    rating: 4.6,
    category: "Meyveli"
  },
  {
    id: 205,
    title: "Krokanlı Karamelli Pasta",
    price: 620,
    image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=600&auto=format&fit=crop",
    badge: "Yeni",
    tagline: "Ev yapımı krokan ile",
    rating: 4.9,
    category: "Krokanlı"
  },
  {
    id: 206,
    title: "Frambuazlı Cheesecake",
    price: 550,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop",
    tagline: "Orijinal tarif",
    rating: 4.8,
    category: "Meyveli"
  },
  {
    id: 207,
    title: "Özel Ganajlı Çikolatalı",
    price: 700,
    image: "https://images.unsplash.com/photo-1588195538326-c5f1f23fa438?q=80&w=600&auto=format&fit=crop",
    badge: "Şefin Seçimi",
    tagline: "Yoğun Belçika çikolatası",
    rating: 5.0,
    category: "Çikolatalı"
  },
  {
    id: 208,
    title: "Profiterollü Pasta",
    price: 680,
    image: "https://images.unsplash.com/photo-1551879400-111a9087cd86?q=80&w=600&auto=format&fit=crop",
    tagline: "İçi krema dolgulu toplar",
    rating: 4.9,
    category: "Özel"
  }
];

const FILTER_TYPES = ['Çikolatalı', 'Meyveli', 'Krokanlı', 'Fıstıklı', 'Özel'];

const CategoryPage: React.FC<CategoryPageProps> = ({ onNavigate, onAddToCart }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans">
      
      {/* 1) Top Bar / Breadcrumb Area */}
      <div className="bg-white border-b border-orange-100 pb-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <button onClick={() => onNavigate('home')} className="hover:text-basak-orange transition-colors flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Anasayfa
            </button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="font-semibold text-gray-900">Pastalar</span>
          </nav>

          {/* Title & Description */}
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-4">
              Pastalar
            </h1>
            <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-2xl">
              Doğum günü, kutlama ve özel günleriniz için günlük taze pasta çeşitlerimiz. 
              <span className="text-basak-orange font-semibold ml-1">Burdur içi adrese teslim</span> ve 
              <span className="text-basak-green font-semibold ml-1">kapıda ödeme</span> imkanı.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* 2) Sidebar Filter (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            
            {/* Filter Section: Price */}
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-orange-50/50">
              <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-basak-orange rounded-full mr-3"></span>
                Fiyat Aralığı
              </h3>
              <div className="flex items-center space-x-2">
                 <input type="number" placeholder="Min" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-basak-orange" />
                 <span className="text-gray-400">-</span>
                 <input type="number" placeholder="Max" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-basak-orange" />
              </div>
            </div>

            {/* Filter Section: Type */}
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-orange-50/50">
              <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-basak-orange rounded-full mr-3"></span>
                Pasta Türü
              </h3>
              <div className="space-y-3">
                {FILTER_TYPES.map(type => (
                  <label key={type} className="flex items-center cursor-pointer group">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedTypes.includes(type) ? 'bg-basak-orange border-basak-orange' : 'border-gray-300 bg-white group-hover:border-basak-orange'}`}>
                       {selectedTypes.includes(type) && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    <span className="ml-3 text-gray-700 font-medium group-hover:text-basak-orange transition-colors">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Delivery & Payment */}
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-orange-50/50">
              <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center">
                 <span className="w-1.5 h-6 bg-basak-green rounded-full mr-3"></span>
                 Teslimat & Ödeme
              </h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-basak-green"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Aynı Gün Teslim</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-basak-green"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Kapıda Ödeme</span>
                </label>
              </div>
            </div>

          </aside>

          {/* Main Content Area */}
          <div className="flex-grow">
            
            {/* Mobile Controls (Sticky Filter + Sort) */}
            <div className="lg:hidden sticky top-20 z-30 bg-basak-cream/95 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 border-b border-orange-100 flex gap-4">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl shadow-sm"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtrele
              </button>
              
              <div className="flex-1 relative">
                <select 
                  className="w-full h-full appearance-none bg-white border border-gray-200 text-gray-700 font-bold py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-basak-orange"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Önerilen</option>
                  <option value="bestseller">Çok Satan</option>
                  <option value="price_asc">Fiyat Artan</option>
                  <option value="price_desc">Fiyat Azalan</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Desktop Sort Bar */}
            <div className="hidden lg:flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-orange-50">
              <span className="text-gray-500 font-medium">Topam <strong className="text-gray-900">{PRODUCTS.length}</strong> ürün listeleniyor</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 font-medium">Sırala:</span>
                <div className="relative">
                  <select 
                    className="appearance-none bg-gray-50 border-none text-gray-900 font-bold py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:ring-2 focus:ring-basak-orange"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Önerilen Sıralama</option>
                    <option value="bestseller">En Çok Satanlar</option>
                    <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3) Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {PRODUCTS.map(product => (
                <ProductCard 
                  key={product.id}
                  {...product}
                  onClick={() => onNavigate('product')}
                  onAddToCart={() => onAddToCart && onAddToCart(product)}
                />
              ))}
            </div>

            {/* 4) Pagination / Load More */}
            <div className="mt-12 flex justify-center">
              <button className="bg-white border-2 border-orange-100 text-basak-orange font-bold py-4 px-12 rounded-full hover:bg-basak-orange hover:text-white transition-all shadow-soft text-lg transform hover:-translate-y-1">
                Daha Fazla Göster
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer (Overlay) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          
          {/* Drawer Content */}
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-heading font-bold text-gray-900">Filtrele</h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               {/* Mobile Filter: Price */}
               <div>
                <h3 className="font-bold text-gray-900 mb-4">Fiyat Aralığı</h3>
                <div className="flex items-center space-x-2">
                   <input type="number" placeholder="Min" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-base" />
                   <span className="text-gray-400">-</span>
                   <input type="number" placeholder="Max" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-base" />
                </div>
              </div>

              {/* Mobile Filter: Type */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Pasta Türü</h3>
                <div className="space-y-4">
                  {FILTER_TYPES.map(type => (
                    <label key={type} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium text-lg">{type}</span>
                      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center ${selectedTypes.includes(type) ? 'bg-basak-orange border-basak-orange' : 'border-gray-300'}`}>
                         {selectedTypes.includes(type) && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-basak-orange text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
              >
                Sonuçları Göster ({PRODUCTS.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryPage;
