# Vercel Deployment Guide - Başak Pastanesi

## Sorunlar ve Çözümler

### ❌ Önceki Sorunlar
1. **46 dakikalık build süresi** - Tüm monorepo her seferinde yeniden build ediliyordu
2. **Gereksiz manuel kurulum** - buildCommand içinde pnpm install çalışıyordu
3. **Turbo cache kullanılmıyordu** - Build optimizasyonu yoktu
4. **Her deploy'da full rebuild** - Sadece web değişse bile tüm paketler build ediliyordu

### ✅ Çözüm: Optimize Edilmiş Konfigürasyon

## Yeni Konfigürasyon Yapısı

### Root `vercel.json`
```json
{
  "buildCommand": "turbo run build --filter=@basak-pastanesi/web",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null,
  "nodeVersion": "20.x"
}
```

**Özellikler:**
- ✅ Turbo ile akıllı build (sadece değişen paketler)
- ✅ pnpm workspace desteği
- ✅ Build cache aktif
- ✅ Node 20.x garantisi

### App `apps/web/vercel.json`
```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "ignoreCommand": "npx turbo-ignore"
}
```

**Özellikler:**
- ✅ Vite otomatik algılama
- ✅ Akıllı deployment (sadece web değiştiğinde)
- ✅ turbo-ignore ile gereksiz build'ler engellenir

## Deployment Süreci

### 1. İlk Deploy (Vercel Dashboard)
```bash
# Vercel projesine git
# Settings → General → Root Directory: apps/web
# Settings → General → Framework Preset: Vite
# Settings → Git → Production Branch: main
```

### 2. Environment Variables (Gerekirse)
```bash
# Settings → Environment Variables
VITE_API_URL=https://your-api-url.vercel.app
VITE_BACKEND_URL=https://your-backend-url.vercel.app
```

### 3. Deploy Tetikleme
```bash
# Push to main branch
git add .
git commit -m "fix: optimize Vercel deployment configuration"
git push origin main

# Vercel otomatik deploy başlatır
```

## Beklenen Performans İyileştirmeleri

| Metrik | Önce | Sonra | İyileşme |
|--------|------|-------|----------|
| **Build Süresi** | 46 dakika | 2-5 dakika | 🚀 ~90% daha hızlı |
| **Cache Kullanımı** | Yok | Aktif | ✅ Turbo cache |
| **Gereksiz Build** | Her zaman | Asla | ✅ turbo-ignore |
| **Dependency Install** | Her seferinde | Cache'den | ✅ pnpm cache |

## Troubleshooting

### Build Hatası: "Cannot find module @repo/..."
**Neden:** Shared paketler build edilmemiş
**Çözüm:** Root vercel.json'daki turbo build komutu otomatik halleder

### Build 30+ dakika sürüyor
**Neden:** Turbo cache temiz veya ilk build
**Çözüm:** İkinci deploy'dan sonra normal (2-5dk)

### Deploy tetiklenmiyor
**Neden:** turbo-ignore değişiklikleri görmüyor
**Çözüm:** `apps/web/` veya `packages/` içinde değişiklik yapın

### Vite build hatası
**Neden:** Environment variables eksik
**Çözüm:** Vercel dashboard'dan VITE_* değişkenlerini ekleyin

## Monorepo Deployment Strategy

### Web App Deployment
- **Trigger:** `apps/web/` veya shared packages değiştiğinde
- **Build:** Turbo otomatik dependencies build eder
- **Output:** `apps/web/dist/`

### API Deployment (Ayrı proje)
- **Trigger:** `apps/api/` değiştiğinde
- **Build:** Node.js serverless functions
- **Output:** Vercel Functions

### Admin Deployment (Ayrı proje)
- **Trigger:** `apps/admin/` değiştiğinde
- **Build:** Vite build
- **Output:** `apps/admin/dist/`

## Deployment Checklist

- [ ] Root `vercel.json` oluşturuldu
- [ ] App `vercel.json` güncellendi
- [ ] Vercel project settings doğru (Root Directory: apps/web)
- [ ] Environment variables eklendi
- [ ] Build command Turbo kullanıyor
- [ ] turbo-ignore aktif
- [ ] İlk deploy test edildi
- [ ] İkinci deploy cache kullanımı doğrulandı

## Monitoring

### Build Logs İnceleme
```bash
# Vercel Dashboard → Deployments → [Latest] → Building
# Şunları kontrol et:
# ✅ "Restored build cache" mesajı
# ✅ "Turbo cache hit" mesajları
# ✅ Build süresi <5 dakika
# ✅ Shared packages cached
```

### Performance Metrics
- **Time to Build:** <5 dakika olmalı
- **Cache Hit Rate:** >80% (ikinci build'den sonra)
- **Bundle Size:** Vite otomatik optimize eder
- **Deployment Frequency:** turbo-ignore gereksiz build'leri engeller

## Sonuç

Bu yeni konfigürasyon ile:
- ⚡ **90% daha hızlı** build süreleri
- 🎯 **Sadece gerekli** build'ler çalışır
- 💾 **Cache optimizasyonu** her seviyede
- 🔧 **Bakım kolay** ve standart Vercel best practices

## İletişim

Sorun yaşarsanız:
1. Build logs'u kontrol edin
2. Vercel dashboard error mesajlarına bakın
3. Bu dosyadaki troubleshooting bölümünü inceleyin
