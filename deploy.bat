@echo off
echo ========================================
echo Tulumbak Monorepo - 3 Proje Deployment
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
echo tulumbak-web:   Next.js (Ana site)
echo tulumbak-api:   Express API (Serverless)
echo tulumbak-admin: Vite SPA (Admin panel)
echo.

echo ========================================
echo Manuel Adimlar (Vercel Dashboard'da):
echo ========================================
echo.
echo 1. https://vercel.com/dashboard adresine git
echo 2. Her proje icin Environment Variables ekle:
echo.
echo tulumbak-api:
echo   - MONGODB_URI = [MongoDB connection string]
echo   - JWT_SECRET = [secret]
echo   - CLOUDINARY credentials
echo.
echo tulumbak-web:
echo   - NEXT_PUBLIC_BACKEND_URL = https://tulumbak-api.vercel.app
echo.
echo tulumbak-admin:
echo   - VITE_API_URL = https://tulumbak-api.vercel.app
echo.
echo 3. GitHub push sonrasi otomatik deploy olacak
echo.

pause
