'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Leaf, Clock, Truck, ChefHat, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Immersive & Emotional */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/about/hero.png"
            alt="Tulumbak Baklava Yapımı"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-xs font-medium tracking-widest uppercase mb-6">
              1985'ten Beri
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Bir İzmir <span className="text-tulumbak-golden">Masalı.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
              Geleneksel lezzetleri modern bir dokunuşla harmanlıyor,
              İzmir'in kalbinden sofralarınıza en taze baklavaları taşıyoruz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section - Typography Focused */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
            "Baklava sadece bir tatlı değildir, <br />
            <span className="text-tulumbak-golden">bir kültür mirasıdır.</span>"
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Tulumbak olarak biz, bu mirası korumak ve gelecek nesillere aktarmak için yola çıktık.
            Her bir katmanında ustalarımızın el emeği, her şerbet damlasında doğallığın tadı var.
            Bizim için başarı, sadece lezzetli bir ürün sunmak değil; o ürünü tadan kişinin yüzünde
            oluşan tebessümdür. Glikoz şurubu yok, katkı maddesi yok; sadece gerçek şeker,
            en kaliteli fıstık ve saf tereyağı var.
          </p>
        </div>
      </section>

      {/* The Three Pillars - Visual Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="group relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/assets/about/mastery.png"
                alt="Ustalık"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <ChefHat className="w-10 h-10 text-tulumbak-golden mb-4" />
                <h3 className="text-2xl font-bold mb-2">Ustalık</h3>
                <p className="text-white/80 leading-relaxed">
                  Yıllarını bu zanaata adamış ustalarımızın ellerinden çıkan,
                  incecik açılmış 40 kat yufkanın hikayesi.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="group relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/assets/about/natural.png"
                alt="Doğallık"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <Leaf className="w-10 h-10 text-tulumbak-golden mb-4" />
                <h3 className="text-2xl font-bold mb-2">Doğallık</h3>
                <p className="text-white/80 leading-relaxed">
                  Gaziantep'ten gelen boz fıstık, Şanlıurfa'dan sade yağ ve
                  %100 pancar şekeri. Başka hiçbir şey yok.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="group relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/assets/about/freshness.png"
                alt="Tazelik"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <Clock className="w-10 h-10 text-tulumbak-golden mb-4" />
                <h3 className="text-2xl font-bold mb-2">Günlük Tazelik</h3>
                <p className="text-white/80 leading-relaxed">
                  Stok tutmuyoruz. Siparişiniz üzerine günlük üretilen baklavalar,
                  özel soğuk zincir araçlarımızla kapınıza geliyor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-20 bg-tulumbak-golden/5 border-y border-tulumbak-golden/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h4 className="text-4xl md:text-5xl font-black text-tulumbak-golden">35+</h4>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Yıllık Tecrübe</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl md:text-5xl font-black text-tulumbak-golden">100%</h4>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Doğal İçerik</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl md:text-5xl font-black text-tulumbak-golden">50K+</h4>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Mutlu Müşteri</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl md:text-5xl font-black text-tulumbak-golden">24s</h4>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Teslimat Süresi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate / B2B Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-neutral-900 rounded-3xl overflow-hidden text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 md:p-20 flex flex-col justify-center space-y-8">
                <div>
                  <span className="text-tulumbak-golden font-medium tracking-widest uppercase text-sm">Kurumsal Çözümler</span>
                  <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">İş Ortaklarınız İçin Prestijli Bir Hediye</h2>
                  <p className="text-neutral-400 leading-relaxed text-lg">
                    Bayramlarda, özel günlerde veya kutlamalarda iş ortaklarınıza ve çalışanlarınıza
                    unutulmaz bir lezzet deneyimi sunun. Kurumsal kimliğinize uygun özel kutu tasarımları
                    ve toplu sipariş avantajları ile yanınızdayız.
                  </p>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Award className="text-tulumbak-golden" />
                    <span>Özel logolu kutu tasarımı</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Truck className="text-tulumbak-golden" />
                    <span>Çoklu adrese eş zamanlı teslimat</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Heart className="text-tulumbak-golden" />
                    <span>Kurumsal fatura ve özel indirimler</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 text-lg h-14 px-8 rounded-full">
                      Kurumsal Teklif Al
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[400px] lg:min-h-full">
                <Image
                  src="/assets/about/corporate.png"
                  alt="Kurumsal Hediye"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
