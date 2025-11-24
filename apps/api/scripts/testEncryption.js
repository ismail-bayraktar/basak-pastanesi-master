#!/usr/bin/env node

/**
 * Test Encryption Service
 *
 * This script tests the encryption/decryption functionality
 * to ensure WEBHOOK_ENCRYPTION_KEY is properly configured
 *
 * Usage:
 *   node scripts/testEncryption.js
 */

import 'dotenv/config'; // Load environment variables FIRST
import encryptionService from '../utils/encryption.js';
import crypto from 'crypto';

console.log('\n🔐 ENCRYPTION SERVICE TEST\n');
console.log('═'.repeat(60));

try {
    // Test 1: Basic encryption/decryption
    console.log('\n📝 Test 1: Basic Encryption/Decryption');
    console.log('─'.repeat(60));

    const testValue = 'my-super-secret-api-key-12345';
    console.log(`Original value: ${testValue}`);

    const encrypted = encryptionService.encrypt(testValue);
    console.log(`Encrypted: ${encrypted.substring(0, 50)}...`);
    console.log(`Length: ${encrypted.length} characters`);

    const decrypted = encryptionService.decrypt(encrypted);
    console.log(`Decrypted: ${decrypted}`);

    if (decrypted === testValue) {
        console.log('✅ Test 1 PASSED: Encryption/Decryption working correctly\n');
    } else {
        console.log('❌ Test 1 FAILED: Decryption mismatch\n');
        process.exit(1);
    }

    // Test 2: Null/empty values
    console.log('📝 Test 2: Null/Empty Values');
    console.log('─'.repeat(60));

    const nullEncrypted = encryptionService.encrypt(null);
    console.log(`Null encryption: ${nullEncrypted}`);

    const emptyEncrypted = encryptionService.encrypt('');
    console.log(`Empty string encryption: ${emptyEncrypted}`);

    if (nullEncrypted === null && emptyEncrypted !== '') {
        console.log('✅ Test 2 PASSED: Null/empty handling correct\n');
    } else {
        console.log('❌ Test 2 FAILED: Null/empty handling incorrect\n');
        process.exit(1);
    }

    // Test 3: Already encrypted values
    console.log('📝 Test 3: Idempotency (Double Encryption Prevention)');
    console.log('─'.repeat(60));

    const firstEncrypt = encryptionService.encrypt('test-value');
    const secondEncrypt = encryptionService.encrypt(firstEncrypt);

    console.log(`First encrypt: ${firstEncrypt.substring(0, 30)}...`);
    console.log(`Second encrypt: ${secondEncrypt.substring(0, 30)}...`);

    if (firstEncrypt === secondEncrypt) {
        console.log('✅ Test 3 PASSED: Already encrypted values not re-encrypted\n');
    } else {
        console.log('❌ Test 3 FAILED: Double encryption occurred\n');
        process.exit(1);
    }

    // Test 4: Hash functionality
    console.log('📝 Test 4: Hash Functionality');
    console.log('─'.repeat(60));

    const hashValue = 'webhook-id-12345';
    const hash1 = encryptionService.hash(hashValue);
    const hash2 = encryptionService.hash(hashValue);

    console.log(`Original: ${hashValue}`);
    console.log(`Hash 1: ${hash1}`);
    console.log(`Hash 2: ${hash2}`);

    if (hash1 === hash2) {
        console.log('✅ Hashes match (deterministic)');
    } else {
        console.log('❌ Hashes do not match\n');
        process.exit(1);
    }

    const isMatch = encryptionService.compareHash(hashValue, hash1);
    console.log(`Hash comparison: ${isMatch ? '✅ Match' : '❌ No match'}`);

    if (isMatch) {
        console.log('✅ Test 4 PASSED: Hash functionality working\n');
    } else {
        console.log('❌ Test 4 FAILED: Hash comparison failed\n');
        process.exit(1);
    }

    // Test 5: Check if encrypted value is deterministic (should NOT be)
    console.log('📝 Test 5: Encryption Randomness (Security)');
    console.log('─'.repeat(60));

    const encrypt1 = encryptionService.encrypt('same-value');
    const encrypt2 = encryptionService.encrypt('same-value');

    console.log(`Encryption 1: ${encrypt1.substring(0, 40)}...`);
    console.log(`Encryption 2: ${encrypt2.substring(0, 40)}...`);

    if (encrypt1 !== encrypt2) {
        console.log('✅ Test 5 PASSED: Encryption is non-deterministic (secure)\n');
    } else {
        console.log('⚠️  Test 5 WARNING: Encryption is deterministic (less secure)\n');
    }

    // Test 6: Decrypt both and verify same plaintext
    const decrypt1 = encryptionService.decrypt(encrypt1);
    const decrypt2 = encryptionService.decrypt(encrypt2);

    if (decrypt1 === decrypt2 && decrypt1 === 'same-value') {
        console.log('✅ Both decrypt to same value: Correct\n');
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('✅ Your encryption is configured correctly');
    console.log('✅ WEBHOOK_ENCRYPTION_KEY is valid');
    console.log('✅ Encryption service is working as expected\n');

    console.log('💡 You can now safely use encryption for:');
    console.log('   • Courier API keys');
    console.log('   • Webhook secrets');
    console.log('   • Payment credentials');
    console.log('   • Any sensitive configuration\n');

    console.log('═'.repeat(60));
    console.log('\n');

    process.exit(0);

} catch (error) {
    console.log('\n❌ ENCRYPTION TEST FAILED!\n');
    console.log('Error:', error.message);
    console.log('\nPossible causes:');
    console.log('  • WEBHOOK_ENCRYPTION_KEY not set in .env');
    console.log('  • WEBHOOK_ENCRYPTION_KEY is too short (< 32 chars)');
    console.log('  • .env file not loaded properly\n');

    console.log('💡 Solution:');
    console.log('  1. Run: node scripts/generateEncryptionKey.js');
    console.log('  2. Copy the generated key to your .env file');
    console.log('  3. Restart and try again\n');

    console.log('═'.repeat(60));
    console.log('\n');

    process.exit(1);
}
