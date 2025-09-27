/**
 * Enhanced Proof Service with ProofSDK Integration
 * Task 3.3: Integrate ProofSDK with backend
 */

import { v4 as uuidv4 } from 'uuid';
import { proofQueue, redis } from '@config/redis';
import { ProofSDK as RealProofSDK } from '../../../contracts/src/proof-sdk/real-proof-sdk';
import { GeneticMarker, Proof } from './mock-proof-sdk'; // Keep types from mock for compatibility
import { ProofGenerationInput, ProofJob } from './proof.types';
import { ProofResult } from '../types';
import { NotFoundError, ValidationError } from '@utils/errors';
import { logger } from '@utils/logger';
import { genomeService } from '@genome/genome.service';
import { db } from '@config/database';

export class ProofIntegrationService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private sdk: RealProofSDK;

  constructor() {
    // Initialize RealProofSDK for production
    this.sdk = new RealProofSDK();
    this.setupSDKListeners();
  }

  /**
   * Setup ProofSDK event listeners
   */
  private setupSDKListeners() {
    // Listen for progress updates from SDK
    this.sdk.on('progress', async (data) => {
      await this.updateJobProgress(data.jobId, data.progress, data.stage);
    });

    // Listen for blockchain verification events
    this.sdk.on('VerificationComplete', async (event) => {
      await this.handleVerificationComplete(event);
    });
  }

  /**
   * Generate proof using ProofSDK (Task 3.3 implementation)
   */
  async generateProof(
    userId: string,
    traitType: string,
    genomeCommitmentHash: string,
    threshold?: number,
    jobId?: string
  ): Promise<ProofResult> {
    try {
      // Step 1: Retrieve genomic data from database
      const genomeData = await this.retrieveGenomeData(userId, genomeCommitmentHash);

      // Step 2: Validate trait data exists
      const marker = this.extractGeneticMarker(genomeData, traitType);

      if (!marker) {
        throw new ValidationError(`Trait ${traitType} not found in genome data`);
      }

      // Step 3: Generate proof based on trait type
      let proof: Proof;

      switch (traitType) {
        case 'BRCA1':
          proof = await this.sdk.generateBRCA1Proof(marker, jobId);
          break;

        case 'BRCA2':
          proof = await this.sdk.generateBRCA2Proof(marker, jobId);
          break;

        case 'CYP2D6':
          proof = await this.sdk.generateCYP2D6Proof(marker, jobId);
          break;

        default:
          throw new ValidationError(`Unsupported trait type: ${traitType}`);
      }

      // Step 4: Store proof on blockchain (mock or real)
      const txHash = await this.storeProofOnChain(proof, userId);

      // Step 5: Save proof to database
      const proofResult = await this.saveProofToDatabase(
        userId,
        proof,
        txHash,
        genomeCommitmentHash
      );

      // Step 6: Cache the proof
      await this.cacheProof(userId, traitType, proofResult);

      return proofResult;

    } catch (error) {
      logger.error(`Proof generation failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve genome data from database or IPFS
   */
  private async retrieveGenomeData(userId: string, commitmentHash: string): Promise<any> {
    // Check if using mock data
    if (process.env.USE_MOCK_IPFS === 'true') {
      return this.getMockGenomeData(userId);
    }

    // Query database for genome commitment
    const query = `
      SELECT gc.*, u.wallet_address
      FROM genome_commitments gc
      JOIN users u ON u.id = gc.patient_id
      WHERE u.id = $1 AND gc.commitment_hash = $2
    `;

    const result = await db.query(query, [userId, commitmentHash]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Genome commitment');
    }

    const commitment = result.rows[0];

    // For Phase 3, return mock data (in production, would fetch from IPFS)
    return this.getMockGenomeData(userId);
  }

  /**
   * Extract genetic marker from genome data
   */
  private extractGeneticMarker(genomeData: any, traitType: string): GeneticMarker | null {
    const traits = genomeData.traits || {};
    const markers = genomeData.markers || {};

    switch (traitType) {
      case 'BRCA1':
        return {
          type: 'BRCA1',
          value: markers.BRCA1_185delAG || traits.BRCA1?.mutation_present || false,
          metadata: {
            confidence: traits.BRCA1?.confidence || 0.95
          }
        };

      case 'BRCA2':
        return {
          type: 'BRCA2',
          value: markers.BRCA2_5266dupC || traits.BRCA2?.mutation_present || false,
          metadata: {
            confidence: traits.BRCA2?.confidence || 0.95
          }
        };

      case 'CYP2D6':
        return {
          type: 'CYP2D6',
          value: markers.CYP2D6?.activityScore || 1.5,
          metadata: {
            metabolizer: markers.CYP2D6?.metabolizer || 'normal',
            activityScore: markers.CYP2D6?.activityScore || 1.5
          }
        };

      default:
        return null;
    }
  }

  /**
   * Store proof on blockchain
   */
  private async storeProofOnChain(proof: Proof, userId: string): Promise<string> {
    // Get patient wallet address
    const userQuery = await db.query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const walletAddress = userQuery.rows[0].wallet_address;

    // Store on chain (mock or real)
    const txHash = await this.sdk.storeProofOnChain(proof, walletAddress);

    logger.info(`Proof stored on chain: ${txHash} for user ${userId}`);

    return txHash;
  }

  /**
   * Save proof to database
   */
  private async saveProofToDatabase(
    userId: string,
    proof: Proof,
    txHash: string,
    commitmentHash: string
  ): Promise<ProofResult> {
    const id = uuidv4();

    const query = `
      INSERT INTO proofs (
        id,
        patient_id,
        trait_type,
        proof_hash,
        verification_key,
        public_inputs,
        tx_hash,
        commitment_hash,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const values = [
      id,
      userId,
      proof.traitType,
      proof.proofHash,
      proof.verificationKey,
      JSON.stringify(proof.publicInputs),
      txHash,
      commitmentHash,
      proof.status
    ];

    const result = await db.query(query, values);

    return {
      id,
      proofHash: proof.proofHash,
      publicSignals: proof.publicInputs,
      proof: JSON.stringify(proof),
      verificationKey: proof.verificationKey,
      createdAt: new Date()
    };
  }

  /**
   * Handle blockchain verification complete event
   */
  private async handleVerificationComplete(event: any) {
    logger.info('Verification completed on blockchain:', event);

    // Update verification count
    await db.query(
      `UPDATE users SET verification_count = verification_count + 1
       WHERE wallet_address = $1`,
      [event.patientAddress]
    );

    // Add to audit log
    await db.query(
      `INSERT INTO audit_log (user_id, action, details, created_at)
       VALUES (
         (SELECT id FROM users WHERE wallet_address = $1),
         'VERIFICATION_COMPLETE',
         $2,
         NOW()
       )`,
      [event.patientAddress, JSON.stringify(event)]
    );
  }

  /**
   * Update job progress in Redis
   */
  private async updateJobProgress(jobId: string, progress: number, stage?: string) {
    try {
      const jobData = await redis.get(`job:${jobId}`);

      if (!jobData) {
        return; // Job not found, skip update
      }

      const job = JSON.parse(jobData);
      job.progress = progress;
      job.status = progress === 100 ? 'completed' : 'processing';
      job.stage = stage;

      await redis.setex(
        `job:${jobId}`,
        this.CACHE_TTL,
        JSON.stringify(job)
      );

      // Emit WebSocket update (will be implemented in Task 3.5)
      // socketService.emitProofProgress(job.userId, progress);

    } catch (error) {
      logger.error(`Failed to update job progress for ${jobId}:`, error);
    }
  }

  /**
   * Cache proof in Redis
   */
  private async cacheProof(userId: string, traitType: string, proof: ProofResult) {
    const cacheKey = `proof:${userId}:${traitType}`;
    await redis.setex(
      cacheKey,
      this.CACHE_TTL,
      JSON.stringify(proof)
    );

    logger.debug(`Cached proof for user ${userId}, trait ${traitType}`);
  }

  /**
   * Get mock genome data for testing
   */
  private getMockGenomeData(userId: string): any {
    // Demo data for Phase 3 testing
    const mockData: Record<string, any> = {
      'sarah': {
        patientId: userId,
        markers: {
          BRCA1_185delAG: false,
          BRCA2_5266dupC: false,
          CYP2D6: {
            activityScore: 1.5,
            metabolizer: 'normal'
          }
        },
        traits: {
          BRCA1: { mutation_present: false, confidence: 0.98 },
          BRCA2: { mutation_present: false, confidence: 0.99 }
        }
      },
      'mike': {
        patientId: userId,
        markers: {
          BRCA1_185delAG: false,
          BRCA2_5266dupC: false,
          CYP2D6: {
            activityScore: 0.5,
            metabolizer: 'poor'
          }
        },
        traits: {
          BRCA1: { mutation_present: false, confidence: 0.97 },
          BRCA2: { mutation_present: false, confidence: 0.98 }
        }
      },
      'default': {
        patientId: userId,
        markers: {
          BRCA1_185delAG: true,
          BRCA2_5266dupC: false,
          CYP2D6: {
            activityScore: 2.0,
            metabolizer: 'rapid'
          }
        },
        traits: {
          BRCA1: { mutation_present: true, confidence: 0.96 },
          BRCA2: { mutation_present: false, confidence: 0.97 }
        }
      }
    };

    // Return specific mock data based on userId or default
    const userKey = userId.toLowerCase().includes('sarah') ? 'sarah' :
                    userId.toLowerCase().includes('mike') ? 'mike' : 'default';

    return mockData[userKey];
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.sdk) {
      this.sdk.destroy();
    }
  }
}

// Export singleton instance
export const proofIntegrationService = new ProofIntegrationService();