'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone, MessageCircle, Send, Clock, Package, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean & Minimal */}
      <section className="relative bg-gradient-to-br from-neutral-50 to-white pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-basak-golden/10 text-basak-golden text-xs font-medium tracking-widest uppercase mb-6">
              İletişim
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tight mb-6">
              Sizden Haber Almak <br />
              <span className="text-basak-golden">İsteriz.</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Sorularınız, özel siparişleriniz veya kurumsal talepleriniz için buradayız.
              Size en kısa sürede geri dönüş yapacağız.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods - Cards */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="tel:+905551234567"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-basak-golden hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-basak-golden/10 flex items-center justify-center mb-4 group-hover:bg-basak-golden/20 transition-colors">
                <Phone className="w-6 h-6 text-basak-golden" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Telefon</h3>
              <p className="text-neutral-600 text-sm mb-3">+90 555 123 45 67</p>
              <span className="text-basak-golden text-sm font-medium group-hover:underline">
                Hemen Ara →
              </span>
            </a>

            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-basak-golden hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-basak-golden/10 flex items-center justify-center mb-4 group-hover:bg-basak-golden/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-basak-golden" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">WhatsApp</h3>
              <p className="text-neutral-600 text-sm mb-3">Hızlı destek</p>
              <span className="text-basak-golden text-sm font-medium group-hover:underline">
                Mesaj Gönder →
              </span>
            </a>

            <a
              href="mailto:info@basakpastanesi.com"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-basak-golden hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-basak-golden/10 flex items-center justify-center mb-4 group-hover:bg-basak-golden/20 transition-colors">
                <Mail className="w-6 h-6 text-basak-golden" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">E-posta</h3>
              <p className="text-neutral-600 text-sm mb-3">info@basakpastanesi.com</p>
              <span className="text-basak-golden text-sm font-medium group-hover:underline">
                E-posta Gönder →
              </span>
            </a>

            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-basak-golden hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-basak-golden/10 flex items-center justify-center mb-4 group-hover:bg-basak-golden/20 transition-colors">
                <MapPin className="w-6 h-6 text-basak-golden" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Adres</h3>
              <p className="text-neutral-600 text-sm mb-3">İzmir, Türkiye</p>
              <span className="text-basak-golden text-sm font-medium group-hover:underline">
                Haritada Gör →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content - Form & Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-neutral-200 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-neutral-900 mb-3">
                  Bize Ulaşın
                </h2>
                <p className="text-neutral-600 mb-8">
                  Formu doldurun, en kısa sürede size geri dönelim. Kurumsal teklifler için lütfen detaylı bilgi verin.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Ad Soyad *
                      </label>
                      <Input
                        type="text"
                        placeholder="Adınız ve soyadınız"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        E-posta *
                      </label>
                      <Input
                        type="email"
                        placeholder="ornek@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Telefon
                      </label>
                      <Input
                        type="tel"
                        placeholder="+90 5XX XXX XX XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Konu
                      </label>
                      <Input
                        type="text"
                        placeholder="Örn: Kurumsal Sipariş"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Mesajınız *
                    </label>
                    <Textarea
                      placeholder="Mesajınızı buraya yazın..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-basak-golden hover:bg-basak-golden/90 text-white h-14 text-lg rounded-full"
                  >
                    Mesajı Gönder
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Business Hours */}
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-basak-golden/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-basak-golden" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Çalışma Saatleri</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Pazartesi - Pazar</span>
                    <span className="font-medium text-neutral-900">09:00 - 22:00</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-basak-golden/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-basak-golden" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Teslimat</h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  İzmir içi soğuk zincir teslimat. Türkiye geneli özel kargo paketleme ile gönderim.
                </p>
              </div>

              {/* Corporate */}
              <div className="bg-basak-golden/5 rounded-2xl p-6 border border-basak-golden/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-basak-golden/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-basak-golden" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Kurumsal</h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                  Toplu siparişler için özel indirimler, logolu kutular ve esnek ödeme seçenekleri.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-basak-golden text-basak-golden hover:bg-basak-golden hover:text-white"
                >
                  Detaylı Bilgi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
