#!/bin/bash

# Basak Pastanesi API - Vercel Environment Variables Setup Script
# Bu script tüm gerekli environment variables'ları Vercel'e ekler

echo "🚀 Basak Pastanesi API - Vercel Environment Variables Setup"
echo "============================================================"
echo ""

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI yüklü değil!${NC}"
    echo "Yüklemek için: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI bulundu${NC}"
echo ""

# Project klasörüne git
cd "$(dirname "$0")/.." || exit

echo "📂 Klasör: $(pwd)"
echo ""

# 1. KRITIK - ZORUNLU
echo -e "${YELLOW}📌 KRITIK Environment Variables Ekleniyor...${NC}"
echo ""

# WEBHOOK_ENCRYPTION_KEY
echo "🔐 WEBHOOK_ENCRYPTION_KEY (production)"
vercel env add WEBHOOK_ENCRYPTION_KEY production <<< "eb3a4dd4e81a73a1e882b93ba327c55fd1986c61526485276dcdefb8977aa30e4d36c9506077c6b53379efbf4c4f43a88a5c0086f4f53341a37b67fd6e48091a"

# JWT_SECRET
echo "🔐 JWT_SECRET (production)"
vercel env add JWT_SECRET production <<< "c8f3a9b2e1d7f4c6a8b9e2d1f7c4a6b8e3d9f1c7a4b6e8d2f9c1a7b4e6d8f3a9"

echo ""
echo -e "${YELLOW}📌 Server Configuration...${NC}"
echo ""

# NODE_ENV
echo "⚙️ NODE_ENV (production)"
vercel env add NODE_ENV production <<< "production"

# PORT
echo "⚙️ PORT (production)"
vercel env add PORT production <<< "4001"

echo ""
echo -e "${YELLOW}📌 Database Configuration...${NC}"
echo ""

# MONGODB_URI - Dedicated Basak Pastanesi MongoDB Atlas
echo "🗄️ MONGODB_URI (production)"
vercel env add MONGODB_URI production <<< "mongodb+srv://ismailbayraktardev_db_user:1A9nXYHXclHq3wWP@basak-pastanesidb.hz9vkny.mongodb.net/basak-pastanesi?retryWrites=true&w=majority&appName=basak-pastanesidb"

echo ""
echo -e "${YELLOW}📌 Cloudinary Configuration...${NC}"
echo ""

# CLOUDINARY
echo "☁️ CLOUDINARY_NAME (production)"
vercel env add CLOUDINARY_NAME production <<< "du7kvit2g"

echo "☁️ CLOUDINARY_API_KEY (production)"
vercel env add CLOUDINARY_API_KEY production <<< "122833777833421"

echo "☁️ CLOUDINARY_SECRET_KEY (production)"
vercel env add CLOUDINARY_SECRET_KEY production <<< "FWE76Cv4D0eqXV6_CZEEdQFUatc"

echo ""
echo -e "${YELLOW}📌 Email Configuration...${NC}"
echo ""

# SMTP
echo "📧 SMTP_HOST (production)"
vercel env add SMTP_HOST production <<< "mail.mottovia.com"

echo "📧 SMTP_PORT (production)"
vercel env add SMTP_PORT production <<< "465"

echo "📧 SMTP_USER (production)"
vercel env add SMTP_USER production <<< "info@mottovia.com"

echo "📧 SMTP_PASSWORD (production)"
vercel env add SMTP_PASSWORD production <<< "p?@]JStDK4IP"

echo ""
echo -e "${YELLOW}📌 Admin Credentials...${NC}"
echo ""

# Admin
echo "👤 ADMIN_EMAIL (production)"
vercel env add ADMIN_EMAIL production <<< "admin@basakpastanesi.com"

echo "👤 ADMIN_PASSWORD (production)"
vercel env add ADMIN_PASSWORD production <<< "Basak PastanesiAdmin2024!Secure#Production"

echo ""
echo -e "${YELLOW}📌 URLs and CORS...${NC}"
echo ""

# Frontend URL - Production domain
echo "🌐 FRONTEND_URL (production)"
vercel env add FRONTEND_URL production <<< "https://www.basakpasta.com.tr"

# CORS Origins - All allowed origins
echo "🌐 CORS_ORIGINS (production)"
vercel env add CORS_ORIGINS production <<< "https://basakpasta.com.tr,https://www.basakpasta.com.tr,https://basak-pastanesi-master-web.vercel.app,https://basak-pastanesi-admin.vercel.app"

# CSP Image Sources
echo "🖼️ CSP_IMAGE_SOURCES (production)"
vercel env add CSP_IMAGE_SOURCES production <<< "'self',data:,https://res.cloudinary.com"

echo ""
echo -e "${YELLOW}📌 Optional Services (Disabled)...${NC}"
echo ""

# Redis (disabled)
echo "❌ REDIS_ENABLED (production)"
vercel env add REDIS_ENABLED production <<< "false"

# SMS (disabled)
echo "❌ SMS_ENABLED (production)"
vercel env add SMS_ENABLED production <<< "false"

# Mudita Kurye (disabled for demo)
echo "❌ MUDITA_ENABLED (production)"
vercel env add MUDITA_ENABLED production <<< "false"

# Sentry (optional)
echo "📊 SENTRY_DSN (production)"
vercel env add SENTRY_DSN production <<< ""

echo ""
echo -e "${GREEN}✅ Tüm environment variables başarıyla eklendi!${NC}"
echo ""
echo -e "${YELLOW}📋 Sonraki Adımlar:${NC}"
echo "1. Frontend deploy edildiğinde FRONTEND_URL ve CORS_ORIGINS'i güncelleyin"
echo "2. PayTR bilgilerini ekleyin (opsiyonel)"
echo "3. Yeni deployment tetikleyin: vercel --prod"
echo ""
echo -e "${GREEN}🎉 Kurulum tamamlandı!${NC}"
