import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
  authTag: string;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly iterations = 100000;
  private readonly keyLength = 32;

  /**
   * Encrypts data using AES-256-GCM
   */
  encrypt(data: string, password: string): EncryptedData {
    // Generate random salt and IV
    const salt = randomBytes(32);
    const iv = randomBytes(16);

    // Derive key from password
    const key = pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');

    // Create cipher
    const cipher = createCipheriv(this.algorithm, key, iv);

    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag for verification
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypts data encrypted with AES-256-GCM
   */
  decrypt(encryptedData: EncryptedData, password: string): string {
    // Convert hex strings back to buffers
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');

    // Derive key from password
    const key = pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');

    // Create decipher
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt data
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generates a secure encryption key
   */
  generateKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Encrypts genomic data specifically
   */
  encryptGenomicData(genomicData: object, userKey: string): EncryptedData {
    const dataString = JSON.stringify(genomicData);
    return this.encrypt(dataString, userKey);
  }

  /**
   * Decrypts genomic data
   */
  decryptGenomicData(encryptedData: EncryptedData, userKey: string): object {
    const decryptedString = this.decrypt(encryptedData, userKey);
    return JSON.parse(decryptedString);
  }
}

export const encryptionService = new EncryptionService();