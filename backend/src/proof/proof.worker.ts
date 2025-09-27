import Bull from 'bull';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { proofService } from './proof.service';
import { socketService } from '../websocket/socket.service';
import { ProofJobData, ProofJobResult } from './proof.types';
import { getProofSDK, ProofSDKInterface } from './proofSDK.mock';
import { redis } from '@config/redis';
import { genomicEncryptionService } from '@/services/genomicEncryption.service';

/**
 * Proof Generation Worker (Task 2.6)
 * Processes proof generation jobs from the Bull queue
 * Integrates with ProofSDK from Dev 4 (or mock)
 */

// Create proof queue with concurrency limit
const proofQueue = new Bull<ProofJobData, ProofJobResult>('proof-generation', {
  redis: {
    host: new URL(config.REDIS_URL).hostname,
    port: parseInt(new URL(config.REDIS_URL).port),
    password: config.REDIS_PASSWORD
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

let proofSDK: ProofSDKInterface;

// Process proof generation jobs with max 3 concurrent
proofQueue.process(3, async (job: Bull.Job<ProofJobData>) => {
  const { userId, traitType, threshold, genomeCommitmentHash } = job.data;

  logger.info(`Processing proof generation job ${job.id} for user ${userId}`);

  // Initialize ProofSDK if not already done
  if (!proofSDK) {
    proofSDK = await getProofSDK();
  }

  // Set up progress reporting interval (500ms)
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    socketService.emitProofProgress(userId, currentProgress);
  }, 500);

  try {
    // Check cache first
    const cacheKey = `proof:${userId}:${traitType}:${threshold || 'none'}`;
    const cachedProof = await redis.get(cacheKey);
    if (cachedProof) {
      logger.info(`Using cached proof for job ${job.id}`);
      clearInterval(progressInterval);
      await job.progress(100);
      socketService.emitProofProgress(userId, 100);
      return JSON.parse(cachedProof);
    }

    // Step 1: Retrieve and decrypt genomic data (10-20%)
    currentProgress = 10;
    await job.progress(currentProgress);

    // TODO: Retrieve actual genomic data from database
    // For now, using mock data
    const genomicData = {
      status: 'wild_type' as const,
      variants: [],
      riskScore: 0.2,
      confidence: 0.95
    };

    currentProgress = 20;
    await job.progress(currentProgress);

    // Step 2: Validate trait data with medical constants (20-30%)
    const { validateBRCARiskScore, validateCYP2D6ActivityScore } = await import('@utils/medicalConstants');

    if (traitType === 'BRCA1' || traitType === 'BRCA2') {
      if (!validateBRCARiskScore(genomicData.riskScore)) {
        throw new Error(`Invalid risk score for ${traitType}`);
      }
    }

    currentProgress = 30;
    await job.progress(currentProgress);

    // Step 3: Generate proof using SDK (30-80%)
    let proof;
    const startTime = Date.now();

    // Update progress during proof generation
    const proofProgressInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const estimatedTotal = traitType === 'CYP2D6' ? 15000 : 10000;
      const proofProgress = Math.min(80, 30 + (elapsed / estimatedTotal) * 50);
      currentProgress = Math.floor(proofProgress);
      await job.progress(currentProgress);
    }, 500);

    try {
      switch (traitType) {
        case 'BRCA1':
          proof = await proofSDK.generateBRCA1Proof(genomicData, threshold);
          break;
        case 'BRCA2':
          proof = await proofSDK.generateBRCA2Proof(genomicData, threshold);
          break;
        case 'CYP2D6':
          const cyp2d6Data = {
            ...genomicData,
            phenotype: 'normal_metabolizer' as const,
            diplotype: '*1/*1',
            activityScore: 2.0
          };
          proof = await proofSDK.generateCYP2D6Proof(cyp2d6Data);
          break;
        default:
          throw new Error(`Unsupported trait type: ${traitType}`);
      }
    } finally {
      clearInterval(proofProgressInterval);
    }

    currentProgress = 80;
    await job.progress(currentProgress);

    // Step 4: Verify proof locally (80-90%)
    if (proofSDK.verifyProof) {
      const isValid = await proofSDK.verifyProof(proof);
      if (!isValid) {
        throw new Error('Proof verification failed');
      }
    }

    currentProgress = 90;
    await job.progress(currentProgress);

    // Step 5: Cache the proof (90-100%)
    const result: ProofJobResult = {
      proofId: `proof_${job.id}`,
      proofHash: proof.proofHash,
      proof: proof.proof,
      publicInputs: proof.publicInputs,
      verificationKey: proof.verificationKey,
      status: 'completed',
      timestamp: Date.now(),
      metadata: proof.metadata
    };

    // Cache with 1-hour TTL
    await redis.setex(cacheKey, 3600, JSON.stringify(result));

    currentProgress = 100;
    await job.progress(currentProgress);
    clearInterval(progressInterval);

    logger.info(`Proof generation completed for job ${job.id}`);

    return result;
  } catch (error) {
    clearInterval(progressInterval);
    logger.error(`Proof generation failed for job ${job.id}:`, error);

    // Emit failure to client
    socketService.emitProofError(userId, {
      message: 'Proof generation failed',
      code: 'PROOF_GENERATION_FAILED',
      details: error.message
    });

    throw error;
  }
});

// Job event handlers
proofQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed successfully`, result);
});

proofQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed:`, error.message);
});

proofQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled and will be retried`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing proof worker gracefully');
  await proofQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing proof worker gracefully');
  await proofQueue.close();
  process.exit(0);
});

// Health monitoring
setInterval(async () => {
  const jobCounts = await proofQueue.getJobCounts();
  const workers = await proofQueue.getWorkers();
  logger.debug('Proof queue stats:', {
    ...jobCounts,
    activeWorkers: workers.length,
    maxConcurrency: 3
  });
}, 30000); // Log every 30 seconds

logger.info('Proof generation worker started successfully with max 3 concurrent jobs');