# 🚀 Turbo Monorepo Deployment Stratejisi (GÜNCELLENDİ)

Bu rehber, Vercel üzerinde **3 ayrı proje** olarak monorepo'nuzu nasıl deploy edeceğinizi ve **maliyetleri düşürüp build sürelerini nasıl kısaltacağınızı** anlatır.

## 🚨 ACİL: Maliyet ve Hız Sorunu Çözümü

**Sorun:** Her `git push` işleminde tüm projeler (Web, Admin, API) gereksiz yere tekrar build ediliyor. Bu da build süresini 10dk+ üzerine çıkarıyor ve kredi tüketiyor.

**Çözüm:** **Ignored Build Step** ve **Turbo Remote Caching**.

Yaptığımız değişiklikler ile artık her proje kendi klasöründeki `vercel.json` dosyasını kullanacak ve `turbo-ignore` komutu sayesinde sadece değişen projeler build edilecek.

---

## 📂 Yeni Yapı

Root dizindeki `vercel.json` dosyaları kaldırıldı/yedeklendi. Artık konfigürasyonlar her uygulamanın kendi içinde:

```
basak-pastanesi-master/
├── apps/
│   ├── web/
│   │   └── vercel.json       # Web için özel config
│   ├── admin/
│   │   └── vercel.json       # Admin için özel config
│   └── api/
│       └── vercel.json       # API için özel config
└── package.json              # Root package.json (turbo-ignore içerir)
```

---

## 🛠️ Vercel Dashboard Kurulumu (Adım Adım)

Lütfen Vercel Dashboard'da 3 ayrı proje oluşturun veya mevcut projelerinizi aşağıdaki ayarlara göre güncelleyin.

### 1. Web Projesi (Next.js)

*   **Project Name:** `basak-pastanesi-web`
*   **Framework Preset:** Next.js
*   **Root Directory:** `apps/web` (Edit'e basıp seçin)
*   **Build Command:** `vercel.json` dosyasından otomatik okunacak. (Manuel girmenize gerek yok)
*   **Ignored Build Step:** `npx turbo-ignore` (Otomatik okunacak ama kontrol edin: Project Settings > Git > Ignored Build Step)

### 2. Admin Projesi (Vite)

*   **Project Name:** `basak-pastanesi-admin`
*   **Framework Preset:** Vite
*   **Root Directory:** `apps/admin` (Edit'e basıp seçin)
*   **Build Command:** `vercel.json` dosyasından otomatik okunacak.
*   **Output Directory:** `dist` (Otomatik okunacak)
*   **Ignored Build Step:** `npx turbo-ignore`

### 3. API Projesi (Express)

*   **Project Name:** `basak-pastanesi-api`
*   **Framework Preset:** Other
*   **Root Directory:** `apps/api` (Edit'e basıp seçin)
*   **Build Command:** `vercel.json` dosyasından otomatik okunacak.
*   **Ignored Build Step:** `npx turbo-ignore`

---

## ⚙️ Nasıl Çalışır?

1.  **Git Push**: Kodunuzu pushladığınızda Vercel 3 projeyi de tetikler.
2.  **Turbo Ignore**: Her proje için `npx turbo-ignore` çalışır.
    *   Eğer `apps/web` değişmediyse, Web projesi build edilmez (**Cancelled** olarak işaretlenir). Kredi harcamaz.
    *   Eğer `apps/api` değiştiyse, sadece API projesi build edilir.
3.  **Turbo Build**: Build işlemi başladığında, `turbo` komutu çalışır ve Vercel Remote Cache kullanır. Daha önce build edilmiş parçalar tekrar build edilmez.

## 📝 Önemli Notlar

*   **Environment Variables**: Her proje için `.env` değişkenlerini Vercel Dashboard > Settings > Environment Variables kısmına eklemeyi unutmayın.
*   **Root Directory**: En kritik ayar budur. Her proje için ilgili `apps/xxx` klasörünü seçtiğinizden emin olun.

Bu yapı ile deploy süreleriniz **saniyeler** mertebesine düşecek ve gereksiz kredi harcaması son bulacaktır.
