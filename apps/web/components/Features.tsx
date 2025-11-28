import React from 'react';
import { Leaf, Truck, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: "Günlük Taze Üretim",
    subtitle: "Her gün Burdur’da taze üretilen pasta ve tatlılar",
    label: "Tazelik Garantisi",
    accent: "green"
  },
  {
    icon: Truck,
    title: "Burdur İçi Hızlı Teslimat",
    subtitle: "Özel günlerinizde adresinize zamanında teslimat",
    label: "Aynı Gün Teslim",
    accent: "orange"
  },
  {
    icon: ShieldCheck,
    title: "Kapıda Ödeme Güvencesi",
    subtitle: "Nakit veya kartla, kapınızda güvenle ödeme",
    label: "Ekstra Güven",
    accent: "green"
  }
];

const Features: React.FC = () => {
  return (
    <section className="bg-basak-cream py-16 md:py-24 border-t border-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-8 shadow-soft flex flex-col items-center text-center h-full border border-orange-100/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Icon Container */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                feature.accent === 'green' 
                  ? 'bg-green-50 text-basak-green' 
                  : 'bg-orange-50 text-basak-orange'
              }`}>
                <feature.icon className="w-10 h-10" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              {/* Subtitle */}
              <p className="text-lg text-gray-700 font-medium leading-relaxed mb-8 flex-grow">
                {feature.subtitle}
              </p>

              {/* Pill Label */}
              <div className="mt-auto">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase border ${
                  feature.accent === 'green' 
                    ? 'bg-green-50 text-basak-green border-green-100' 
                    : 'bg-orange-50 text-basak-orange border-orange-100'
                }`}>
                  {feature.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;