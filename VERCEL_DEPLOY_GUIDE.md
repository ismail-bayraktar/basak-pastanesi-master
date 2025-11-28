# 🚀 Başak Pastanesi - Vercel Deployment Rehberi

Bu proje, Vercel üzerinde **Monorepo** yapısına uygun olarak "Local Build, Prebuilt Deploy" stratejisi ile çalışacak şekilde yapılandırılmıştır.

## 📋 Ön Hazırlık

1.  **Vercel Hesabı:** Bir Vercel hesabınızın olması gerekir.
2.  **Vercel CLI:** Bilgisayarınızda Vercel CLI yüklü olmalıdır.
    ```bash
    npm i -g vercel
    ```

## 🛠️ Nasıl Deploy Edilir?

Projenin kök dizininde bulunan **`deploy-prod.ps1`** (PowerShell) scriptini çalıştırmanız yeterlidir.

Terminalden:
```powershell
./deploy-prod.ps1
```

Veya dosyaya sağ tıklayıp "Run with PowerShell" diyebilirsiniz.

Bu script sırasıyla şunları yapar:
1.  **Login:** Vercel'e giriş yapıp yapmadığınızı kontrol eder.
2.  **Link:** Projeleri (Web, Admin, API) Vercel üzerindeki projelerle eşleştirir (sadece ilk seferde sorar).
3.  **Build:** Her projeyi **kendi bilgisayarınızda** build eder (Böylece tüm dosyalara erişebilir).
4.  **Deploy:** Build edilen dosyaları Vercel'e yükler.

## ⚙️ Environment Variables (Ortam Değişkenleri)

İlk kurulumda veya Vercel Dashboard üzerinden şu değişkenleri tanımlamanız gerekir:

### 1. API Projesi (`basak-pastanesi-api`)
- `MONGODB_URI`: MongoDB bağlantı adresi
- `JWT_SECRET`: Güvenlik anahtarı
- `CORS_ORIGINS`: Frontend ve Admin URL'leri (örn: `https://basak-pastanesi-web.vercel.app,https://basak-pastanesi-admin.vercel.app`)

### 2. Web Projesi (`basak-pastanesi-web`)
- `VITE_BACKEND_URL`: API projesinin URL'i (örn: `https://basak-pastanesi-api.vercel.app`)
- `VITE_ADMIN_URL`: Admin projesinin URL'i

### 3. Admin Projesi (`basak-pastanesi-admin`)
- `VITE_API_URL`: API projesinin URL'i
- `VITE_IMAGE_URL`: API projesinin URL'i

## ⚠️ Olası Sorunlar

*   **"Command not found: vercel"**: `npm i -g vercel` komutu ile CLI'ı yükleyin.
*   **Login Hatası**: Script içinde login olamazsanız, terminalde manuel olarak `vercel login` yazıp giriş yapın.
*   **Build Hatası**: Eğer build sırasında hata alırsanız, önce projenin localde `pnpm build` ile hatasız derlendiğinden emin olun.

