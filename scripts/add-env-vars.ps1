# PowerShell script to add environment variables to Vercel projects

Write-Host "Adding environment variables to Web project..." -ForegroundColor Cyan

# Web project
cd apps/web

# VITE_BACKEND_URL
Write-Host "`nAdding VITE_BACKEND_URL to Web project..." -ForegroundColor Yellow
echo "https://api-teal-omega-36.vercel.app" | vercel env add VITE_BACKEND_URL production

echo "https://api-teal-omega-36.vercel.app" | vercel env add VITE_BACKEND_URL preview

echo "https://api-teal-omega-36.vercel.app" | vercel env add VITE_BACKEND_URL development

# VITE_API_URL
Write-Host "`nAdding VITE_API_URL to Web project..." -ForegroundColor Yellow
echo "https://api-teal-omega-36.vercel.app/api" | vercel env add VITE_API_URL production

echo "https://api-teal-omega-36.vercel.app/api" | vercel env add VITE_API_URL preview

echo "https://api-teal-omega-36.vercel.app/api" | vercel env add VITE_API_URL development

Write-Host "`n✅ Web project environment variables added!" -ForegroundColor Green

# Admin project
Write-Host "`nAdding environment variables to Admin project..." -ForegroundColor Cyan
cd ../admin

# VITE_BACKEND_URL
Write-Host "`nAdding VITE_BACKEND_URL to Admin project..." -ForegroundColor Yellow
echo "https://api-teal-omega-36.vercel.app" | vercel env add VITE_BACKEND_URL production

echo "https://api-teal-omega-36.vercel.app" | vercel env add VITE_BACKEND_URL preview

echo "https://api-teal-omega-36.vercel.app" | vercel env add VITE_BACKEND_URL development

# VITE_API_URL
Write-Host "`nAdding VITE_API_URL to Admin project..." -ForegroundColor Yellow
echo "https://api-teal-omega-36.vercel.app/api" | vercel env add VITE_API_URL production

echo "https://api-teal-omega-36.vercel.app/api" | vercel env add VITE_API_URL preview

echo "https://api-teal-omega-36.vercel.app/api" | vercel env add VITE_API_URL development

Write-Host "`n✅ Admin project environment variables added!" -ForegroundColor Green

Write-Host "`n🚀 Now redeploying both projects..." -ForegroundColor Cyan

# Redeploy Web
cd ../web
vercel --prod

# Redeploy Admin
cd ../admin
vercel --prod

Write-Host "`n✅ DONE! Check your deployments." -ForegroundColor Green
