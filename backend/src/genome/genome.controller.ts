import { Request, Response } from 'express';
import { genomeService } from './genome.service';
import { GenomeUploadInput } from './genome.types';
import { logger } from '@utils/logger';
import { MEDICAL_DESCRIPTIONS } from '@utils/medicalConstants';

export class GenomeController {
  /**
   * Upload genomic data (FR-007)
   */
  async upload(req: Request<{}, {}, GenomeUploadInput>, res: Response) {
    const userId = req.user!.id;
    const { genomicData, encrypt } = req.body;

    const result = await genomeService.uploadGenomicData(
      userId,
      genomicData,
      encrypt
    );

    logger.info(`Genomic data uploaded by user ${userId}`);

    res.json({
      success: true,
      data: {
        commitmentHash: result.commitmentHash,
        ipfsCid: result.ipfsCid,
        encrypted: encrypt,
        timestamp: Date.now()
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  /**
   * Get user's genome commitments
   */
  async list(req: Request, res: Response) {
    const userId = req.user!.id;

    const commitments = await genomeService.getUserCommitments(userId);

    res.json({
      success: true,
      data: {
        commitments: commitments.map(c => ({
          commitmentHash: c.commitmentHash,
          ipfsCid: c.ipfsCid,
          createdAt: c.createdAt,
          hasEncryption: !!c.encryptedKey
        })),
        total: commitments.length
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  /**
   * Retrieve genomic data by commitment hash
   */
  async retrieve(req: Request<{ commitmentHash: string }>, res: Response) {
    const userId = req.user!.id;
    const { commitmentHash } = req.params;

    const genomicData = await genomeService.retrieveGenomicData(
      userId,
      commitmentHash
    );

    if (!genomicData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Genomic data not found',
          statusCode: 404
        }
      });
    }

    res.json({
      success: true,
      data: {
        genomicData,
        commitmentHash,
        retrievedAt: Date.now()
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  /**
   * Delete genomic data (soft delete)
   */
  async delete(req: Request<{ commitmentHash: string }>, res: Response) {
    const userId = req.user!.id;
    const { commitmentHash } = req.params;

    const success = await genomeService.deleteGenomicData(
      userId,
      commitmentHash
    );

    res.json({
      success,
      data: {
        message: 'Genomic data deleted successfully',
        commitmentHash
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  /**
   * Get available traits for verification (FR-025)
   */
  async getAvailableTraits(req: Request, res: Response) {
    const traits = [
      {
        type: 'BRCA1',
        name: MEDICAL_DESCRIPTIONS.BRCA1.name,
        description: MEDICAL_DESCRIPTIONS.BRCA1.patientFriendly,
        verificationTypes: ['boolean', 'range']
      },
      {
        type: 'BRCA2',
        name: MEDICAL_DESCRIPTIONS.BRCA2.name,
        description: MEDICAL_DESCRIPTIONS.BRCA2.patientFriendly,
        verificationTypes: ['boolean', 'range']
      },
      {
        type: 'CYP2D6',
        name: MEDICAL_DESCRIPTIONS.CYP2D6.name,
        description: MEDICAL_DESCRIPTIONS.CYP2D6.patientFriendly,
        verificationTypes: ['category', 'range']
      }
    ];

    res.json({
      success: true,
      data: { traits },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  /**
   * Get user statistics
   */
  async getStats(req: Request, res: Response) {
    const userId = req.user!.id;

    const stats = await genomeService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }
}

export const genomeController = new GenomeController();