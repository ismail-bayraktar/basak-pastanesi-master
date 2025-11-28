# Frontend Setup Tamamlandı ✅

## Yapılan Değişiklikler

### 1. Workspace Çakışması Çözüldü
- `apps/web-old-backup/package.json` name'i `@basak-pastanesi/web-old-backup` olarak değiştirildi
- Artık workspace çakışması yok

### 2. Tailwind CSS Yapılandırması
- ✅ `tailwind.config.ts` oluşturuldu (Tailwind v4)
- ✅ `postcss.config.mjs` oluşturuldu
- ✅ `src/index.css` oluşturuldu (Tailwind directives ve custom theme)
- ✅ `index.tsx`'te CSS import'u eklendi
- ✅ `index.html`'den CDN Tailwind kaldırıldı

### 3. Environment Variables
- ✅ Vite config'de `VITE_BACKEND_URL` tanımlandı
- ✅ API client'ta `import.meta.env.VITE_BACKEND_URL` kullanılıyor
- ✅ `.env.example` oluşturuldu

**Not:** `.env.local` dosyasını manuel olarak oluşturun:
```env
VITE_BACKEND_URL=http://localhost:4001
VITE_SITE_URL=http://localhost:3000
```

### 4. API Entegrasyonu
- ✅ API client yapılandırıldı
- ✅ Tüm endpoint'ler `endpoints.ts`'de tanımlı
- ✅ Yeni endpoint'ler eklendi:
  - User Profile (`/api/user/profile`)
  - Addresses (`/api/user/addresses/*`)
  - Favorites (`/api/user/favorites/*`)
  - Reorder (`/api/order/reorder/:orderId`)
  - Reviews (`/api/reviews/*`)

### 5. UI Components
- ✅ Toaster component eklendi (react-hot-toast)
- ✅ Tüm component'ler hazır

## Çalıştırma

### 1. Dependencies Yükle
```bash
pnpm install
```

### 2. Environment Variables Ayarla
`apps/web/.env.local` dosyası oluşturun:
```env
VITE_BACKEND_URL=http://localhost:4001
VITE_SITE_URL=http://localhost:3000
```

### 3. Backend'i Başlat
```bash
cd apps/api
pnpm dev
```

### 4. Frontend'i Başlat
```bash
cd apps/web
pnpm dev
```

Frontend `http://localhost:3000` adresinde çalışacak.

## API Endpoint'leri

### User Management
- `GET /api/user/profile` - Kullanıcı profili
- `PUT /api/user/profile` - Profil güncelle
- `GET /api/user/addresses` - Adresleri listele
- `POST /api/user/addresses` - Adres ekle
- `PUT /api/user/addresses/:id` - Adres güncelle
- `DELETE /api/user/addresses/:id` - Adres sil
- `POST /api/user/addresses/:id/set-default` - Varsayılan adres

### Favorites
- `GET /api/user/favorites` - Favorileri getir
- `POST /api/user/favorites/add` - Favori ekle
- `DELETE /api/user/favorites/:productId` - Favori çıkar

### Orders
- `POST /api/order/reorder/:orderId` - Tekrar sipariş ver

### Reviews
- `POST /api/reviews` - Yorum ekle
- `GET /api/reviews/product/:productId` - Ürün yorumları
- `GET /api/reviews/user` - Kullanıcı yorumları

## Sorun Giderme

### Tailwind CSS Çalışmıyor
- `postcss.config.mjs` dosyasının var olduğunu kontrol edin
- `src/index.css` dosyasının import edildiğini kontrol edin
- Browser console'da CSS hataları var mı kontrol edin

### API Bağlantı Hatası
- Backend'in çalıştığını kontrol edin: `http://localhost:4001/api/product/list`
- `.env.local` dosyasında `VITE_BACKEND_URL` doğru mu kontrol edin
- CORS ayarlarını kontrol edin (backend'de `localhost:3000` izinli olmalı)

### Import Hatası
- Path alias'ları kontrol edin (`@/` root'a işaret ediyor)
- `tsconfig.json` ve `vite.config.ts` path ayarlarını kontrol edin

## Sonraki Adımlar

1. Component'leri API'ye bağlama (FeaturedProducts zaten bağlandı)
2. Categories component'ini API'ye bağlama
3. Cart component'ini backend'e bağlama
4. Checkout sürecini backend'e bağlama
5. Auth (Login/Register) entegrasyonu

