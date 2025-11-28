# Frontend (Web) - Vercel Environment Variables Setup

## Sorun
Frontend localhost:4001'e bağlanmaya çalışıyor ama production'da API Vercel'de çalışıyor!

## Çözüm - Environment Variables Eklenmeli

### 1. API Deployment URL'ini Bul

```bash
cd apps/api
vercel ls
```

En üstteki production URL'i kopyala. Örnek:
- `https://basakpastanesi-api.vercel.app` (custom domain varsa)
- `https://basakpastanesi-1tkexsv43-ismails-projects-06a1c35e.vercel.app` (Vercel otomatik URL)

### 2. Frontend Environment Variables Ekle

**Seçenek A: Vercel Dashboard'dan (Önerilen)**

1. https://vercel.com/ismails-projects-06a1c35e/basakpastanesi-web/settings/environment-variables
2. Şu variable'ları ekle:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_BACKEND_URL` | `https://basakpastanesi-api.vercel.app` | Production, Preview |
| `VITE_API_URL` | `https://basakpastanesi-api.vercel.app/api` | Production, Preview |

**Seçenek B: Vercel CLI'dan**

```bash
cd apps/web

# Production için
vercel env add VITE_BACKEND_URL production
# Değer: https://basakpastanesi-api.vercel.app

vercel env add VITE_API_URL production
# Değer: https://basakpastanesi-api.vercel.app/api

# Preview için (opsiyonel)
vercel env add VITE_BACKEND_URL preview
# Değer: https://basakpastanesi-api.vercel.app

vercel env add VITE_API_URL preview
# Değer: https://basakpastanesi-api.vercel.app/api
```

### 3. Yeni Deployment Tetikle

```bash
# GitHub'a push yap (otomatik deploy)
git commit --allow-empty -m "trigger redeploy for env vars"
git push

# VEYA CLI ile
cd apps/web
vercel --prod
```

---

## Local Development İçin

Local'de çalışırken `.env` dosyası kullanılıyor:

```env
VITE_BACKEND_URL=http://localhost:4001
VITE_API_URL=http://localhost:4001/api
```

Bu dosya `.gitignore`'da olmalı - production URL'leri sadece Vercel'de!

---

## Deployment Sonrası Test

1. Frontend'i aç: `https://basakpastanesi-web.vercel.app`
2. Console'u kontrol et - artık `localhost:4001` yerine API URL'ine istek atmalı
3. Network tab'da API isteklerini gör:
   - ✅ `https://basakpastanesi-api.vercel.app/api/product/list`
   - ❌ `localhost:4001/api/product/list` (eski hatalı)

---

## Not

- `VITE_` prefix'i zorunlu - Vite build zamanında bu variable'ları bundle'a dahil eder
- Env değişikliklerinden sonra **mutlaka yeniden deploy** gerekli
- Custom domain eklenirse URL'leri güncelle
