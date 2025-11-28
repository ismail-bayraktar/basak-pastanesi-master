
import React from 'react';
import { MapPin, Phone, Clock, Send, Calendar, Star, Users, Truck, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
}

const MILESTONES = [
  { year: '1985', title: 'Başak Pastanesi Açıldı', desc: 'Burdur’da küçük bir aile işletmesi olarak lezzet yolculuğumuza başladık.', icon: Star, color: 'orange' },
  { year: '2000', title: 'Özel Tasarım Pastalar', desc: 'Düğün ve nişan organizasyonları için özel tasarım pasta üretimine geçtik.', icon: Users, color: 'green' },
  { year: '2015', title: 'Kurumsal Hizmet', desc: 'Burdur genelinde ofis ve toplantılar için toplu sipariş hizmetine başladık.', icon: CheckCircle2, color: 'orange' },
  { year: '2024', title: 'Online Sipariş', desc: 'Siz evinizden çıkmadan lezzet kapınıza gelsin diye dijitalleşiyoruz.', icon: Truck, color: 'green' },
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-20">

      {/* 1) INTRO / STORY SECTION */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-soft border border-orange-50 overflow-hidden relative">

          {/* Decorative Blob */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-orange-50/50 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-12 lg:p-16 items-center relative z-10">
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-basak-orange text-xs font-bold uppercase tracking-wide">
                Hikayemiz
              </span>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 leading-tight">
                Başak Pastanesi <br />Hakkında
              </h1>
              <div className="space-y-4 text-lg text-gray-600 font-medium leading-relaxed">
                <p>
                  1985 yılında Burdur’un kalbinde, küçük ve sıcak bir aile işletmesi olarak kapılarımızı açtık. İlk günden beri değişmeyen tek kuralımız var:
                  <span className="text-gray-900 font-bold"> "Kendi çocuklarımıza yedirmediğimiz hiçbir şeyi vitrine koymamak."</span>
                </p>
                <p>
                  Yıllar içinde tariflerimizi geliştirdik, ailemizi büyüttük ama o ilk günkü heyecanımızı hiç kaybetmedik. Bugün, günlük taze üretimimiz, katkısız doğal malzemelerimiz ve güler yüzlü hizmetimizle Burdur’un en sevilen lezzet duraklarından biri olmanın gururunu yaşıyoruz.
                </p>
                <p>
                  Özel gün pastalarından günlük tatlılara, kahvaltılık çeşitlerden kurumsal ikramlıklara kadar her ürünümüzde aynı özen ve sevgiyi hissedeceksiniz.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/about/kitchen.png"
                alt="Başak Pastanesi Mutfak"
                className="rounded-[2rem] shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500 w-full object-cover h-[400px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <p className="font-heading font-bold text-gray-900 text-lg">"Mutluluk paylaştıkça, lezzet tattıkça çoğalır."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) TIMELINE */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-heading font-bold text-center text-gray-900 mb-12">Yıllar İçinde Biz</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-gray-100 -z-10"></div>

          {MILESTONES.map((milestone, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center text-center relative group hover:-translate-y-1 transition-transform">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md ${milestone.color === 'orange' ? 'bg-orange-50 text-basak-orange' : 'bg-green-50 text-basak-green'}`}>
                <milestone.icon className="w-8 h-8" />
              </div>
              <span className="text-3xl font-heading font-bold text-gray-200 mb-2 block">{milestone.year}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {milestone.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3) LOCATION & CONTACT */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left: Contact Info */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-soft border border-orange-50 flex flex-col justify-center h-full">
            <h2 className="text-3xl font-heading font-extrabold text-gray-900 mb-8">
              İletişim & Mağaza
            </h2>

            <div className="space-y-8">
              {/* Address */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-basak-orange flex-shrink-0 mr-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Mağazamız</h4>
                  <p className="text-gray-600">Özgür Mah. Gazi Cad. No:77/2<br />Burdur Merkez (Köprübaşı BP Karşısı)</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-basak-orange flex-shrink-0 mr-4">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Çalışma Saatleri</h4>
                  <p className="text-gray-600">Haftanın her günü: <span className="font-bold text-gray-800">08:00 - 22:00</span></p>
                </div>
              </div>

              {/* Phone (Big CTA) */}
              <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 text-center sm:text-left">
                <p className="text-sm font-bold text-basak-orange uppercase tracking-wider mb-2">ALO PASTA SİPARİŞ HATTI</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <a href="tel:02482333072" className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 hover:text-basak-orange transition-colors">
                    0248 233 30 72
                  </a>
                  <a
                    href="tel:02482333072"
                    className="inline-flex items-center justify-center px-6 py-3 bg-basak-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Hemen Ara
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Map & Form */}
          <div className="space-y-8">

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-[2rem] overflow-hidden h-64 md:h-80 shadow-inner relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.684617498428!2d30.2888!3d37.7183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c4444444444445%3A0x123456789abcdef!2sBurdur!5e0!3m2!1str!2str!4v1600000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold text-gray-800">
                📍 Bizi yerinde ziyaret edin, kahvemiz hazır.
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-[2rem] p-8 shadow-soft border border-gray-100">
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">Bize Ulaşın</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ad Soyad</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefon / E-posta</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Konu</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all">
                    <option>Genel Soru</option>
                    <option>Sipariş Desteği</option>
                    <option>Özel Tasarım Pasta</option>
                    <option>Kurumsal Teklif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mesajınız</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all resize-none"></textarea>
                </div>

                <button className="w-full bg-basak-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center">
                  Mesajı Gönder
                  <Send className="w-5 h-5 ml-2" />
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default AboutPage;
