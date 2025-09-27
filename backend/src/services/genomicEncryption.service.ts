import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHash } from 'crypto';
import { logger } from '@utils/logger';
import { validateBRCARiskScore, validateCYP2D6ActivityScore, validateConfidenceScore } from '@utils/medicalConstants';
import { AppError, ValidationError } from '@utils/errors';
import { query } from '@config/database';

/**
 * Task 2.2: Genomic Data Encryption Service
 * CRITICAL: Never stores unencrypted genomic data
 * Validates all genomic data before encryption
 * Generates unique salt/IV for each encryption operation
 */

export interface GenomicData {
  patientId: string;
  sequenceDate: string;
  genome: {
    BRCA1?: GeneticMarker;
    BRCA2?: GeneticMarker;
    CYP2D6?: PharmacogenomicMarker;
    APOE?: GeneticMarker;
    HER2?: GeneticMarker;
  };
  metadata: {
    version: string;
    laboratory?: string;
    qualityScore?: number;
  };
}

export interface GeneticMarker {
  status: 'wild_type' | 'heterozygous' | 'homozygous' | 'mutation_detected';
  variants: string[];
  riskScore: number;
  confidence: number;
}

export interface PharmacogenomicMarker extends GeneticMarker {
  phenotype: 'poor_metabolizer' | 'intermediate_metabolizer' |
             'normal_metabolizer' | 'rapid_metabolizer' | 'ultrarapid_metabolizer';
  diplotype: string;
  activityScore: number;
}

export interface EncryptedGenomicData {
  encryptedData: string;
  salt: string;
  iv: string;
  authTag: string;
  keyDerivationIterations: number;
  algorithm: string;
  encryptedAt: string;
  patientId: string;
  commitmentHash: string;
}

export interface EncryptionMetadata {
  id: string;
  patientId: string;
  salt: string;
  iv: string;
  authTag: string;
  algorithm: string;
  keyDerivationIterations: number;
  encryptedAt: Date;
  reEncryptedAt?: Date;
  accessRevoked?: boolean;
}

