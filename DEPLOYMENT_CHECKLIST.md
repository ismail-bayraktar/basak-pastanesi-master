# 🚀 Vercel Deployment Sonrası Yapılacaklar

## ✅ Tamamlanan Optimizasyonlar

### 1. MongoDB Connection
- ✅ Aggressive connection caching eklendi
- ✅ Timeout'lar optimize edildi (3-5 saniye)
- ✅ Pool size azaltıldı (3 connection - M0 için optimal)
- ✅ Compression (zlib) eklendi
- ✅ Connection reuse 60 saniyeye çıkarıldı

### 2. Model Optimizasyonları
- ✅ EmailSettings _id index hatası düzeltildi
- ✅ Product listProducts query'sine lean() eklendi
- ✅ Sadece gerekli field'ler seçiliyor (bandwidth tasarrufu)
- ✅ Category controller zaten lean() kullanıyor

### 3. Index'ler
- ✅ Product model'de gerekli index'ler mevcut
- ✅ Category model index kontrolü yapıldı

## 🎯 Şimdi Yapılması Gerekenler

### 1. Vercel'e Deploy Et

```bash
# Commit ve push
git add .
git commit -m "MongoDB Atlas optimizations + performance improvements"
git push origin main
```

Vercel otomatik deploy edecek veya Vercel Dashboard'dan manuel tetikleyebilirsiniz.

### 2. Environment Variables Kontrol

**Vercel Dashboard > tulumbak-api > Settings > Environment Variables**

`MONGODB_URI` değerinizin sonuna şunları ekleyin:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&maxPoolSize=3&minPoolSize=1&maxIdleTimeMS=60000&compressors=zlib
```

**Önemli Parametreler**:
- `retryWrites=true` - Yazma hatalarında retry
- `w=majority` - Write concern (M0'da önemli)
- `maxPoolSize=3` - Free tier için optimal
- `minPoolSize=1` - Minimum 1 connection
- `maxIdleTimeMS=60000` - 60 saniye idle tutma
- `compressors=zlib` - Bandwidth tasarrufu

### 3. Test Endpointleri

Deploy sonrası test edin:

```bash
# Product list (en yoğun endpoint)
https://tulumbak-api.vercel.app/api/product/list

# Category list
https://tulumbak-api.vercel.app/api/category/active

# Homepage data
https://tulumbak-api.vercel.app/api/slider/list
```

### 4. Performans İzleme

**Vercel Dashboard > Deployments > Runtime Logs**

Şu log'ları arayın:
- ✅ `♻️ Reusing cached MongoDB connection` - İyi! Connection reuse çalışıyor
- ⚠️ `MongoDB connected` - Her requestte bunu görüyorsanız, cache çalışmıyor
- ❌ `MongoDB connection failed` - IP whitelist veya connection string hatası

### 5. MongoDB Atlas Monitoring

**Atlas Dashboard > Cluster > Metrics**

İzlenmesi gerekenler:
- **Connections**: 3-5 civarında olmalı (spike'lar normal)
- **Operations**: Azalmalı (lean() sayesinde)
- **Network**: Azalmalı (compression + select sayesinde)

## 📊 Beklenen İyileştirmeler

### Önce (Free Tier M0 + Eski Kod):
- ❌ İlk request: 3-5 saniye
- ❌ Sonraki requestler: 1-2 saniye
- ❌ Cold start: 5-10 saniye
- ❌ Sık timeout hataları

### Sonra (Free Tier M0 + Optimize Kod):
- ✅ İlk request: 1-2 saniye
- ✅ Sonraki requestler: 300-500ms
- ✅ Cold start: 2-3 saniye
- ✅ Daha az timeout

### Vercel KV Ekleyince (Önerilen):
- 🚀 Cache hit: 50-100ms
- 🚀 Cache miss: 500-800ms
- 🚀 %80-90 cache hit rate beklenir

## 🎁 Bonus: Hızlı Kazanç İçin

### Sık kullanılan query'lere limit ekle

**Product listesi için pagination** (opsiyonel):

`apps/api/controllers/ProductController.js` içinde `listProducts`:

```javascript
// Pagination ekle
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const products = await productModel
    .find(query)
    .select('name description basePrice image category subCategory sizes bestseller date stock slug sku active')
    .populate('category', 'name slug active')
    .sort({ date: -1 })
    .limit(limit) // MAX 20 product
    .skip(skip)
    .lean();

const total = await productModel.countDocuments(query);

res.json({
    success: true, 
    products,
    pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
    }
});
```

## 🔧 Sorun Yaşarsanız

### 1. Hala yavaş?
- MongoDB Atlas'ta Cluster tier'ı M2'ye yükseltin ($9/ay)
- Vercel KV ekleyin (caching)
- CDN için Cloudflare veya Vercel Edge kullanın

### 2. Timeout hataları devam ediyor?
- `MONGODB_URI` connection string'i doğru mu kontrol edin
- IP whitelist 0.0.0.0/0 olduğundan emin olun
- MongoDB Atlas > Network Access kontrol edin

### 3. Connection sorunları?
- Vercel logs'larda "cached connection" görmüyorsanız:
  - `apps/api/config/mongodb.js` değişiklikleri commit/push edildi mi?
  - Vercel yeni deployment aldı mı?
  - Environment variables güncel mi?

## 🆘 İletişim

Sorun devam ederse:
1. Vercel Runtime Logs ekran görüntüsü
2. MongoDB Atlas Metrics ekran görüntüsü
3. Hangi endpoint'te sorun yaşıyorsunuz?
4. Error mesajı nedir?

Bunları paylaşırsanız daha spesifik yardımcı olabilirim! 🚀
