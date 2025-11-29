# Başak Pastanesi - Web & Admin Deployment Checklist

## ✅ Yapılması Gerekenler (Sırayla)

### 1. MongoDB Atlas IP Whitelist (2 dakika)

**Adımlar:**
1. MongoDB Atlas Dashboard'a gidin: https://cloud.mongodb.com/
2. Network Access → IP Access List
3. **ADD IP ADDRESS** tıklayın
4. **ALLOW ACCESS FROM ANYWHERE** seçin (otomatik 0.0.0.0/0 ekler)
5. **Confirm** yapın
6. ⏳ 1-2 dakika bekleyin (aktif olması için)

**Neden?** Vercel serverless functions dinamik IP'ler kullanır, MongoDB'nin tüm Vercel IP'lerine izin vermesi gerekir.

---

### 2. Vercel Web Project - Cache Temizliği

**URL:** https://vercel.com/ismails-projects-06a1c35e/basak-pastanesi-web

**Adım 1: Settings Kontrolü**
- Settings → General
- **Root Directory**: `apps/web` ✅
- **Build Command**: BOŞ (vercel.json kullanacak)
- **Output Directory**: BOŞ (vercel.json kullanacak)
- **Install Command**: BOŞ (vercel.json kullanacak)
- **Framework Preset**: Vite ✅

**Adım 2: Cache Temizliği ve Redeploy**
- Deployments sekmesine git
- En son deployment → ⋯ (üç nokta)
- **Redeploy**
- ✅ **Clear build cache and redeploy** işaretle
- **Redeploy** butonuna tıkla

**Beklenen Sonuç:**
- Build süresi: ~25 saniye
- Turbo cache hits görülmeli
- Build başarılı olmalı

---

### 3. Vercel Admin Project - Cache Temizliği

**URL:** https://vercel.com/ismails-projects-06a1c35e/basak-pastanesi-admin

**Aynı adımları tekrarla:**
1. Settings → General kontrolü (apps/admin)
2. Cache temizliği + Redeploy

---

### 4. Environment Variables - Web Project

**URL:** https://vercel.com/ismails-projects-06a1c35e/basak-pastanesi-web/settings/environment-variables

**Eklenecek Değişkenler:**

| Name | Value |
|------|-------|
| `VITE_BACKEND_URL` | `https://api-teal-omega-36.vercel.app` |
| `VITE_API_URL` | `https://api-teal-omega-36.vercel.app/api` |
| `VITE_ADMIN_URL` | `https://basak-pastanesi-admin.vercel.app` |

**Her değişken için:**
- Environment: ✅ Production, ✅ Preview, ✅ Development (hepsini seç)
- Add butonu

**Önemli:** Değişkenler eklendikten sonra otomatik redeploy tetiklenir.

---

### 5. Environment Variables - Admin Project

**URL:** https://vercel.com/ismails-projects-06a1c35e/basak-pastanesi-admin/settings/environment-variables

**Eklenecek Değişkenler:**

| Name | Value |
|------|-------|
| `VITE_BACKEND_URL` | `https://api-teal-omega-36.vercel.app` |
| `VITE_API_URL` | `https://api-teal-omega-36.vercel.app/api` |

**Her değişken için:**
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Add butonu

---

### 6. Deployment Kontrolü

**Adım 1: Build Logs Kontrolü**

Web project logs:
- Deployments → en son deployment → View Function Logs
- Kontrol et:
  - ✅ `turbo run build --filter=@basak-pastanesi/web` çalışıyor
  - ✅ `@repo/constants:build`, `@repo/types:build`, `@repo/utils:build` başarılı
  - ✅ Build completed in ~25s
  - ❌ `cd ../..` komutu YOK olmalı

Admin project logs:
- Aynı kontrolleri yap

**Adım 2: Live URL Testleri**

Web:
- https://basak-pastanesi-web.vercel.app/
- Ana sayfa yükleniyor mu?
- Console'da hata var mı? (F12 → Console)

Admin:
- https://basak-pastanesi-admin.vercel.app/
- Admin paneli açılıyor mu?

API:
- https://api-teal-omega-36.vercel.app/
- Çalışıyor mu?

---

### 7. Admin Login Testi

**Test Senaryosu:**
1. Admin paneline git: https://basak-pastanesi-admin.vercel.app/
2. Kullanıcı adı/şifre gir
3. Login butonuna tıkla

**Beklenen Sonuç:**
- ✅ Login başarılı
- ✅ Dashboard'a yönlendirme

**Hata Durumunda:**
1. F12 → Console aç
2. Network sekmesi → XHR filtresi
3. Login request'i kontrol et:
   - URL doğru mu? (https://api-teal-omega-36.vercel.app/api/...)
   - Response ne döndü?
4. Hata mesajını kaydet

---

## 🚨 Sorun Giderme

### Build Hatası: "cd ../.. not found"
**Çözüm:** Vercel Dashboard → Settings → General → Build Command'ı BOŞ birak

### Build Hatası: "pnpm-lock.yaml not found"
**Çözüm:** Root Directory ayarını kontrol et (apps/web veya apps/admin olmalı)

### MongoDB Bağlantı Hatası
**Çözüm:** MongoDB Atlas → Network Access → 0.0.0.0/0 eklenmiş mi kontrol et

### "internet bağlantısı yok" Hatası
**Çözüm:** Environment variables doğru mu? VITE_API_URL kontrol et

### Environment Variables Çalışmıyor
**Çözüm:** Değişkenler eklendikten sonra redeploy tetiklenmiş mi?

---

## ✅ Final Checklist

- [ ] MongoDB Atlas'a 0.0.0.0/0 eklendi
- [ ] Web project cache temizlendi ve redeploy edildi
- [ ] Admin project cache temizlendi ve redeploy edildi
- [ ] Web project environment variables eklendi
- [ ] Admin project environment variables eklendi
- [ ] Web build başarılı (~25s)
- [ ] Admin build başarılı (~25s)
- [ ] Web URL açılıyor
- [ ] Admin URL açılıyor
- [ ] API URL çalışıyor
- [ ] Admin login başarılı

---

## 📊 Başarı Kriterleri

| Kriter | Hedef | Durum |
|--------|-------|-------|
| Build süresi | <30 saniye | ⏳ |
| Build başarı | %100 | ⏳ |
| Turbo cache | Cache hits | ⏳ |
| MongoDB bağlantı | Başarılı | ⏳ |
| Admin login | Başarılı | ⏳ |
| Maliyet | <$2 | ⏳ |

**Toplam Tahmini Süre:** 15-20 dakika
**Maliyet Tahmini:** $0.50-$1.00
