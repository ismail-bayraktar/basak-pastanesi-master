@echo off
echo ========================================================
echo   BAŞAK PASTANESİ HIZLI DEPLOYMENT ARACI
echo ========================================================
echo.
echo 1. Kodlar hazirlaniyor (git add)...
git add .

echo.
set /p commit_msg="Yapilan degisiklik icin kisa bir not yazin (Ornek: urun sayfasi duzeltildi): "

echo.
echo 2. Kaydediliyor (git commit)...
git commit -m "%commit_msg%"

echo.
echo 3. Gonderiliyor (git push)...
git push

echo.
echo ========================================================
echo   ISLEM TAMAM! Vercel otomatik olarak deploy edecek.
echo ========================================================
echo.
pause
