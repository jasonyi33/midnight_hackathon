import { query, queryActive } from '@config/database';
import { ipfsService } from '@/ipfs/ipfs.service';
import { encryptionIntegrationService } from '@/services/encryptionIntegration';
import { GenomicData, GenomeCommitment } from './genome.types';
import { NotFoundError, ValidationError } from '@utils/errors';
import { logger } from '@utils/logger';
import {
  validateBRCARiskScore,
  validateCYP2D6ActivityScore,
  validateConfidenceScore
} from '@utils/medicalConstants';

export class GenomeService {
  /**
   * Upload and encrypt genomic data (FR-007-014)
   */
  async uploadGenomicData(
    userId: string,
    genomicData: GenomicData,
    encrypt: boolean = true
  ): Promise<{
    commitmentHash: string;
    ipfsCid: string;
    success: boolean;
  }> {
    try {
      // Validate genomic data structure (FR-008)
      this.validateGenomicData(genomicData);

      // Pin to IPFS with encryption (FR-009, FR-011)
      const { cid, commitmentHash } = await ipfsService.pinGenomicData(
        userId,
        genomicData,
        encrypt
      );

      // Verify pinning success (FR-011)
      const isPinned = await ipfsService.verifyPin(cid);
      if (!isPinned) {
        throw new Error('Failed to verify IPFS pin');
      }

      logger.info(`Genomic data uploaded for user ${userId}: CID=${cid}, Hash=${commitmentHash}`);

      return {
        commitmentHash,
        ipfsCid: cid,
        success: true
      };
    } catch (error) {
      logger.error('Failed to upload genomic data:', error);
      throw error;
    }
  }

  /**
   * Retrieve genomic commitment by hash
   */
  async getCommitment(userId: string, commitmentHash: string): Promise<GenomeCommitment | null> {
    const result = await queryActive<GenomeCommitment>(
      `SELECT * FROM genome_commitments
       WHERE user_id = $1 AND commitment_hash = $2`,
      [userId, commitmentHash]
    );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get all commitments for a user
   */
  async getUserCommitments(userId: string): Promise<GenomeCommitment[]> {
    return queryActive<GenomeCommitment>(
      `SELECT * FROM genome_commitments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
  }

  /**
   * Retrieve and decrypt genomic data from IPFS
   */
  async retrieveGenomicData(
    userId: string,
    commitmentHash: string
  ): Promise<GenomicData | null> {
    try {
      // Get commitment from database
      const commitment = await this.getCommitment(userId, commitmentHash);
      if (!commitment) {
        throw new NotFoundError('Genome commitment');
      }

      // Retrieve from IPFS
      const encryptedData = await ipfsService.getFromIPFS(commitment.ipfsCid);

      // Decrypt if needed
      if (commitment.encryptedKey) {
        const decrypted = await encryptionIntegrationService.decryptGenomeCommitment(
          userId,
          commitmentHash
        );
        return decrypted as GenomicData;
      }

      return encryptedData as GenomicData;
    } catch (error) {
      logger.error('Failed to retrieve genomic data:', error);
      throw error;
    }
  }

  /**
   * Validate genomic data structure (FR-008, FR-030)
   */
  private validateGenomicData(data: GenomicData): void {
    // Check required fields
    if (!data.genome.BRCA1 || !data.genome.BRCA2 || !data.genome.CYP2D6) {
      throw new ValidationError('Missing required genetic markers');
    }

    // Validate BRCA1 risk score
    if (!validateBRCARiskScore(data.genome.BRCA1.riskScore)) {
      throw new ValidationError('Invalid BRCA1 risk score (must be 0.0-1.0)');
    }

    // Validate BRCA2 risk score
    if (!validateBRCARiskScore(data.genome.BRCA2.riskScore)) {
      throw new ValidationError('Invalid BRCA2 risk score (must be 0.0-1.0)');
    }

    // Validate CYP2D6 activity score
    if (!validateCYP2D6ActivityScore(data.genome.CYP2D6.activityScore)) {
      throw new ValidationError('Invalid CYP2D6 activity score (must be 0.0-3.0)');
    }

    // Validate confidence scores
    const markers = [data.genome.BRCA1, data.genome.BRCA2, data.genome.CYP2D6];
    for (const marker of markers) {
      if (!validateConfidenceScore(marker.confidence)) {
        throw new ValidationError('Invalid confidence score (must be 0.0-1.0)');
      }
    }

    // Validate metadata
    if (data.metadata.qualityScore !== undefined) {
      if (data.metadata.qualityScore < 0 || data.metadata.qualityScore > 100) {
        throw new ValidationError('Quality score must be between 0 and 100');
      }
    }
  }

  /**
   * Delete genomic data (soft delete)
   */
  async deleteGenomicData(
    userId: string,
    commitmentHash: string
  ): Promise<boolean> {
    try {
      // Soft delete from database
      const result = await query(
        `UPDATE genome_commitments
         SET deleted_at = NOW()
         WHERE user_id = $1 AND commitment_hash = $2 AND deleted_at IS NULL
         RETURNING id`,
        [userId, commitmentHash]
      );

      if (result.length === 0) {
        throw new NotFoundError('Genome commitment');
      }

      // Optionally unpin from IPFS (for GDPR compliance)
      const commitment = await this.getCommitment(userId, commitmentHash);
      if (commitment?.ipfsCid) {
        await ipfsService.unpin(commitment.ipfsCid);
      }

      logger.info(`Genomic data deleted for user ${userId}: ${commitmentHash}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete genomic data:', error);
      throw error;
    }
  }

  /**
   * Get genomic data statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    totalCommitments: number;
    latestUpload: Date | null;
    totalSize: number;
  }> {
    const result = await query<{
      total: string;
      latest: Date;
    }>(
      `SELECT
         COUNT(*) as total,
         MAX(created_at) as latest
       FROM genome_commitments
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    return {
      totalCommitments: parseInt(result[0]?.total || '0'),
      latestUpload: result[0]?.latest || null,
      totalSize: 0 // Would need to track in database or query IPFS
    };
  }
}

export const genomeService = new GenomeService();