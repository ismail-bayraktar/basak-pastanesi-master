
import React from 'react';
import { X, Minus, Plus, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../App';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number | string, delta: number) => void;
  onRemoveItem: (id: number | string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}) => {
  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-end md:items-stretch">
      
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-basak-cream/90 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className={`
        relative w-full md:w-[480px] bg-white shadow-2xl flex flex-col
        transition-transform duration-300 ease-out transform
        ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0'}
        h-[90vh] md:h-full rounded-t-[2.5rem] md:rounded-none md:rounded-l-[2.5rem]
      `}>
        
        {/* 1) HEADER */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-gray-900">Sepetiniz</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">{cartItems.length} ürün eklendi</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 -mr-3 text-gray-400 hover:text-basak-orange hover:bg-orange-50 rounded-full transition-all"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* 2) CART ITEM LIST */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-start group">
              {/* Thumbnail */}
              <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0 flex flex-col justify-between h-24 py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-heading font-bold text-gray-900 leading-tight truncate pr-2">
                      {item.title}
                    </h3>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{item.portion || 'Standart'}</p>
                </div>

                <div className="flex items-end justify-between">
                  <span className="font-bold text-gray-900 text-lg">
                    {item.price * item.quantity} TL
                  </span>
                  
                  {/* Qty Control */}
                  <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-basak-orange hover:bg-white rounded-md transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-basak-orange hover:bg-white rounded-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {cartItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Sepetinizde ürün bulunmamaktadır.</p>
              <button 
                onClick={() => { onClose(); onNavigate && onNavigate('category'); }}
                className="text-basak-orange font-bold hover:underline"
              >
                Alışverişe Başla
              </button>
            </div>
          )}
        </div>

        {/* 3) SUMMARY & ACTIONS */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-t-[2rem] md:rounded-none md:rounded-tl-[2.5rem]">
          
          {/* Trust Signal */}
          <div className="flex items-start mb-6 bg-white p-4 rounded-xl border border-green-100 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-basak-green mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-gray-600">
              <span className="text-basak-green">Günlük taze üretim</span> ve Burdur içi kapıda ödeme güvencesi.
            </p>
          </div>

          {/* Totals */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Ara Toplam</span>
              <span>{subtotal.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Teslimat</span>
              <span className="text-basak-green font-bold">Ücretsiz</span>
            </div>
            <div className="flex justify-between items-end border-t border-gray-200 pt-4">
              <span className="text-lg font-bold text-gray-900">Toplam</span>
              <span className="text-3xl font-heading font-extrabold text-basak-orange">
                {total.toLocaleString('tr-TR')} <span className="text-lg text-gray-500 font-bold">TL</span>
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button 
              disabled={cartItems.length === 0}
              onClick={() => onNavigate && onNavigate('checkout')}
              className="w-full flex items-center justify-center px-6 py-4 bg-basak-orange text-white text-lg font-bold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ödemeye Devam Et
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('cart')}
              className="w-full py-4 text-center font-bold text-gray-500 hover:text-basak-orange transition-colors"
            >
              Sepete Git
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartDrawer;