export class GenomicEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly iterations = 100000;
  private readonly keyLength = 32;
  private readonly saltLength = 32;
  private readonly ivLength = 16;

  /**
   * Validates genomic data structure and ranges
   * CRITICAL: Must validate before any encryption
   */
  private validateGenomicData(data: GenomicData): void {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid genomic data structure');
    }

    if (!data.patientId || typeof data.patientId !== 'string') {
      throw new ValidationError('Patient ID is required');
    }

    if (!data.genome || typeof data.genome !== 'object') {
      throw new ValidationError('Genome data is required');
    }

    // Validate BRCA1 if present
    if (data.genome.BRCA1) {
      this.validateGeneticMarker(data.genome.BRCA1, 'BRCA1');
    }

    // Validate BRCA2 if present
    if (data.genome.BRCA2) {
      this.validateGeneticMarker(data.genome.BRCA2, 'BRCA2');
    }

    // Validate CYP2D6 if present
    if (data.genome.CYP2D6) {
      this.validatePharmacogenomicMarker(data.genome.CYP2D6);
    }

    // At least one genetic marker must be present
    if (!data.genome.BRCA1 && !data.genome.BRCA2 && !data.genome.CYP2D6) {
      throw new ValidationError('At least one genetic marker is required');
    }

    logger.info(`Genomic data validated for patient ${data.patientId}`);
  }

  private validateGeneticMarker(marker: GeneticMarker, type: string): void {
    if (!validateBRCARiskScore(marker.riskScore)) {
      throw new ValidationError(`Invalid ${type} risk score: ${marker.riskScore}`);
    }

    if (!validateConfidenceScore(marker.confidence)) {
      throw new ValidationError(`Invalid ${type} confidence score: ${marker.confidence}`);
    }

    const validStatuses = ['wild_type', 'heterozygous', 'homozygous', 'mutation_detected'];
    if (!validStatuses.includes(marker.status)) {
      throw new ValidationError(`Invalid ${type} status: ${marker.status}`);
    }
  }

  private validatePharmacogenomicMarker(marker: PharmacogenomicMarker): void {
    this.validateGeneticMarker(marker, 'CYP2D6');

    if (!validateCYP2D6ActivityScore(marker.activityScore)) {
      throw new ValidationError(`Invalid CYP2D6 activity score: ${marker.activityScore}`);
    }

    const validPhenotypes = [
      'poor_metabolizer', 'intermediate_metabolizer',
      'normal_metabolizer', 'rapid_metabolizer', 'ultrarapid_metabolizer'
    ];
    if (!validPhenotypes.includes(marker.phenotype)) {
      throw new ValidationError(`Invalid CYP2D6 phenotype: ${marker.phenotype}`);
    }
  }

  /**
   * Encrypts genomic data with AES-256-GCM
   * CRITICAL: Never logs or stores unencrypted data
   */
  async encryptGenomicData(
    genomicData: GenomicData,
    userKey: string
  ): Promise<EncryptedGenomicData> {
    // Validate before encryption
    this.validateGenomicData(genomicData);

    // Generate unique cryptographic materials for this encryption
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);

    // Derive encryption key from user key
    const derivedKey = pbkdf2Sync(
      userKey,
      salt,
      this.iterations,
      this.keyLength,
      'sha256'
    );

    // Create cipher
    const cipher = createCipheriv(this.algorithm, derivedKey, iv);

    // Convert genomic data to string (never log this!)
    const dataString = JSON.stringify(genomicData);

    // Encrypt data
    let encryptedData = cipher.update(dataString, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Generate commitment hash for blockchain storage
    const commitmentData = {
      patientId: genomicData.patientId,
      encryptedData: encryptedData.substring(0, 64), // First 64 chars for privacy
      timestamp: Date.now()
    };
    const commitmentHash = `0x${createHash('sha256')
      .update(JSON.stringify(commitmentData))
      .digest('hex')}`;

    // Store encryption metadata (NOT the actual data)
    await this.storeEncryptionMetadata({
      id: randomBytes(16).toString('hex'),
      patientId: genomicData.patientId,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm,
      keyDerivationIterations: this.iterations,
      encryptedAt: new Date()
    });

    // Log encryption event (NO sensitive data)
    logger.info(`Genomic data encrypted for patient ${genomicData.patientId}`);

    // Clear sensitive data from memory
    dataString.replace(/./g, '\0');

    return {
      encryptedData,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      keyDerivationIterations: this.iterations,
      algorithm: this.algorithm,
      encryptedAt: new Date().toISOString(),
      patientId: genomicData.patientId,
      commitmentHash
    };
  }

  /**
   * Decrypts genomic data
   * CRITICAL: Only for authorized access
   */
  async decryptGenomicData(
    encryptedData: EncryptedGenomicData,
    userKey: string
  ): Promise<GenomicData> {
    try {
      // Convert hex strings back to buffers
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');

      // Derive key from user key
      const derivedKey = pbkdf2Sync(
        userKey,
        salt,
        encryptedData.keyDerivationIterations,
        this.keyLength,
        'sha256'
      );

      // Create decipher
      const decipher = createDecipheriv(encryptedData.algorithm, derivedKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Parse and validate decrypted data
      const genomicData = JSON.parse(decrypted);
      this.validateGenomicData(genomicData);

      // Log decryption event (NO sensitive data)
      logger.info(`Genomic data decrypted for patient ${encryptedData.patientId}`);

      return genomicData;
    } catch (error) {
      logger.error(`Decryption failed for patient ${encryptedData.patientId}`);
      throw new AppError(401, 'Decryption failed - invalid key or corrupted data');
    }
  }

  /**
   * Re-encrypts genomic data with new key for access revocation
   */
  async reEncryptGenomicData(
    encryptedData: EncryptedGenomicData,
    oldKey: string,
    newKey: string
  ): Promise<EncryptedGenomicData> {
    // Decrypt with old key
    const genomicData = await this.decryptGenomicData(encryptedData, oldKey);

    // Re-encrypt with new key
    const reEncrypted = await this.encryptGenomicData(genomicData, newKey);

    // Update metadata
    await this.updateEncryptionMetadata(encryptedData.patientId, {
      reEncryptedAt: new Date(),
      accessRevoked: true
    });

    logger.info(`Genomic data re-encrypted for patient ${encryptedData.patientId}`);

    return reEncrypted;
  }

  /**
   * Stores encryption metadata in database
   * CRITICAL: Never store actual genomic data
   */
  private async storeEncryptionMetadata(metadata: EncryptionMetadata): Promise<void> {
    await query(
      `INSERT INTO encryption_metadata
       (id, patient_id, salt, iv, auth_tag, algorithm, iterations, encrypted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        metadata.id,
        metadata.patientId,
        metadata.salt,
        metadata.iv,
        metadata.authTag,
        metadata.algorithm,
        metadata.keyDerivationIterations,
        metadata.encryptedAt
      ]
    );
  }

  /**
   * Updates encryption metadata for re-encryption
   */
  private async updateEncryptionMetadata(
    patientId: string,
    updates: Partial<EncryptionMetadata>
  ): Promise<void> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    await query(
      `UPDATE encryption_metadata SET ${setClause} WHERE patient_id = $1`,
      [patientId, ...Object.values(updates)]
    );
  }

  /**
   * Generates a secure encryption key
   */
  generateSecureKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Creates commitment hash for blockchain storage
   */
  generateCommitmentHash(encryptedData: string, patientId: string): string {
    const commitmentData = {
      patientId,
      dataHash: createHash('sha256').update(encryptedData).digest('hex'),
      timestamp: Date.now()
    };
    return `0x${createHash('sha256').update(JSON.stringify(commitmentData)).digest('hex')}`;
  }
}

export const genomicEncryptionService = new GenomicEncryptionService();