#!/bin/bash

# Vercel Environment Variables Setup Script
# Bu scripti çalıştırmadan önce .env.production dosyasını oluşturun

echo "🚀 Vercel Environment Variables Setup"
echo "======================================"

# MongoDB Atlas
vercel env add MONGODB_URI production
vercel env add MONGODB_URI preview
vercel env add MONGODB_URI development

# Server Config
vercel env add NODE_ENV production
vercel env add PORT production

# Security
vercel env add JWT_SECRET production
vercel env add JWT_SECRET preview
vercel env add JWT_SECRET development
vercel env add WEBHOOK_ENCRYPTION_KEY production
vercel env add WEBHOOK_ENCRYPTION_KEY preview

# Admin
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production

# Cloudinary
vercel env add CLOUDINARY_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_SECRET_KEY production
vercel env add CLOUDINARY_URL production

# Payment
vercel env add MERCHANT_ID production
vercel env add MERCHANT_KEY production
vercel env add MERCHANT_SALT production
vercel env add TEST_MODE production
vercel env add MERCHANT_OK_URL production
vercel env add MERCHANT_FAIL_URL production

# Email
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production

# Frontend URL
vercel env add FRONTEND_URL production
vercel env add CORS_ORIGINS production
vercel env add CSP_IMAGE_SOURCES production

# MuditaKurye
vercel env add MUDITA_ENABLED production
vercel env add MUDITA_TEST_MODE production
vercel env add MUDITA_API_URL production
vercel env add MUDITA_WEBHOOK_SECRET production
vercel env add MUDITAKURYE_BASE_URL production
vercel env add MUDITAKURYE_API_KEY production
vercel env add MUDITAKURYE_RESTAURANT_ID production
vercel env add MUDITAKURYE_USERNAME production

echo "✅ Environment variables kurulumu tamamlandı!"
echo "📝 Şimdi Vercel'e deploy edebilirsiniz: vercel --prod"
