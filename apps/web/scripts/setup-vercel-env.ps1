# Basak Pastanesi Web - Vercel Environment Variables Setup Script (Windows)
# This script adds all required environment variables to Vercel

Write-Host "Basak Pastanesi Web - Vercel Environment Variables Setup" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
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

Write-Host "[1/2] Adding Frontend Environment Variables..." -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Update these URLs after API deployment!" -ForegroundColor Yellow
Write-Host ""

# Backend URL (will be updated after API deployment)
Add-VercelEnv -Name "VITE_BACKEND_URL" -Value "https://api-teal-omega-36.vercel.app"
Add-VercelEnv -Name "VITE_API_URL" -Value "https://api-teal-omega-36.vercel.app/api"

Write-Host ""
Write-Host "All environment variables added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT Next Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy API first and get the production URL"
Write-Host "2. Update VITE_BACKEND_URL and VITE_API_URL with actual API URL"
Write-Host "3. Redeploy frontend: vercel --prod"
Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
