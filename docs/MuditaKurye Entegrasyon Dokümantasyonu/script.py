
# MuditaKurye entegrasyon dökümanları için tüm bilgileri topluyorum

# 1. README.md - Ana giriş dosyası
readme_content = """# MuditaKurye Entegrasyon Dokümantasyonu

> Tulumbak E-Ticaret Sistemi için MuditaKurye Kurye Entegrasyonu

## 📋 İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Kimlik Doğrulama](./AUTHENTICATION.md)
3. [Sipariş Yönetimi](./ORDER-MANAGEMENT.md)
4. [Webhook Entegrasyonu](./WEBHOOK-INTEGRATION.md)
5. [Test ve Production](./TESTING.md)

## 🚀 Hızlı Başlangıç

### Ön Koşullar

- Node.js v18+
- MuditaKurye panelinden alınan kimlik bilgileri:
  - Restaurant ID
  - API Key
  - Webhook Secret

### Kurulum

```bash
npm install express axios dotenv
```

### Ortam Değişkenleri (.env)

```env
# API Bilgileri
MUDITAKURYE_BASE_URL=https://api.muditakurye.com.tr
MUDITAKURYE_API_KEY=yk_24c584705e97492483bcb4264338aa14
MUDITAKURYE_RESTAURANT_ID=rest_85b4ad47f35b45e893c9
MUDITAKURYE_USERNAME=api_tal6xdlvmraytsys

# Webhook Bilgileri
MUDITAKURYE_WEBHOOK_SECRET=wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4
MUDITAKURYE_STATUS_WEBHOOK_URL=https://yourapi.com/webhook/status
MUDITAKURYE_CANCEL_WEBHOOK_URL=https://yourapi.com/webhook/cancel
```

## 📌 Temel Kavramlar

### API Base URL'ler

| Ortam | URL |
|-------|-----|
| Production | `https://api.muditakurye.com.tr` |
| Staging | `https://staging-api.muditakurye.com` |

### İş Akışı

```
Tulumbak Sipariş → MuditaKurye API → Kurye Atama → Durum Güncellemeleri (Webhook)
```

### Sipariş Durumları

- `NEW` - Yeni sipariş
- `VALIDATED` - Restoran onayladı
- `ROUTED` - Kurye yönlendirildi
- `ASSIGNED` - Kurye atandı
- `ACCEPTED` - Kurye kabul etti
- `PREPARED` - Sipariş hazır
- `ON_DELIVERY` - Kuryede
- `DELIVERED` - Teslim edildi
- `CANCELED` - İptal edildi

## 🔗 Sonraki Adımlar

1. [Kimlik Doğrulama Kurulumu](./AUTHENTICATION.md)
2. [İlk Siparişinizi Gönderin](./ORDER-MANAGEMENT.md)
3. [Webhook Dinleyicisi Kurun](./WEBHOOK-INTEGRATION.md)
4. [Test Edin](./TESTING.md)

## 📞 Destek

- **E-posta**: info@muditayazilim.com.tr
- **Telefon**: +90 553 205 55 67
- **Dokümantasyon**: https://integration.muditakurye.com.tr/
"""

print("✅ README.md hazırlandı")
print(f"Dosya boyutu: {len(readme_content)} karakter\n")
