'use client';

import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto overflow-hidden rounded-3xl bg-gradient-to-r from-[#fff4e5] via-white to-[#ffe6cc] border border-[#ffe3bd] shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center px-6 sm:px-10 py-12">
          <div className="md:col-span-2 flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 text-amber-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
              Kurumsal + E-ticaret
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              Kurumsal teklif, toplu sipariş ve mağazaya hızlı erişim tek noktada
            </h2>
            <p className="text-sm sm:text-base text-neutral-700 max-w-2xl">
              Günlük üretim, soğuk zincir teslimat ve özenli paketleme ile hem son kullanıcıya hem işletmelere hizmet veriyoruz.
            </p>
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-amber-800 font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-2">
                <span className="material-symbols-outlined text-base">verified</span>
                Günlük üretim
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-2">
                <span className="material-symbols-outlined text-base">local_shipping</span>
                Soğuk zincir
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-2">
                <span className="material-symbols-outlined text-base">redeem</span>
                Hediye & kutu
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link href="/contact">
                <button className="h-12 px-6 rounded-full bg-brand-primary text-white font-semibold text-sm sm:text-base shadow-lg hover:scale-105 transition-transform">
                  Kurumsal teklif al
                </button>
              </Link>
              <Link href="/collection">
                <button className="h-12 px-6 rounded-full bg-white text-neutral-900 font-semibold text-sm sm:text-base border border-amber-200 hover:scale-105 transition-transform">
                  Mağazayı incele
                </button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white/70 rounded-2xl p-5 border border-amber-100 shadow-md">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-primary">call</span>
              <div className="text-sm">
                <p className="font-semibold text-neutral-900">Hızlı destek</p>
                <a href="tel:+905551234567" className="text-brand-primary font-semibold">
                  +90 555 123 45 67
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-primary">chat</span>
              <div className="text-sm">
                <p className="font-semibold text-neutral-900">WhatsApp sipariş</p>
                <a
                  href="https://wa.me/905551234567"
                  className="text-brand-primary font-semibold"
                  target="_blank"
                  rel="noreferrer"
                >
                  Konuşmayı başlat
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-primary">redeem</span>
              <div className="text-sm">
                <p className="font-semibold text-neutral-900">Kurumsal hediye</p>
                <p className="text-neutral-700">Markalı kutu, toplu teslimat, fatura desteği.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
