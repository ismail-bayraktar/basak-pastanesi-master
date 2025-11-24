# Kimlik Doğrulama

MuditaKurye API'sine erişim için iki yöntem desteklenmektedir.

## 🔑 Yöntem 1: API Key (Önerilen)

### Header Formatı

```http
X-API-Key: yk_24c584705e97492483bcb4264338aa14
Content-Type: application/json
```

### Node.js Örneği

```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.MUDITAKURYE_BASE_URL,
  headers: {
    'X-API-Key': process.env.MUDITAKURYE_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export default client;
```

### Next.js API Route Örneği

```javascript
// lib/muditakurye-client.js
import axios from 'axios';

export const muditaKuryeClient = axios.create({
  baseURL: process.env.MUDITAKURYE_BASE_URL,
  headers: {
    'X-API-Key': process.env.MUDITAKURYE_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});
```

## 🔐 Yöntem 2: Basic Authentication

### Header Formatı

```http
Authorization: Basic YXBpX3RhbDZ4ZGx2bXJheXRzeXM6U2VjcmV0UGFzc3dvcmQ=
Content-Type: application/json
```

### Kodlama

```javascript
const username = process.env.MUDITAKURYE_USERNAME;
const password = process.env.MUDITAKURYE_PASSWORD;
const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

headers: {
  'Authorization': `Basic ${basicAuth}`,
  'Content-Type': 'application/json'
}
```

## ⚠️ Güvenlik Önerileri

### 1. Kimlik Bilgilerini Saklamayın

❌ **Yanlış:**
```javascript
const apiKey = "yk_24c584705e97492483bcb4264338aa14"; // Kodda sabit
```

✅ **Doğru:**
```javascript
const apiKey = process.env.MUDITAKURYE_API_KEY; // .env dosyasından
```

### 2. .gitignore Kullanın

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 3. Secrets Manager Kullanın (Production)

```javascript
// Vercel, AWS Secrets Manager, vb.
const apiKey = process.env.MUDITAKURYE_API_KEY;
```

## 🧪 Bağlantı Testi

### Health Check

```javascript
import { muditaKuryeClient } from './lib/muditakurye-client';

async function testConnection() {
  try {
    const response = await muditaKuryeClient.get('/webhook/third-party/health');
    console.log('✅ Bağlantı başarılı:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Bağlantı hatası:', error.message);
    if (error.response) {
      console.error('Hata detayı:', error.response.status, error.response.data);
    }
    return false;
  }
}
```

## 🔄 Token Yenileme

API Key'ler süresiz çalışır ancak güvenlik için periyodik yenileme önerilir:

1. MuditaKurye paneline giriş yapın
2. **Ayarlar → Entegrasyon** bölümüne gidin
3. Yeni API Key oluşturun
4. Eski key'i devre dışı bırakın
5. Ortam değişkenlerini güncelleyin

## 📊 Hata Kodları

| HTTP Kodu | Açıklama | Çözüm |
|-----------|----------|--------|
| 401 | Unauthorized | API Key kontrol edin |
| 403 | Forbidden | İzinleri kontrol edin |
| 429 | Too Many Requests | Rate limit aşıldı, bekleyin |
| 500 | Server Error | MuditaKurye desteğe başvurun |

## 🔗 Sonraki Adım

[Sipariş Yönetimi →](./ORDER-MANAGEMENT.md)
