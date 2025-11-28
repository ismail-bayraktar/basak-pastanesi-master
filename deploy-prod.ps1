Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BASAK PASTANESI - PRODUCTION DEPLOYMENT (VERCEL)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Vercel Login
Write-Host "[1/4] Checking Vercel Login..." -ForegroundColor Yellow
try {
    $null = vercel whoami 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Not logged in" }
    Write-Host "    Logged in successfully." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "[!] You are not logged in to Vercel." -ForegroundColor Yellow
    Write-Host "    Please login now..."
    cmd /c "vercel login"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Login failed. Aborting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[2/4] Linking Projects (One-time setup)..." -ForegroundColor Yellow
Write-Host ""

# Function to link project
function Link-Project {
    param($path, $name)
    Write-Host "--- Linking $name ($path) ---" -ForegroundColor Cyan
    Push-Location $path
    if (-not (Test-Path ".vercel")) {
        # Run interactive link so user can choose project name
        cmd /c "vercel link"
    } else {
        Write-Host "    Already linked." -ForegroundColor Gray
    }
    
    # Ensure project settings are pulled (fixes 'No Project Settings found' error)
    Write-Host "    Pulling project settings..." -ForegroundColor Gray
    cmd /c "vercel pull --yes"
    
    Pop-Location
}

Link-Project "apps/web" "WEB"
Link-Project "apps/admin" "ADMIN"
Link-Project "apps/api" "API"

Write-Host ""
Write-Host "[3/4] Building & Deploying Projects..." -ForegroundColor Yellow
Write-Host "      Strategy: Local Build -> Prebuilt Upload" -ForegroundColor Gray
Write-Host ""

# Function to deploy
function Deploy-Project {
    param($path, $name)
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  DEPLOYING $name" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    Push-Location $path
    
    Write-Host "  - Building locally..." -ForegroundColor Yellow
    cmd /c "vercel build --prod"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] $name Build failed." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Write-Host "  - Uploading prebuilt artifacts..." -ForegroundColor Yellow
    # Capture output to get URL. We use a temporary file to avoid piping issues with interactive CLIs
    $tempFile = [System.IO.Path]::GetTempFileName()
    cmd /c "vercel deploy --prebuilt --prod > $tempFile"
    
    if ($LASTEXITCODE -ne 0) {
         Write-Host "[X] $name Deploy failed." -ForegroundColor Red
         Remove-Item $tempFile -ErrorAction SilentlyContinue
         Pop-Location
         exit 1
    }

    $deploymentUrl = Get-Content $tempFile | Select-Object -Last 1
    Remove-Item $tempFile -ErrorAction SilentlyContinue

    Write-Host "    $name Deployed: $deploymentUrl" -ForegroundColor Green
    Pop-Location
    return $deploymentUrl
}

$apiUrl = Deploy-Project "apps/api" "API (Backend)"
$adminUrl = Deploy-Project "apps/admin" "ADMIN (Dashboard)"
$webUrl = Deploy-Project "apps/web" "WEB (Storefront)"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  API:   $apiUrl"
Write-Host "  Admin: $adminUrl"
Write-Host "  Web:   $webUrl"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

