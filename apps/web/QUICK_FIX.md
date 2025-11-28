# Hızlı Çözüm Rehberi

## Sorun: Beyaz Ekran

### Adım 1: Dependencies Yükleyin
```bash
cd apps/web
pnpm install
```

### Adım 2: Dev Server'ı Başlatın
```bash
pnpm dev
```

### Adım 3: Browser Console'u Kontrol Edin
1. Browser'da `http://localhost:3000` açın
2. F12 ile Developer Tools'u açın
3. Console tab'inde hataları kontrol edin
4. Network tab'inde dosyaların yüklendiğini kontrol edin

### Adım 4: Eğer Hala Beyaz Ekran
1. **Browser Cache Temizle:**
   - Ctrl + Shift + R (hard refresh)
   - Veya Developer Tools > Application > Clear Storage

2. **Vite Cache Temizle:**
```bash
cd apps/web
rm -rf node_modules/.vite
pnpm dev
```

3. **Node Modules Yeniden Yükle:**
```bash
cd apps/web
rm -rf node_modules
pnpm install
pnpm dev
```

## Sorun: Turborepo Eski Frontend'i Çalıştırıyor

Eski frontend devre dışı bırakıldı. Artık sadece yeni frontend çalışacak.

```bash
# Root'tan çalıştırın
pnpm dev

# Veya direkt yeni frontend'i çalıştırın
cd apps/web
pnpm dev
```

## Debug İçin Console Log'ları

App.tsx ve index.tsx'e console.log'lar eklendi. Browser console'unda şunları göreceksiniz:
- `🚀 Starting app...`
- `✅ Root element found`
- `✅ App rendered`
- `🎨 Rendering App, view: home`

Eğer bu log'lar görünmüyorsa, JavaScript yüklenmiyor demektir.

