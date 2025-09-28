import { Router } from 'express';
import { authenticateToken } from '../utils/jwt';
import { validate } from '@middleware/validation';
import { genomeController } from './genome.controller';
import { genomeUploadSchema, genomeRetrieveSchema } from './genome.types';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/genome/upload
 * Upload genomic data (FR-007)
 */
router.post(
  '/upload',
  validate(genomeUploadSchema),
  asyncHandler(genomeController.upload)
);

/**
 * GET /api/genome/list
 * Get user's genome commitments
 */
router.get(
  '/list',
  asyncHandler(genomeController.list)
);

/**
 * GET /api/genome/retrieve/:commitmentHash
 * Retrieve genomic data by commitment hash
 */
router.get(
  '/retrieve/:commitmentHash',
  validate(genomeRetrieveSchema),
  asyncHandler(genomeController.retrieve)
);

/**
 * DELETE /api/genome/:commitmentHash
 * Delete genomic data (soft delete)
 */
router.delete(
  '/:commitmentHash',
  validate(genomeRetrieveSchema),
  asyncHandler(genomeController.delete)
);

/**
 * GET /api/genome/traits
 * Get available traits for verification (FR-025)
 */
router.get(
  '/traits',
  asyncHandler(genomeController.getAvailableTraits)
);

/**
 * GET /api/genome/stats
 * Get user statistics
 */
router.get(
  '/stats',
  asyncHandler(genomeController.getStats)
);

export default router;