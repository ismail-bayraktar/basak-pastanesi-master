'use client';

import { Clock, Package, ShieldCheck, Truck, Snowflake } from 'lucide-react';

const steps = [
  { title: 'Sipariş ve hazırlık', desc: 'Günlük üretim; şerbetleme sonrası bekletmeden paketleme.' },
  { title: 'Paketleme', desc: 'Sızdırmaz kap, güven bantı ve ısıya dayanıklı kutu.' },
  { title: 'Teslimat', desc: 'Şehir içi soğuk zincir kurye; şehir dışı hızlı kargo opsiyonu.' },
];

const faqs = [
  {
    q: 'Teslimat süresi nedir?',
    a: 'İzmir içi aynı gün; diğer bölgeler için kargo süreleri değişebilir.',
  },
  {
    q: 'Soğuk zincir sağlanıyor mu?',
    a: 'Evet, ısı kontrollü taşıma ve sızdırmaz paket kullanılır.',
  },
  {
    q: 'Hediye gönderimi yapılır mı?',
    a: 'Not kartı, hediye kutusu ve e-fatura desteği mevcut.',
  },
];

export default function DeliveryPage() {
  return (
    <div className="bg-gradient-to-b from-[#fff7ec] via-white to-white">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1478749485505-2a903a729c63?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />
        <div className="relative w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-4 py-14 sm:py-20 text-white space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
            Teslimat
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-snug max-w-3xl">
            Soğuk zincir, hızlı teslimat ve güvenli paketleme
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-white/85">
            Günlük üretimden kapınıza kadar; şerbetli tatlılarda sızdırmaz paket, soğuk zincir ve zamanında teslimat.
          </p>
        </div>
      </section>

      <section className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto px-4 py-12 space-y-10">
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div key={s.title} className="rounded-2xl bg-white shadow-lg border border-neutral-100 p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                <span className="material-symbols-outlined text-base">counter_{idx + 1}</span>
                Adım {idx + 1}
              </div>
              <h3 className="text-lg font-bold text-neutral-900">{s.title}</h3>
              <p className="text-sm text-neutral-700">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white shadow-lg border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold text-neutral-900">Soğuk zincir</h3>
            </div>
            <p className="text-sm text-neutral-700">
              Isı kontrollü taşıma, sızdırmaz şerbetleme ve hızlı rota planlaması.
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-lg border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold text-neutral-900">Paketleme</h3>
            </div>
            <p className="text-sm text-neutral-700">
              Sızdırmaz kap, güven bantı, hediye ve kurumsal kutu seçenekleri.
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-lg border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold text-neutral-900">Zamanlama</h3>
            </div>
            <p className="text-sm text-neutral-700">
              Öğleden önce verilen siparişler aynı gün; diğerleri planlanarak çıkar.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl bg-white shadow-lg border border-neutral-100 p-6 space-y-4">
          <h3 className="text-xl font-bold text-neutral-900">Sık sorulanlar</h3>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-neutral-900">
                  {f.q}
                  <span className="material-symbols-outlined text-base text-amber-700 group-open:rotate-45 transition-transform">
                    add
                  </span>
                </summary>
                <p className="mt-3 text-sm text-neutral-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
