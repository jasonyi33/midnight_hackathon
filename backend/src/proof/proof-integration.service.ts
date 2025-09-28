/**
 * Real Midnight ZK Proof Integration Service
 * Uses compiled Compact contracts and Midnight native capabilities
 */

import { v4 as uuidv4 } from 'uuid';
import { proofQueue, redis } from '@config/redis';
import { midnightZKProofService, GenomicData, ZKProof } from '../services/MidnightZKProofService';
import { midnightBlockchainService } from '../services/MidnightBlockchainService';
import { logger } from '../utils/logger';

export interface ProofGenerationRequest {
  userId: string;
  traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  genomicData: GenomicData;
  patientAddress: string;
  threshold?: number;
}

export interface ProofGenerationResult {
  id: string;
  proofHash: string;
  proof: ZKProof;
  status: 'completed' | 'failed';
  timestamp: number;
  txHash?: string;
}

/**
 * Midnight-native proof integration service
 * Handles ZK proof generation using real Compact circuits
 */
class MidnightProofIntegrationService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing Midnight proof integration service...');
      
      // Initialize blockchain connection
      await midnightBlockchainService.initialize();
      
      this.isInitialized = true;
      logger.info('✅ Midnight proof integration service initialized');
    } catch (error) {
      logger.error('Failed to initialize proof integration service:', error);
      throw error;
    }
  }

  /**
   * Generate ZK proof using real Midnight circuits
   */
  async generateProof(
    userId: string,
    traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6',
    genomeCommitmentHash: string,
    threshold?: number
  ): Promise<ProofGenerationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const proofId = uuidv4();
    
    try {
      logger.info(`Generating ${traitType} proof for user ${userId}...`);

      // 1. Retrieve cached genomic data (simulation - normally from IPFS)
      const genomicData = await this.retrieveGenomicData(userId, genomeCommitmentHash);
      
      // 2. Estimate costs before proceeding
      const costEstimate = await midnightBlockchainService.estimateProofCost(traitType);
      logger.info(`Estimated cost: ${costEstimate.cost} ${costEstimate.currency}`);

      // 3. Generate ZK proof using appropriate circuit
      let proof: ZKProof;
      
      switch (traitType) {
        case 'BRCA1':
          proof = await midnightZKProofService.generateBRCA1Proof(
            genomicData,
            userId // using userId as patient address for now
          );
          break;
        case 'BRCA2':
          proof = await midnightZKProofService.generateBRCA2Proof(
            genomicData,
            userId
          );
          break;
        case 'CYP2D6':
          proof = await midnightZKProofService.generateCYP2D6Proof(
            genomicData,
            userId
          );
          break;
        default:
          throw new Error(`Unsupported trait type: ${traitType}`);
      }

      // 4. Submit proof to Midnight blockchain
      const submission = await midnightBlockchainService.submitProofToChain(
        proof,
        traitType,
        userId
      );

      // 5. Create result
      const result: ProofGenerationResult = {
        id: proofId,
        proofHash: this.generateProofHash(proof),
        proof,
        status: submission.verified ? 'completed' : 'failed',
        timestamp: Date.now(),
        txHash: submission.txHash,
      };

      // 6. Cache the result
      await this.cacheProofResult(userId, traitType, result);

      const duration = Date.now() - startTime;
      logger.info(`✅ ${traitType} proof generated successfully in ${duration}ms`, {
        proofId,
        txHash: submission.txHash,
        verified: submission.verified,
      });

      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ ${traitType} proof generation failed after ${duration}ms:`, error);
      
      throw new Error(`Proof generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify proof on Midnight blockchain
   */
  async verifyProof(proof: ZKProof): Promise<boolean> {
    try {
      logger.info(`Verifying proof ${proof.id} on Midnight blockchain...`);
      
      const isValid = await midnightZKProofService.verifyProofOnChain(proof);
      
      logger.info(`Proof ${proof.id} verification: ${isValid ? 'VALID' : 'INVALID'}`);
      return isValid;
      
    } catch (error) {
      logger.error(`Proof verification failed for ${proof.id}:`, error);
      return false;
    }
  }

  /**
   * Get proof generation status
   */
  async getProofStatus(userId: string, proofId: string): Promise<any> {
    try {
      const cacheKey = `proof_status:${userId}:${proofId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      logger.error(`Failed to get proof status for ${proofId}:`, error);
      return null;
    }
  }

  /**
   * List all proofs for a user
   */
  async getUserProofs(userId: string): Promise<ZKProof[]> {
    try {
      const pattern = `proof_result:${userId}:*`;
      const keys = await redis.keys(pattern);
      
      const proofs: ZKProof[] = [];
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const result: ProofGenerationResult = JSON.parse(data);
          proofs.push(result.proof);
        }
      }
      
      return proofs.sort((a, b) => 
        new Date(b.metadata.generatedAt).getTime() - new Date(a.metadata.generatedAt).getTime()
      );
      
    } catch (error) {
      logger.error(`Failed to get user proofs for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(): Promise<any> {
    try {
      const contractState = await midnightBlockchainService.getContractState();
      const walletBalance = await midnightBlockchainService.getWalletBalance();
      
      return {
        contractState,
        walletBalance,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to get blockchain stats:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private async retrieveGenomicData(userId: string, genomeCommitmentHash: string): Promise<GenomicData> {
    // In real implementation, this would:
    // 1. Decrypt the IPFS data using user's key
    // 2. Validate the commitment hash
    // 3. Return the genomic data
    
    // For now, return mock data based on trait patterns
    return {
      patientId: userId,
      markers: {
        'rs334': true,     // BRCA1 related
        'rs144848': false, // BRCA2 related  
        'rs1065852': true, // CYP2D6 related
      },
      traits: {
        BRCA1: {
          mutation_present: false,
          confidence_score: 0.95,
        },
        BRCA2: {
          mutation_present: false,
          confidence_score: 0.92,
        },
        CYP2D6: {
          metabolizer_status: 'normal',
          activity_score: 2.0,
        },
      },
    };
  }

  private generateProofHash(proof: ZKProof): string {
    const crypto = require('crypto');
    const data = `${proof.id}:${proof.traitType}:${proof.proof}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async cacheProofResult(
    userId: string,
    traitType: string,
    result: ProofGenerationResult
  ): Promise<void> {
    const cacheKey = `proof_result:${userId}:${traitType}`;
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    logger.info('Shutting down Midnight proof integration service...');
    // Cleanup any open connections or resources
  }
}

export const proofIntegrationService = new MidnightProofIntegrationService();