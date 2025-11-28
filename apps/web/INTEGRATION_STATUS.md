# Frontend Entegrasyon Durumu

## ✅ Tamamlanan İşlemler

1. **Frontend Repo Entegrasyonu**
   - ✅ Frontend repo'su clone edildi
   - ✅ Eski frontend yedeklendi (`apps/web-old-backup`)
   - ✅ Yeni frontend `apps/web` klasörüne taşındı

2. **Package.json Güncellemeleri**
   - ✅ Monorepo'ya uygun hale getirildi (`@basak-pastanesi/web`)
   - ✅ Gerekli dependencies eklendi (axios, zustand, react-hot-toast)
   - ✅ Workspace dependencies eklendi (@repo/constants, @repo/types, @repo/utils)

3. **API Yapılandırması**
   - ✅ API client oluşturuldu (`src/lib/api/client.ts`)
   - ✅ API endpoints tanımlandı (`src/lib/api/endpoints.ts`)
   - ✅ Environment variables yapılandırıldı (Vite için)

4. **Servisler**
   - ✅ Product service (`src/services/productService.ts`)
   - ✅ Cart service (`src/services/cartService.ts`)
   - ✅ Auth service (`src/services/authService.ts`)
   - ✅ Order service (`src/services/orderService.ts`)

5. **Type Definitions**
   - ✅ Product types (`src/types/product.ts`)
   - ✅ Cart types (`src/types/cart.ts`)
   - ✅ Auth types (`src/types/auth.ts`)
   - ✅ Order types (`src/types/order.ts`)
   - ✅ API types (`src/types/api.ts`)

6. **Örnek Component Entegrasyonu**
   - ✅ FeaturedProducts component'i API'ye bağlandı

## 🔄 Yapılması Gerekenler

### 1. Dependencies Yükleme
```bash
cd apps/web
pnpm install
```

### 2. Environment Variables
`.env.local` dosyası oluşturun (gitignore'da olduğu için otomatik oluşturulamadı):
```env
VITE_BACKEND_URL=http://localhost:4001
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
VITE_SITE_URL=http://localhost:3000
```

### 3. Component'leri API'ye Bağlama

Aşağıdaki component'lerin API'ye bağlanması gerekiyor:

- [ ] **Categories.tsx** - Kategorileri API'den çek
- [ ] **CategoryPage.tsx** - Kategoriye göre ürünleri filtrele
- [ ] **ProductDetailPage.tsx** - Ürün detayını API'den çek
- [ ] **CartDrawer.tsx** - Sepeti API'den çek ve güncelle
- [ ] **CartPage.tsx** - Sepet sayfasını API'ye bağla
- [ ] **CheckoutPage.tsx** - Sipariş verme işlemini API'ye bağla
- [ ] **AccountPage.tsx** - Login/Register işlemlerini API'ye bağla
- [ ] **OrderHistoryPage.tsx** - Sipariş geçmişini API'den çek
- [ ] **OrderDetailPage.tsx** - Sipariş detayını API'den çek

### 4. State Management

Cart ve Auth için state management eklenmeli:
- Zustand store'ları oluşturulmalı
- LocalStorage ile senkronizasyon yapılmalı

### 5. Error Handling

Tüm API çağrılarında error handling eklenmeli:
- Loading states
- Error messages
- Retry logic

## 📝 Notlar

- Frontend Vite kullanıyor (Next.js değil)
- Environment variables için `VITE_` prefix'i kullanılmalı
- API client zaten error handling içeriyor (toast notifications)
- Backend URL: `http://localhost:4001` (development)

## 🧪 Test Etme

1. Backend'i başlatın:
```bash
cd apps/api
pnpm dev
```

2. Frontend'i başlatın:
```bash
cd apps/web
pnpm dev
```

3. Browser'da açın: `http://localhost:3000`

## 🔍 Sorun Giderme

### API Bağlantı Hatası
- Backend'in çalıştığını kontrol edin: `http://localhost:4001/api/product/list`
- `.env.local` dosyasının doğru olduğunu kontrol edin
- CORS ayarlarını kontrol edin (`apps/api/app.js`)

### Import Hatası
- Path alias'ları kontrol edin (`@/` root'a işaret ediyor)
- `tsconfig.json` ve `vite.config.ts` path ayarlarını kontrol edin

### Dependencies Hatası
- `pnpm install` çalıştırın
- Workspace dependencies için root'ta `pnpm install` çalıştırın

