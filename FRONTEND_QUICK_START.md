# 🚀 Frontend Entegrasyonu - Hızlı Başlangıç

Bu rehber, hazır frontend'inizi bu projeye entegre etmek için hızlı adımları içerir.

## ⚡ Hızlı Adımlar

### 1. Frontend Repo'sunu Clone Et

```bash
# Windows
cd apps
git clone [FRONTEND_REPO_URL] web-temp

# Mevcut web klasörünü yedekle (opsiyonel)
move web web-backup
move web-temp web
```

### 2. Environment Variables Ayarla

`apps/web/.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. API Bağlantılarını Yapılandır

Frontend'deki API çağrılarını backend endpoint'lerine göre güncelle:

**Mevcut Backend Endpoint'leri:**
- Ürünler: `/api/product/list`
- Sepet: `/api/cart/add`, `/api/cart/get`
- Sipariş: `/api/order/place`
- Auth: `/api/user/login`, `/api/user/register`

**Detaylı mapping için:** `API_ENDPOINTS_MAPPING.md` dosyasına bakın.

### 4. Dependencies Yükle

```bash
cd apps/web
pnpm install
```

### 5. Backend'i Başlat

```bash
# Terminal 1
cd apps/api
pnpm dev
```

### 6. Frontend'i Başlat

```bash
# Terminal 2
cd apps/web
pnpm dev
```

---

## 📋 Checklist

Entegrasyon sırasında kontrol edin:

- [ ] Frontend repo'su clone edildi
- [ ] `.env.local` dosyası oluşturuldu
- [ ] API endpoint'leri güncellendi
- [ ] API client yapılandırıldı (`src/lib/api/client.ts`)
- [ ] Token yönetimi çalışıyor (localStorage)
- [ ] Backend çalışıyor (`http://localhost:4001`)
- [ ] Frontend çalışıyor (`http://localhost:3000`)
- [ ] API çağrıları başarılı

---

## 🔧 Otomatik Entegrasyon Script'i

Daha kolay entegrasyon için script kullanabilirsiniz:

**Windows:**
```bash
scripts\integrate-frontend.bat [FRONTEND_REPO_URL]
```

**Linux/Mac:**
```bash
chmod +x scripts/integrate-frontend.sh
./scripts/integrate-frontend.sh [FRONTEND_REPO_URL]
```

---

## 📚 Detaylı Dokümantasyon

- **Tam Entegrasyon Rehberi:** `FRONTEND_INTEGRATION.md`
- **API Endpoint Mapping:** `API_ENDPOINTS_MAPPING.md`
- **Backend API Dokümantasyonu:** `apps/api/` klasörü

---

## 🆘 Sorun Giderme

### API Bağlantı Hatası

**Problem:** `Network Error` veya `CORS Error`

**Çözüm:**
1. Backend'in çalıştığını kontrol edin: `http://localhost:4001/api/product/list`
2. `.env.local` dosyasında `NEXT_PUBLIC_BACKEND_URL` doğru mu?
3. Backend CORS ayarlarını kontrol edin (`apps/api/app.js`)

### Token Hatası

**Problem:** `401 Unauthorized`

**Çözüm:**
1. Login işlemi başarılı mı?
2. Token localStorage'a kaydediliyor mu?
3. API client'ta Authorization header ekleniyor mu?

### Sayfa Yüklenmiyor

**Problem:** Sayfa boş veya hata veriyor

**Çözüm:**
1. Browser console'da hata var mı?
2. Network tab'da API çağrıları başarılı mı?
3. Dependencies yüklü mü? (`pnpm install`)

---

## 💡 İpuçları

1. **API Client Kullanın:** Tüm API çağrıları için `src/lib/api/client.ts` kullanın
2. **Environment Variables:** Production için `.env.production` dosyası oluşturun
3. **TypeScript:** Type safety için `@/types` klasöründeki type'ları kullanın
4. **Error Handling:** Tüm API çağrılarında try-catch kullanın

---

**Başarılar! 🎉**

