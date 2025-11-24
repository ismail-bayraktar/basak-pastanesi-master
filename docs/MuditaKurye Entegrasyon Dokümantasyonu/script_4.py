
# 5. TESTING.md - Test ve production süreçleri
testing_content = """# Test ve Production

MuditaKurye entegrasyonunu test etmek ve production'a almak için adım adım rehber.

## 🧪 Local Test Ortamı

### 1. Ngrok ile Webhook Testi

Webhook endpoint'inizi dışarıya açmak için:

```bash
# Ngrok yükle (ilk kez)
npm install -g ngrok

# Sunucunuzu başlatın
node server.js
# veya
npm run dev

# Başka bir terminalde ngrok başlatın
ngrok http 3000
```

Ngrok çıktısı:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### 2. Webhook URL'lerini Panelde Güncelle

MuditaKurye paneline gidin:
- **Status Webhook URL**: `https://abc123.ngrok.io/webhook/muditakurye/status`
- **Cancel Webhook URL**: `https://abc123.ngrok.io/webhook/muditakurye/cancel`

### 3. Test Siparişi Gönder

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
      address: 'Test Caddesi No:1, Çankaya, Ankara',
      latitude: 39.9208,
      longitude: 32.8541,
      notes: 'Test siparişi'
    },
    payment: {
      method: 'CASH',
      captured: false
    },
    total: 50.00,
    items: [
      {
        sku: 'TEST_001',
        name: 'Test Ürün',
        quantity: 1,
        price: 50.00
      }
    ]
  };

  console.log('🧪 Test siparişi gönderiliyor...');
  const result = await createCourierOrder(testOrder);
  
  if (result.success) {
    console.log('✅ Test başarılı!');
    console.log('Sipariş ID:', result.data.orderId);
    console.log('Webhook sunucunuzu kontrol edin...');
  } else {
    console.error('❌ Test başarısız:', result.error);
  }
}

runTest();
```

Çalıştır:
```bash
node test/create-test-order.js
```

## 🔍 Manuel Webhook Testi

### Postman/cURL ile Test

```bash
# Status webhook test
curl -X POST https://abc123.ngrok.io/webhook/muditakurye/status \\
  -H "Content-Type: application/json" \\
  -H "X-MuditaKurye-Signature: test_signature" \\
  -d '{
    "event": "order.status_changed",
    "orderId": "test_123",
    "status": "PREPARED",
    "previousStatus": "VALIDATED",
    "timestamp": "2025-11-12T15:30:00+03:00"
  }'
```

### Signature Oluşturma (Test için)

```javascript
// test/generate-signature.js
import crypto from 'crypto';

const secret = process.env.MUDITAKURYE_WEBHOOK_SECRET;
const payload = {
  event: "order.status_changed",
  orderId: "test_123",
  status: "PREPARED"
};

const hmac = crypto.createHmac('sha256', secret);
const signature = hmac.update(JSON.stringify(payload)).digest('hex');

console.log('Signature:', signature);
console.log('\\nPostman için header:');
console.log(`X-MuditaKurye-Signature: ${signature}`);
```

## 📊 Loglama ve Monitoring

### Winston ile Yapılandırılmış Loglama

```bash
npm install winston
```

```javascript
// lib/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
```

Kullanım:
```javascript
import { logger } from './lib/logger';

logger.info('Sipariş oluşturuldu', { orderId, status });
logger.error('Webhook hatası', { error: error.message, orderId });
```

## 🚀 Staging Ortamı

### Staging API Kullanımı

`.env.staging`:
```env
MUDITAKURYE_BASE_URL=https://staging-api.muditakurye.com
MUDITAKURYE_API_KEY=yk_staging_xxx
MUDITAKURYE_RESTAURANT_ID=rest_staging_xxx
```

### Staging Test Senaryoları

1. **Sipariş Oluşturma**: Normal akış testi
2. **Durum Güncellemeleri**: Tüm durumları test et
3. **İptal Senaryosu**: Sipariş iptal testi
4. **Hata Senaryoları**: Geçersiz data, timeout vs.
5. **Signature Doğrulama**: Güvenlik testi

## 🎯 Production Checklist

### Deployment Öncesi

- [ ] Tüm test senaryoları başarılı
- [ ] Production API Key alındı
- [ ] Webhook URL'leri HTTPS ve güvenli
- [ ] Environment variables production'da ayarlandı
- [ ] Signature doğrulama aktif
- [ ] Hata loglama ve monitoring kuruldu
- [ ] Rate limiting test edildi
- [ ] Idempotency mekanizması çalışıyor

### Environment Variables (Production)

```env
# Production API
MUDITAKURYE_BASE_URL=https://api.muditakurye.com.tr
MUDITAKURYE_API_KEY=yk_production_xxx
MUDITAKURYE_RESTAURANT_ID=rest_production_xxx
MUDITAKURYE_WEBHOOK_SECRET=wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4

# Webhook URLs (production domain)
MUDITAKURYE_STATUS_WEBHOOK_URL=https://yourapi.com/webhook/muditakurye/status
MUDITAKURYE_CANCEL_WEBHOOK_URL=https://yourapi.com/webhook/muditakurye/cancel

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Deployment (Vercel örneği)

```bash
# Environment variables ayarla
vercel env add MUDITAKURYE_API_KEY production

# Deploy
vercel --prod
```

### Webhook URL'leri Güncelleme

Production deploy'dan sonra MuditaKurye paneline girin:
1. **Ayarlar → Entegrasyon**
2. **Status Webhook URL**: `https://yourapi.com/webhook/muditakurye/status`
3. **Cancel Webhook URL**: `https://yourapi.com/webhook/muditakurye/cancel`
4. **Kaydet**

## 📈 Monitoring ve Alerting

### Sentry Entegrasyonu

```bash
npm install @sentry/node
```

```javascript
// lib/sentry.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

Webhook'da kullanım:
```javascript
import Sentry from './lib/sentry';

app.post('/webhook/muditakurye/status', async (req, res) => {
  try {
    // ... işlemler
  } catch (error) {
    Sentry.captureException(error, {
      extra: { orderId, webhookData: req.body }
    });
    console.error('Webhook error:', error);
  }
  
  res.status(200).json({ received: true });
});
```

## 🐛 Hata Ayıklama

### Webhook Gelmiyorsa

1. **URL Kontrolü**: HTTPS, geçerli SSL sertifikası
2. **Firewall/CORS**: Webhook endpoint'ine erişim açık mı?
3. **Panelden Test**: MuditaKurye panelinde "Test Webhook" butonu
4. **Loglar**: Sunucu loglarını kontrol et
5. **Health Check**: `/webhook/muditakurye/health` çalışıyor mu?

### Signature Hatası

```javascript
// Debug için signature karşılaştırma
const receivedSignature = req.get('X-MuditaKurye-Signature');
const hmac = crypto.createHmac('sha256', secret);
const expected = hmac.update(req.rawBody).digest('hex');

console.log('Received:', receivedSignature);
console.log('Expected:', expected);
console.log('Match:', receivedSignature === expected);
```

### Sipariş Gönderilmiyor

```javascript
// Detaylı hata loglama
try {
  const response = await muditaKuryeClient.post('/webhook/third-party/order', payload);
} catch (error) {
  console.error('Request config:', error.config);
  console.error('Response status:', error.response?.status);
  console.error('Response data:', error.response?.data);
  console.error('Request headers:', error.config?.headers);
}
```

## 🔄 Production Bakım

### API Key Rotasyonu

1. Panelden yeni key oluştur
2. Staging'de test et
3. Production environment variable güncelle
4. Deploy
5. Eski key'i devre dışı bırak

### Webhook URL Değişikliği

1. Yeni endpoint deploy et
2. Panelde URL'yi güncelle
3. Test et
4. Eski endpoint'i deprecate et

## 📞 Destek ve İletişim

### MuditaKurye Destek

- **E-posta**: info@muditayazilim.com.tr
- **Telefon**: +90 553 205 55 67
- **Dokümantasyon**: https://integration.muditakurye.com.tr/

### Hata Bildirimi

Destek ekibine gönderilecek bilgiler:
- Sipariş ID
- Tarih/saat
- Hata mesajı
- Request/response logları
- Environment (staging/production)

## ✅ Production Go-Live Sonrası

İlk 24-48 saat:
- [ ] Tüm siparişleri yakından takip et
- [ ] Webhook delivery rate kontrol et
- [ ] Hata oranlarını monitör et
- [ ] Müşteri geri bildirimlerini topla
- [ ] Performance metriklerini izle

---

**Entegrasyonunuz başarıyla tamamlandı! 🎉**
"""

print("✅ TESTING.md hazırlandı")
print(f"Dosya boyutu: {len(testing_content)} karakter\n")
