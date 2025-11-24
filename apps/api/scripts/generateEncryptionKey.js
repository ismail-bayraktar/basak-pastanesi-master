#!/usr/bin/env node

/**
 * Generate Secure Encryption Key
 *
 * This script generates a cryptographically secure random key
 * for use as WEBHOOK_ENCRYPTION_KEY
 *
 * Usage:
 *   node scripts/generateEncryptionKey.js
 *
 * The generated key should be added to your .env file:
 *   WEBHOOK_ENCRYPTION_KEY=<generated_key>
 */

import crypto from 'crypto';
import 'dotenv/config'; // Load environment variables (optional for this script)

console.log('\n🔐 WEBHOOK ENCRYPTION KEY GENERATOR\n');
console.log('═'.repeat(60));

// Generate 64-byte (512-bit) random key
const key = crypto.randomBytes(64).toString('hex');

console.log('\n✅ Secure encryption key generated successfully!\n');
console.log('📋 Copy this key to your .env file:\n');
console.log('─'.repeat(60));
console.log(`WEBHOOK_ENCRYPTION_KEY=${key}`);
console.log('─'.repeat(60));

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('   • Never commit this key to version control');
console.log('   • Use different keys for dev/staging/production');
console.log('   • Store production keys in a secure vault (AWS Secrets Manager, etc.)');
console.log('   • Rotate keys periodically (every 90 days recommended)');
console.log('   • If compromised, rotate immediately\n');

console.log('📊 Key Information:');
console.log(`   • Length: ${key.length} characters (${key.length / 2} bytes)`);
console.log(`   • Format: Hexadecimal`);
console.log(`   • Entropy: ${Math.log2(Math.pow(16, key.length)).toFixed(0)} bits`);
console.log(`   • Algorithm: Cryptographically Secure Random Number Generator\n`);

console.log('💡 Next Steps:');
console.log('   1. Copy the key above');
console.log('   2. Add it to your .env file');
console.log('   3. Restart your application');
console.log('   4. Verify encryption is working:\n');
console.log('      node scripts/testEncryption.js\n');

console.log('═'.repeat(60));
console.log('\n');
