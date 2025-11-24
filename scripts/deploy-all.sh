#!/bin/bash

# Full Stack Vercel Deployment Script
# Tüm projeyi (backend, frontend, admin) Vercel'e deploy eder

set -e  # Exit on error

echo "🚀 Tulumbak Full Stack Deployment"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI bulunamadı${NC}"
    echo "Kurmak için: npm install -g vercel"
    exit 1
fi

echo -e "${YELLOW}📦 Backend Deployment${NC}"
echo "-----------------------------------"
cd backend

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production dosyası bulunamadı${NC}"
    echo "Lütfen önce .env.production dosyasını oluşturun"
    exit 1
fi

vercel --prod --yes
BACKEND_URL=$(vercel ls | grep tulumbak-backend | head -1 | awk '{print $2}')
echo -e "${GREEN}✅ Backend deployed: $BACKEND_URL${NC}"
echo ""

echo -e "${YELLOW}📦 Frontend Deployment${NC}"
echo "-----------------------------------"
cd ../frontend

# Update .env with backend URL
echo "VITE_API_URL=$BACKEND_URL" > .env.production

vercel --prod --yes
FRONTEND_URL=$(vercel ls | grep tulumbak-frontend | head -1 | awk '{print $2}')
echo -e "${GREEN}✅ Frontend deployed: $FRONTEND_URL${NC}"
echo ""

echo -e "${YELLOW}📦 Admin Deployment${NC}"
echo "-----------------------------------"
cd ../admin

# Update .env with backend URL
echo "VITE_API_URL=$BACKEND_URL" > .env.production

vercel --prod --yes
ADMIN_URL=$(vercel ls | grep tulumbak-admin | head -1 | awk '{print $2}')
echo -e "${GREEN}✅ Admin deployed: $ADMIN_URL${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}🎉 Deployment Tamamlandı!${NC}"
echo "=================================="
echo ""
echo "📱 URLs:"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo "  Admin:    $ADMIN_URL"
echo ""
echo "⚙️  Sonraki Adımlar:"
echo "  1. Backend'de CORS_ORIGINS güncelle: $FRONTEND_URL,$ADMIN_URL"
echo "  2. Frontend'de API URL kontrol et: $BACKEND_URL"
echo "  3. PayTR callback URLs güncelle"
echo "  4. MongoDB Atlas IP whitelist kontrol et (0.0.0.0/0)"
echo ""
