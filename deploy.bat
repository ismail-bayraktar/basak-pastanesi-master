@echo off
echo ========================================
echo Basak Pastanesi Monorepo - 3 Proje Deployment
echo ========================================
echo.

echo [1/4] Git push yapiliyor...
git add .
git commit -m "chore: prepare for deployment" --allow-empty
git push
echo ✓ Git push tamamlandi
echo.

echo [2/4] Vercel projeleri kontrol ediliyor...
vercel projects ls
echo.

echo [3/4] Deployment bilgileri:
echo.
echo basak-pastanesi-web:   Next.js (Ana site)
echo basak-pastanesi-api:   Express API (Serverless)
echo basak-pastanesi-admin: Vite SPA (Admin panel)
echo.

echo ========================================
echo Manuel Adimlar (Vercel Dashboard'da):
echo ========================================
echo.
echo 1. https://vercel.com/dashboard adresine git
echo 2. Her proje icin Environment Variables ekle:
echo.
echo basak-pastanesi-api:
echo   - MONGODB_URI = [MongoDB connection string]
echo   - JWT_SECRET = [secret]
echo   - CLOUDINARY credentials
echo.
echo basak-pastanesi-web:
echo   - NEXT_PUBLIC_BACKEND_URL = https://basak-pastanesi-api.vercel.app
echo.
echo basak-pastanesi-admin:
echo   - VITE_API_URL = https://basak-pastanesi-api.vercel.app
echo.
echo 3. GitHub push sonrasi otomatik deploy olacak
echo.

pause
