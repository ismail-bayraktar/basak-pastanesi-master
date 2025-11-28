
import React from 'react';
import { Trash2, Minus, Plus, ArrowRight, ArrowLeft, Store, Truck, CreditCard } from 'lucide-react';
import { CartItem } from '../App';

interface CartPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number | string, delta: number) => void;
  onRemoveItem: (id: number | string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onNavigate, cartItems, onUpdateQuantity, onRemoveItem }) => {

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCost = 0; 
  const total = subtotal + deliveryCost;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-basak-cream flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 bg-white p-12 rounded-[2.5rem] shadow-soft max-w-lg w-full border border-orange-50">
          <div className="w-24 h-24 bg-orange-50 text-basak-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-gray-900">Sepetiniz Boş</h2>
          <p className="text-gray-600 text-lg">Lezzetli ürünlerimizi keşfetmek için hemen alışverişe başlayın.</p>
          <button 
            onClick={() => onNavigate('category')}
            className="inline-flex items-center justify-center px-8 py-4 bg-basak-orange text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
          >
            Ürünleri İncele
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basak-cream pb-32 md:pb-16">
      
      {/* 1) HEADER & BREADCRUMB */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-8 md:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <button onClick={() => onNavigate('home')} className="hover:text-basak-orange transition-colors">Anasayfa</button>
            <span className="mx-2 text-gray-300">/</span>
            <span className="font-bold text-gray-900">Sepetim</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-2">
            Sepetiniz
          </h1>
          <p className="text-gray-600 font-medium">Siparişinizi tamamlamadan önce sepetinizi kontrol edin.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* 2) CART ITEM LIST (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Desktop Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-bold text-gray-400 uppercase tracking-wider px-6 pb-2 border-b border-gray-200">
              <div className="col-span-6">Ürün</div>
              <div className="col-span-2 text-center">Birim Fiyat</div>
              <div className="col-span-2 text-center">Adet</div>
              <div className="col-span-2 text-right">Tutar</div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-4 md:p-6 shadow-soft border border-transparent hover:border-orange-100 transition-all flex flex-col md:grid md:grid-cols-12 gap-6 items-center">
                  
                  {/* Product Info */}
                  <div className="flex items-center w-full md:col-span-6">
                    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 md:ml-6 flex-grow">
                      <h3 className="text-lg font-heading font-bold text-gray-900 mb-1 leading-tight">{item.title}</h3>
                      <p className="text-sm text-gray-500 font-medium mb-3">{item.portion || 'Standart Porsiyon'}</p>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center md:hidden"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Kaldır
                      </button>
                    </div>
                  </div>

                  {/* Unit Price (Desktop) */}
                  <div className="hidden md:block col-span-2 text-center text-gray-600 font-medium text-lg">
                    {item.price} TL
                  </div>

                  {/* Quantity */}
                  <div className="w-full md:col-span-2 flex justify-between md:justify-center items-center">
                    <span className="md:hidden font-bold text-gray-900 text-lg">{item.price} TL</span>
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 shadow-sm">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-basak-orange hover:bg-white rounded-lg transition-all"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-10 text-center font-bold text-lg text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-basak-orange hover:bg-white rounded-lg transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Delete (Desktop) */}
                  <div className="w-full md:col-span-2 flex justify-between md:flex-col md:items-end items-center">
                    <span className="text-xl font-bold text-basak-orange md:mb-2">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                    </span>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="hidden md:flex text-gray-300 hover:text-red-500 transition-colors"
                      title="Sepetten Kaldır"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Back to Shopping */}
            <button 
              onClick={() => onNavigate('category')}
              className="inline-flex items-center font-bold text-gray-500 hover:text-basak-orange transition-colors mt-6 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Alışverişe Devam Et
            </button>
          </div>

          {/* 3) ORDER SUMMARY (Right Column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-soft border border-orange-50 p-6 md:p-8 sticky top-24">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 text-lg font-medium">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between text-gray-600 text-lg font-medium">
                  <span>Teslimat Ücreti</span>
                  <span className="text-sm bg-green-100 text-basak-green px-2 py-1 rounded-lg">Ücretsiz</span>
                </div>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold text-gray-900">Toplam</span>
                  <span className="text-3xl font-heading font-extrabold text-basak-orange">
                    {total.toLocaleString('tr-TR')} <span className="text-lg text-gray-400">TL</span>
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={() => onNavigate('checkout')}
                className="w-full flex items-center justify-center px-6 py-4 bg-basak-orange text-white text-lg font-bold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:scale-95 mb-4"
              >
                Teslimat Bilgilerine Geç
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button className="w-full text-center text-sm font-semibold text-gray-500 hover:text-basak-orange transition-colors">
                Kurumsal fatura mı kesilecek?
              </button>

              {/* Trust & Benefits Block */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-start">
                  <Store className="w-5 h-5 text-basak-green mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-800 text-sm">1985’ten beri Burdur’da</span>
                    <span className="text-xs text-gray-500">Güvenilir mahalle pastaneniz</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Truck className="w-5 h-5 text-basak-green mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-800 text-sm">Günlük Taze Üretim</span>
                    <span className="text-xs text-gray-500">Sipariş üzerine hazırlanır</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-basak-green mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-800 text-sm">Kapıda Ödeme</span>
                    <span className="text-xs text-gray-500">Nakit veya Kredi Kartı ile</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-40">
         <div className="flex gap-4 items-center">
            <div className="flex flex-col">
               <span className="text-xs text-gray-500 font-medium">Toplam Tutar</span>
               <span className="text-2xl font-bold text-basak-orange">{total.toLocaleString('tr-TR')} TL</span>
            </div>
            <button 
              onClick={() => onNavigate('checkout')}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-basak-orange text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Teslimat Bilgilerine Geç
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
         </div>
      </div>

    </div>
  );
};

export default CartPage;
