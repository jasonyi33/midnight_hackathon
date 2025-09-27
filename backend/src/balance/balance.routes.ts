import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { balanceController } from './balance.controller';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/balance
 * Get tDUST balance for authenticated user
 */
router.get(
  '/',
  asyncHandler(balanceController.getBalance)
);

/**
 * POST /api/balance/check-minimum
 * Check if user has minimum balance for operation
 */
router.post(
  '/check-minimum',
  asyncHandler(balanceController.checkMinimumBalance)
);

/**
 * GET /api/balance/fees
 * Get estimated transaction fees
 */
router.get(
  '/fees',
  asyncHandler(balanceController.getEstimatedFees)
);

/**
 * POST /api/balance/stats
 * Get balance statistics (admin only)
 */
router.post(
  '/stats',
  asyncHandler(balanceController.getBalanceStats)
);

export default router;