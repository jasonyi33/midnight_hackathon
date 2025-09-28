import { v4 as uuidv4 } from 'uuid';
import { proofQueue, redis } from '../config/redis';
import { ProofGenerationInput, ProofJob } from './proof.types';
import { ProofResult } from '../types';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

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
    const position = jobs.findIndex((job: any) => job.id === jobId);
    return position === -1 ? 0 : position + 1;
  }
}

export const proofService = new ProofService();