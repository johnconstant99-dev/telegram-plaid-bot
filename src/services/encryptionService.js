const crypto = require('crypto');
const config = require('../config');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class EncryptionService {
  constructor() {
    if (!config.security.encryptionKey || config.security.encryptionKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }
    this.key = Buffer.from(config.security.encryptionKey, 'utf8');
  }

  encrypt(text) {
    if (!text) return null;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv + authTag + encrypted data
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }

  decrypt(encryptedText) {
    if (!encryptedText) return null;
    
    const ivHex = encryptedText.slice(0, IV_LENGTH * 2);
    const authTagHex = encryptedText.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2);
    const encrypted = encryptedText.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = new EncryptionService();
