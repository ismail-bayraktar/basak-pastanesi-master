'use client';

import Link from 'next/link';
import Image from 'next/image';

const promos = [
  {
    title: 'Hafta sonu tepsisi',
    desc: 'Aile boyu paylaşım için 1 kg’lık özel tepsi, hızlı teslimat.',
    tag: 'Sınırlı stok',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    href: '/collection',
  },
  {
    title: 'Ofis ikram seti',
    desc: 'Toplu sipariş, fatura desteği ve soğuk zincirle güvenli teslim.',
    tag: 'Kurumsal',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    href: '/contact',
  },
  {
    title: 'Hediye kutuları',
    desc: 'Not kartı ve marka logolu kutu seçenekleri, aynı gün gönderim.',
    tag: 'Hediye',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80',
    href: '/collection?category=hediye',
  },
  {
    title: 'Sezon spesiyal',
    desc: 'Yeni sezon tatlısı, dengeli şerbet ve seçilmiş fıstıkla hazır.',
    tag: 'Yeni',
    image: 'https://images.unsplash.com/photo-1571162190586-84b4b0cf6c05?auto=format&fit=crop&w=800&q=80',
    href: '/collection',
  },
];

export function PromoSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto">
        <div className="flex flex-col gap-3 mb-8 text-center">
          <span className="mx-auto rounded-full bg-brand-primary/10 text-brand-primary px-4 py-1 text-sm font-semibold tracking-wide">
            Kampanyalar
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Sınırlı süreli lezzetler</h2>
          <p className="text-sm sm:text-base text-text-light-secondary text-center max-w-3xl mx-auto">
            Hafta sonu tepsisi, ofis ikram seti ve hediye kutuları gibi dönemsel kampanyalarımızı kaçırmayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {promos.map((item) => (
            <div
              key={item.title}
              className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg border border-neutral-100 hover:shadow-2xl transition-all"
            >
              <div className="relative h-40 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute top-3 left-3 rounded-full bg-black/60 text-white text-xs font-semibold px-3 py-1">
                  {item.tag}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-grow">
                <h3 className="text-lg font-bold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-700 flex-grow">{item.desc}</p>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
                >
                  İncele
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
