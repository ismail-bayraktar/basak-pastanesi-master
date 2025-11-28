# Frontend Entegrasyon Rehberi

Bu rehber, farklı bir GitHub reposunda bulunan hazır frontend'in bu projeye nasıl entegre edileceğini açıklar.

## 📋 Ön Hazırlık

### 1. Frontend Repo Bilgileri
- Frontend GitHub repo URL'si: `[FRONTEND_REPO_URL]`
- Frontend teknolojisi: `[React/Vue/Next.js/etc]`
- Frontend klasör yapısı: `[klasör yapısı]`

### 2. Mevcut Proje Yapısı
```
basak-pastanesi-master/
├── apps/
│   ├── web/          # Next.js frontend (mevcut)
│   ├── api/          # Express.js backend
│   └── admin/        # Admin panel
└── packages/         # Shared packages
```

---

## 🔄 Entegrasyon Yöntemleri

### Yöntem 1: Mevcut `apps/web` Klasörünü Değiştirme (Önerilen)

Eğer yeni frontend Next.js kullanıyorsa, mevcut `apps/web` klasörünü yeni frontend ile değiştirebilirsiniz.

#### Adımlar:

1. **Mevcut web klasörünü yedekle:**
```bash
cd apps
mv web web-backup
```

2. **Yeni frontend'i clone et:**
```bash
git clone [FRONTEND_REPO_URL] web
cd web
```

3. **Gerekli dosyaları kopyala:**
```bash
# Environment variables template'i kopyala
cp ../web-backup/.env.example .env.local

# Vercel config'i kopyala (varsa)
cp ../web-backup/vercel.json . 2>/dev/null || true
```

4. **Package.json'u güncelle:**
```json
{
  "name": "@basak-pastanesi/web",
  "version": "0.1.0",
  "private": true,
  // ... diğer ayarlar
}
```

5. **Dependencies'i yükle:**
```bash
pnpm install
```

---

### Yöntem 2: Yeni Frontend'i `apps/web` İçine Entegre Etme

Eğer frontend farklı bir teknoloji kullanıyorsa veya mevcut yapıyı korumak istiyorsanız:

#### Adımlar:

1. **Frontend'i geçici bir klasöre clone et:**
```bash
cd apps
git clone [FRONTEND_REPO_URL] frontend-temp
```

2. **Frontend dosyalarını `apps/web` içine kopyala:**
```bash
# Tüm dosyaları kopyala (src, public, vb.)
cp -r frontend-temp/* web/
cp -r frontend-temp/.* web/ 2>/dev/null || true
```

3. **Geçici klasörü sil:**
```bash
rm -rf frontend-temp
```

---

## 🔌 API Bağlantılarını Yapılandırma

### 1. Environment Variables Ayarlama

`apps/web/.env.local` dosyası oluşturun:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001

# Production için:
# NEXT_PUBLIC_BACKEND_URL=https://basak-pastanesi-api.vercel.app

# Diğer environment variables
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. API Client Yapılandırması

Frontend'de API çağrıları için `apps/web/src/lib/api/client.ts` dosyasını kullanın veya benzer bir yapı oluşturun:

```typescript
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. API Endpoint'lerini Eşleştirme

Mevcut backend endpoint'leri (`apps/web/src/lib/api/endpoints.ts`):

```typescript
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/api/product/list',
    DETAIL: (id: string) => `/api/product/${id}`,
    PRICE_RANGE: '/api/product/price-range',
  },
  
  // Cart
  CART: {
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    GET: '/api/cart/get',
  },
  
  // Orders
  ORDERS: {
    PLACE: '/api/order/place',
    USER_ORDERS: '/api/order/userorders',
    BANK_INFO: '/api/order/bank-info',
  },
  
  // Categories
  CATEGORIES: {
    ACTIVE: '/api/category/active',
  },
  
  // Sliders
  SLIDERS: {
    LIST: '/api/slider/list',
  },
};
```

**Frontend'deki API çağrılarını bu endpoint'lere göre güncelleyin.**

---

## 🗄️ Veritabanı Bağlantısı

Backend MongoDB kullanıyor. Veritabanı bağlantısı backend tarafında yapılandırılmış.

### Backend Veritabanı Yapılandırması

`apps/api/config/mongodb.js` dosyası MongoDB bağlantısını yönetiyor.

**Environment Variables (Backend için):**
```env
# apps/api/.env
MONGODB_URI=mongodb://localhost:27017/basak-pastanesi
# veya
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/basak-pastanesi
```

**Frontend'in veritabanına direkt erişmesi gerekmez.** Tüm veritabanı işlemleri backend API üzerinden yapılır.

---

## 📁 Dosya Yapısı Kontrolü

Frontend entegrasyonundan sonra kontrol edilmesi gerekenler:

### 1. Sayfa Yapısı
- ✅ Ana sayfa (`/`)
- ✅ Ürün listesi (`/collection`)
- ✅ Ürün detay (`/product/[id]`)
- ✅ Sepet (`/cart`)
- ✅ Checkout (`/checkout`)
- ✅ Giriş/Kayıt (`/login`, `/register`)
- ✅ Profil (`/profile`)
- ✅ Siparişler (`/orders`)

### 2. Bileşenler (Components)
- ✅ Header/Navbar
- ✅ Footer
- ✅ ProductCard
- ✅ Cart components
- ✅ Form components

### 3. Servisler (Services)
- ✅ `authService.ts` - Kimlik doğrulama
- ✅ `productService.ts` - Ürün işlemleri
- ✅ `cartService.ts` - Sepet işlemleri
- ✅ `orderService.ts` - Sipariş işlemleri

### 4. State Management
- ✅ Auth store (Zustand/Redux/Context)
- ✅ Cart store
- ✅ Product store

---

## 🔧 Gerekli Düzenlemeler

### 1. API Çağrılarını Güncelleme

Frontend'deki tüm API çağrılarını backend endpoint'lerine göre güncelleyin:

**Örnek:**
```typescript
// Eski (frontend'deki)
fetch('/api/products')

