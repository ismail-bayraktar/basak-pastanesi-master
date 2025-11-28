# Basak Pastanesi API - Vercel Environment Variables Setup Script (Windows)
# This script adds all required environment variables to Vercel

Write-Host "Basak Pastanesi API - Vercel Environment Variables Setup" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Check Vercel CLI
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Vercel CLI not installed!" -ForegroundColor Red
    Write-Host "Install with: npm install -g vercel"
    exit 1
}

Write-Host "Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Navigate to project folder
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "..")

Write-Host "Folder: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Helper function to add env var
function Add-VercelEnv {
    param (
        [string]$Name,
        [string]$Value,
        [string]$Environment = "production"
    )

    Write-Host "  Setting: $Name" -ForegroundColor Yellow
    $Value | vercel env add $Name $Environment
}

# 1. CRITICAL - REQUIRED
Write-Host "[1/8] Adding CRITICAL Environment Variables..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "WEBHOOK_ENCRYPTION_KEY" -Value "eb3a4dd4e81a73a1e882b93ba327c55fd1986c61526485276dcdefb8977aa30e4d36c9506077c6b53379efbf4c4f43a88a5c0086f4f53341a37b67fd6e48091a"
Add-VercelEnv -Name "JWT_SECRET" -Value "c8f3a9b2e1d7f4c6a8b9e2d1f7c4a6b8e3d9f1c7a4b6e8d2f9c1a7b4e6d8f3a9"

Write-Host ""
Write-Host "[2/8] Adding Server Configuration..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "NODE_ENV" -Value "production"
Add-VercelEnv -Name "PORT" -Value "4001"

Write-Host ""
Write-Host "[3/8] Adding Database Configuration..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "MONGODB_URI" -Value "mongodb+srv://tulumbak_db_user:XuWKSZKqg3apdhSD@tulumbak-db.ljzlo7e.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=tulumbak-db"

Write-Host ""
Write-Host "[4/8] Adding Cloudinary Configuration..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "CLOUDINARY_NAME" -Value "du7kvit2g"
Add-VercelEnv -Name "CLOUDINARY_API_KEY" -Value "122833777833421"
Add-VercelEnv -Name "CLOUDINARY_SECRET_KEY" -Value "FWE76Cv4D0eqXV6_CZEEdQFUatc"

Write-Host ""
Write-Host "[5/8] Adding Email Configuration..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "SMTP_HOST" -Value "mail.mottovia.com"
Add-VercelEnv -Name "SMTP_PORT" -Value "465"
Add-VercelEnv -Name "SMTP_USER" -Value "info@mottovia.com"
Add-VercelEnv -Name "SMTP_PASSWORD" -Value "p?@]JStDK4IP"

Write-Host ""
Write-Host "[6/8] Adding Admin Credentials..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "ADMIN_EMAIL" -Value "admin@basakpastanesi.com"
Add-VercelEnv -Name "ADMIN_PASSWORD" -Value "Basak PastanesiAdmin2024!Secure#Production"

Write-Host ""
Write-Host "[7/8] Adding URLs and CORS..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "FRONTEND_URL" -Value "https://basakpastanesi-web.vercel.app"
Add-VercelEnv -Name "CORS_ORIGINS" -Value "https://basakpastanesi-web.vercel.app,https://basakpastanesi-admin.vercel.app"
Add-VercelEnv -Name "CSP_IMAGE_SOURCES" -Value "'self',data:,https://res.cloudinary.com"

Write-Host ""
Write-Host "[8/8] Adding Optional Services (Disabled)..." -ForegroundColor Cyan
Write-Host ""

Add-VercelEnv -Name "REDIS_ENABLED" -Value "false"
Add-VercelEnv -Name "SMS_ENABLED" -Value "false"
Add-VercelEnv -Name "MUDITA_ENABLED" -Value "false"
Add-VercelEnv -Name "SENTRY_DSN" -Value ""

Write-Host ""
Write-Host "All environment variables added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update FRONTEND_URL and CORS_ORIGINS after frontend deployment"
Write-Host "2. Add PayTR credentials (optional)"
Write-Host "3. Trigger new deployment: vercel --prod"
Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
