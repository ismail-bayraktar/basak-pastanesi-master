
import React from 'react';
import { 
  ArrowLeft, Gift, ChevronRight, Star, 
  TrendingUp, ShoppingBag, CreditCard, 
  Calendar, Clock, Award, CheckCircle2
} from 'lucide-react';
import { CartItem } from '../App';

interface LoyaltyPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites' | 'loyalty') => void;
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void;
}

// Mock Data
const USER_POINTS = 240;
const TARGET_POINTS = 500;
const POINT_HISTORY = [
  { id: 1, action: "Sipariş Kazanımı (#BSK-2024-0012)", date: "14 Ekim", points: "+45" },
  { id: 2, action: "Yorum Yapma Bonusu", date: "10 Ekim", points: "+20" },
  { id: 3, action: "Arkadaş Daveti", date: "01 Ekim", points: "+50" },
];

const CAMPAIGNS = [
  {
    id: 1,
    title: "Haftalık Pasta İndirimi %10",
    description: "Bu hafta tüm çikolatalı yaş pastalarda geçerli %10 indirim fırsatını kaçırma!",
    validUntil: "20 Ekim 2024",
    type: "active", // orange
    badge: "Size Özel",
    bgPattern: "bg-orange-50"
  },
  {
    id: 2,
    title: "3 Al 2 Öde: Magnolia",
    description: "Magnolia tutkunlarına özel, sepetteki 3. magnolia bizden hediye.",
    validUntil: "30 Ekim 2024",
    type: "special", // green
    badge: "Fırsat",
    bgPattern: "bg-green-50"
  },
  {
    id: 3,
    title: "Kahve Yanı Kurabiye İkramı",
    description: "Herhangi bir kahve siparişinin yanında 2 adet tereyağlı kurabiye hediye.",
    validUntil: "Süresiz",
    type: "general", // gray/cream
    badge: "Genel",
    bgPattern: "bg-gray-50"
  }
];

const LoyaltyPage: React.FC<LoyaltyPageProps> = ({ onNavigate, onAddToCart }) => {
  
  const progressPercentage = Math.min(100, (USER_POINTS / TARGET_POINTS) * 100);

  const handleUsePoints = () => {
    alert("Puanlarınızı ödeme ekranında kullanabilirsiniz!");
  };

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-24">
      
      {/* 1) HEADER SECTION */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <button onClick={() => onNavigate('home')} className="hover:text-basak-orange transition-colors">Anasayfa</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <button onClick={() => onNavigate('account')} className="hover:text-basak-orange transition-colors">Hesabım</button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="font-bold text-gray-900">Sadakat Programı</span>
          </nav>

          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-orange-100 text-basak-orange rounded-2xl">
                <Award className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900">
                Sadakat Programı
                </h1>
                <p className="text-lg text-gray-600 font-medium mt-1">
                Sipariş verdikçe puan kazanın, lezzetlerle ödüllendirin.
                </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* 2) LOYALTY SUMMARY CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-soft border border-orange-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-[10rem] opacity-50 pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                
                {/* Left: Points & Progress */}
                <div>
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Toplam Puanınız</span>
                    <div className="text-6xl font-heading font-extrabold text-basak-orange mt-2 mb-6">
                        {USER_POINTS}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-2 flex justify-between text-sm font-bold text-gray-600">
                        <span>0</span>
                        <span>Hedef: {TARGET_POINTS}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-basak-orange to-orange-400 h-4 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-gray-600 font-medium mb-8 flex items-center">
                        <Gift className="w-5 h-5 text-basak-green mr-2" />
                        <span className="font-bold text-gray-900 mr-1">{TARGET_POINTS - USER_POINTS} puan</span> 
                        daha kazanırsanız 1 Pasta Dilimi hediye!
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={handleUsePoints}
                            disabled={USER_POINTS < 100}
                            className="flex-1 sm:flex-none px-8 py-4 bg-basak-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Puanlarımı Kullan
                        </button>
                        <button 
                            onClick={() => onNavigate('category')}
                            className="flex-1 sm:flex-none px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-basak-orange hover:text-basak-orange transition-all"
                        >
                            Puan Kazan
                        </button>
                    </div>
                </div>

                {/* Right: History & Info */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 h-full">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        Son Hareketler
                    </h3>
                    <div className="space-y-3">
                        {POINT_HISTORY.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.action}</p>
                                    <p className="text-xs text-gray-400">{item.date}</p>
                                </div>
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg text-sm">
                                    {item.points}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-center text-xs font-bold text-gray-400 hover:text-basak-orange transition-colors">
                        Tüm Geçmişi Gör
                    </button>
                </div>

            </div>
        </div>

        {/* 3) HOW IT WORKS */}
        <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">Nasıl Çalışır?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        icon: ShoppingBag,
                        title: "Sipariş Ver",
                        desc: "Her 1 TL alışverişinizde 1 Puan kazanın.",
                        color: "orange"
                    },
                    {
                        icon: TrendingUp,
                        title: "Puan Biriktir",
                        desc: "Puanlarınız hesabınızda süresiz olarak birikir.",
                        color: "green"
                    },
                    {
                        icon: CreditCard,
                        title: "Harcarken Kazan",
                        desc: "Biriken puanlarınızı ödeme ekranında indirim olarak kullanın.",
                        color: "orange"
                    }
                ].map((step, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 text-center group hover:-translate-y-1 transition-transform duration-300">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${step.color === 'orange' ? 'bg-orange-50 text-basak-orange group-hover:bg-orange-100' : 'bg-green-50 text-basak-green group-hover:bg-green-100'}`}>
                            <step.icon className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* 4) PERSONALIZED CAMPAIGNS */}
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold text-gray-900">Sizin İçin Kampanyalar</h2>
                <span className="text-sm font-bold text-basak-green bg-green-50 px-3 py-1 rounded-full animate-pulse">
                    {CAMPAIGNS.length} Fırsat
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CAMPAIGNS.map((camp) => (
                    <div key={camp.id} className={`rounded-3xl p-6 md:p-8 border transition-all hover:shadow-lg ${camp.bgPattern} ${camp.type === 'active' ? 'border-orange-200' : camp.type === 'special' ? 'border-green-200' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                camp.type === 'active' ? 'bg-white text-basak-orange shadow-sm' : 
                                camp.type === 'special' ? 'bg-white text-basak-green shadow-sm' : 
                                'bg-gray-200 text-gray-600'
                            }`}>
                                {camp.badge}
                            </span>
                            <span className="text-xs font-bold text-gray-500 flex items-center bg-white/50 px-2 py-1 rounded-lg">
                                <Calendar className="w-3 h-3 mr-1" />
                                Son: {camp.validUntil}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                            {camp.title}
                        </h3>
                        <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                            {camp.description}
                        </p>

                        <button 
                            onClick={() => onNavigate('category')}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-colors ${
                                camp.type === 'active' ? 'bg-basak-orange text-white hover:bg-orange-600 shadow-md shadow-orange-100' :
                                camp.type === 'special' ? 'bg-basak-green text-white hover:bg-green-600 shadow-md shadow-green-100' :
                                'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {camp.type === 'general' ? 'Detayları Gör' : 'Siparişe Başla'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoyaltyPage;
