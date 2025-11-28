# Rate Limit (429) Hatası Düzeltildi ✅

## Sorun
`sliderStore.ts` dosyasında slider listesi çekilirken 429 (Too Many Requests) hatası alınıyordu. Bu, rate limiting'in çok sık çağrılan slider endpoint'ine uygulanmasından kaynaklanıyordu.

## Yapılan Düzeltmeler

### 1. Slider Store'a Cache ve Retry Logic Eklendi
- ✅ **Cache mekanizması**: 5 dakika boyunca aynı veriyi tekrar çekmiyor
- ✅ **Retry logic**: 429 hatası alındığında otomatik olarak 3 kez tekrar deniyor
- ✅ **Exponential backoff**: Her retry'da bekleme süresi artıyor
- ✅ **Loading state kontrolü**: Aynı anda birden fazla istek gönderilmesini engelliyor

### 2. Slider Endpoint Rate Limiting'den Muaf Tutuldu
- ✅ `/api/slider/list` endpoint'i rate limiting'den muaf tutuldu
- ✅ Public endpoint olduğu için ve frontend'de cache'lendiği için güvenli

### 3. API Client'a 429 Handling Eklendi
- ✅ 429 hatası için özel mesaj gösteriliyor
- ✅ Retry-after header'ı kontrol ediliyor
- ✅ Slider endpoint'i için toast gösterilmiyor (sliderStore kendi handling'i yapıyor)

## Kullanım

Slider store artık otomatik olarak:
1. Cache'lenmiş veriyi kullanır (5 dakika içinde)
2. 429 hatası alırsa otomatik retry yapar
3. Retry sırasında exponential backoff kullanır
4. Tüm retry'lar başarısız olursa kullanıcıya bilgi verir

## Not
Eğer hala eski frontend'i (`apps/web-old-backup`) kullanıyorsanız, yeni frontend'e (`apps/web`) geçmeniz önerilir. Yeni frontend'de slider store yok ve daha modern bir yapı kullanılıyor.

