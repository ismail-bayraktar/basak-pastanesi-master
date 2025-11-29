#!/bin/bash
# Vercel Environment Variables Setup Script

echo "Setting up Web project environment variables..."
cd apps/web
vercel env add VITE_BACKEND_URL production
# Enter: https://api-teal-omega-36.vercel.app

vercel env add VITE_API_URL production
# Enter: https://api-teal-omega-36.vercel.app/api

vercel env add VITE_ADMIN_URL production
# Enter: https://basak-pastanesi-admin.vercel.app

echo "Setting up Admin project environment variables..."
cd ../admin
vercel env add VITE_BACKEND_URL production
# Enter: https://api-teal-omega-36.vercel.app

vercel env add VITE_API_URL production
# Enter: https://api-teal-omega-36.vercel.app/api

echo "Environment variables added! Now redeploy both projects."
echo "Web: cd apps/web && vercel --prod"
echo "Admin: cd apps/admin && vercel --prod"
