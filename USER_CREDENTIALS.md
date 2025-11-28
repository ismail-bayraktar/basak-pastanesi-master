# 🔐 Kullanıcı Giriş Bilgileri

Proje geliştirme ve test süreçlerinde kullanılmak üzere oluşturulmuş kullanıcı hesapları aşağıdadır.

## 🌐 Site ve Admin Paneli Erişimi

| Platform | URL (Local) | URL (Canlı - Örnek) |
| :--- | :--- | :--- |
| **Müşteri Sitesi** | `http://localhost:3000` | `https://www.basakpastanesi.com` |
| **Admin Paneli** | `http://localhost:5173` | `https://admin.basakpastanesi.com` |
| **API Backend** | `http://localhost:4001` | `https://api.basakpastanesi.com` |

> **Kolay Erişim:** Müşteri sitesindeyken tarayıcı adres satırına `/admin` yazarsanız (örn: `localhost:3000/admin`), otomatik olarak Admin paneline yönlendirilirsiniz.

---

## 👑 Admin Paneli Kullanıcısı (Yönetici)

Bu kullanıcı **Admin Paneli** (`apps/admin`) ve **Backend API** üzerindeki tüm yetkilere sahiptir.

- **Email:** `admin@basakpastanesi.com`
- **Şifre:** `Basak2025!`
- **Rol:** Super Admin
- **Yetkiler:** Ürün yönetimi, sipariş yönetimi, kullanıcı yönetimi vb. tüm yetkiler.

> **Not:** Admin şifresini unuttuğunuzda veya sıfırlamak istediğinizde `apps/api` klasöründe şu komutu çalıştırabilirsiniz:
> ```bash
> cd apps/api
> node scripts/createAdmin.js
> ```

---

## 👤 Test Müşteri Kullanıcısı (Son Kullanıcı)

Bu kullanıcı **Frontend** (`apps/web`) üzerinde alışveriş deneyimini test etmek için oluşturulmuştur.

- **Email:** `musteri@basakpastanesi.com`
- **Şifre:** `Musteri123!`
- **Ad Soyad:** Test Müşterisi
- **Telefon:** 0555 123 45 67
- **Rol:** Kullanıcı (Customer)

> **Kullanım:**
> 1. `localhost:3000` adresine gidin.
> 2. Sağ üstteki **👤 Hesabım** ikonuna tıklayın.
> 3. Açılan pencerede "Giriş Yap" sekmesinden yukarıdaki bilgileri girin.

---

## ⚠️ Güvenlik Uyarısı

Bu bilgiler sadece **geliştirme ortamı (development)** içindir. Canlı ortama (Production) geçildiğinde:
1. Bu hesapların şifreleri **mutlaka değiştirilmelidir**.
2. `.env` dosyasındaki `JWT_SECRET` ve diğer gizli anahtarlar güncellenmelidir.
