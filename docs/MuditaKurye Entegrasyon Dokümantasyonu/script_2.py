
# 3. ORDER-MANAGEMENT.md - Sipariş oluşturma ve yönetimi
order_content = """# Sipariş Yönetimi

MuditaKurye'ye sipariş göndermek için REST API kullanılır.

## 📤 Sipariş Oluşturma

### Endpoint

```
POST https://api.muditakurye.com.tr/webhook/third-party/order
```

### Request Headers

```http
X-API-Key: yk_24c584705e97492483bcb4264338aa14
Content-Type: application/json
```

### Request Body (Zorunlu Alanlar)

```json
{
  "orderId": "order_123456",
  "restaurantId": "rest_85b4ad47f35b45e893c9",
  "customerName": "Ahmet Yılmaz",
  "deliveryAddress": "Atatürk Cad. No:123, Çankaya, Ankara"
}
```

### Request Body (Tüm Alanlar)

```json
{
  "orderId": "order_123456",
  "restaurantId": "rest_85b4ad47f35b45e893c9",
  "customerName": "Ahmet Yılmaz",
  "customerPhone": "+905551234567",
  "customerEmail": "ahmet@example.com",
  "deliveryAddress": "Atatürk Cad. No:123, Çankaya, Ankara",
  "deliveryLatitude": 39.9208,
  "deliveryLongitude": 32.8541,
  "scheduledDeliveryTime": "2025-11-12T18:30:00+03:00",
  "paymentMethod": "CASH",
  "paymentCaptured": false,
  "subtotal": 129.50,
  "deliveryFee": 15.00,
  "serviceFee": 5.00,
  "discount": 10.00,
  "taxAmount": 9.50,
  "total": 149.00,
  "currency": "TRY",
  "notes": "Kapıyı çalmadan önce arayın",
  "items": [
    {
      "productCode": "PIZZA_001",
      "productName": "Margarita Pizza",
      "quantity": 2,
      "unitPrice": 45.00,
      "totalAmount": 90.00,
      "productNote": "Ekstra peynir"
    },
    {
      "productCode": "DRINK_001",
      "productName": "Coca Cola 1L",
      "quantity": 1,
      "unitPrice": 20.00,
      "totalAmount": 20.00
    }
  ]
}
```

## 💻 Node.js/Express Örneği

### Sipariş Gönderme Servisi

```javascript
// services/muditakurye.service.js
import { muditaKuryeClient } from '../lib/muditakurye-client';
import { randomUUID } from 'crypto';

export async function createCourierOrder(orderData) {
  try {
    const payload = {
      orderId: orderData.id || `ext_${randomUUID()}`,
      restaurantId: process.env.MUDITAKURYE_RESTAURANT_ID,
      customerName: orderData.customer.name,
      customerPhone: orderData.customer.phone,
      deliveryAddress: orderData.delivery.address,
      deliveryLatitude: orderData.delivery.latitude,
      deliveryLongitude: orderData.delivery.longitude,
      paymentMethod: orderData.payment.method, // "CASH" | "CARD" | "ONLINE"
      paymentCaptured: orderData.payment.captured,
      total: orderData.total,
      currency: 'TRY',
      items: orderData.items.map(item => ({
        productCode: item.sku,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalAmount: item.quantity * item.price,
        productNote: item.note
      })),
      notes: orderData.delivery.notes
    };

    const response = await muditaKuryeClient.post(
      '/webhook/third-party/order',
      payload
    );

    console.log('✅ MuditaKurye sipariş oluşturuldu:', response.data);
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ MuditaKurye sipariş hatası:', error.message);
    
    if (error.response) {
      console.error('Hata detayı:', error.response.status, error.response.data);
      return {
        success: false,
        error: error.response.data,
        status: error.response.status
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}
```

## 🎯 Next.js API Route Örneği

```javascript
// pages/api/orders/create.js
import { createCourierOrder } from '../../../services/muditakurye.service';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    
    // Sipariş doğrulama
    if (!orderData.customer?.name || !orderData.delivery?.address) {
      return res.status(400).json({ 
        error: 'Eksik sipariş bilgileri' 
      });
    }

    // MuditaKurye'ye gönder
    const result = await createCourierOrder(orderData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: 'Kurye siparişi oluşturulamadı',
        details: result.error
      });
    }

    return res.status(202).json({
      message: 'Kurye siparişi başarıyla oluşturuldu',
      data: result.data
    });

  } catch (error) {
    console.error('API Route hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası' 
    });
  }
}
```

## 📋 Response Örnekleri

### Başarılı (202 Accepted)

```json
{
  "status": "accepted",
  "orderId": "order_123456",
  "muditaKuryeOrderId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Sipariş alındı ve işleme konuldu"
}
```

### Hata (400 Bad Request)

```json
{
  "error": "validation_error",
  "message": "Geçersiz sipariş bilgileri",
  "details": {
    "deliveryAddress": "Bu alan zorunludur"
  }
}
```

### Hata (401 Unauthorized)

```json
{
  "error": "unauthorized",
  "message": "Geçersiz API Key"
}
```

## 🔄 Sipariş Durumları

Sipariş gönderildikten sonra durum güncellemeleri webhook ile gelir:

1. **NEW** - Sipariş alındı
2. **VALIDATED** - Restoran onayladı
3. **ROUTED** - Kurye yönlendirildi
4. **ASSIGNED** - Kurye atandı
5. **ACCEPTED** - Kurye kabul etti
6. **PREPARED** - Sipariş hazır
7. **ON_DELIVERY** - Kuryede
8. **DELIVERED** - Teslim edildi
9. **CANCELED** - İptal edildi

## ⚙️ İdempotency

Aynı `orderId` ile birden fazla istek gönderilirse, sadece ilki işleme alınır:

```javascript
// İlk istek
const order1 = await createCourierOrder({ 
  id: 'order_123', 
  ... 
});
// ✅ Sipariş oluşturuldu

// Aynı ID ile tekrar
const order2 = await createCourierOrder({ 
  id: 'order_123', 
  ... 
});
// ℹ️ Zaten var, yeni oluşturulmadı
```

## 🔗 Sonraki Adım

[Webhook Entegrasyonu →](./WEBHOOK-INTEGRATION.md)
"""

print("✅ ORDER-MANAGEMENT.md hazırlandı")
print(f"Dosya boyutu: {len(order_content)} karakter\n")
