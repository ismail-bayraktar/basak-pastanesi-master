'use client';

const features = [
  {
    icon: 'local_shipping',
    title: 'Aynı Gün Teslimat',
    description: 'Belirli bölgelere özel, taptaze lezzetler aynı gün kapınızda.',
  },
  {
    icon: 'inventory_2',
    title: 'Özel Paketleme',
    description: 'Lezzet ve tazeliği koruyan, şık ve güvenli paketler.',
  },
  {
    icon: 'public',
    title: "Türkiye'ye Gönderim",
    description: "Bu eşsiz lezzetleri Türkiye'nin her yerine ulaştırıyoruz.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[85%] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary/20 text-brand-primary mb-4">
              <span className="material-symbols-outlined !text-4xl">{feature.icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
