
# 4. WEBHOOK-INTEGRATION.md - Webhook entegrasyonu ve güvenlik
webhook_content = """# Webhook Entegrasyonu

MuditaKurye, sipariş durum güncellemelerini webhook ile gönderir.

## 🎯 Webhook URL'leri

Panelden iki webhook URL tanımlamalısınız:

1. **Status Update Webhook URL**: Durum güncellemeleri için
2. **Cancel Webhook URL**: İptal bildirimleri için

### Örnek URL'ler

```
https://yourapi.com/webhook/muditakurye/status
https://yourapi.com/webhook/muditakurye/cancel
```

## 🔐 Webhook Secret

```
wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4
```

Bu secret ile gelen isteklerin MuditaKurye'den geldiğini doğrulayabilirsiniz.

## 📨 Webhook Payload Yapısı

### Durum Güncellemesi

```json
{
  "event": "order.status_changed",
  "orderId": "order_123456",
  "muditaKuryeOrderId": "550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "RST-20251112-0042",
  "status": "PREPARED",
  "previousStatus": "VALIDATED",
  "timestamp": "2025-11-12T17:45:00+03:00",
  "provider": "THIRD_PARTY",
  "providerRestaurantId": "rest_85b4ad47f35b45e893c9"
}
```

### İptal Bildirimi

```json
{
  "event": "order.canceled",
  "orderId": "order_123456",
  "muditaKuryeOrderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CANCELED",
  "previousStatus": "ASSIGNED",
  "reason": "Restoran isteği",
  "canceledBy": "RESTAURANT",
  "timestamp": "2025-11-12T17:50:00+03:00"
}
```

## 🔒 Signature Doğrulama

### HMAC SHA-256 ile Güvenlik

```javascript
import crypto from 'crypto';

export function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch {
    return false;
  }
}
```

## 💻 Express.js Webhook Sunucusu

### Temel Yapı

```javascript
// server.js
import express from 'express';
import crypto from 'crypto';

const app = express();

// Raw body için özel middleware
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Signature doğrulama middleware
function verifySignature(req, res, next) {
  const signature = req.get('X-MuditaKurye-Signature');
  const secret = process.env.MUDITAKURYE_WEBHOOK_SECRET;
  
  if (!secret) {
    console.warn('⚠️ Webhook secret tanımlı değil, güvenlik kontrolü atlanıyor');
    return next();
  }
  
  if (!signature) {
    console.warn('⚠️ İstek signature içermiyor');
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(req.rawBody);
  const expected = hmac.digest('hex');
  
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      console.error('❌ Signature doğrulaması başarısız');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('❌ Signature doğrulama hatası:', error);
    return res.status(401).json({ error: 'Signature verification failed' });
  }
  
  next();
}

// Status webhook endpoint
app.post('/webhook/muditakurye/status', verifySignature, async (req, res) => {
  const { event, orderId, status, previousStatus, timestamp } = req.body;
  
  console.log(`📬 [Webhook] ${event}`);
  console.log(`   Order ID: ${orderId}`);
  console.log(`   Status: ${previousStatus} → ${status}`);
  console.log(`   Time: ${timestamp}`);
  
  // Hızlıca 200 dön (5 saniye içinde)
  res.status(200).json({ received: true });
  
  // Asenkron işlemler
  try {
    await processStatusUpdate(orderId, status, req.body);
  } catch (error) {
    console.error('❌ Status update işleme hatası:', error);
    // Hata loglama, alerting vs.
  }
});

// Cancel webhook endpoint
app.post('/webhook/muditakurye/cancel', verifySignature, async (req, res) => {
  const { event, orderId, reason, canceledBy, timestamp } = req.body;
  
  console.log(`📬 [Webhook] ${event}`);
  console.log(`   Order ID: ${orderId}`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Canceled By: ${canceledBy}`);
  
  res.status(200).json({ received: true });
  
  try {
    await processCancelation(orderId, reason, req.body);
  } catch (error) {
    console.error('❌ Cancel işleme hatası:', error);
  }
});

// Health check
app.get('/webhook/muditakurye/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook sunucusu çalışıyor: http://localhost:${PORT}`);
});
```

## 🎯 Next.js API Route (Alternatif)

```javascript
// pages/api/webhook/muditakurye/status.js
import crypto from 'crypto';
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Raw body al
  const rawBody = await buffer(req);
  const signature = req.headers['x-muditakurye-signature'];
  const secret = process.env.MUDITAKURYE_WEBHOOK_SECRET;

  // Signature doğrulama
  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const expected = hmac.update(rawBody).digest('hex');
    
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  }

  // Payload parse et
  const payload = JSON.parse(rawBody.toString());
  const { event, orderId, status } = payload;

  console.log(`📬 Webhook: ${event} - Order: ${orderId} - Status: ${status}`);

  // Hızlıca yanıt dön
  res.status(200).json({ received: true });

  // Asenkron işlemler (örn: DB update)
  // processStatusUpdate(payload).catch(console.error);
}
```

## 📊 İş Mantığı Örnekleri

### Durum Güncelleme İşleme

```javascript
async function processStatusUpdate(orderId, status, webhookData) {
  // Database güncelleme
  await db.orders.update(
    { id: orderId },
    { 
      courierStatus: status,
      lastWebhookAt: new Date(),
      webhookHistory: db.raw('array_append(webhook_history, ?)', [JSON.stringify(webhookData)])
    }
  );
  
  // Müşteriye bildirim gönder
  if (status === 'ON_DELIVERY') {
    await sendCustomerNotification(orderId, 'Siparişiniz yolda!');
  } else if (status === 'DELIVERED') {
    await sendCustomerNotification(orderId, 'Siparişiniz teslim edildi.');
  }
  
  // Admin panele bildirim
  await notifyAdminPanel(orderId, status);
}
```

### İptal İşleme

```javascript
async function processCancelation(orderId, reason, webhookData) {
  await db.orders.update(
    { id: orderId },
    { 
      status: 'canceled',
      cancelReason: reason,
      canceledAt: new Date()
    }
  );
  
  // Müşteriye bildirim
  await sendCustomerNotification(orderId, `Siparişiniz iptal edildi. Sebep: ${reason}`);
  
  // Ödeme iadesi tetikle (gerekirse)
  if (webhookData.paymentCaptured) {
    await initiateRefund(orderId);
  }
}
```

## 🔄 İdempotency ve Retry Yönetimi

```javascript
// Webhook idempotency için cache/DB kontrolü
const processedWebhooks = new Set();

app.post('/webhook/muditakurye/status', async (req, res) => {
  const webhookId = `${req.body.orderId}-${req.body.status}-${req.body.timestamp}`;
  
  if (processedWebhooks.has(webhookId)) {
    console.log('ℹ️ Webhook zaten işlendi, atlanıyor');
    return res.status(200).json({ received: true, duplicate: true });
  }
  
  processedWebhooks.add(webhookId);
  
  // İşleme devam et...
  res.status(200).json({ received: true });
});
```

## ⚠️ En İyi Pratikler

1. **Hızlı Yanıt**: Webhook'a 5 saniye içinde 200 dön
2. **Asenkron İşleme**: Ağır işleri queue'ya al
3. **İdempotency**: Aynı webhook birden fazla gelebilir
4. **Loglama**: Tüm webhook'ları kaydet
5. **Hata Yönetimi**: İşlem hatası olsa bile 200 dön, MuditaKurye retry yapar
6. **Güvenlik**: Signature doğrulamayı mutlaka yap

## 🔗 Sonraki Adım

[Test ve Production →](./TESTING.md)
"""

print("✅ WEBHOOK-INTEGRATION.md hazırlandı")
print(f"Dosya boyutu: {len(webhook_content)} karakter\n")
