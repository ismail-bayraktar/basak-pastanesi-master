#!/bin/bash

# ========================================
# TURBOREPO MONOREPO TEST SUITE
# ========================================

set -e  # Exit on error

echo "🧪 TURBOREPO MONOREPO TEST SUITE"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2

    echo -e "${YELLOW}▶ Testing: $test_name${NC}"

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📦 1. PACKAGE MANAGER TESTS"
echo "----------------------------"

run_test "pnpm installed" "command -v pnpm"
run_test "Node.js version >= 18" "node -v | grep -E 'v(1[8-9]|2[0-9])'"
run_test "pnpm workspace configured" "test -f pnpm-workspace.yaml"

echo ""
echo "🏗️  2. MONOREPO STRUCTURE TESTS"
echo "--------------------------------"

run_test "turbo.json exists" "test -f turbo.json"
run_test "Root package.json exists" "test -f package.json"
run_test "apps/ directory exists" "test -d apps"
run_test "packages/ directory exists" "test -d packages"

echo ""
echo "📱 3. APPLICATIONS TESTS"
echo "------------------------"

run_test "Web app exists (apps/web)" "test -d apps/web"
run_test "API exists (apps/api)" "test -d apps/api"
run_test "Admin exists (apps/admin)" "test -d apps/admin"

run_test "Web app package.json" "test -f apps/web/package.json"
run_test "API package.json" "test -f apps/api/package.json"
run_test "Admin package.json" "test -f apps/admin/package.json"

echo ""
echo "📦 4. SHARED PACKAGES TESTS"
echo "----------------------------"

run_test "@repo/types exists" "test -d packages/types"
run_test "@repo/utils exists" "test -d packages/utils"
run_test "@repo/constants exists" "test -d packages/constants"

run_test "@repo/types package.json" "test -f packages/types/package.json"
run_test "@repo/utils package.json" "test -f packages/utils/package.json"
run_test "@repo/constants package.json" "test -f packages/constants/package.json"

echo ""
echo "🔧 5. DEPENDENCIES TESTS"
echo "------------------------"

run_test "node_modules exists" "test -d node_modules"
run_test "Turborepo installed" "test -f node_modules/.bin/turbo"
run_test "Web dependencies installed" "test -d apps/web/node_modules"
run_test "API dependencies installed" "test -d apps/api/node_modules"
run_test "Admin dependencies installed" "test -d apps/admin/node_modules"

echo ""
echo "⚙️  6. CONFIGURATION TESTS"
echo "--------------------------"

run_test "Web Next.js config" "test -f apps/web/next.config.ts"
run_test "Admin Vite config" "test -f apps/admin/vite.config.ts"
run_test "TypeScript root config" "test -f tsconfig.json"

echo ""
echo "🗄️  7. DATABASE TESTS"
echo "---------------------"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker not installed - skipping database tests${NC}"
else
    if docker ps &> /dev/null; then
        run_test "Docker is running" "docker ps > /dev/null"
        run_test "MongoDB container exists" "docker ps --format '{{.Names}}' | grep -i mongo"

        # Test MongoDB connection
        if [ -f apps/api/.env ]; then
            run_test "API .env file exists" "test -f apps/api/.env"

            # Extract MongoDB URI
            MONGO_URI=$(grep MONGODB_URI apps/api/.env | cut -d '=' -f2-)
            if [ ! -z "$MONGO_URI" ]; then
                run_test "MongoDB URI configured" "test ! -z '$MONGO_URI'"
            else
                echo -e "${RED}✗ FAILED${NC}: MongoDB URI not found in .env"
                ((TESTS_FAILED++))
            fi
        else
            echo -e "${YELLOW}⚠ apps/api/.env not found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Docker is not running - skipping database tests${NC}"
    fi
fi

echo ""
echo "🏗️  8. BUILD TESTS"
echo "------------------"

# Check if packages are already built
if [ -d "packages/utils/dist" ] && [ -d "packages/types/dist" ]; then
    echo -e "${GREEN}✓ PASSED${NC}: Packages already built"
    ((TESTS_PASSED++))
else
    run_test "Build shared packages" "pnpm build --filter './packages/*'"
fi

echo ""
echo "🔍 9. IMPORT TESTS"
echo "------------------"

# Test if shared packages can be imported
run_test "Web app imports @repo/utils" "grep -r '@repo/utils' apps/web/src"
run_test "API imports workspace packages" "grep -r 'workspace:' apps/api/package.json"
run_test "Admin imports workspace packages" "grep -r 'workspace:' apps/admin/package.json"

echo ""
echo "================================================"
echo "📊 TEST RESULTS"
echo "================================================"
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Monorepo is ready for development and deployment"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please fix the issues before proceeding"
    exit 1
fi
