'use client';

import Link from 'next/link';
import Image from 'next/image';

const heroImage =
  'https://images.unsplash.com/photo-1576749872115-d2b19dc0b0af?auto=format&fit=crop&w=1200&q=80';

export function DailySpecial() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 rounded-3xl bg-white shadow-2xl border border-neutral-100 overflow-hidden">
          {/* Image */}
          <div className="relative lg:col-span-2 h-72 sm:h-80 lg:h-full">
            <Image
              src={heroImage}
              alt="Günün lezzeti baklava"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/25 to-black/10" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="rounded-full bg-orange-500 text-white text-xs font-semibold px-3 py-1 shadow-lg">
                Günün lezzeti
              </span>
              <span className="rounded-full bg-black/60 text-white text-xs font-semibold px-3 py-1">
                Sınırlı üretim
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Günlük taze <span className="material-symbols-outlined text-sm">local_fire_department</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              Sınırlı üretim özel tepsi baklava
            </h2>
            <p className="text-sm sm:text-base text-neutral-700 max-w-2xl">
              Bakır tepside pişirilen, dengeli şerbetli ve seçilmiş fıstıkla hazırlanan özel tepsi.
              Öğleden önce verilen siparişlerde aynı gün soğuk zincirle teslim.
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-amber-800">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 border border-amber-100">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Sadece bugün
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 border border-amber-100">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                Hızlı teslimat
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 border border-amber-100">
                <span className="material-symbols-outlined text-sm">check</span>
                Soğuk zincir
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-bold text-orange-600">329,00 TL</span>
              <span className="text-sm text-neutral-500">1 kg özel tepsi</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/product/special">
                <button className="h-12 px-6 rounded-full bg-brand-primary text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                  Sepete ekle
                </button>
              </Link>
              <Link href="/collection">
                <button className="h-12 px-6 rounded-full bg-white text-neutral-900 font-semibold border border-amber-200 hover:scale-105 transition-transform">
                  Diğer ürünler
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
