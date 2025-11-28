
import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Filter, Package, Truck, 
  CheckCircle, XCircle, RefreshCw, ChevronRight, 
  MapPin, Clock, Calendar, Home
} from 'lucide-react';
import { CartItem } from '../App';

interface OrderHistoryPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
  onOrderClick?: (orderId: string) => void;
}

type OrderStatus = 'Hazırlanıyor' | 'Yolda' | 'Teslim Edildi' | 'İptal Edildi' | 'Onaylandı';
type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

interface Order {
  id: string;
  date: string;
  time: string;
  items: string;
  total: number;
  status: OrderStatus;
  addressLabel: string;
  image: string; // Representative image
}

// Mock Data
const ALL_ORDERS: Order[] = [
  {
    id: "BSK-2024-0012",
    date: "14 Ekim 2024",
    time: "14:30",
    items: "Fıstıklı Çikolatalı Pasta (6-8 Kişilik) + 2x Çilekli Magnolia",
    total: 745,
    status: "Teslim Edildi",
    addressLabel: "Ev",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "BSK-2024-0015",
    date: "15 Ekim 2024",
    time: "09:15",
    items: "3x İzmir Bomba + 1x Soğuk Kahve",
    total: 240,
    status: "Hazırlanıyor",
    addressLabel: "İş",
    image: "https://images.unsplash.com/photo-1607920593216-a5db321527e9?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "BSK-2024-0014",
    date: "15 Ekim 2024",
    time: "11:00",
    items: "Klasik Ekler (1 Kg)",
    total: 420,
    status: "Yolda",
    addressLabel: "Ev",
    image: "https://images.unsplash.com/photo-1612203985729-1c788006d4b0?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "BSK-2024-0009",
    date: "02 Ekim 2024",
    time: "18:15",
    items: "Klasik Ekler (1 Kg)",
    total: 420,
    status: "Teslim Edildi",
    addressLabel: "Ev",
    image: "https://images.unsplash.com/photo-1612203985729-1c788006d4b0?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "BSK-2024-0004",
    date: "20 Eylül 2024",
    time: "10:00",
    items: "Karışık Kuru Pasta (1 Kg)",
    total: 350,
    status: "İptal Edildi",
    addressLabel: "Anne Evi",
    image: "https://images.unsplash.com/photo-1597528662465-5bcbf96f497a?q=80&w=200&auto=format&fit=crop"
  }
];

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate, onAddToCart, onOrderClick }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredOrders = ALL_ORDERS.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['Hazırlanıyor', 'Yolda', 'Onaylandı'].includes(order.status);
    if (activeFilter === 'completed') return order.status === 'Teslim Edildi';
    if (activeFilter === 'cancelled') return order.status === 'İptal Edildi';
    return true;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Teslim Edildi': return 'bg-green-100 text-basak-green border-green-200';
      case 'Hazırlanıyor':
      case 'Yolda': 
      case 'Onaylandı': return 'bg-orange-100 text-basak-orange border-orange-200';
      case 'İptal Edildi': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-900';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Teslim Edildi': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case 'Yolda': return <Truck className="w-4 h-4 mr-1.5" />;
      case 'Hazırlanıyor': return <Package className="w-4 h-4 mr-1.5" />;
      case 'İptal Edildi': return <XCircle className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  const handleReorder = (order: Order) => {
    if (onAddToCart) {
      // Mock adding single item from order for demo
      onAddToCart({
        id: 999, // dummy ID
        title: "Sipariş Tekrarı: " + order.items.split('+')[0], 
        price: order.total,
        image: order.image,
        portion: "Standart"
      });
      alert(`${order.id} numaralı siparişteki ürünler sepete eklendi.`);
    }
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-20">
      
      {/* 1) HEADER SECTION */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-8 md:pt-32 md:pb-8 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <button onClick={() => onNavigate('home')} className="hover:text-basak-orange transition-colors">Anasayfa</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <button onClick={() => onNavigate('account')} className="hover:text-basak-orange transition-colors">Hesabım</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="font-bold text-gray-900">Siparişlerim</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-2">
                Siparişlerim
              </h1>
              <p className="text-gray-600 font-medium">
                Geçmiş siparişlerinizi görüntüleyin ve tekrar sipariş verin.
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl overflow-x-auto max-w-full no-scrollbar">
              {(['all', 'active', 'completed', 'cancelled'] as FilterType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all
                    ${activeFilter === tab 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}
                  `}
                >
                  {tab === 'all' && 'Tümü'}
                  {tab === 'active' && 'Aktif'}
                  {tab === 'completed' && 'Tamamlandı'}
                  {tab === 'cancelled' && 'İptal'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2) ORDER LIST */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-orange-50 shadow-soft">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
               <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h3>
            <p className="text-gray-500 mb-6">Bu kategoride gösterilecek siparişiniz yok.</p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="text-basak-orange font-bold hover:underline"
            >
              Tüm siparişleri göster
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-orange-50 hover:shadow-md transition-all group"
              >
                {/* Top Row: ID, Date, Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100">
                      <img src={order.image} alt="Order Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-lg flex items-center">
                        {order.id}
                        <ChevronRight className="w-4 h-4 ml-1 text-gray-300" />
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {order.date} 
                        <span className="mx-2">•</span> 
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {order.time}
                      </div>
                    </div>
                  </div>

                  <div className={`
                    inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border self-start md:self-auto
                    ${getStatusColor(order.status)}
                  `}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                {/* Middle Row: Items & Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <p className="text-sm font-bold text-gray-400 uppercase mb-2">Sipariş Özeti</p>
                    <p className="text-gray-700 font-medium leading-relaxed">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-2">Teslimat</p>
                    <div className="flex items-center text-gray-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-2">
                         <MapPin className="w-3 h-3" />
                      </div>
                      {order.addressLabel} Adresi
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Total & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-center sm:text-left w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <span className="text-sm text-gray-500 font-medium mr-2">Toplam Tutar:</span>
                    <span className="text-xl font-heading font-extrabold text-basak-orange">{order.total} TL</span>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => onOrderClick && onOrderClick(order.id)}
                      className="flex-1 sm:flex-none py-3 px-6 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:border-basak-orange hover:text-basak-orange transition-colors"
                    >
                      Detaylar
                    </button>
                    {order.status !== 'İptal Edildi' && (
                      <button 
                        onClick={() => handleReorder(order)}
                        className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-basak-orange text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 flex items-center justify-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tekrarla
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* 3) LOAD MORE */}
        {filteredOrders.length > 0 && (
          <div className="mt-12 text-center">
            <button className="inline-flex items-center justify-center px-12 py-4 bg-white border-2 border-orange-100 text-basak-orange font-bold rounded-full hover:bg-basak-orange hover:text-white transition-all shadow-soft transform hover:-translate-y-1">
              Daha Fazla Göster
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default OrderHistoryPage;
