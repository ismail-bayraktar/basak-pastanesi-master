#!/usr/bin/env node

/**
 * Kill process on specified port
 * Usage: node scripts/kill-port.js [port]
 * Default port: 4001
 */

import { execSync } from 'child_process';

(async function() {
  const port = process.argv[2] || '4001';

  console.log(`🔍 Port ${port} kontrol ediliyor...`);

  try {
    if (process.platform === 'win32') {
      // Windows için
      try {
        const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        const lines = result.split('\n').filter(line => line.includes('LISTENING'));

        if (lines.length === 0) {
          console.log(`✅ Port ${port} zaten boş`);
          process.exit(0);
        }

        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });

        pids.forEach(pid => {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`✅ Process ${pid} sonlandırıldı (Port ${port})`);
          } catch (err) {
            console.log(`⚠️  Process ${pid} sonlandırılamadı (zaten kapanmış olabilir)`);
          }
        });
      } catch (err) {
        console.log(`✅ Port ${port} boş`);
      }
    } else {
      // Linux/Mac için
      try {
        const result = execSync(`lsof -i :${port} -t`, { encoding: 'utf8' });
        const pids = result.trim().split('\n').filter(pid => pid);

        if (pids.length === 0) {
          console.log(`✅ Port ${port} zaten boş`);
          process.exit(0);
        }

        pids.forEach(pid => {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`✅ Process ${pid} sonlandırıldı (Port ${port})`);
          } catch (err) {
            console.log(`⚠️  Process ${pid} sonlandırılamadı`);
          }
        });
      } catch (err) {
        console.log(`✅ Port ${port} boş`);
      }
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
})();
