import { randomBytes, pbkdf2Sync, createHash } from 'crypto';
import { config } from '@config/index';
import { query } from '@config/database';
import { encryptionService } from './encryption';
import { logger } from './logger';

export interface UserKey {
  userId: string;
  encryptedKey: string;
  salt: string;
  createdAt: Date;
}

export class KeyManagementService {
  private masterKey: Buffer;

  constructor() {
    // Derive master key from environment variable
    const masterKeyString = process.env.ENCRYPTION_MASTER_KEY || 'default_master_key_for_development';
    this.masterKey = this.deriveMasterKey(masterKeyString);
  }

  /**
   * Derive master key from string
   */
  private deriveMasterKey(keyString: string): Buffer {
    const salt = 'genomic_privacy_salt_v1';
    return pbkdf2Sync(keyString, salt, 100000, 32, 'sha256');
  }

  /**
   * Generate a unique encryption key for a user
   */
  generateUserKey(userId: string): string {
    const userSalt = randomBytes(32);
    const userKey = pbkdf2Sync(
      this.masterKey,
      Buffer.concat([userSalt, Buffer.from(userId)]),
      50000,
      32,
      'sha256'
    );
    return userKey.toString('hex');
  }

  /**
   * Store encrypted user key in database
   */
  async storeUserKey(userId: string, userKey: string): Promise<void> {
    const salt = randomBytes(32).toString('hex');

    // Encrypt the user key with master key
    const encryptedData = encryptionService.encrypt(userKey, this.masterKey.toString('hex'));

    await query(
      `INSERT INTO user_keys (user_id, encrypted_key, salt, iv, auth_tag, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         encrypted_key = EXCLUDED.encrypted_key,
         salt = EXCLUDED.salt,
         iv = EXCLUDED.iv,
         auth_tag = EXCLUDED.auth_tag,
         updated_at = NOW()`,
      [userId, encryptedData.encrypted, encryptedData.salt, encryptedData.iv, encryptedData.authTag]
    );

    logger.info(`User key stored for user ${userId}`);
  }

  /**
   * Retrieve and decrypt user key
   */
  async getUserKey(userId: string): Promise<string | null> {
    const result = await query<{
      encrypted_key: string;
      salt: string;
      iv: string;
      auth_tag: string;
    }>(
      'SELECT encrypted_key, salt, iv, auth_tag FROM user_keys WHERE user_id = $1',
      [userId]
    );

    if (result.length === 0) {
      // Generate new key if not exists
      const newKey = this.generateUserKey(userId);
      await this.storeUserKey(userId, newKey);
      return newKey;
    }

    const { encrypted_key, salt, iv, auth_tag } = result[0];

    // Decrypt the user key
    const decryptedKey = encryptionService.decrypt(
      {
        encrypted: encrypted_key,
        salt,
        iv,
        authTag: auth_tag
      },
      this.masterKey.toString('hex')
    );

    return decryptedKey;
  }

  /**
   * Rotate user key (for security)
   */
  async rotateUserKey(userId: string): Promise<string> {
    const newKey = this.generateUserKey(userId);

    // Store old key in history before updating
    await query(
      `INSERT INTO user_key_history (user_id, encrypted_key, salt, iv, auth_tag, rotated_at)
       SELECT user_id, encrypted_key, salt, iv, auth_tag, NOW()
       FROM user_keys
       WHERE user_id = $1`,
      [userId]
    );

    await this.storeUserKey(userId, newKey);

    logger.info(`Key rotated for user ${userId}`);
    return newKey;
  }

  /**
   * Generate deterministic key for specific data types
   */
  generateDataKey(userId: string, dataType: string): string {
    const combined = `${userId}_${dataType}_${this.masterKey.toString('hex').substring(0, 16)}`;
    return createHash('sha256').update(combined).digest('hex');
  }
}

export const keyManagementService = new KeyManagementService();