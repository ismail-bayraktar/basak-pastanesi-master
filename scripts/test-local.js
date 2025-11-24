#!/usr/bin/env node

/**
 * Local Monorepo Test Suite
 * Tests build system, dependencies, and MongoDB connectivity
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    log(`✓ ${name}`, 'green');
    passedTests++;
    return true;
  } catch (error) {
    log(`✗ ${name}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    failedTests++;
    return false;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    log(`✓ ${name}`, 'green');
    passedTests++;
    return true;
  } catch (error) {
    log(`✗ ${name}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    failedTests++;
    return false;
  }
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    throw new Error(error.stderr || error.message);
  }
}

async function main() {
  log('\n🧪 TURBOREPO MONOREPO TEST SUITE', 'blue');
  log('='.repeat(50), 'blue');
  log('');

  // 1. Package Manager Tests
  log('📦 1. PACKAGE MANAGER', 'yellow');
  test('pnpm is installed', () => {
    exec('pnpm --version');
  });

  test('Node.js version >= 18', () => {
    const version = process.version.replace('v', '');
    const major = parseInt(version.split('.')[0]);
    if (major < 18) throw new Error(`Node ${version} < 18`);
  });

  test('pnpm workspace configured', () => {
    if (!fs.existsSync('pnpm-workspace.yaml')) {
      throw new Error('pnpm-workspace.yaml not found');
    }
  });

  log('');

  // 2. Monorepo Structure
  log('🏗️  2. MONOREPO STRUCTURE', 'yellow');
  test('turbo.json exists', () => {
    if (!fs.existsSync('turbo.json')) throw new Error('Not found');
  });

  test('Root package.json exists', () => {
    if (!fs.existsSync('package.json')) throw new Error('Not found');
  });

  test('apps/ directory exists', () => {
    if (!fs.existsSync('apps')) throw new Error('Not found');
  });

  test('packages/ directory exists', () => {
    if (!fs.existsSync('packages')) throw new Error('Not found');
  });

  log('');

  // 3. Applications
  log('📱 3. APPLICATIONS', 'yellow');
  const apps = ['web', 'api', 'admin'];
  apps.forEach((app) => {
    test(`${app} exists`, () => {
      if (!fs.existsSync(`apps/${app}`)) throw new Error('Not found');
    });

    test(`${app} package.json`, () => {
      if (!fs.existsSync(`apps/${app}/package.json`)) {
        throw new Error('Not found');
      }
    });
  });

  log('');

  // 4. Shared Packages
  log('📦 4. SHARED PACKAGES', 'yellow');
  const packages = ['types', 'utils', 'constants'];
  packages.forEach((pkg) => {
    test(`@repo/${pkg} exists`, () => {
      if (!fs.existsSync(`packages/${pkg}`)) throw new Error('Not found');
    });

    test(`@repo/${pkg} package.json`, () => {
      if (!fs.existsSync(`packages/${pkg}/package.json`)) {
        throw new Error('Not found');
      }
    });
  });

  log('');

  // 5. Dependencies
  log('🔧 5. DEPENDENCIES', 'yellow');
  test('Root node_modules exists', () => {
    if (!fs.existsSync('node_modules')) throw new Error('Run pnpm install');
  });

  test('Turborepo installed', () => {
    if (!fs.existsSync('node_modules/.bin/turbo')) {
      throw new Error('Run pnpm install');
    }
  });

  apps.forEach((app) => {
    test(`${app} dependencies installed`, () => {
      if (!fs.existsSync(`apps/${app}/node_modules`)) {
        throw new Error('Run pnpm install');
      }
    });
  });

  log('');

  // 6. Build Tests
  log('🏗️  6. BUILD SYSTEM', 'yellow');

  test('Shared packages buildable', () => {
    log('  Building shared packages...', 'blue');
    exec('pnpm build --filter "./packages/*"');
  });

  test('@repo/utils built', () => {
    if (!fs.existsSync('packages/utils/dist')) {
      throw new Error('dist/ not found');
    }
  });

  test('@repo/types built', () => {
    if (!fs.existsSync('packages/types/dist')) {
      throw new Error('dist/ not found');
    }
  });

  log('');

  // 7. MongoDB Connection Test
  log('🗄️  7. DATABASE CONNECTION', 'yellow');

  await asyncTest('MongoDB Atlas connection', async () => {
    const envPath = path.join(__dirname, '../apps/api/.env');

    if (!fs.existsSync(envPath)) {
      throw new Error('apps/api/.env not found');
    }

    // Read .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);

    if (!mongoUriMatch) {
      throw new Error('MONGODB_URI not found in .env');
    }

    const mongoUri = mongoUriMatch[1].trim();

    if (!mongoUri.startsWith('mongodb')) {
      throw new Error('Invalid MongoDB URI format');
    }

    log('  Connecting to MongoDB Atlas...', 'blue');

    // Test connection with timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    await mongoose.connection.close();
    log('  MongoDB connected successfully!', 'green');
  });

  log('');

  // 8. Import Tests
  log('🔍 8. PACKAGE IMPORTS', 'yellow');

  test('Web app imports @repo/utils', () => {
    const utilsPath = 'apps/web/src/lib/utils.ts';
    if (!fs.existsSync(utilsPath)) {
      throw new Error('utils.ts not found');
    }

    const content = fs.readFileSync(utilsPath, 'utf8');
    if (!content.includes('@repo/utils')) {
      throw new Error('@repo/utils not imported');
    }
  });

  test('API imports workspace packages', () => {
    const pkgPath = 'apps/api/package.json';
    const content = fs.readFileSync(pkgPath, 'utf8');
    if (!content.includes('workspace:')) {
      throw new Error('No workspace dependencies');
    }
  });

  log('');

  // Results
  log('='.repeat(50), 'blue');
  log('📊 TEST RESULTS', 'blue');
  log('='.repeat(50), 'blue');
  log(`✓ Passed: ${passedTests}`, 'green');
  if (failedTests > 0) {
    log(`✗ Failed: ${failedTests}`, 'red');
  }
  log(`Total: ${passedTests + failedTests}`, 'blue');
  log('');

  if (failedTests === 0) {
    log('🎉 ALL TESTS PASSED!', 'green');
    log('Monorepo is ready for development and deployment', 'green');
    process.exit(0);
  } else {
    log('❌ SOME TESTS FAILED', 'red');
    log('Please fix the issues before proceeding', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
