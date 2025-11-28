
import React from 'react';
import { ArrowLeft, Phone, Mail, FileText, ChevronRight, Shield } from 'lucide-react';
import { PolicyType } from '../App';

interface LegalPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  policyType?: PolicyType;
  onPolicyChange?: (policy: PolicyType) => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ onNavigate, policyType = 'privacy', onPolicyChange }) => {
  
  // Content Configuration based on policyType
  const getContent = () => {
    switch(policyType) {
      case 'cookie':
        return {
            title: "Çerez Politikası",
            subtitle: "Web sitemizdeki çerez kullanımı ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgiler.",
            lastUpdated: "15 Ekim 2024"
        };
      case 'kvkk':
        return {
            title: "KVKK Aydınlatma Metni",
            subtitle: "Kişisel verilerinizin korunması kanunu kapsamında haklarınız ve sorumluluklarımız.",
            lastUpdated: "10 Eylül 2024"
        };
      case 'refund':
        return {
            title: "İade ve Değişim Koşulları",
            subtitle: "Memnuniyetiniz bizim için önemli. İade ve değişim süreçleri hakkında detaylı bilgiler.",
            lastUpdated: "01 Ocak 2024"
        };
      case 'distance-sales':
        return {
            title: "Mesafeli Satış Sözleşmesi",
            subtitle: "Online alışverişlerinizde geçerli olan yasal haklar ve sözleşme detayları.",
            lastUpdated: "01 Ocak 2024"
        };
      case 'privacy':
      default:
        return {
          title: "Gizlilik Politikası",
          subtitle: "Kişisel verilerinizin güvenliği, toplanma yöntemleri ve kullanım amaçları hakkında bilgilendirme.",
          lastUpdated: "20 Ekim 2024"
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-basak-cream font-sans pb-20">
      
      {/* 1) HEADER SECTION */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center text-sm text-gray-500 mb-6">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-basak-orange transition-colors"
            >
              Anasayfa
            </button>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            <span className="font-bold text-gray-900">{content.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            {content.subtitle}
          </p>
          <p className="text-sm text-gray-400 mt-4 font-medium">
            Son Güncelleme: {content.lastUpdated}
          </p>
        </div>
      </div>

      {/* 2) CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left/Main Column: Legal Text */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-soft border border-orange-50/50">
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                
                {/* Section 1 */}
                <section>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-1.5 h-8 bg-basak-orange rounded-full mr-3"></span>
                    1. Genel Bilgiler
                  </h2>
                  <p className="leading-relaxed">
                    Başak Pastanesi ("Şirket") olarak, web sitemizi ziyaret eden müşterilerimizin kişisel gizliliğini korumayı taahhüt ediyoruz. Bu {content.title}, sitemiz üzerinden topladığımız bilgilerin türünü, bu bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır. Hizmetlerimizi kullanarak, bu politikada belirtilen uygulamaları kabul etmiş olursunuz.
                  </p>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-1.5 h-8 bg-basak-orange rounded-full mr-3"></span>
                    2. Toplanan Kişisel Veriler
                  </h2>
                  <p className="leading-relaxed mb-4">
                    Hizmetlerimizi sunabilmek ve siparişlerinizi teslim edebilmek adına aşağıdaki verileri toplayabiliriz:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 marker:text-basak-orange">
                    <li><strong>Kimlik Bilgileri:</strong> Ad, soyad.</li>
                    <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi, teslimat adresi.</li>
                    <li><strong>İşlem Güvenliği:</strong> IP adresi, site içi hareketler.</li>
                    <li><strong>Sipariş Bilgileri:</strong> Satın alınan ürünler, sipariş tarihi ve tutarı.</li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-1.5 h-8 bg-basak-orange rounded-full mr-3"></span>
                    3. Verilerin Kullanım Amacı
                  </h2>
                  <p className="leading-relaxed">
                    Toplanan kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-basak-orange">
                    <li>Siparişlerinizi hazırlamak ve belirtilen adrese teslim etmek.</li>
                    <li>Sipariş durumunuz hakkında bilgilendirme SMS'i veya e-postası göndermek.</li>
                    <li>Yasal yükümlülüklerimizi (örneğin fatura kesimi) yerine getirmek.</li>
                    <li>Müşteri hizmetleri taleplerinizi yanıtlamak.</li>
                  </ul>
                </section>

                 {/* Section 4 */}
                 <section>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-1.5 h-8 bg-basak-orange rounded-full mr-3"></span>
                    4. Çerezler (Cookies)
                  </h2>
                  <p className="leading-relaxed">
                    Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerezler, tarayıcınız tarafından saklanan küçük metin dosyalarıdır. Çerez tercihlerinizi tarayıcı ayarlarınızdan değiştirebilirsiniz. Daha fazla bilgi için <button onClick={() => onPolicyChange && onPolicyChange('cookie')} className="text-basak-orange font-bold hover:underline">Çerez Politikası</button> sayfamızı inceleyebilirsiniz.
                  </p>
                </section>

                 {/* Section 5: Highlighted Note */}
                 <section className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-lg font-heading font-bold text-basak-green mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Veri Güvenliği
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    Kişisel verileriniz, yetkisiz erişime, kaybolmaya veya değiştirilmeye karşı uygun teknik ve idari tedbirlerle korunmaktadır. Ödeme işlemlerinde kredi kartı bilgileriniz sistemlerimizde saklanmamakta, ilgili ödeme kuruluşu altyapısı üzerinden şifreli olarak işlenmektedir.
                  </p>
                </section>

                {/* Section 6 */}
                <section>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-1.5 h-8 bg-basak-orange rounded-full mr-3"></span>
                    5. Haklarınız
                  </h2>
                  <p className="leading-relaxed">
                    KVKK kapsamında, kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, verilerin düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
                  </p>
                </section>

              </div>
            </div>
            
            <div className="mt-8 text-center lg:text-left">
               <button 
                onClick={() => onNavigate('home')}
                className="inline-flex items-center font-bold text-gray-500 hover:text-basak-orange transition-colors"
               >
                 <ArrowLeft className="w-5 h-5 mr-2" />
                 Ana Sayfaya Dön
               </button>
            </div>
          </div>

          {/* Right Column: Sidebar (Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Contact Card */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-orange-50 sticky top-24">
              <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center text-basak-orange mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">Sorunuz mu var?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Bu politika veya verileriniz ile ilgili sorularınız için Veri Sorumlusu temsilcimizle iletişime geçebilirsiniz.
              </p>
              
              <div className="space-y-4">
                <a href="tel:02482333072" className="flex items-center group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-basak-orange group-hover:text-white flex items-center justify-center text-gray-500 transition-colors mr-3">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase">Telefon</span>
                    <span className="block text-gray-900 font-bold group-hover:text-basak-orange transition-colors">0248 233 30 72</span>
                  </div>
                </a>

                <a href="mailto:kvkk@basakpastanesi.com" className="flex items-center group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-basak-orange group-hover:text-white flex items-center justify-center text-gray-500 transition-colors mr-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase">E-Posta</span>
                    <span className="block text-gray-900 font-bold group-hover:text-basak-orange transition-colors">kvkk@basakpastanesi.com</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Other Policies Navigation */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hidden lg:block">
              <h4 className="font-heading font-bold text-gray-900 mb-4">Diğer Politikalar</h4>
              <ul className="space-y-3">
                <li><button onClick={() => onPolicyChange && onPolicyChange('cookie')} className="text-gray-600 hover:text-basak-orange text-sm font-medium flex items-center"><ChevronRight className="w-3 h-3 mr-2" /> Çerez Politikası</button></li>
                <li><button onClick={() => onPolicyChange && onPolicyChange('distance-sales')} className="text-gray-600 hover:text-basak-orange text-sm font-medium flex items-center"><ChevronRight className="w-3 h-3 mr-2" /> Mesafeli Satış Sözleşmesi</button></li>
                <li><button onClick={() => onPolicyChange && onPolicyChange('refund')} className="text-gray-600 hover:text-basak-orange text-sm font-medium flex items-center"><ChevronRight className="w-3 h-3 mr-2" /> İade Koşulları</button></li>
                <li><button onClick={() => onPolicyChange && onPolicyChange('kvkk')} className="text-gray-600 hover:text-basak-orange text-sm font-medium flex items-center"><ChevronRight className="w-3 h-3 mr-2" /> KVKK Aydınlatma Metni</button></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default LegalPage;
