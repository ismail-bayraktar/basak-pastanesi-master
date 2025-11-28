# API Endpoint Mapping - Frontend Entegrasyonu İçin

Bu dosya, frontend'deki API çağrılarını backend endpoint'lerine eşleştirmek için kullanılır.

## 🔐 Authentication (Kimlik Doğrulama)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Login | `/api/user/login` | POST | Kullanıcı girişi |
| Register | `/api/user/register` | POST | Kullanıcı kaydı |
| Logout | - | - | Token'ı localStorage'dan sil |
| Get User Info | `/api/user/profile` | GET | Kullanıcı bilgileri (token gerekli) |

**Request Örneği (Login):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Örneği:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 📦 Products (Ürünler)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Ürün Listesi | `/api/product/list` | GET | Tüm ürünleri listele |
| Ürün Detay | `/api/product/:id` | GET | Tekil ürün detayı |
| Fiyat Aralığı | `/api/product/price-range` | GET | Min-max fiyat bilgisi |
| Ürün Arama | `/api/product/list?search=...` | GET | Arama parametresi ile |

**Query Parameters (List):**
- `page`: Sayfa numarası
- `limit`: Sayfa başına ürün sayısı
- `category`: Kategori ID'si
- `search`: Arama terimi
- `minPrice`: Minimum fiyat
- `maxPrice`: Maximum fiyat
- `sort`: Sıralama (price, name, createdAt)

**Response Örneği (List):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "product_id",
        "name": "Çilekli Pasta",
        "price": 450,
        "description": "...",
        "images": ["image_url"],
        "category": "category_id",
        "stock": 10,
        "isActive": true
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## 🛒 Cart (Sepet)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Sepete Ekle | `/api/cart/add` | POST | Ürünü sepete ekle |
| Sepeti Güncelle | `/api/cart/update` | PUT | Sepet miktarını güncelle |
| Sepeti Getir | `/api/cart/get` | GET | Kullanıcının sepetini getir |
| Sepetten Sil | `/api/cart/remove` | DELETE | Ürünü sepetten çıkar |

**Request Örneği (Add):**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "variations": {} // Opsiyonel
}
```

**Response Örneği (Get):**
```json
{
  "success": true,
  "cartData": {
    "items": [
      {
        "productId": {
          "_id": "product_id",
          "name": "Çilekli Pasta",
          "price": 450,
          "images": ["image_url"]
        },
        "quantity": 2,
        "subtotal": 900
      }
    ],
    "total": 900,
    "itemCount": 2
  }
}
```

---

## 📋 Orders (Siparişler)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Sipariş Ver | `/api/order/place` | POST | Yeni sipariş oluştur |
| Kullanıcı Siparişleri | `/api/order/userorders` | GET | Kullanıcının siparişleri |
| Sipariş Detay | `/api/order/:id` | GET | Tekil sipariş detayı |
| Banka Bilgileri | `/api/order/bank-info` | GET | Havale/EFT için banka bilgileri |

**Request Örneği (Place Order):**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 450
    }
  ],
  "deliveryAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "address": "Özgür Mah. Gazi Cad. No:77/2",
    "city": "Burdur",
    "district": "Merkez"
  },
  "paymentMethod": "cash_on_delivery", // veya "online"
  "deliveryDate": "2025-01-20",
  "deliveryTime": "14:00",
  "notes": "Kapı zili çalınmasın"
}
```

**Response Örneği:**
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-2025-001",
    "status": "pending",
    "total": 900,
    "items": [...],
    "createdAt": "2025-01-19T10:00:00Z"
  }
}
```

---

## 💳 Payment (Ödeme)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| PayTR Token | `/api/paytr/get-token` | POST | Online ödeme için token |
| PayTR Sayfası | `/paytr/payment` | GET | Ödeme sayfası (redirect) |

**Request Örneği (PayTR Token):**
```json
{
  "orderId": "order_id",
  "amount": 900,
  "user": {
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "05551234567"
  }
}
```

---

## 📂 Categories (Kategoriler)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Aktif Kategoriler | `/api/category/active` | GET | Public - aktif kategoriler |
| Tüm Kategoriler | `/api/category/list` | GET | Admin - tüm kategoriler |

**Response Örneği:**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "category_id",
      "name": "Pastalar",
      "slug": "pastalar",
      "image": "image_url",
      "isActive": true,
      "productCount": 13
    }
  ]
}
```

---

## 🎠 Sliders (Slider'lar)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Aktif Slider'lar | `/api/slider/list` | GET | Ana sayfa slider'ları |

**Response Örneği:**
```json
{
  "success": true,
  "sliders": [
    {
      "_id": "slider_id",
      "title": "Özel Günlerinizde Adrese Teslim",
      "image": "image_url",
      "link": "/collection",
      "isActive": true,
      "order": 1
    }
  ]
}
```

---

## 🚚 Delivery (Teslimat)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Teslimat Bölgeleri | `/api/delivery/zones` | GET | Teslimat bölgeleri |
| Teslimat Saatleri | `/api/delivery/timeslots` | GET | Müsait teslimat saatleri |

**Response Örneği (Zones):**
```json
{
  "success": true,
  "zones": [
    {
      "_id": "zone_id",
      "name": "Burdur Merkez",
      "deliveryFee": 0,
      "minOrderAmount": 0,
      "isActive": true
    }
  ]
}
```

---

## 🎫 Coupon (Kupon)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Kupon Doğrula | `/api/coupon/validate` | POST | Kupon kodunu doğrula |

**Request Örneği:**
```json
{
  "code": "INDIRIM10",
  "cartTotal": 900
}
```

**Response Örneği:**
```json
{
  "success": true,
  "coupon": {
    "code": "INDIRIM10",
    "discount": 90,
    "discountType": "percentage", // veya "fixed"
    "minPurchase": 500
  }
}
```

---

## ⚙️ Settings (Ayarlar)

| Frontend İhtiyacı | Backend Endpoint | Method | Açıklama |
|------------------|------------------|--------|----------|
| Bakım Modu | `/api/settings/maintenance-status` | GET | Bakım modu durumu |

---

## 🔑 Authentication Header

Tüm protected endpoint'ler için Authorization header gerekli:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

Token, login sonrası response'dan alınır ve localStorage'a kaydedilir.

---

## 📝 Notlar

1. **Base URL**: `process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'`
2. **Error Handling**: Tüm API çağrıları error handling içermeli
3. **Loading States**: API çağrıları sırasında loading state gösterilmeli
4. **Token Refresh**: Token süresi dolduğunda otomatik logout yapılmalı
5. **CORS**: Backend CORS ayarları frontend URL'ini içermeli

---

## 🧪 Test Endpoint'leri

Development için test endpoint'leri:

```bash
# Backend çalışıyor mu?
curl http://localhost:4001/api/product/list

# CORS çalışıyor mu?
curl -H "Origin: http://localhost:3000" http://localhost:4001/api/product/list
```

---

**Son Güncelleme:** 2025-01-XX

