# Vercel Environment Variables Setup

## 🚀 HIZLI KURULUM (ÖNERİLEN)

### Otomatik Setup Script Kullanarak

**Windows (PowerShell):**
```powershell
cd apps/api
powershell -ExecutionPolicy Bypass -File .\scripts\setup-vercel-env.ps1
```

**Linux/Mac:**
```bash
cd apps/api
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

Bu script tüm gerekli environment variables'ları otomatik olarak Vercel'e ekler!

---

## 📋 MANUEL KURULUM

Eğer script kullanmak istemiyorsanız, aşağıdaki değişkenleri manuel olarak ekleyin.

## EKSIK VE ZORUNLU DEGISKENLER

Asagidaki degiskenleri Vercel Dashboard > Settings > Environment Variables'tan ekleyin.

### 1. KRITIK - Hata Veren (Hemen Ekle)

```bash
# Webhook sifrelemesi icin (min 32 karakter)
vercel env add WEBHOOK_ENCRYPTION_KEY
# Deger: rastgele 32+ karakterlik guvenli bir key olusturun
# Ornek: openssl rand -hex 32
```

### 2. Server Ayarlari

```bash
vercel env add NODE_ENV
# Deger: production

vercel env add PORT
# Deger: 4001
```

### 3. URL Ayarlari

```bash
vercel env add FRONTEND_URL
# Deger: https://www.basakpastanesi.com (veya gercek frontend URL'iniz)

vercel env add BACKEND_URL
# Deger: https://basakpastanesi-api.vercel.app (veya custom domain)

vercel env add WEBHOOK_BASE_URL
# Deger: https://basakpastanesi-api.vercel.app

vercel env add CORS_ORIGINS
# Deger: https://www.basakpastanesi.com,https://admin.basakpastanesi.com
```

### 4. PayTR Odeme Entegrasyonu

```bash
vercel env add MERCHANT_ID
# Deger: PayTR'dan alinan merchant ID

vercel env add MERCHANT_KEY
# Deger: PayTR'dan alinan merchant key

vercel env add MERCHANT_SALT
# Deger: PayTR'dan alinan merchant salt

vercel env add TEST_MODE
# Deger: 1 (test) veya 0 (production)

vercel env add MERCHANT_OK_URL
# Deger: https://www.basakpastanesi.com/success

vercel env add MERCHANT_FAIL_URL
# Deger: https://www.basakpastanesi.com/failed
```

### 5. Email (SMTP) Ayarlari

```bash
vercel env add SMTP_HOST
# Deger: smtp.gmail.com (veya kullandiginiz SMTP)

vercel env add SMTP_PORT
# Deger: 587

vercel env add SMTP_USER
# Deger: email@example.com

vercel env add SMTP_PASSWORD
# Deger: SMTP sifresi veya app password
```

### 6. Redis (Opsiyonel - Vercel'de genelde devre disi)

```bash
vercel env add REDIS_ENABLED
# Deger: false
```

### 7. Diger Opsiyonel Ayarlar

```bash
vercel env add SENTRY_DSN
# Deger: (bos birakilabilir veya Sentry DSN)

vercel env add SMS_ENABLED
# Deger: false

vercel env add MUDITA_ENABLED
# Deger: false
```

---

## Hizli Kurulum Komutlari

Asagidaki komutlari sirayla calistirin (apps/api klasorunde):

```bash
# 1. KRITIK - Bu olmadan calismiyor!
vercel env add WEBHOOK_ENCRYPTION_KEY production
# Girdi: 32+ karakterlik rastgele key

# 2. Temel ayarlar
vercel env add NODE_ENV production
# Girdi: production

vercel env add CORS_ORIGINS production
# Girdi: https://your-frontend.vercel.app,https://your-admin.vercel.app

vercel env add FRONTEND_URL production
# Girdi: https://your-frontend.vercel.app

vercel env add BACKEND_URL production
# Girdi: https://basakpastanesi-api.vercel.app

# 3. Opsiyonel servisleri devre disi birak
vercel env add REDIS_ENABLED production
# Girdi: false

vercel env add SMS_ENABLED production
# Girdi: false

vercel env add MUDITA_ENABLED production
# Girdi: false
```

---

## Encryption Key Olusturma

### Windows (PowerShell)
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Linux/Mac
```bash
openssl rand -hex 32
```

### Online
https://randomkeygen.com/ adresinden "256-bit WEP Key" kullanabilirsiniz.

---

## Deployment Sonrasi Kontrol

Env'leri ekledikten sonra:

```bash
# Yeni deployment tetikle
vercel --prod

# Veya GitHub'a push yaparak otomatik deploy
git commit --allow-empty -m "trigger deploy"
git push
```

---

## Notlar

1. **WEBHOOK_ENCRYPTION_KEY** olmadan API baslatilmiyor - bu zorunlu!
2. PayTR bilgileri yoksa odeme calismaz ama API calisir
3. SMTP bilgileri yoksa email gonderilemez ama API calisir
4. Redis ve SMS devre disi birakilabilir (false)
