@echo off
REM Frontend Entegrasyon Script'i (Windows)
REM Kullanım: scripts\integrate-frontend.bat [FRONTEND_REPO_URL]

setlocal enabledelayedexpansion

set FRONTEND_REPO_URL=%1

if "%FRONTEND_REPO_URL%"=="" (
    echo ❌ Hata: Frontend repo URL'si gerekli
    echo Kullanım: scripts\integrate-frontend.bat [FRONTEND_REPO_URL]
    exit /b 1
)

echo 🚀 Frontend entegrasyonu başlatılıyor...
echo 📦 Repo URL: %FRONTEND_REPO_URL%

REM Mevcut web klasörünü yedekle
if exist "apps\web" (
    echo 📁 Mevcut web klasörü yedekleniyor...
    set BACKUP_NAME=web-backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_NAME=!BACKUP_NAME: =0!
    move apps\web apps\!BACKUP_NAME!
)

REM Frontend'i clone et
echo ⬇️  Frontend repo'su clone ediliyor...
cd apps
git clone %FRONTEND_REPO_URL% web
cd web

REM Gerekli dosyaları kopyala
for /d %%d in (..\web-backup-*) do (
    set BACKUP_DIR=%%d
    goto :found_backup
)
:found_backup
if defined BACKUP_DIR (
    echo 📋 Gerekli dosyalar kopyalanıyor...
    
    REM .env.example kopyala
    if exist "%BACKUP_DIR%\.env.example" (
        copy "%BACKUP_DIR%\.env.example" .env.local.example
        echo ✅ .env.example kopyalandı
    )
    
    REM vercel.json kopyala (varsa)
    if exist "%BACKUP_DIR%\vercel.json" (
        copy "%BACKUP_DIR%\vercel.json" .
        echo ✅ vercel.json kopyalandı
    )
)

REM .env.local oluştur
if not exist ".env.local" (
    echo 📝 .env.local dosyası oluşturuluyor...
    (
        echo # Backend API URL
        echo NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
        echo.
        echo # Site URL
        echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ) > .env.local
    echo ✅ .env.local oluşturuldu
)

REM Dependencies yükle
echo 📦 Dependencies yükleniyor...
if exist "pnpm-lock.yaml" (
    pnpm install
    echo ✅ Dependencies yüklendi
) else if exist "package.json" (
    pnpm install
    echo ✅ Dependencies yüklendi
)

echo.
echo ✅ Frontend entegrasyonu tamamlandı!
echo.
echo 📋 Sonraki adımlar:
echo 1. apps\web\.env.local dosyasını kontrol edin
echo 2. API endpoint'lerini apps\web\src\lib\api\endpoints.ts dosyasına göre güncelleyin
echo 3. API client yapılandırmasını kontrol edin (apps\web\src\lib\api\client.ts)
echo 4. Backend'i başlatın: cd apps\api ^&^& pnpm dev
echo 5. Frontend'i başlatın: cd apps\web ^&^& pnpm dev
echo.
echo 📖 Detaylı bilgi için FRONTEND_INTEGRATION.md dosyasına bakın

endlocal

