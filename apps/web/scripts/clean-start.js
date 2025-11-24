#!/usr/bin/env node

/**
 * Clean start script
 * Kills port, removes lock file, and starts Next.js dev server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = '3000';
const LOCK_FILE = path.join(__dirname, '../.next/dev/lock');

console.log('🧹 Temizlik ve başlatma işlemi başlıyor...\n');

// Step 1: Kill port
console.log(`🔍 Port ${PORT} kontrol ediliyor...`);
try {
  execSync(`node ${path.join(__dirname, 'kill-port.js')} ${PORT}`, { stdio: 'inherit' });
} catch (err) {
  console.log('⚠️  Port sonlandırma hatası (devam ediliyor)');
}

// Step 2: Remove lock file
console.log('\n🔒 Lock dosyası kontrol ediliyor...');
if (fs.existsSync(LOCK_FILE)) {
  try {
    fs.unlinkSync(LOCK_FILE);
    console.log('✅ Lock dosyası silindi');
  } catch (err) {
    console.log('⚠️  Lock dosyası silinemedi:', err.message);
  }
} else {
  console.log('✅ Lock dosyası zaten yok');
}

// Step 3: Start dev server
console.log('\n🚀 Dev server başlatılıyor...\n');
console.log('━'.repeat(50));

const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

devProcess.on('error', (err) => {
  console.error('❌ Dev server başlatma hatası:', err);
  process.exit(1);
});

devProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Dev server exit code: ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Dev server kapatılıyor...');
  devProcess.kill('SIGINT');
  process.exit(0);
});
