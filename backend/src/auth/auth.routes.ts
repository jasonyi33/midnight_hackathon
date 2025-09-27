import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '@utils/asyncHandler';
import { validateBody } from '@middleware/validation';
import { authenticate } from '@middleware/auth';
import { authLimiter } from '@middleware/rateLimiter';
import { connectWalletSchema, refreshTokenSchema } from './auth.types';

const router = Router();

router.post(
  '/connect',
  authLimiter,
  validateBody(connectWalletSchema.shape.body),
  asyncHandler(authController.connect.bind(authController))
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema.shape.body),
  asyncHandler(authController.refresh.bind(authController))
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.me.bind(authController))
);

router.post(
  '/disconnect',
  authenticate,
  asyncHandler(authController.disconnect.bind(authController))
);

export default router;