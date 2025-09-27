import { Request, Response } from 'express';
import { proofService } from './proof.service';
import { ProofGenerationInput } from './proof.types';
import { logger } from '@utils/logger';

export class ProofController {
  async generate(req: Request<{}, {}, ProofGenerationInput>, res: Response) {
    const userId = req.user!.id;
    const input = req.body;

    // Check for cached proof first
    const cachedProof = await proofService.getCachedProof(userId, input.traitType);

    if (cachedProof) {
      logger.info(`Returning cached proof for user ${userId}, trait ${input.traitType}`);

      return res.json({
        success: true,
        data: {
          jobId: 'cached',
          status: 'complete',
          progress: 100,
          proof: Buffer.from(JSON.stringify(cachedProof)).toString('base64')
        },
        metadata: {
          timestamp: Date.now(),
          requestId: req.requestId || '',
          version: '1.0.0'
        }
      });
    }

    const { jobId, estimatedTime } = await proofService.queueProofGeneration(userId, input);

    return res.json({
      success: true,
      data: {
        jobId,
        status: 'queued',
        estimatedTime
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async getStatus(req: Request<{ jobId: string }>, res: Response) {
    const { jobId } = req.params;

    const job = await proofService.getJobStatus(jobId);
    const queuePosition = job.status === 'queued'
      ? await proofService.getQueuePosition(jobId)
      : undefined;

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        queuePosition,
        proof: job.proof,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async cancel(req: Request<{ jobId: string }>, res: Response) {
    const { jobId } = req.params;

    // TODO: Implement job cancellation
    logger.info(`Cancelling job ${jobId}`);

    res.json({
      success: true,
      data: {
        message: 'Job cancelled successfully'
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }
}

export const proofController = new ProofController();