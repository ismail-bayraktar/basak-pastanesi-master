#!/bin/bash

# Frontend Entegrasyon Script'i
# Kullanım: ./scripts/integrate-frontend.sh [FRONTEND_REPO_URL]

set -e

FRONTEND_REPO_URL=$1

if [ -z "$FRONTEND_REPO_URL" ]; then
    echo "❌ Hata: Frontend repo URL'si gerekli"
    echo "Kullanım: ./scripts/integrate-frontend.sh [FRONTEND_REPO_URL]"
    exit 1
fi

echo "🚀 Frontend entegrasyonu başlatılıyor..."
echo "📦 Repo URL: $FRONTEND_REPO_URL"

# Mevcut web klasörünü yedekle
if [ -d "apps/web" ]; then
    echo "📁 Mevcut web klasörü yedekleniyor..."
    mv apps/web apps/web-backup-$(date +%Y%m%d-%H%M%S)
fi

# Frontend'i clone et
echo "⬇️  Frontend repo'su clone ediliyor..."
cd apps
git clone "$FRONTEND_REPO_URL" web
cd web

# Gerekli dosyaları kopyala
if [ -d "../web-backup-"* ]; then
    BACKUP_DIR=$(ls -td ../web-backup-* | head -1)
    echo "📋 Gerekli dosyalar kopyalanıyor..."
    
    # .env.example kopyala
    if [ -f "$BACKUP_DIR/.env.example" ]; then
        cp "$BACKUP_DIR/.env.example" .env.local.example
        echo "✅ .env.example kopyalandı"
    fi
    
    # vercel.json kopyala (varsa)
    if [ -f "$BACKUP_DIR/vercel.json" ]; then
        cp "$BACKUP_DIR/vercel.json" .
        echo "✅ vercel.json kopyalandı"
    fi
fi

# Package.json'u güncelle
echo "📝 package.json güncelleniyor..."
if [ -f "package.json" ]; then
    # package.json'u düzenle (jq kullanarak veya sed ile)
    # Name'i güncelle
    if command -v jq &> /dev/null; then
        jq '.name = "@basak-pastanesi/web"' package.json > package.json.tmp && mv package.json.tmp package.json
    else
        echo "⚠️  jq bulunamadı, package.json'u manuel olarak güncelleyin"
    fi
fi

# Dependencies yükle
echo "📦 Dependencies yükleniyor..."
if [ -f "pnpm-lock.yaml" ] || [ -f "package.json" ]; then
    pnpm install
    echo "✅ Dependencies yüklendi"
fi

# .env.local oluştur
if [ ! -f ".env.local" ]; then
    echo "📝 .env.local dosyası oluşturuluyor..."
    cat > .env.local << EOF
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
    echo "✅ .env.local oluşturuldu"
fi

echo ""
echo "✅ Frontend entegrasyonu tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. apps/web/.env.local dosyasını kontrol edin"
echo "2. API endpoint'lerini apps/web/src/lib/api/endpoints.ts dosyasına göre güncelleyin"
echo "3. API client yapılandırmasını kontrol edin (apps/web/src/lib/api/client.ts)"
echo "4. Backend'i başlatın: cd apps/api && pnpm dev"
echo "5. Frontend'i başlatın: cd apps/web && pnpm dev"
echo ""
echo "📖 Detaylı bilgi için FRONTEND_INTEGRATION.md dosyasına bakın"

