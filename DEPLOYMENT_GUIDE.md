# Basak Pastanesi - Vercel Deployment Guide

**Sabaha Kadar Hazir! Demo Presentation Deployment**

---

## Quick Overview

Bu guide ile 3 app'i Vercel'e deploy edecegiz:
1. **API** - Backend (Node.js Express serverless)
2. **Web** - Frontend (Vite React)
3. **Admin** - Admin Panel (Vite React)

**Estimated Time**: 20-30 dakika

---

## Prerequisites

```powershell
# Vercel CLI yuklu mu kontrol et
vercel --version

# Yoksa yukle
npm install -g vercel

# Vercel'e login ol
vercel login
```

---

## STEP 1: API Deployment (10 dakika)

### 1.1 Environment Variables Setup

```powershell
cd apps/api
powershell -ExecutionPolicy Bypass -File .\scripts\setup-vercel-env.ps1
```

Bu script 20+ environment variable ekleyecek (MongoDB, Cloudinary, SMTP, etc.)

### 1.2 Deploy API

```powershell
# Still in apps/api
vercel --prod
```

### 1.3 Get Production URL

Deployment tamamlaninca Vercel size production URL verecek:
```
https://basakpastanesi-api.vercel.app
```

**ONEMLI**: Bu URL'i kopyala! Frontend'de kullanacagiz.

---

## STEP 2: Web Frontend Deployment (5 dakika)

### 2.1 Environment Variables Setup

```powershell
cd ../web  # apps/web'e git
powershell -ExecutionPolicy Bypass -File .\scripts\setup-vercel-env.ps1
```

### 2.2 Update API URLs

**Vercel Dashboard'a git:**
1. https://vercel.com/dashboard
2. basakpastanesi-web projesini ac
3. Settings > Environment Variables
4. `VITE_BACKEND_URL` ve `VITE_API_URL`'i guncelle:

```
VITE_BACKEND_URL = https://basakpastanesi-api.vercel.app
VITE_API_URL = https://basakpastanesi-api.vercel.app/api
```

### 2.3 Deploy Web

```powershell
# Still in apps/web
vercel --prod
```

---

## STEP 3: Admin Panel Deployment (5 dakika)

### 3.1 Environment Variables Setup

```powershell
cd ../admin  # apps/admin'e git
powershell -ExecutionPolicy Bypass -File .\scripts\setup-vercel-env.ps1
```

### 3.2 Update API URLs

**Vercel Dashboard:**
1. basakpastanesi-admin projesini ac
2. Settings > Environment Variables
3. `VITE_BACKEND_URL`'i guncelle:

```
VITE_BACKEND_URL = https://basakpastanesi-api.vercel.app
VITE_API_URL = https://basakpastanesi-api.vercel.app/api
```

### 3.3 Deploy Admin

```powershell
# Still in apps/admin
vercel --prod
```

---

## STEP 4: Update API CORS (Kritik!)

API'nin frontend'lerden request kabul etmesi icin CORS guncelle:

**Vercel Dashboard > API Project > Environment Variables:**

```
CORS_ORIGINS = https://basakpastanesi-web.vercel.app,https://basakpastanesi-admin.vercel.app
```

**Sonra API'yi redeploy et:**
```powershell
cd apps/api
vercel --prod
```

---

## STEP 5: Verification & Testing

### 5.1 Test API

```powershell
curl https://basakpastanesi-api.vercel.app
# Response: "API Working"
```

### 5.2 Test Web Frontend

1. Ac: `https://basakpastanesi-web.vercel.app`
2. Console'u ac (F12)
3. Network tab'i kontrol et
4. API istekleri dogru URL'e gitmeli

### 5.3 Test Admin Panel

1. Ac: `https://basakpastanesi-admin.vercel.app`
2. Login yap:
   - Email: `admin@basakpastanesi.com`
   - Password: `Basak PastanesiAdmin2024!Secure#Production`
3. Dashboard yuklendigini gormelisin

---

## Troubleshooting

### Problem: Web deployment "workspace:*" hatasi

**Cozum**: `apps/web/vercel.json` guncelledik (otomatik duzeltildi)
```json
"installCommand": "cd ../.. && pnpm install --frozen-lockfile"
```

### Problem: API 500 error

**Kontrol Et**:
1. MONGODB_URI dogru mu?
2. WEBHOOK_ENCRYPTION_KEY eklendi mi?
3. Vercel logs: `vercel logs`

### Problem: CORS error

**Cozum**:
1. API'de CORS_ORIGINS dogru mu?
2. API'yi redeploy et

---

## Production URLs (Kaydedelim)

Sabah sunumda kullanacagiz:

```
API:     https://basakpastanesi-api.vercel.app
Web:     https://basakpastanesi-web.vercel.app
Admin:   https://basakpastanesi-admin.vercel.app
```

---

## Next Steps for Demo

1. **Test Scenarios Hazirlama**
   - Urun ekleme/silme
   - Siparis olusturma
   - Admin panel gezintisi

2. **Demo Data**
   - Birkac ornek urun ekle
   - Test siparis olustur
   - Slider resimleri yukle

3. **Presentation Hazirlik**
   - URLs'leri not et
   - Ana ozellikleri listele
   - Sorunsuz demo icin once test et

---

## Emergency Rollback

Bir sorun olursa:

```powershell
# Onceki deployment'a don
vercel rollback
```

---

**Good luck with the presentation! 🚀**
