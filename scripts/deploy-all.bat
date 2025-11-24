@echo off
REM Full Stack Vercel Deployment Script for Windows
REM Tüm projeyi (backend, frontend, admin) Vercel'e deploy eder

echo.
echo ========================================
echo   Tulumbak Full Stack Deployment
echo ========================================
echo.

REM Check if vercel is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI bulunamadi
    echo Kurmak icin: npm install -g vercel
    exit /b 1
)

REM Backend Deployment
echo.
echo [1/3] Backend Deployment
echo -----------------------------------
cd backend

if not exist .env.production (
    echo [ERROR] .env.production dosyasi bulunamadi
    echo Lutfen once .env.production dosyasini olusturun
    exit /b 1
)

call vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend deployment basarisiz
    exit /b 1
)
echo [OK] Backend deployed successfully
cd ..

REM Frontend Deployment
echo.
echo [2/3] Frontend Deployment
echo -----------------------------------
cd frontend

call vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend deployment basarisiz
    exit /b 1
)
echo [OK] Frontend deployed successfully
cd ..

REM Admin Deployment
echo.
echo [3/3] Admin Deployment
echo -----------------------------------
cd admin

call vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Admin deployment basarisiz
    exit /b 1
)
echo [OK] Admin deployed successfully
cd ..

echo.
echo ========================================
echo   Deployment Tamamlandi!
echo ========================================
echo.
echo Sonraki Adimlar:
echo   1. Vercel Dashboard'dan URL'leri alin
echo   2. Backend CORS_ORIGINS guncelle
echo   3. Frontend API URL guncelle
echo   4. PayTR callback URLs guncelle
echo   5. MongoDB Atlas IP whitelist kontrol et
echo.

pause
