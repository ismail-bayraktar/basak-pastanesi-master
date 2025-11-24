# Basak Pastanesi Dönüşüm Analiz Raporu

## 1. Proje Yapısı Analizi
Mevcut "Tulumbak" sistemi, **WordPress/WooCommerce tabanlı DEĞİLDİR**. Modern bir **Monorepo** mimarisine sahiptir:

*   **Backend (API):** Node.js, Express, MongoDB.
*   **Frontend (Web):** Next.js (React), Tailwind CSS.
*   **Yönetim Paneli (Admin):** Vite (React), Tailwind CSS.
*   **Paket Yöneticisi:** PNPM & TurboRepo.

Bu yapı, WordPress'e göre çok daha performanslı ve ölçeklenebilirdir ancak yönetimi teknik bilgi gerektirir.

## 2. Dönüştürme Gereksinimleri (Refactoring)

Aşağıdaki alanlarda "Tulumbak" isminin "Basak Pastanesi" olarak değiştirilmesi gerekmektedir:

### Kritik Yapılandırmalar
*   **Veritabanı:** `mongodb://localhost:27017/tulumbak` -> `basak_pastanesi`
*   **Cloudinary (Resim Yönetimi):** Klasör yolları `tulumbak/general` -> `basak-pastanesi/general`
*   **E-posta Ayarları:** `info@tulumbak.com` -> `info@basakpastanesi.com` (veya sizin belirleyeceğiniz adres)
*   **API Endpointleri:** `api.tulumbak.com` -> `api.basakpastanesi.com` (Geliştirme ortamında localhost kalacak)

### Kod İçi Referanslar
Toplamda **90+ satırda** "Tulumbak" referansı tespit edildi. Bunlar:
*   Loglama servisleri
*   Medya yükleme yolları
*   Varsayılan e-posta şablonları
*   Kurye entegrasyon ayarları (Mudita Kurye)

## 3. Önerilen Yol Haritası

1.  **Temizlik:** Projedeki `git` geçmişini sıfırlayıp Basak Pastanesi için yeni bir repo başlatmak.
2.  **İsimlendirme:** Kod içerisindeki tüm `tulumbak` stringlerini `basak-pastanesi` ile değiştirmek.
3.  **Konfigürasyon:** `.env` dosyalarını yeni proje için oluşturmak.
4.  **Görsel Düzenleme:** Logo ve renklerin değiştirilmesi (Sizin tarafınızdan yapılacak, yerlerini göstereceğim).

## 4. Eksikler / İhtiyaçlar
*   **Logo:** `apps/web/public` ve `apps/admin/public` klasörlerine yeni logolar eklenmeli.
*   **Domain:** Canlıya alınacağı zaman kullanılacak domain adresleri.
*   **Renk Paleti:** Başak Pastanesi'nin kurumsal renk kodları.