// Yeni (backend endpoint'ine göre)
fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/list`)
```

### 2. Authentication Token Yönetimi

Backend JWT token kullanıyor. Token'ı localStorage'da saklayın:

```typescript
// Login sonrası
localStorage.setItem('token', response.data.token);

// API çağrılarında
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 3. Image URL'lerini Güncelleme

Backend Cloudinary kullanıyor. Image URL'lerini kontrol edin:

```typescript
// apps/web/src/lib/utils/image.ts
export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath; // Cloudinary URL
  }
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imagePath}`;
}
```

### 4. CORS Ayarları

Backend CORS yapılandırması `apps/api/app.js` içinde. Frontend URL'ini ekleyin:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

---

## 🧪 Test Etme

### 1. Lokal Geliştirme

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

### 2. API Bağlantısını Test Et

```bash
# Backend'in çalıştığını kontrol et
curl http://localhost:4001/api/product/list

# Frontend'den API çağrısı yap
# Browser console'da test et
```

### 3. Sayfaları Kontrol Et

- [ ] Ana sayfa yükleniyor mu?
- [ ] Ürünler listeleniyor mu?
- [ ] Sepete ekleme çalışıyor mu?
- [ ] Login/Register çalışıyor mu?
- [ ] Checkout süreci çalışıyor mu?

---

## 📝 Checklist

Entegrasyon tamamlandıktan sonra kontrol edin:

### Backend Bağlantıları
- [ ] Environment variables ayarlandı
- [ ] API client yapılandırıldı
- [ ] Endpoint'ler eşleştirildi
- [ ] CORS ayarları yapıldı
- [ ] Token yönetimi çalışıyor

### Frontend Yapısı
- [ ] Tüm sayfalar çalışıyor
- [ ] Bileşenler import ediliyor
- [ ] Stil dosyaları yükleniyor
- [ ] Image'ler görüntüleniyor
- [ ] Responsive tasarım çalışıyor

### Fonksiyonellik
- [ ] Ürün listeleme çalışıyor
- [ ] Ürün detay gösteriliyor
- [ ] Sepete ekleme çalışıyor
- [ ] Sepet güncelleme çalışıyor
- [ ] Checkout süreci çalışıyor
- [ ] Login/Register çalışıyor
- [ ] Sipariş geçmişi gösteriliyor

---

## 🚀 Production Deployment

### 1. Environment Variables

Production için environment variables ayarlayın:

```env
NEXT_PUBLIC_BACKEND_URL=https://basak-pastanesi-api.vercel.app
NEXT_PUBLIC_SITE_URL=https://basak-pastanesi.vercel.app
```

### 2. Build

```bash
cd apps/web
pnpm build
```

### 3. Deploy

Vercel veya başka bir platforma deploy edin.

---

## 🆘 Sorun Giderme

### API Bağlantı Hatası

**Problem:** `Network Error` veya `CORS Error`

**Çözüm:**
1. Backend'in çalıştığını kontrol edin
2. CORS ayarlarını kontrol edin
3. Environment variable'ları kontrol edin

### Token Hatası

**Problem:** `401 Unauthorized`

**Çözüm:**
1. Login işlemini kontrol edin
2. Token'ın localStorage'a kaydedildiğini kontrol edin
3. API interceptor'ları kontrol edin

### Image Yüklenmiyor

**Problem:** Image'ler görüntülenmiyor

**Çözüm:**
1. Image URL'lerini kontrol edin
2. Next.js Image component kullanın
3. `next.config.ts` içinde image domain'lerini ekleyin

---

## 📞 İletişim

Sorularınız için:
- GitHub Issues
- Proje dokümantasyonu

---

**Son Güncelleme:** 2025-01-XX

