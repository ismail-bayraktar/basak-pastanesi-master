'use client';

import Image from 'next/image';

const valueProps = [
  {
    title: 'Günlük Taze Üretim',
    description: 'Her sabah taze olarak hazırlanan baklavalarımız, aynı gün sofranızda.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&q=80',
  },
  {
    title: 'Geleneksel Tarifler',
    description: 'Nesillerdir süren ustamızın elleriyle, geleneksel yöntemlerle üretilir.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop&q=80',
  },
  {
    title: 'Birinci Sınıf Malzeme',
    description: 'Gaziantep fıstığı, Urfa yağı ve doğal pancar şekeriyle hazırlanır.',
    image: 'https://images.unsplash.com/photo-1587241321921-91a834d81caa?w=600&h=400&fit=crop&q=80',
  },
];

export function ValuePropsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[85%] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Neden TulumBak?</h2>
          <p className="text-lg text-text-light-secondary max-w-2xl mx-auto">
            Lezzet ve kaliteyi bir araya getiren üç temel değerimiz
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={prop.image}
                  alt={prop.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{prop.title}</h3>
                <p className="text-text-light-secondary leading-relaxed">{prop.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
