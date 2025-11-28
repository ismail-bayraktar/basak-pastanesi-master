
import React from 'react';
import { Check, Home, Phone } from 'lucide-react';

interface OrderSuccessProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-basak-cream flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-soft max-w-lg w-full text-center border border-orange-50 relative overflow-hidden">
        
        {/* Confetti / Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-basak-orange to-basak-green"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-green-100 text-basak-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce-slow">
            <Check className="w-12 h-12" strokeWidth={3} />
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
            Siparişiniz Alındı!
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Teşekkürler. Siparişiniz başarıyla oluşturuldu ve en kısa sürede hazırlanmaya başlanacak.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Sipariş Numarası</p>
            <p className="text-3xl font-mono font-bold text-gray-900">#39204</p>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Sipariş detaylarınızla ilgili sizi arayabiliriz.<br/>
            Herhangi bir sorunuz olursa: <a href="tel:02482333072" className="text-basak-orange font-bold">0248 233 30 72</a>
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('home')}
              className="w-full flex items-center justify-center px-8 py-4 bg-basak-orange text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Anasayfaya Dön
            </button>
            <button 
              onClick={() => window.open('tel:02482333072')}
              className="w-full flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 text-lg font-bold rounded-xl hover:border-basak-orange hover:text-basak-orange transition-all"
            >
              <Phone className="w-5 h-5 mr-2" />
              Bizi Ara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
