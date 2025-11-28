'use client';

const badges = [
  {
    icon: 'verified',
    title: '%100 Doğal',
    subtitle: 'Katkısız malzeme',
  },
  {
    icon: 'local_shipping',
    title: 'Aynı Gün Teslimat',
    subtitle: 'Seçili bölgelerde',
  },
  {
    icon: 'payments',
    title: 'Güvenli Ödeme',
    subtitle: '3D Secure',
  },
  {
    icon: 'local_offer',
    title: 'Ücretsiz Kargo',
    subtitle: '500 TL ve üzeri',
  },
];

export function TrustBadgesSection() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-200/50 w-full">
      <div className="w-[85%] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3 justify-center">
              <span className="material-symbols-outlined text-brand-primary text-2xl">
                {badge.icon}
              </span>
              <div className="text-left">
                <p className="font-bold text-sm leading-tight">{badge.title}</p>
                <p className="text-xs text-text-light-secondary">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
