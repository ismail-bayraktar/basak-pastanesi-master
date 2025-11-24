import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark text-text-dark-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/tulumbak-logo.png"
                alt="Tulumbak İzmir Baklava"
                width={140}
                height={42}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-text-dark-secondary text-sm leading-relaxed">
              İzmir'de günlük taze üretim, şerbetli tatlılarda hijyen ve soğuk zincirle güvenli teslimat.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-text-dark-secondary">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <span className="material-symbols-outlined text-base text-brand-primary">verified</span>
                Günlük üretim
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <span className="material-symbols-outlined text-base text-brand-primary">local_shipping</span>
                Soğuk zincir
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-base">Hızlı Erişim</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm">
                  Ana sayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm"
                >
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4 text-base">Müşteri Hizmetleri</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/orders"
                  className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm"
                >
                  Siparişlerim
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm"
                >
                  Gizlilik politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm"
                >
                  Kullanım şartları
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-text-dark-secondary hover:text-brand-primary transition-colors text-sm"
                >
                  Teslimat bilgileri
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-base">İletişim</h4>
            <ul className="space-y-2.5 text-text-dark-secondary text-sm">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-brand-primary mt-0.5 text-lg">
                  location_on
                </span>
                <span>İzmir, Türkiye</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-brand-primary mt-0.5 text-lg">call</span>
                <a href="tel:+905551234567" className="hover:text-brand-primary transition-colors">
                  +90 555 123 45 67
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-brand-primary mt-0.5 text-lg">mail</span>
                <a href="mailto:info@tulumbak.com" className="hover:text-brand-primary transition-colors">
                  info@tulumbak.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-brand-primary mt-0.5 text-lg">storefront</span>
                <Link
                  href="/contact"
                  className="hover:text-brand-primary transition-colors"
                >
                  Şubeler ve ziyaret
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-text-dark-secondary/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-dark-secondary text-sm text-center sm:text-left">
            &copy; {currentYear} Tulumbak İzmir Baklava. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            {['facebook', 'photo_camera', 'tag'].map((icon) => (
              <a
                key={icon}
                href="#"
                className="text-text-dark-secondary hover:text-brand-primary transition-colors"
                aria-label={icon}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
