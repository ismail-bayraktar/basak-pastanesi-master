
import React from 'react';
import { 
  Package, User as UserIcon, Heart, MapPin, RefreshCw, 
  ChevronRight, LogOut, Gift, Star, Clock, 
  Settings, CreditCard 
} from 'lucide-react';
import { CartItem } from '../App';
import { useAuth } from '@/context/AuthContext';

interface AccountPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites' | 'loyalty') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
  onOrderClick?: (orderId: string) => void;
}

// Mock Data for the dashboard
const USER = {
  name: "Ali Yılmaz",
  email: "ali.yilmaz@example.com",
  phone: "0532 555 44 33",
  loyaltyPoints: 120,
  loyaltyTarget: 500,
  savedAddresses: 2
};

const FAVORITES = [
  { id: 101, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop", title: "Fıstıklı Pasta" },
  { id: 103, image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=200&auto=format&fit=crop", title: "Magnolia" },
  { id: 104, image: "https://images.unsplash.com/photo-1597528662465-5bcbf96f497a?q=80&w=200&auto=format&fit=crop", title: "Kuru Pasta" },
];

const ORDERS = [
  {
    id: "BSK-2024-0012",
    date: "14 Ekim 2024, 14:30",
    status: "Teslim Edildi",
    statusColor: "green",
    total: 745,
    items: "Fıstıklı Çikolatalı Pasta (6-8 Kişilik), 2x Çilekli Magnolia",
    canReorder: true
  },
  {
    id: "BSK-2024-0009",
    date: "02 Ekim 2024, 18:15",
    status: "Teslim Edildi",
    statusColor: "green",
    total: 420,
    items: "Klasik Ekler (1 Kg)",
    canReorder: true
  },
  {
    id: "BSK-2024-0004",
    date: "20 Eylül 2024, 10:00",
    status: "İptal Edildi",
    statusColor: "red",
    total: 350,
    items: "Karışık Kuru Pasta (1 Kg)",
    canReorder: false
  }
];

const CAMPAIGNS = [
  { id: 1, title: "Haftanın Tatlısı", desc: "Magnolia alana çay ikramı", color: "orange" },
  { id: 2, title: "Doğum Günü İndirimi", desc: "Bu ayki siparişinizde %10 indirim", color: "green" },
];

const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onAddToCart, onOrderClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const handleReorder = (orderId: string) => {
    // Simulate reordering by adding a dummy item
    if (onAddToCart) {
      onAddToCart({
        id: 101, // Mock ID
        title: "Fıstıklı Çikolatalı Pasta", // Mock Data based on order
        price: 650,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop",
        portion: "6-8 Kişilik"
      });
      // In a real app, this would add all items from the order
      alert(`${orderId} nolu siparişinizdeki ürünler sepete eklendi.`);
    }
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-20">
      
      {/* 1) HEADER SECTION */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-2">
                Merhaba, {user?.name || 'Misafir'}
              </h1>
              <p className="text-gray-600 font-medium text-lg">
                Siparişlerinizi yönetin, tekrar sipariş verin ve avantajlarınızı görün.
              </p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar
               </button>
               <button 
                 onClick={handleLogout}
                 className="flex items-center justify-center px-4 py-2 bg-red-50 rounded-xl text-red-500 font-bold hover:bg-red-100 transition-colors"
               >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* 2) QUICK SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Last Order */}
          <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-orange-50 relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[4rem] -mr-4 -mt-4 z-0"></div>
             <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-100 text-basak-orange rounded-full flex items-center justify-center mr-3">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900">Son Sipariş</h3>
                </div>
                <p className="text-sm text-gray-500 mb-1">14 Ekim 2024</p>
                <p className="font-bold text-gray-900 text-lg mb-4">745 TL</p>
                <button 
                  onClick={() => handleReorder(ORDERS[0].id)}
                  className="w-full py-2 bg-basak-orange text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tekrarla
                </button>
             </div>
          </div>

          {/* Card 2: Loyalty */}
          <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-orange-50 relative overflow-hidden group hover:shadow-md transition-all">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 text-basak-green rounded-full flex items-center justify-center mr-3">
                      <Gift className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-gray-900">Puanlarım</h3>
                  </div>
                  <span className="text-2xl font-heading font-extrabold text-basak-green">{USER.loyaltyPoints}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                  <div className="bg-basak-green h-2.5 rounded-full" style={{ width: `${(USER.loyaltyPoints / USER.loyaltyTarget) * 100}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mb-4">Her 500 puanda 1 pasta dilimi hediye!</p>
                
                <button 
                  onClick={() => onNavigate('loyalty')}
                  className="w-full py-2 border-2 border-green-100 text-basak-green text-sm font-bold rounded-xl hover:bg-green-50 transition-colors"
                >
                  Puan Geçmişi
                </button>
             </div>
          </div>

          {/* Card 3: Favorites */}
          <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-orange-50 relative overflow-hidden group hover:shadow-md transition-all">
             <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900">Favoriler</h3>
                </div>
                
                <div className="flex -space-x-3 mb-5 pl-2">
                  {FAVORITES.map(fav => (
                    <img key={fav.id} src={fav.image} alt={fav.title} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">
                    +5
                  </div>
                </div>
                
                <button 
                  onClick={() => onNavigate('favorites')} 
                  className="w-full py-2 border-2 border-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:border-basak-orange hover:text-basak-orange transition-colors"
                >
                  Tümünü Gör
                </button>
             </div>
          </div>

          {/* Card 4: Addresses */}
          <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-orange-50 relative overflow-hidden group hover:shadow-md transition-all">
             <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900">Adresler</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">Ev</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">İş</span>
                  <span className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-basak-orange hover:text-basak-orange cursor-pointer transition-colors">
                    +
                  </span>
                </div>
                
                <button className="w-full py-2 border-2 border-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:border-basak-orange hover:text-basak-orange transition-colors">
                  Adresleri Yönet
                </button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3) MAIN CONTENT: ORDER LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900">Son Siparişleriniz</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Geçmiş siparişlerinizi görüntüleyin ve takip edin.</p>
              </div>
            </div>

            <div className="space-y-4">
              {ORDERS.map((order) => (
                <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-soft border border-gray-100 hover:border-orange-200 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-basak-orange">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block font-heading font-bold text-gray-900">{order.id}</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-${order.statusColor}-50 text-${order.statusColor === 'green' ? 'basak-green' : order.statusColor === 'red' ? 'red-500' : 'basak-orange'}`}>
                         {order.status}
                       </span>
                       <span className="font-bold text-gray-900 text-lg">{order.total} TL</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm font-medium line-clamp-1">{order.items}</p>
                  </div>

                  <div className="flex gap-3">
                    {order.canReorder && (
                      <button 
                        onClick={() => handleReorder(order.id)}
                        className="flex-1 md:flex-none px-6 py-2 bg-basak-orange text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tekrar Sipariş Ver
                      </button>
                    )}
                    <button 
                      onClick={() => onOrderClick && onOrderClick(order.id)}
                      className="flex-1 md:flex-none px-6 py-2 bg-white border-2 border-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:border-basak-orange hover:text-basak-orange transition-colors"
                    >
                      Detaylar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => onNavigate('orders')}
              className="w-full py-4 text-center font-bold text-gray-500 hover:text-basak-orange transition-colors"
            >
              Tüm Sipariş Geçmişini Görüntüle
            </button>
          </div>

          {/* 4) SIDEBAR: CAMPAIGNS & MENU */}
          <div className="space-y-8">
            
            {/* Campaigns */}
            <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-orange-50">
              <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 text-basak-orange mr-2" fill="currentColor" />
                Sizin İçin Kampanyalar
              </h3>
              <div className="space-y-4">
                {CAMPAIGNS.map(camp => (
                  <div key={camp.id} onClick={() => onNavigate('loyalty')} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-orange-50 hover:border-orange-100 transition-colors cursor-pointer group">
                    <h4 className={`font-bold text-gray-900 mb-1 group-hover:text-basak-orange`}>{camp.title}</h4>
                    <p className="text-sm text-gray-500">{camp.desc}</p>
                    <div className="mt-3 flex items-center text-xs font-bold text-basak-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      Fırsatı İncele <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Menu */}
            <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-gray-100">
               <h3 className="font-heading font-bold text-gray-900 mb-4">Hesap Ayarları</h3>
               <nav className="space-y-1">
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors text-left group">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-basak-orange" />
                      Profil Bilgilerim
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors text-left group">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400 group-hover:text-basak-orange" />
                      Adreslerim
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors text-left group">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-basak-orange" />
                      Kayıtlı Kartlarım
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                 </button>
                 <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-red-500 font-medium transition-colors text-left"
                 >
                    <div className="flex items-center">
                      <LogOut className="w-5 h-5 mr-3" />
                      Çıkış Yap
                    </div>
                 </button>
               </nav>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountPage;
