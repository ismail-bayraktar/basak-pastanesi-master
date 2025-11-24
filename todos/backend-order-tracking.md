# Backend Order Tracking System Requirements

## 🎯 Genel Bakış
Frontend sipariş takip sistemi için backend'in sağlaması gereken API'ler ve veritabanı yapıları.

## 📋 Gerekli API Endpoint'leri

### 1. Sipariş Takip API'leri
```
GET /api/order/track/:trackingId
- Sipariş takip numarası ile sipariş bilgileri
- Response: { order, statusHistory, estimatedDelivery, courierInfo }

GET /api/order/:orderId/status
- Sipariş ID'si ile mevcut durum
- Response: { status, lastUpdate, nextSteps }

POST /api/order/:orderId/track
- Sipariş durum güncelleme (internal/system use)
- Request: { status, location, timestamp, note }
```

### 2. Kurye Takip API'leri
```
GET /api/courier/:courierId/location
- Kurye mevcut konumu
- Response: { lat, lng, lastUpdate, estimatedArrival }

GET /api/order/:orderId/courier-info
- Siparişe atanan kurye bilgileri
- Response: { courier, contact, vehicle, estimatedTime }

POST /api/order/:orderId/courier-location-update
- Kurye konum güncelleme (courier app API)
- Request: { lat, lng, timestamp }
```

### 3. Sipariş Geçmişi API'leri
```
GET /api/order/:orderId/history
- Sipariş tüm durum geçmişi
- Response: [{ status, timestamp, location, note, updatedBy }]

GET /api/order/:orderId/timeline
- Sipariş zaman çizelgesi (özel format)
- Response: { completedSteps, currentStep, upcomingSteps, timeline }
```

## 🗄️ Veritabanı Modelleri

### Order Model Güncellemeleri
```javascript
// Ek alanlar Order model'e eklenmeli
{
  trackingId: { type: String, unique: true, required: true }, // ABC123XYZ
  statusHistory: [{
    status: String, // 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'
    timestamp: Date,
    location: String, // "İzmir, Bornova, Sanayi Mah."
    note: String, // "Siparişiniz hazırlanıyor"
    updatedBy: { type: String, enum: ['system', 'admin', 'courier'] }
  }],
  estimatedDelivery: Date,
  actualDelivery: Date,
  courier: { type: ObjectId, ref: 'Courier' },
  trackingLink: String, // WhatsApp/SMS gönderilecek link
}
```

### Courier Model (Yeni)
```javascript
{
  name: String,
  phone: String,
  email: String,
  vehicle: { type: String, enum: ['motorcycle', 'car', 'bicycle'] },
  plateNumber: String,
  isActive: Boolean,
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdate: Date
  },
  workingHours: {
    start: String, // "09:00"
    end: String   // "18:00"
  }
}
```

### OrderStatus Model (Yeni)
```javascript
{
  name: String, // "preparing", "ready", "picked_up", "delivering", "delivered", "cancelled"
  displayName: String, // "Hazırlanıyor"
  description: String,
  estimatedTime: Number, // dakika
  isCompleted: Boolean,
  requiresCourier: Boolean,
  customerVisible: Boolean,
  order: Number // durum sırası
}
```

## 🔐 Güvenlik Gereksinimleri

### 1. Authentication & Authorization
- Sipariş takip için authentication gerekli DEĞIL (public access)
- Kurye konum güncellemeleri için courier authentication
- Admin durum güncellemeleri için admin authentication

### 2. Data Protection
- Tracking ID'ler random ve tahmin edilemez olmalı
- Kurye konum bilgileri sadece sipariş sahibi ve admin görür
- Müşteri bilgileri korunmalı

### 3. Rate Limiting
- Sipariş takip API'leri için rate limiting
- Bot'ların abuse etmesini engelle

## 📱 Gerçek Zamanlı İletişim

### 1. WebSocket Events (Opsiyonel)
```javascript
// Client Events
'order:subscribe' -> { orderId, trackingId }
'order:unsubscribe' -> { orderId }

// Server Events
'order:status_update' -> { orderId, status, timestamp }
'order:courier_location' -> { orderId, lat, lng }
```

### 2. SMS Integration
```
POST /api/sms/send-tracking-link
- Müşteriye takip linki gönderme
- Request: { phone, trackingId, orderDetails }

SMS Template:
"Tulumbak siparişiniz: #ABC123. Takip için: https://tulumbak.com/track/ABC123"
```

### 3. WhatsApp Integration (Opsiyonel)
```
POST /api/whatsapp/send-tracking-link
- WhatsApp üzerinden takip linki gönderme
```

## 🚀 Performance Optimizasyon

### 1. Caching
- Sipariş durumları için Redis cache
- Kurye konumları için kısa süreli cache (1-2 dakika)

### 2. Database Indexing
```javascript
// Order model index'leri
orderSchema.index({ trackingId: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Courier model index'leri
courierSchema.index({ currentLocation: '2dsphere' });
courierSchema.index({ isActive: 1 });
```

## 🔄 Workflow Integration

### 1. Otomatik Durum Güncellemeleri
```javascript
// Order creation -> "preparing"
// Kitchen完成 -> "ready"
// Courier assigns -> "picked_up"
// Courier starts delivery -> "delivering"
// Customer confirms -> "delivered"
```

### 2. Notification Triggers
- Durum değiştiğinde SMS/Email gönder
- Kurye yaklaştığında bildirim
- Teslimat tamamlandığında memnuniyat anketi

## 🧪 Testing Gereksinimleri

### 1. Unit Tests
- Tracking ID generation
- Status validation
- Courier location updates

### 2. Integration Tests
- End-to-end sipariş takip flow
- Kurye konum güncellemeleri
- SMS/Email gönderimi

### 3. Load Tests
- Concurrent tracking requests
- Real-time location updates

## 📊 Analytics & Monitoring

### 1. Metrics
- Average delivery time
- Courier performance
- Customer satisfaction
- Tracking page visits

### 2. Logging
- Status change logs
- Courier location logs
- Error logs for failed updates

## ⚠️ Important Notes

### 1. Privacy
- Kurye konumları sadece teslimat sırasında visible
- Geçmiş konum bilgileri otomatik silinebilir

### 2. Data Retention
- Sipariş geçmişi minimum 1 yıl saklanmalı
- Kurye konum verileri 1 ay sonra silinebilir

### 3. Compliance
- KVKK uyumluluğu
- GDPR (varsa) uyumluluğu
- Lokal yasal gereksinimler

---

## 🚀 Implementasyon Önceliği

1. **Önce**: Order model güncellemeleri ve tracking ID generation
2. **Sonra**: Temel tracking API'leri
3. **Son**: Kurye takip ve real-time özellikler

Bu doküman backend geliştirme için referans olarak kullanılabilir.