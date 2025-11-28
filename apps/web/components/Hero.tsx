
import React from 'react';
import { Phone, ArrowRight, Truck, CheckCircle, MapPin } from 'lucide-react';

interface HeroProps {
  onNavigate?: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative overflow-hidden bg-basak-cream pt-10 pb-16 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-100 opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-100 opacity-50 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: Text Content */}
          <div className="space-y-8 text-center lg:text-left">

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white text-basak-green shadow-sm border border-green-100">
                <Truck className="w-4 h-4 mr-1.5" />
                Adrese Teslim
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white text-basak-green shadow-sm border border-green-100">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Kapıda Ödeme
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white text-gray-600 shadow-sm border border-gray-100">
                <MapPin className="w-4 h-4 mr-1.5 text-basak-orange" />
                Burdur Merkez
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-gray-900 leading-tight">
                Siz Hayal Edin, <br />
                <span className="text-basak-orange">Biz Yapalım</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Burdur’da 1985’ten beri aileniz için günlük taze pasta ve tatlılar üretiyoruz. Özel günlerinizde yanınızdayız.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

              {/* Primary Action */}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('category')}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-soft text-white bg-basak-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-basak-orange transition-all transform hover:-translate-y-0.5"
              >
                Online Sipariş Ver
                <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
              </button>

              {/* Secondary Action */}
              <a
                href="tel:02482333072"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-lg font-bold rounded-xl text-gray-700 bg-white hover:border-basak-orange hover:text-basak-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-basak-orange transition-all"
              >
                <Phone className="mr-2 -ml-1 w-5 h-5" />
                0248 233 30 72
              </a>
            </div>

            <p className="text-sm text-gray-500 font-medium mt-2">
              *Haftanın her günü 08:00 - 22:00 arası açık.
            </p>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative">
            {/* Decorative Elements behind image */}
            <div className="absolute inset-0 bg-basak-orange rounded-3xl transform rotate-3 opacity-10 scale-105"></div>

            <div className="relative rounded-3xl overflow-hidden shadow-soft bg-white aspect-[4/3] lg:aspect-square group">
              {/* Main Image */}
              <img
                src="/images/hero/hero-bg-v2.png"
                alt="Başak Pastanesi Bakery Counter and Happy Family"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />

              {/* Floating Badge on Image */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-basak-green">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-gray-900">Günlük Taze Üretim</p>
                    <p className="text-sm text-gray-600">Katkı maddesi içermeyen doğal lezzetler</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
