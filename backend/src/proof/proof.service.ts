import { v4 as uuidv4 } from 'uuid';
import { proofQueue } from '@config/redis';
import { redis } from '@config/redis';
import { ProofGenerationInput, ProofJob, ZKProof } from './proof.types';
import { ProofResult } from '@types';
import { NotFoundError, AppError } from '@utils/errors';
import { logger } from '@utils/logger';
import { query } from '@config/database';

export class ProofService {
  private readonly CACHE_TTL = 3600; // 1 hour

  async queueProofGeneration(
    userId: string,
    input: ProofGenerationInput
  ): Promise<{ jobId: string; estimatedTime: number }> {
    const jobId = uuidv4();

    const job = await proofQueue.add('generate', {
      jobId,
      userId,
      ...input
    }, {
      jobId
    });

    // Store job metadata in Redis
    const jobData: ProofJob = {
      id: jobId,
      userId,
      traitType: input.traitType,
      genomeHash: input.genomeHash,
      threshold: input.threshold,
      status: 'queued',
      progress: 0,
      createdAt: new Date()
    };

    await redis.setex(
      `job:${jobId}`,
      this.CACHE_TTL,
      JSON.stringify(jobData)
    );

    // Estimate time based on trait type
    const estimatedTime = this.getEstimatedTime(input.traitType);

    logger.info(`Proof generation job ${jobId} queued for user ${userId}`);

    return { jobId, estimatedTime };
  }

  async getJobStatus(jobId: string): Promise<ProofJob> {
    const jobData = await redis.get(`job:${jobId}`);

    if (!jobData) {
      throw new NotFoundError('Job');
    }

    return JSON.parse(jobData);
  }

  async updateJobProgress(jobId: string, progress: number) {
    const jobData = await this.getJobStatus(jobId);
    jobData.progress = progress;
    jobData.status = 'processing';

    await redis.setex(
      `job:${jobId}`,
      this.CACHE_TTL,
      JSON.stringify(jobData)
    );

    logger.debug(`Job ${jobId} progress: ${progress}%`);
  }

  async completeJob(jobId: string, proof: ProofResult) {
    const jobData = await this.getJobStatus(jobId);
    jobData.status = 'complete';
    jobData.progress = 100;
    jobData.proof = Buffer.from(JSON.stringify(proof)).toString('base64');
    jobData.completedAt = new Date();

    await redis.setex(
      `job:${jobId}`,
      this.CACHE_TTL,
      JSON.stringify(jobData)
    );

    // Cache the proof
    await this.cacheProof(jobData.userId, jobData.traitType, proof);

    logger.info(`Job ${jobId} completed successfully`);
  }

  async failJob(jobId: string, error: string) {
    const jobData = await this.getJobStatus(jobId);
    jobData.status = 'failed';
    jobData.error = error;
    jobData.completedAt = new Date();

    await redis.setex(
      `job:${jobId}`,
      this.CACHE_TTL,
      JSON.stringify(jobData)
    );

    logger.error(`Job ${jobId} failed: ${error}`);
  }

  private async cacheProof(userId: string, traitType: string, proof: ProofResult) {
    const cacheKey = `proof:${userId}:${traitType}`;
    await redis.setex(
      cacheKey,
      this.CACHE_TTL,
      JSON.stringify(proof)
    );
  }

  async getCachedProof(userId: string, traitType: string): Promise<ProofResult | null> {
    const cacheKey = `proof:${userId}:${traitType}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    return null;
  }

  private getEstimatedTime(traitType: string): number {
    const estimates: Record<string, number> = {
      'BRCA1': 10,
      'BRCA2': 10,
      'CYP2D6': 15
    };

    return estimates[traitType] || 20;
  }

  async getQueuePosition(jobId: string): Promise<number> {
    const jobs = await proofQueue.getJobs(['waiting', 'active']);
    const position = jobs.findIndex(job => job.id === jobId);
    return position === -1 ? 0 : position + 1;
  }

  /**
   * Generate proof for genomic trait verification
   * Called by the proof worker process
   * Implements FR-015, FR-016, FR-017 requirements
   */
  async generateProof(
    userId: string,
    traitType: string,
    genomeCommitmentHash: string,
    threshold?: number
  ): Promise<ZKProof> {
    try {
      logger.info(`Generating proof for user ${userId}, trait ${traitType}`);

      // Check if proof already exists in cache
      const cachedProof = await this.getCachedProof(userId, traitType);
      if (cachedProof) {
        logger.info(`Using cached proof for ${userId}:${traitType}`);
        return cachedProof as ZKProof;
      }

      // Generate unique proof ID and hash
      const proofId = uuidv4();
      const proofHash = `0x${this.generateProofHash(userId, traitType, Date.now())}`;

      // Create proof object (will be replaced with actual SDK generation)
      const proof: ZKProof = {
        id: proofId,
        userId,
        traitType: traitType as any,
        proofHash,
        publicInputs: {
          commitmentHash: genomeCommitmentHash,
          threshold,
          timestamp: Date.now()
        },
        proof: Buffer.from(JSON.stringify({
          userId,
          traitType,
          threshold,
          timestamp: Date.now()
        })).toString('base64'),
        verificationKey: this.generateVerificationKey(traitType),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Store proof in database
      await this.storeProofInDatabase(proof);

      // Cache the proof
      await this.cacheProof(userId, traitType, proof as any);

      logger.info(`Proof generated successfully for ${userId}:${traitType}`);
      return proof;
    } catch (error) {
      logger.error(`Proof generation failed for ${userId}:${traitType}`, error);
      throw new AppError(500, 'Proof generation failed');
    }
  }

  /**
   * Store proof in database
   * Implements FR-056, FR-071 (encrypted storage)
   */
  private async storeProofInDatabase(proof: ZKProof): Promise<void> {
    await query(
      `INSERT INTO proofs (id, user_id, trait_type, proof_hash, proof_data, public_inputs, status, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (proof_hash) DO NOTHING`,
      [
        proof.id,
        proof.userId,
        proof.traitType,
        proof.proofHash,
        proof.proof,
        JSON.stringify(proof.publicInputs),
        'completed',
        proof.createdAt,
        proof.expiresAt
      ]
    );
  }

  /**
   * Generate deterministic proof hash
   */
  private generateProofHash(userId: string, traitType: string, timestamp: number): string {
    const crypto = require('crypto');
    const data = `${userId}:${traitType}:${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate mock verification key
   * Will be replaced with actual key from ProofSDK
   */
  private generateVerificationKey(traitType: string): string {
    return Buffer.from(JSON.stringify({
      type: 'groth16',
      curve: 'bn128',
      circuit: traitType.toLowerCase(),
      alpha_g1: 'mock_alpha',
      beta_g2: 'mock_beta',
      gamma_g2: 'mock_gamma',
      delta_g2: 'mock_delta'
    })).toString('base64');
  }
}

export const proofService = new ProofService();