
import React from 'react';
import { Briefcase, ArrowRight, CheckCircle2, FileText, Calendar, Coffee } from 'lucide-react';

const Corporate: React.FC = () => {
  return (
    <section className="bg-basak-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-soft border border-orange-50 overflow-hidden relative">
          
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-full bg-orange-50/50 skew-x-12 transform translate-x-20 hidden md:block"></div>
          
          <div className="flex flex-col lg:flex-row items-center p-8 md:p-12 lg:p-16 relative z-10">
            
            {/* Left Column: Icon/Visual */}
            <div className="flex-shrink-0 mb-8 lg:mb-0 lg:mr-12">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-orange-50 rounded-full flex items-center justify-center text-basak-orange relative">
                <Briefcase className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1.5} />
                
                {/* Floating mini icons */}
                <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md border border-orange-100">
                   <Coffee className="w-5 h-5 text-gray-600" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-white p-2 rounded-full shadow-md border border-orange-100">
                   <FileText className="w-5 h-5 text-basak-green" />
                </div>
              </div>
            </div>

            {/* Middle Column: Text Content */}
            <div className="flex-grow text-center lg:text-left">
              
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                 <span className="px-3 py-1 bg-green-50 text-basak-green text-xs font-bold uppercase tracking-wide rounded-full">
                    Kurumsal
                 </span>
                 <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide rounded-full">
                    Faturalı
                 </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">
                Ofisiniz ve Toplantılarınız İçin Kurumsal Çözümler
              </h2>
              
              <p className="text-gray-600 font-medium mb-6 max-w-2xl mx-auto lg:mx-0">
                Sabah kahvaltıları, yönetim toplantıları veya ofis kutlamaları... 
                Toplu siparişlerinizde taze ürün garantisi, düzenli teslimat ve kurumunuza özel fatura imkanı sunuyoruz.
              </p>

              {/* Feature List */}
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left max-w-lg mx-auto lg:mx-0">
                <li className="flex items-center text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-basak-green mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Toplu sipariş formu ile kolay talep</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <FileText className="w-5 h-5 text-basak-green mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Kurumsal fatura desteği</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 text-basak-green mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Düzenli teslimat planlama</span>
                </li>
              </ul>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-basak-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm">
                  Kurumsal Sipariş Sayfasına Git
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <a href="#" className="font-bold text-gray-500 hover:text-basak-orange transition-colors underline decoration-2 decoration-gray-200 hover:decoration-basak-orange underline-offset-4">
                  Teklif Al
                </a>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Corporate;
