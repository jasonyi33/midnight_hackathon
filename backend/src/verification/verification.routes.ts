import { Router } from 'express';
import { verificationController } from './verification.controller';
import { asyncHandler } from '@utils/asyncHandler';
import { validateBody, validateParams } from '@middleware/validation';
import { authenticate, authorize } from '@middleware/auth';
import { verificationRequestSchema, verificationResponseSchema } from './verification.types';

const router = Router();

router.post(
  '/request',
  authenticate,
  authorize('doctor'),
  validateBody(verificationRequestSchema.shape.body),
  asyncHandler(verificationController.request.bind(verificationController))
);

router.get(
  '/list',
  authenticate,
  asyncHandler(verificationController.list.bind(verificationController))
);

router.post(
  '/respond/:requestId',
  authenticate,
  authorize('patient'),
  validateParams(verificationResponseSchema.shape.params),
  validateBody(verificationResponseSchema.shape.body),
  asyncHandler(verificationController.respond.bind(verificationController))
);

router.get(
  '/history/:doctorId',
  authenticate,
  authorize('doctor'),
  asyncHandler(verificationController.history.bind(verificationController))
);

export default router;