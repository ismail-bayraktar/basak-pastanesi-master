
import React from 'react';
import { 
  ArrowLeft, Check, Truck, Package, Clock, 
  MapPin, CreditCard, Phone, RefreshCw, 
  ChevronRight, Calendar, Info
} from 'lucide-react';
import { CartItem } from '../App';

interface OrderDetailPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
  orderId?: string;
}

// Mock Data for a specific order
const ORDER_DETAILS = {
  id: "BSK-2024-0012",
  date: "14 Ekim 2024",
  time: "14:30",
  status: "Teslim Edildi",
  paymentMethod: "Kapıda Ödeme (Kredi Kartı)",
  subtotal: 840,
  deliveryFee: 0,
  total: 840,
  address: {
    title: "Ev",
    name: "Ali Yılmaz",
    detail: "Bahçelievler Mah. Atatürk Cad. Yonca Apt. No:12 D:5 Burdur / Merkez",
    note: "Zile basmayın, kapıya bırakın lütfen."
  },
  items: [
    {
      id: 101,
      title: "Fıstıklı Çikolatalı Yaş Pasta",
      portion: "6-8 Kişilik",
      price: 650,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 103,
      title: "Çilekli Magnolia",
      portion: "Standart",
      price: 95,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=200&auto=format&fit=crop"
    }
  ],
  timeline: [
    { status: 'Sipariş Alındı', time: '14:30', completed: true },
    { status: 'Hazırlanıyor', time: '14:45', completed: true },
    { status: 'Yolda', time: '15:15', completed: true },
    { status: 'Teslim Edildi', time: '15:40', completed: true },
  ]
};

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ onNavigate, onAddToCart, orderId }) => {
  
  // Use passed orderId or default to mock
  const displayId = orderId || ORDER_DETAILS.id;

  const handleReorder = () => {
    if (onAddToCart) {
      // Add all items from the order
      ORDER_DETAILS.items.forEach(item => {
        onAddToCart({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          portion: item.portion
        });
      });
      alert(`${displayId} nolu siparişinizdeki ürünler sepete eklendi.`);
    }
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-24">
      
      {/* 1) HEADER SECTION */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-8 md:pt-32 md:pb-8 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <button onClick={() => onNavigate('account')} className="hover:text-basak-orange transition-colors">Hesabım</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <button onClick={() => onNavigate('orders')} className="hover:text-basak-orange transition-colors">Siparişlerim</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="font-bold text-gray-900">Detay</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900">
                  {displayId}
                </h1>
                <span className="bg-green-100 text-basak-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                  {ORDER_DETAILS.status}
                </span>
              </div>
              <p className="text-gray-500 font-medium flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-1.5" />
                {ORDER_DETAILS.date}, {ORDER_DETAILS.time}
              </p>
            </div>

            <button 
              onClick={() => onNavigate('orders')}
              className="hidden md:flex items-center text-gray-500 hover:text-basak-orange font-bold transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Listeye Dön
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (Timeline, Items, Info) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2) STATUS TIMELINE */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50">
              <h2 className="text-lg font-heading font-bold text-gray-900 mb-6">Sipariş Durumu</h2>
              
              {/* Desktop Horizontal Timeline */}
              <div className="hidden md:flex items-center justify-between relative">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10"></div>
                <div className="absolute top-5 left-0 h-1 bg-basak-green transition-all duration-1000 -z-10" style={{ width: '100%' }}></div>

                {ORDER_DETAILS.timeline.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${step.completed ? 'bg-basak-green text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {step.completed ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <span className={`mt-3 text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</span>
                    <span className="text-xs text-gray-400 mt-1">{step.time}</span>
                  </div>
                ))}
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-6 relative pl-4">
                <div className="absolute top-2 left-[19px] h-full w-0.5 bg-gray-100 -z-10"></div>
                {ORDER_DETAILS.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 z-10 ${step.completed ? 'bg-basak-green text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {step.completed ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="pt-2">
                      <p className={`text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</p>
                      <p className="text-xs text-gray-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3) ORDER ITEMS */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50">
              <h2 className="text-lg font-heading font-bold text-gray-900 mb-6">Sipariş İçeriği</h2>
              <div className="space-y-6">
                {ORDER_DETAILS.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                        <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{item.portion}</p>
                      <span className="inline-flex items-center text-xs font-bold text-basak-orange bg-orange-50 px-2 py-1 rounded">
                        {item.quantity} Adet x {item.price} TL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Toplam Ürün Adedi</span>
                <span className="font-bold text-gray-900 text-lg">3</span>
              </div>
            </div>

            {/* 4) DELIVERY & PAYMENT INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Delivery */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50">
                <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-basak-orange mr-2" />
                  Teslimat Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Alıcı</span>
                    <p className="text-gray-900 font-medium">{ORDER_DETAILS.address.name}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Adres</span>
                    <div className="flex items-start">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 mt-0.5">
                        {ORDER_DETAILS.address.title}
                      </span>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {ORDER_DETAILS.address.detail}
                      </p>
                    </div>
                  </div>
                  {ORDER_DETAILS.address.note && (
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                      <p className="text-xs text-basak-orange font-bold flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        Not: {ORDER_DETAILS.address.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50">
                <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 text-basak-orange mr-2" />
                  Ödeme Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Ödeme Yöntemi</span>
                    <p className="text-gray-900 font-medium">{ORDER_DETAILS.paymentMethod}</p>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Ara Toplam</span>
                      <span>{ORDER_DETAILS.subtotal} TL</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Teslimat</span>
                      <span className="text-basak-green font-bold">Ücretsiz</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-2">
                      <span className="font-bold text-gray-900">Toplam Tutar</span>
                      <span className="font-heading font-extrabold text-basak-orange text-xl">{ORDER_DETAILS.total} TL</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN (Actions) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              
              {/* Action Card */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50">
                <h3 className="font-heading font-bold text-gray-900 mb-4">İşlemler</h3>
                
                <button 
                  onClick={handleReorder}
                  className="w-full flex items-center justify-center px-6 py-4 bg-basak-orange text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 transform hover:-translate-y-0.5 mb-4"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Aynı Siparişi Tekrarla
                </button>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-3">Siparişinizle ilgili bir sorun mu var?</p>
                  <a href="tel:02482333072" className="flex items-center justify-center text-basak-orange font-bold hover:underline">
                    <Phone className="w-4 h-4 mr-2" />
                    0248 233 30 72
                  </a>
                </div>
              </div>

              {/* Return Info */}
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Teslimat gerçekleştikten sonra, hijyen kuralları gereği gıda ürünlerinde iade kabul edilmemektedir. Eksik veya hatalı ürün durumunda lütfen hemen bizi arayın.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
