import Bull from 'bull';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { proofIntegrationService } from './proof-integration.service';
import { socketService } from '@websocket/socket.service';
import { ProofJobData, ProofJobResult } from './proof.types';

/**
 * Proof Generation Worker (Task 2.6)
 * Processes proof generation jobs from the Bull queue
 */

// Create proof queue connection
const proofQueue = new Bull<ProofJobData>('proof-generation', {
  redis: {
    host: new URL(config.REDIS_URL).hostname,
    port: parseInt(new URL(config.REDIS_URL).port),
    password: config.REDIS_PASSWORD
  }
});

// Process proof generation jobs
proofQueue.process(async (job: Bull.Job<ProofJobData>) => {
  const { userId, traitType, threshold, genomeCommitmentHash } = job.data;

  logger.info(`Processing proof generation job ${job.id} for user ${userId}`);

  try {
    // Report initial progress
    await job.progress(10);
    socketService.emitProofProgress(userId, job.id.toString(), 10);

    // Step 1: Retrieve genomic data (20%)
    await job.progress(20);
    socketService.emitProofProgress(userId, job.id.toString(), 20);

    // Step 2: Validate trait data (30%)
    await job.progress(30);
    socketService.emitProofProgress(userId, job.id.toString(), 30);

    // Step 3: Generate ZK circuit (50%)
    await job.progress(50);
    socketService.emitProofProgress(userId, job.id.toString(), 50);

    // Step 4: Create proof (70%)
    await job.progress(70);
    socketService.emitProofProgress(userId, job.id.toString(), 70);

    // Step 5: Generate proof using integration service
    const proof = await proofIntegrationService.generateProof(
      userId,
      traitType,
      genomeCommitmentHash,
      threshold
    );

    // Step 6: Verify proof locally (90%)
    await job.progress(90);
    socketService.emitProofProgress(userId, job.id.toString(), 90);

    // Complete
    await job.progress(100);
    socketService.emitProofProgress(userId, job.id.toString(), 100);

    logger.info(`Proof generation completed for job ${job.id}`);

    return {
      proofId: proof.id,
      proofHash: proof.proofHash,
      status: 'completed',
      timestamp: Date.now()
    };
  } catch (error) {
    logger.error(`Proof generation failed for job ${job.id}:`, error);

    // Emit failure to client
    socketService.emitProofError(userId, {
      message: 'Proof generation failed',
      code: 'PROOF_GENERATION_FAILED'
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
  logger.debug('Proof queue stats:', jobCounts);
}, 30000); // Log every 30 seconds

logger.info('Proof generation worker started successfully');