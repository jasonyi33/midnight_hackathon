import { Router } from 'express';
import { proofController } from './proof.controller';
import { asyncHandler } from '@utils/asyncHandler';
import { validateBody, validateParams } from '@middleware/validation';
import { authenticate } from '@middleware/auth';
import { proofGenerationLimiter } from '@middleware/rateLimiter';
import { proofGenerationSchema, proofStatusSchema } from './proof.types';

const router = Router();

router.post(
  '/generate',
  authenticate,
  proofGenerationLimiter,
  validateBody(proofGenerationSchema.shape.body),
  asyncHandler(proofController.generate.bind(proofController))
);

router.get(
  '/status/:jobId',
  authenticate,
  validateParams(proofStatusSchema.shape.params),
  asyncHandler(proofController.getStatus.bind(proofController))
);

router.delete(
  '/cancel/:jobId',
  authenticate,
  validateParams(proofStatusSchema.shape.params),
  asyncHandler(proofController.cancel.bind(proofController))
);

export default router;