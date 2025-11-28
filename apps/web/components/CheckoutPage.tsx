
import React, { useState } from 'react';
import { 
  ArrowLeft, Check, CheckCircle2, MapPin, 
  CreditCard, Banknote, User, Phone, 
  Calendar, Clock, ChevronRight, Building, Truck, ShieldCheck
} from 'lucide-react';
import { CartItem } from '../App';

interface CheckoutPageProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
  cartItems: CartItem[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, cartItems }) => {
  const [step, setStep] = useState<2 | 3>(2); // Start at Step 2 (Delivery)
  const [isCorporate, setIsCorporate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash_door' | 'card_door' | 'online'>('cash_door');

  // Calculate Totals from dynamic items
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Free delivery logic same as cart

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = () => {
    // Simulate API call
    setTimeout(() => {
      onNavigate('success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-basak-cream pb-24 font-sans">
      
      {/* HEADER & STEPPER */}
      <div className="bg-white border-b border-orange-100 pt-24 pb-4 md:pt-6 md:pb-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-heading font-extrabold text-gray-900 hidden md:block">
              Ödeme Adımları
            </h1>

            {/* Stepper */}
            <div className="flex items-center justify-center w-full md:w-auto space-x-2 sm:space-x-4">
              
              {/* Step 1: Cart (Completed) */}
              <button 
                onClick={() => onNavigate('cart')}
                className="flex items-center group"
              >
                <div className="w-8 h-8 rounded-full bg-basak-green text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-transparent group-hover:ring-green-200 transition-all">
                  <Check className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-bold text-gray-700 hidden sm:block">Sepet</span>
              </button>
              
              <div className="w-8 h-0.5 bg-basak-green/50"></div>

              {/* Step 2: Delivery */}
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all
                  ${step === 2 
                    ? 'bg-basak-orange text-white ring-4 ring-orange-50' 
                    : step > 2 ? 'bg-basak-green text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {step > 2 ? <Check className="w-5 h-5" /> : 2}
                </div>
                <span className={`ml-2 text-sm font-bold hidden sm:block ${step === 2 ? 'text-basak-orange' : 'text-gray-500'}`}>
                  Teslimat
                </span>
              </div>

              <div className={`w-8 h-0.5 ${step > 2 ? 'bg-basak-green/50' : 'bg-gray-200'}`}></div>

              {/* Step 3: Payment */}
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all
                  ${step === 3 
                    ? 'bg-basak-orange text-white ring-4 ring-orange-50' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  3
                </div>
                <span className={`ml-2 text-sm font-bold hidden sm:block ${step === 3 ? 'text-basak-orange' : 'text-gray-500'}`}>
                  Ödeme
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: FORMS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* STEP 2: DELIVERY INFO FORM */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="animate-fade-in space-y-8">
                
                {/* Contact & Address */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50/50">
                  <div className="mb-6">
                    <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center">
                      <MapPin className="w-6 h-6 text-basak-orange mr-3" />
                      Teslimat Bilgileri
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">Lütfen pastanızın teslim edileceği adres bilgilerini doldurun.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ad Soyad</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all text-base" placeholder="Örn: Ahmet Yılmaz" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Numarası</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="tel" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all text-base" placeholder="05XX XXX XX XX" />
                      </div>
                    </div>

                    {/* Address Title */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Adres Başlığı</label>
                      <input required type="text" className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all text-base" placeholder="Örn: Ev, İşyeri" />
                    </div>

                    {/* City (Fixed) */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">İl / İlçe</label>
                      <select disabled className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium">
                        <option>Burdur / Merkez</option>
                      </select>
                    </div>

                     {/* District */}
                     <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mahalle</label>
                      <select className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all appearance-none font-medium">
                        <option>Bahçelievler Mah.</option>
                        <option>Konak Mah.</option>
                        <option>Burç Mah.</option>
                        <option>Şirinevler Mah.</option>
                        <option>Diğer</option>
                      </select>
                    </div>

                    {/* Full Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Açık Adres</label>
                      <textarea required rows={3} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all resize-none text-base" placeholder="Cadde, sokak, apartman ve daire no giriniz..."></textarea>
                    </div>

                    {/* Note */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Sipariş Notu (Opsiyonel)</label>
                      <input type="text" className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all text-base" placeholder="Örn: Zile basmayın, kapıya bırakın." />
                    </div>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50/50">
                  <div className="mb-6">
                    <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center">
                      <Clock className="w-6 h-6 text-basak-orange mr-3" />
                      Teslimat Zamanı
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tarih Seçiniz</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all appearance-none font-medium">
                          <option>Bugün (15 Ekim)</option>
                          <option>Yarın (16 Ekim)</option>
                          <option>17 Ekim Perşembe</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Saat Aralığı</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange focus:outline-none transition-all appearance-none font-medium">
                          <option>En kısa sürede (45-60 dk)</option>
                          <option>12:00 - 14:00 Arası</option>
                          <option>14:00 - 16:00 Arası</option>
                          <option>16:00 - 18:00 Arası</option>
                          <option>18:00 - 20:00 Arası</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse md:flex-row items-center gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => onNavigate('cart')}
                    className="w-full md:w-auto px-6 py-4 rounded-xl font-bold text-gray-500 hover:text-basak-orange hover:bg-white transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Sepete Dön
                  </button>
                  <button 
                    type="submit"
                    className="w-full md:flex-1 bg-basak-orange text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center"
                  >
                    Teslimat Zamanını Seç ve Devam Et
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PAYMENT FORM */}
            {step === 3 && (
              <div className="animate-slide-in-right space-y-8">
                
                {/* Payment Methods */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50/50">
                  <div className="mb-6">
                    <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center">
                      <CreditCard className="w-6 h-6 text-basak-orange mr-3" />
                      Ödeme Yöntemi
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">Kapıda ödeme ile güvenle ödeyebilir veya diğer seçenekleri kullanabilirsiniz.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Option 1: Cash on Delivery */}
                    <label className={`
                      relative cursor-pointer border-2 rounded-2xl p-5 flex items-start transition-all
                      ${paymentMethod === 'cash_door' ? 'border-basak-orange bg-orange-50/30 ring-1 ring-orange-100' : 'border-gray-100 hover:border-orange-100 hover:bg-gray-50'}
                    `}>
                      <div className="flex items-center h-6">
                        <input 
                          type="radio" 
                          name="payment" 
                          className="w-5 h-5 text-basak-orange focus:ring-basak-orange border-gray-300"
                          checked={paymentMethod === 'cash_door'}
                          onChange={() => setPaymentMethod('cash_door')}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center mb-1">
                          <Banknote className={`w-5 h-5 mr-2 ${paymentMethod === 'cash_door' ? 'text-basak-orange' : 'text-gray-400'}`} />
                          <span className="font-bold text-gray-900 text-lg">Kapıda Ödeme (Önerilen)</span>
                        </div>
                        <p className="text-gray-500 text-sm">Siparişinizi teslim alırken nakit veya kart ile ödeme yapın.</p>
                      </div>
                      {paymentMethod === 'cash_door' && (
                        <div className="absolute top-5 right-5 text-basak-green font-bold text-xs bg-green-50 px-2 py-1 rounded-md">
                          En Kolay
                        </div>
                      )}
                    </label>

                    {/* Option 2: Online Payment */}
                    <label className={`
                      relative cursor-pointer border-2 rounded-2xl p-5 flex items-start transition-all opacity-60
                      ${paymentMethod === 'online' ? 'border-basak-orange bg-orange-50/30' : 'border-gray-100 hover:border-orange-100'}
                    `}>
                      <div className="flex items-center h-6">
                         <input 
                          type="radio" 
                          name="payment" 
                          className="w-5 h-5 text-basak-orange focus:ring-basak-orange border-gray-300"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center mb-1">
                          <CreditCard className={`w-5 h-5 mr-2 ${paymentMethod === 'online' ? 'text-basak-orange' : 'text-gray-400'}`} />
                          <span className="font-bold text-gray-900 text-lg">Online Kart ile Ödeme</span>
                        </div>
                        <p className="text-gray-500 text-sm">Kredi / banka kartı ile güvenli online ödeme (Yakında).</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Corporate Invoice */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-orange-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                       <Building className="w-5 h-5 text-gray-400 mr-3" />
                       <span className="font-bold text-gray-900">Kurumsal fatura istiyorum</span>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                      type="button"
                      onClick={() => setIsCorporate(!isCorporate)}
                      className={`
                        relative inline-flex flex-shrink-0 h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-basak-orange
                        ${isCorporate ? 'bg-basak-orange' : 'bg-gray-200'}
                      `}
                    >
                      <span className={`
                        pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                        ${isCorporate ? 'translate-x-6' : 'translate-x-0'}
                      `} />
                    </button>
                  </div>

                  {isCorporate && (
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                       <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Firma Adı</label>
                          <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange transition-all" />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Vergi Dairesi</label>
                          <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange transition-all" />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Vergi Numarası</label>
                          <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-basak-orange transition-all" />
                       </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse md:flex-row items-center gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto px-6 py-4 rounded-xl font-bold text-gray-500 hover:text-basak-orange hover:bg-white transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Teslimat Bilgilerine Dön
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmOrder}
                    className="w-full md:flex-1 bg-basak-orange text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center"
                  >
                    Siparişi Onayla
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                  </button>
                </div>

              </div>
            )}
            
          </div>

          {/* RIGHT COLUMN: SUMMARY (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-white rounded-[2rem] shadow-soft border border-orange-50 p-6 md:p-8">
                <h2 className="text-lg font-heading font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                  Sipariş Özeti
                </h2>

                {/* Mini List */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex gap-3">
                        <span className="font-bold text-basak-orange bg-orange-50 w-6 h-6 rounded flex items-center justify-center text-xs">{item.quantity}x</span>
                        <div>
                           <span className="text-gray-900 font-semibold block">{item.title}</span>
                           <span className="text-gray-500 text-xs">{item.portion || 'Standart'}</span>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                    </div>
                  ))}
                  {cartItems.length === 0 && (
                      <p className="text-gray-500 text-sm">Sepetiniz boş.</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Ara Toplam</span>
                    <span>{subtotal.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Teslimat</span>
                    <span className="text-basak-green font-bold text-sm bg-green-50 px-2 py-0.5 rounded">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-2">
                    <span className="text-lg font-bold text-gray-900">Toplam</span>
                    <span className="text-3xl font-heading font-extrabold text-basak-orange">
                      {total.toLocaleString('tr-TR')} <span className="text-lg text-gray-400">TL</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Block */}
              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100/50 space-y-4">
                <div className="flex items-start">
                  <ShieldCheck className="w-5 h-5 text-basak-green mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-800 text-sm">1985’ten beri Burdur’da</span>
                    <span className="text-xs text-gray-500">Güvenilir mahalle pastaneniz</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Truck className="w-5 h-5 text-basak-green mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-800 text-sm">Günlük Taze Üretim</span>
                    <span className="text-xs text-gray-500">Sipariş üzerine hazırlanır</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
