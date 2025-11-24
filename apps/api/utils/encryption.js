import crypto from 'crypto';
import 'dotenv/config'; // Load environment variables
import logger from './logger.js';

/**
 * Encryption Utility
 * Provides secure encryption/decryption for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32; // 256 bits
        this.ivLength = 16;  // 128 bits
        this.saltLength = 64;
        this.tagLength = 16; // 128 bits
        this.iterations = 100000; // PBKDF2 iterations
        this.digest = 'sha512';

        // Validate encryption key on initialization
        this.validateEncryptionKey();
    }

    /**
     * Validate that encryption key is properly configured
     */
    validateEncryptionKey() {
        const key = process.env.WEBHOOK_ENCRYPTION_KEY;

        if (!key) {
            const error = 'WEBHOOK_ENCRYPTION_KEY environment variable is required';
            logger.error(error);
            throw new Error(error);
        }

        if (key.length < 32) {
            const error = `WEBHOOK_ENCRYPTION_KEY must be at least 32 characters (got ${key.length})`;
            logger.error(error);
            throw new Error(error);
        }

        // Warn if using weak key
        if (key === 'default_encryption_key_change_in_production') {
            logger.warn('⚠️ WARNING: Using default encryption key! Change this in production!');
        }

        logger.info('Encryption key validated successfully');
    }

    /**
     * Derive a cryptographic key from password using PBKDF2
     */
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(
            password,
            salt,
            this.iterations,
            this.keyLength,
            this.digest
        );
    }

    /**
     * Encrypt a string value
     * @param {string} plaintext - Value to encrypt
     * @returns {string} Encrypted value in format: enc:salt:iv:authTag:ciphertext
     */
    encrypt(plaintext) {
        if (!plaintext) {
            return null;
        }

        // Don't re-encrypt already encrypted values
        if (typeof plaintext === 'string' && plaintext.startsWith('enc:')) {
            return plaintext;
        }

        try {
            const masterKey = process.env.WEBHOOK_ENCRYPTION_KEY;

            // Generate random salt and IV
            const salt = crypto.randomBytes(this.saltLength);
            const iv = crypto.randomBytes(this.ivLength);

            // Derive key from master key + salt
            const key = this.deriveKey(masterKey, salt);

            // Create cipher
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);

            // Encrypt
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Get authentication tag
            const authTag = cipher.getAuthTag();

            // Format: enc:salt:iv:authTag:ciphertext
            const result = [
                'enc',
                salt.toString('hex'),
                iv.toString('hex'),
                authTag.toString('hex'),
                encrypted
            ].join(':');

            logger.debug('Value encrypted successfully', {
                saltLength: salt.length,
                ivLength: iv.length,
                tagLength: authTag.length
            });

            return result;

        } catch (error) {
            logger.error('Encryption failed', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt an encrypted string
     * @param {string} encryptedText - Encrypted value
     * @returns {string} Decrypted plaintext
     */
    decrypt(encryptedText) {
        if (!encryptedText) {
            return null;
        }

        // Return as-is if not encrypted
        if (!encryptedText.startsWith('enc:')) {
            logger.warn('Attempting to decrypt unencrypted value');
            return encryptedText;
        }

        try {
            const masterKey = process.env.WEBHOOK_ENCRYPTION_KEY;

            // Parse encrypted string
            const parts = encryptedText.split(':');
            if (parts.length !== 5) {
                throw new Error('Invalid encrypted format');
            }

            const [prefix, saltHex, ivHex, authTagHex, ciphertext] = parts;

            // Convert from hex
            const salt = Buffer.from(saltHex, 'hex');
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');

            // Derive key
            const key = this.deriveKey(masterKey, salt);

            // Create decipher
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(authTag);

            // Decrypt
            let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            logger.debug('Value decrypted successfully');

            return decrypted;

        } catch (error) {
            logger.error('Decryption failed', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    /**
     * Check if a value is encrypted
     */
    isEncrypted(value) {
        return typeof value === 'string' && value.startsWith('enc:');
    }

    /**
     * Rotate encryption (re-encrypt with new key)
     * Used when changing encryption keys
     */
    rotate(encryptedText, oldKey) {
        try {
            // Temporarily use old key for decryption
            const originalKey = process.env.WEBHOOK_ENCRYPTION_KEY;
            process.env.WEBHOOK_ENCRYPTION_KEY = oldKey;

            const plaintext = this.decrypt(encryptedText);

            // Restore new key
            process.env.WEBHOOK_ENCRYPTION_KEY = originalKey;

            // Re-encrypt with new key
            return this.encrypt(plaintext);

        } catch (error) {
            logger.error('Key rotation failed', {
                error: error.message
            });
            throw new Error(`Key rotation failed: ${error.message}`);
        }
    }

    /**
     * Generate a secure random encryption key
     * Use this to generate WEBHOOK_ENCRYPTION_KEY
     */
    static generateKey(length = 64) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Hash a value (one-way, for comparison only)
     * Use for webhook IDs, idempotency keys, etc.
     */
    hash(value, algorithm = 'sha256') {
        return crypto
            .createHash(algorithm)
            .update(value)
            .digest('hex');
    }

    /**
     * Compare hash with value (timing-safe)
     */
    compareHash(value, hash, algorithm = 'sha256') {
        const valueHash = this.hash(value, algorithm);

        try {
            return crypto.timingSafeEqual(
                Buffer.from(valueHash, 'hex'),
                Buffer.from(hash, 'hex')
            );
        } catch (error) {
            return false;
        }
    }
}

// Export singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;

// Also export class for testing
export { EncryptionService };

/**
 * Usage Examples:
 *
 * // Encrypt
 * const encrypted = encryptionService.encrypt('my-secret-api-key');
 * // Result: enc:a1b2c3...:d4e5f6...:g7h8i9...:j0k1l2...
 *
 * // Decrypt
 * const decrypted = encryptionService.decrypt(encrypted);
 * // Result: 'my-secret-api-key'
 *
 * // Generate new key
 * const newKey = EncryptionService.generateKey(64);
 * // Use this as WEBHOOK_ENCRYPTION_KEY in .env
 *
 * // Hash (one-way)
 * const hash = encryptionService.hash('webhook-id-12345');
 *
 * // Compare hash
 * const isMatch = encryptionService.compareHash('webhook-id-12345', hash);
 */
