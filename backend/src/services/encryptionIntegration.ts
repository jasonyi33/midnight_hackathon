import { encryptionService, EncryptedData } from '@utils/encryption';
import { keyManagementService } from '@utils/keyManagement';
import { query } from '@config/database';
import { logger } from '@utils/logger';

export interface EncryptedField {
  fieldName: string;
  encrypted: boolean;
  data?: string;
  metadata?: EncryptedData;
}

export class EncryptionIntegrationService {
  /**
   * Encrypt sensitive fields before storing in database
   */
  async encryptSensitiveFields(
    userId: string,
    data: Record<string, any>,
    fieldsToEncrypt: string[]
  ): Promise<Record<string, any>> {
    const userKey = await keyManagementService.getUserKey(userId);
    if (!userKey) {
      throw new Error('Failed to get user encryption key');
    }

    const encryptedData = { ...data };

    for (const field of fieldsToEncrypt) {
      if (data[field] !== undefined && data[field] !== null) {
        const valueToEncrypt = typeof data[field] === 'object'
          ? JSON.stringify(data[field])
          : String(data[field]);

        const encrypted = encryptionService.encrypt(valueToEncrypt, userKey);

        // Store encrypted data as JSON string
        encryptedData[`${field}_encrypted`] = JSON.stringify(encrypted);
        encryptedData[`${field}_is_encrypted`] = true;

        // Remove original field
        delete encryptedData[field];
      }
    }

    return encryptedData;
  }

  /**
   * Decrypt sensitive fields after retrieving from database
   */
  async decryptSensitiveFields(
    userId: string,
    data: Record<string, any>,
    fieldsToDecrypt: string[]
  ): Promise<Record<string, any>> {
    const userKey = await keyManagementService.getUserKey(userId);
    if (!userKey) {
      throw new Error('Failed to get user encryption key');
    }

    const decryptedData = { ...data };

    for (const field of fieldsToDecrypt) {
      const encryptedField = `${field}_encrypted`;
      const isEncryptedField = `${field}_is_encrypted`;

      if (decryptedData[isEncryptedField] && decryptedData[encryptedField]) {
        try {
          const encryptedDataObj = JSON.parse(decryptedData[encryptedField]);
          const decrypted = encryptionService.decrypt(encryptedDataObj, userKey);

          // Try to parse as JSON if it looks like JSON
          try {
            decryptedData[field] = JSON.parse(decrypted);
          } catch {
            decryptedData[field] = decrypted;
          }

          // Remove encrypted fields
          delete decryptedData[encryptedField];
          delete decryptedData[isEncryptedField];
        } catch (error) {
          logger.error(`Failed to decrypt field ${field}:`, error);
          decryptedData[field] = null;
        }
      }
    }

    return decryptedData;
  }

  /**
   * Encrypt genome commitment data
   */
  async encryptGenomeCommitment(
    userId: string,
    genomicData: object,
    ipfsCid: string
  ): Promise<{
    encryptedData: string;
    commitmentHash: string;
    encryptedKey: string;
  }> {
    const userKey = await keyManagementService.getUserKey(userId);
    if (!userKey) {
      throw new Error('Failed to get user encryption key');
    }

    // Encrypt the genomic data
    const encrypted = encryptionService.encryptGenomicData(genomicData, userKey);

    // Generate commitment hash
    const crypto = await import('crypto');
    const dataForHash = JSON.stringify({ genomicData, ipfsCid, userId });
    const commitmentHash = crypto.createHash('sha256').update(dataForHash).digest('hex');

    // Store in database
    await query(
      `INSERT INTO genome_commitments (user_id, commitment_hash, ipfs_cid, encrypted_key, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, commitment_hash) WHERE deleted_at IS NULL
       DO UPDATE SET ipfs_cid = EXCLUDED.ipfs_cid, updated_at = NOW()`,
      [userId, `0x${commitmentHash}`, ipfsCid, JSON.stringify(encrypted)]
    );

    logger.info(`Genome commitment stored for user ${userId}`);

    return {
      encryptedData: JSON.stringify(encrypted),
      commitmentHash: `0x${commitmentHash}`,
      encryptedKey: userKey
    };
  }

  /**
   * Decrypt genome commitment data
   */
  async decryptGenomeCommitment(
    userId: string,
    commitmentHash: string
  ): Promise<object | null> {
    const result = await query<{ encrypted_key: string; ipfs_cid: string }>(
      `SELECT encrypted_key, ipfs_cid
       FROM genome_commitments
       WHERE user_id = $1 AND commitment_hash = $2 AND deleted_at IS NULL`,
      [userId, commitmentHash]
    );

    if (result.length === 0) {
      return null;
    }

    const userKey = await keyManagementService.getUserKey(userId);
    if (!userKey) {
      throw new Error('Failed to get user encryption key');
    }

    try {
      const encryptedData = JSON.parse(result[0].encrypted_key);
      const decrypted = encryptionService.decryptGenomicData(encryptedData, userKey);
      return decrypted;
    } catch (error) {
      logger.error(`Failed to decrypt genome commitment for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Encrypt proof data before caching
   */
  async encryptProofCache(
    userId: string,
    traitType: string,
    proofData: object
  ): Promise<void> {
    const userKey = await keyManagementService.getUserKey(userId);
    if (!userKey) {
      throw new Error('Failed to get user encryption key');
    }

    const encrypted = encryptionService.encrypt(JSON.stringify(proofData), userKey);

    await query(
      `INSERT INTO proof_cache (user_id, trait_type, proof_data, metadata, created_at, expires_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '1 hour')
       ON CONFLICT (user_id, trait_type) WHERE deleted_at IS NULL
       DO UPDATE SET
         proof_data = EXCLUDED.proof_data,
         metadata = EXCLUDED.metadata,
         expires_at = NOW() + INTERVAL '1 hour'`,
      [userId, traitType, JSON.stringify(encrypted), { encrypted: true }]
    );

    logger.info(`Proof cached for user ${userId}, trait ${traitType}`);
  }

  /**
   * Decrypt proof from cache
   */
  async decryptProofCache(
    userId: string,
    traitType: string
  ): Promise<object | null> {
    const result = await query<{ proof_data: string; metadata: any }>(
      `SELECT proof_data, metadata
       FROM proof_cache
       WHERE user_id = $1 AND trait_type = $2
         AND deleted_at IS NULL
         AND expires_at > NOW()`,
      [userId, traitType]
    );

    if (result.length === 0) {
      return null;
    }

    const userKey = await keyManagementService.getUserKey(userId);
    if (!userKey) {
      throw new Error('Failed to get user encryption key');
    }

    try {
      const encryptedData = JSON.parse(result[0].proof_data);
      const decrypted = encryptionService.decrypt(encryptedData, userKey);
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error(`Failed to decrypt proof cache for user ${userId}:`, error);
      return null;
    }
  }
}

export const encryptionIntegrationService = new EncryptionIntegrationService();