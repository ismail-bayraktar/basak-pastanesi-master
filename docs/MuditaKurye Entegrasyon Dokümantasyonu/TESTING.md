# Test ve Production

MuditaKurye entegrasyonunu test etmek ve production'a almak için rehber.

## 🧪 Local Test Ortamı

### 1. Ngrok ile Webhook Testi

```bash
# Ngrok yükle
npm install -g ngrok

# Sunucuyu başlat
node server.js

# Ngrok başlat
ngrok http 3000
```

Ngrok çıktısı:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### 2. Webhook URL'lerini Güncelle

MuditaKurye paneline:
- **Status URL**: `https://abc123.ngrok.io/webhook/muditakurye/status`
- **Cancel URL**: `https://abc123.ngrok.io/webhook/muditakurye/cancel`

### 3. Test Siparişi

```javascript
// test/create-test-order.js
import { createCourierOrder } from '../services/muditakurye.service';

async function runTest() {
  const testOrder = {
    id: `test_${Date.now()}`,
    customer: {
      name: 'Test Müşteri',
      phone: '+905551234567'
    },
    delivery: {
      address: 'Test Cad. No:1, Ankara',
      latitude: 39.9208,
      longitude: 32.8541
    },
    payment: { method: 'CASH', captured: false },
    total: 50.00,
    items: [{ sku: 'TEST_001', name: 'Test', quantity: 1, price: 50 }]
  };

  const result = await createCourierOrder(testOrder);
  console.log(result.success ? '✅ Başarılı' : '❌ Hata:', result);
}

runTest();
```

## 🔍 Manuel Webhook Testi

### cURL ile

```bash
curl -X POST https://abc123.ngrok.io/webhook/muditakurye/status \\
  -H "Content-Type: application/json" \\
  -H "X-MuditaKurye-Signature: YOUR_SIGNATURE" \\
  -d '{
    "event": "order.status_changed",
    "orderId": "test_123",
    "status": "PREPARED",
    "timestamp": "2025-11-12T15:30:00+03:00"
  }'
```

### Signature Oluşturma

```javascript
// test/generate-signature.js
import crypto from 'crypto';

const secret = process.env.MUDITAKURYE_WEBHOOK_SECRET;
const payload = { event: "order.status_changed", orderId: "test_123" };

const hmac = crypto.createHmac('sha256', secret);
const signature = hmac.update(JSON.stringify(payload)).digest('hex');

console.log('Signature:', signature);
```

## 📊 Loglama

```bash
npm install winston
```

```javascript
// lib/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

## 🚀 Staging

`.env.staging`:
```env
MUDITAKURYE_BASE_URL=https://staging-api.muditakurye.com
MUDITAKURYE_API_KEY=yk_staging_xxx
```

## 🎯 Production Checklist

- [ ] Tüm testler başarılı
- [ ] Production API Key alındı
- [ ] Webhook URL'leri HTTPS
- [ ] Environment variables ayarlandı
- [ ] Signature doğrulama aktif
- [ ] Loglama kuruldu
- [ ] Monitoring hazır

### Production .env

```env
MUDITAKURYE_BASE_URL=https://api.muditakurye.com.tr
MUDITAKURYE_API_KEY=yk_24c584705e97492483bcb4264338aa14
MUDITAKURYE_RESTAURANT_ID=rest_85b4ad47f35b45e893c9
MUDITAKURYE_WEBHOOK_SECRET=wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4
```

### Vercel Deploy

```bash
vercel env add MUDITAKURYE_API_KEY production
vercel --prod
```

## 📈 Monitoring

### Sentry

```bash
npm install @sentry/node
```

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Webhook'da
try {
  await processWebhook();
} catch (error) {
  Sentry.captureException(error);
}
```

## 🐛 Hata Ayıklama

### Webhook Gelmiyorsa

1. URL HTTPS mi?
2. Firewall açık mı?
3. Health check çalışıyor mu?
4. Logları kontrol et

### Signature Hatası

```javascript
const received = req.get('X-MuditaKurye-Signature');
const hmac = crypto.createHmac('sha256', secret);
const expected = hmac.update(req.rawBody).digest('hex');

console.log('Received:', received);
console.log('Expected:', expected);
```

## 🔄 Bakım

### API Key Rotasyonu

1. Yeni key oluştur
2. Staging'de test et
3. Production'ı güncelle
4. Eski key'i kapat

## 📞 Destek

- **E-posta**: info@muditayazilim.com.tr
- **Telefon**: +90 553 205 55 67

## ✅ Go-Live Sonrası

İlk 24-48 saat:
- [ ] Siparişleri takip et
- [ ] Webhook delivery kontrol et
- [ ] Hata oranları izle
- [ ] Performance monitör et

---

**Entegrasyon tamamlandı! 🎉**
