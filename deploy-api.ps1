Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING API ONLY (Direct Upload)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Push-Location apps/api

# API is just Node.js/Express, so we can skip local build and deploy source directly
# This avoids the 'spawn cmd.exe' errors and Vercel CLI build issues
Write-Host "  - Uploading source files..." -ForegroundColor Yellow
$tempFile = [System.IO.Path]::GetTempFileName()

# Deploying directly from source (--prod) without prebuilt
cmd /c "vercel deploy --prod > $tempFile"

if ($LASTEXITCODE -ne 0) {
     Write-Host "[X] API Deploy failed." -ForegroundColor Red
     Remove-Item $tempFile -ErrorAction SilentlyContinue
     Pop-Location
     exit 1
}

$deploymentUrl = Get-Content $tempFile | Select-Object -Last 1
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "    API Deployed: $deploymentUrl" -ForegroundColor Green
Pop-Location
pause
