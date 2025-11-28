'use client';

import Image from 'next/image';

export function StorySection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-bg-dark to-bg-dark/95 w-full">
      <div className="w-[85%] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-6 text-text-dark-primary">
            Nesillerdir Süren Lezzet Hikayesi
          </h2>
          <p className="text-xl text-text-dark-secondary max-w-3xl mx-auto leading-relaxed">
            Başak Pastanesi, dededen toruna geçen bir tutkunun, en kaliteli malzemelerle buluştuğu yerdir.
            Her bir dilim baklavamız, yılların tecrübesi ve ilk günkü heyecanla hazırlanır.
          </p>
        </div>
      </div>
    </section>
  );
}
