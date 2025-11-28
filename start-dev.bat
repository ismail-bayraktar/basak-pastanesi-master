@echo off
echo Starting Basak Pastanesi Development Environment...
echo.
echo Starting API in a new window...
start "Basak API" cmd /k "cd apps/api && pnpm dev"
echo.
echo Starting Web App in a new window...
start "Basak Web" cmd /k "cd apps/web && pnpm dev"
echo.
echo Done! Please check the new windows for logs.
