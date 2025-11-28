# Sorun Giderme Rehberi

## Sorun 1: Turborepo Eski Frontend'i Çalıştırıyor

**Çözüm:**
- Eski frontend (`apps/web-old-backup`) devre dışı bırakıldı
- Turborepo artık sadece yeni frontend'i (`apps/web`) çalıştıracak

## Sorun 2: Beyaz Ekran

### Olası Nedenler ve Çözümler:

1. **CSS Yüklenmiyor**
   - `src/index.css` dosyası var ve doğru import ediliyor
   - PostCSS config doğru yapılandırılmış
   - Tailwind CSS v4 kullanılıyor

2. **JavaScript Hatası**
   - Browser console'u açın (F12) ve hataları kontrol edin
   - Network tab'inde CSS ve JS dosyalarının yüklendiğini kontrol edin

3. **Port Çakışması**
   - Yeni frontend: `http://localhost:3000`
   - Eski frontend: `http://localhost:3001` veya başka port
   - Port 3000'in kullanıldığından emin olun

### Test Adımları:

1. **Dependencies Yükleyin:**
```bash
cd apps/web
pnpm install
```

2. **Dev Server'ı Başlatın:**
```bash
pnpm dev
```

3. **Browser'da Açın:**
- `http://localhost:3000` adresini açın
- Console'u kontrol edin (F12)
- Network tab'inde dosyaların yüklendiğini kontrol edin

4. **Eğer Hala Beyaz Ekran:**
- Browser cache'i temizleyin (Ctrl+Shift+R)
- `node_modules` klasörünü silip tekrar `pnpm install` yapın
- Vite cache'ini temizleyin: `rm -rf node_modules/.vite`

## Sorun 3: Import Path Hataları

Eğer `@/` path alias'ları çalışmıyorsa:
- `tsconfig.json` ve `vite.config.ts` dosyalarını kontrol edin
- Path alias'lar doğru yapılandırılmış olmalı

## Hızlı Çözüm:

```bash
# 1. Eski frontend'i durdurun (eğer çalışıyorsa)
# Ctrl+C ile durdurun

# 2. Yeni frontend'i başlatın
cd apps/web
pnpm install
pnpm dev

# 3. Browser'da açın
# http://localhost:3000
```

## Hala Çalışmıyorsa:

1. Browser console'u açın ve hataları paylaşın
2. Network tab'inde hangi dosyaların yüklenemediğini kontrol edin
3. Terminal'deki hata mesajlarını paylaşın

