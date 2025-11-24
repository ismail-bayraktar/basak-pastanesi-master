'use client';

import Image from 'next/image';

export function MissionSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-[85%] mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Kurumsal Kimliğimiz</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-text-light-secondary dark:text-text-dark-secondary">
          Kalite, güven ve geleneksel lezzeti modern bir anlayışla birleştiriyoruz.
        </p>
      </div>
      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold leading-6">Misyonumuz</h3>
            <p className="mt-2 text-base text-text-light-secondary dark:text-text-dark-secondary">
              En taze ve doğal malzemelerle ürettiğimiz geleneksel baklavayı, hijyenik koşullarda
              ve modern sunumlarla tüm Türkiye'ye ulaştırarak, bu eşsiz lezzeti herkesin
              deneyimlemesini sağlamak.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold leading-6">Vizyonumuz</h3>
            <p className="mt-2 text-base text-text-light-secondary dark:text-text-dark-secondary">
              Türkiye'nin en sevilen ve güvenilen online baklava markası olmak, yenilikçi
              ürünlerimizle sektörde öncü konumda yer alarak lezzet mirasımızı gelecek nesillere
              taşımak.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold leading-6">Değerlerimiz</h3>
            <ul className="mt-2 space-y-2 text-base text-text-light-secondary dark:text-text-dark-secondary">
              <li className="flex items-start">
                <span className="material-symbols-outlined text-brand-secondary mr-2 mt-0.5 text-lg">
                  verified
                </span>
                <span>
                  <strong>Kalite:</strong> Her zaman en iyi malzemeyi kullanırız.
                </span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-brand-secondary mr-2 mt-0.5 text-lg">
                  verified
                </span>
                <span>
                  <strong>Güven:</strong> Müşterilerimize karşı şeffaf ve dürüstüz.
                </span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-brand-secondary mr-2 mt-0.5 text-lg">
                  verified
                </span>
                <span>
                  <strong>Doğallık:</strong> Ürünlerimizde katkı maddesi kullanmayız.
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="https://images.unsplash.com/photo-1587241321921-91a834d81caa?w=400&h=300&fit=crop&q=80"
            alt="TulumBak logo on a package"
            width={400}
            height={300}
            className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[4/3]"
          />
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop&q=80"
            alt="Founders of TulumBak smiling in their shop"
            width={400}
            height={300}
            className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[4/3]"
          />
        </div>
      </div>
      </div>
    </section>
  );
}
