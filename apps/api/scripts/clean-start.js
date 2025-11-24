#!/usr/bin/env node

/**
 * Clean start script for backend
 * Kills port 4001 and starts backend server
 */

import { execSync, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = '4001';

console.log('🧹 Backend temizlik ve başlatma işlemi başlıyor...\n');

// Step 1: Kill port
console.log(`🔍 Port ${PORT} kontrol ediliyor...`);
try {
  execSync(`node ${path.join(__dirname, 'kill-port.js')} ${PORT}`, { stdio: 'inherit' });
} catch (err) {
  console.log('⚠️  Port sonlandırma hatası (devam ediliyor)');
}

// Step 2: Start backend server
console.log('\n🚀 Backend server başlatılıyor...\n');
console.log('━'.repeat(50));

const backendProcess = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

backendProcess.on('error', (err) => {
  console.error('❌ Backend server başlatma hatası:', err);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exit code: ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Backend server kapatılıyor...');
  backendProcess.kill('SIGINT');
  process.exit(0);
});
