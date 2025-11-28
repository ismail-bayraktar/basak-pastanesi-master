
import React from 'react';
import { ArrowRight, Instagram, Sparkles, PenTool } from 'lucide-react';

const SpecialOrders: React.FC = () => {
  return (
    <section className="bg-basak-cream py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-soft border border-orange-50 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-50 opacity-50 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Side: Content */}
            <div className="space-y-8 relative z-10">

              {/* Badge/Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-basak-green">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Doğum Günü
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-basak-green">
                  Nişan & Düğün
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-basak-green">
                  Kurumsal
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 leading-tight mb-6">
                  Özel Gün Pastalarınız İçin: <br />
                  <span className="text-basak-orange">Siz Hayal Edin, Biz Yapalım</span>
                </h2>
                <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6">
                  En özel anlarınızda yanınızdayız. Kişi sayısına göre fiyatlandırılan, istediğiniz konseptte hazırlanan pastalarınızı kapınıza kadar getiriyoruz.
                </p>

                {/* Instagram Cue */}
                <div className="flex items-center space-x-2 text-basak-orange font-medium bg-orange-50 inline-block px-4 py-2 rounded-lg">
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm">Instagram’da paylaşmaya değer tasarımlar</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center px-8 py-4 bg-basak-orange text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5">
                  Örnek Pastaları Gör
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-orange-100 text-basak-orange text-lg font-bold rounded-xl hover:bg-orange-50 hover:border-basak-orange transition-all">
                  <PenTool className="mr-2 w-5 h-5" />
                  Kendi Pastanı Tasarla
                </button>
              </div>

            </div>

            {/* Right Side: Collage */}
            <div className="relative h-[400px] md:h-[500px] w-full mt-8 lg:mt-0 hidden md:block">
              {/* Image 1: Main (Wedding/Engagement) */}
              <div className="absolute top-0 right-0 w-3/4 h-3/4 z-10 transform hover:scale-105 transition-transform duration-500">
                <img
                  src="/images/special/wedding-cake.png"
                  alt="Elegant Wedding Cake"
                  className="w-full h-full object-cover rounded-[2rem] shadow-xl border-4 border-white"
                />
              </div>

              {/* Image 2: Secondary (Kids/Birthday) - Bottom Left */}
              <div className="absolute bottom-0 left-0 w-3/5 h-3/5 z-20 transform hover:scale-105 transition-transform duration-500">
                <img
                  src="/images/special/kids-cake.png"
                  alt="Fun Kids Birthday Cake"
                  className="w-full h-full object-cover rounded-[2rem] shadow-xl border-4 border-white"
                />
              </div>

              {/* Decorative Circle */}
              <div className="absolute bottom-10 right-10 bg-white p-4 rounded-full shadow-lg z-30 animate-pulse hidden lg:block">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-basak-orange">100%</span>
                  <span className="block text-xs font-bold text-gray-500 uppercase">El Yapımı</span>
                </div>
              </div>
            </div>

            {/* Mobile Image (Single composite or just one nice image) */}
            <div className="md:hidden mt-6">
              <img
                src="/images/special/wedding-cake.png"
                alt="Custom Cake"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOrders;
