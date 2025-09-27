import { Request, Response } from 'express';
import { dustBalanceService } from '@/services/dustBalance.service';
import { logger } from '@utils/logger';

export class BalanceController {
  /**
   * Get tDUST balance for the authenticated user
   */
  async getBalance(req: Request, res: Response) {
    try {
      const walletAddress = req.user!.walletAddress;
      const balance = await dustBalanceService.getBalance(walletAddress);

      res.json({
        success: true,
        data: {
          balance: balance.balance,
          formattedBalance: balance.formattedBalance,
          decimals: balance.decimals,
          lastUpdated: balance.lastUpdated
        },
        metadata: {
          timestamp: Date.now(),
          requestId: req.requestId || '',
          version: '1.0.0'
        }
      });
    } catch (error) {
      logger.error('Failed to get balance:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BALANCE_FETCH_FAILED',
          message: 'Failed to retrieve tDUST balance',
          statusCode: 500
        }
      });
    }
  }

  /**
   * Check if user has minimum balance for an operation
   */
  async checkMinimumBalance(req: Request, res: Response) {
    const { operationType, minimumRequired } = req.body;
    const walletAddress = req.user!.walletAddress;

    try {
      const hasBalance = await dustBalanceService.hasMinimumBalance(
        walletAddress,
        minimumRequired || dustBalanceService.estimateTransactionFee(operationType)
      );

      res.json({
        success: true,
        data: {
          hasMinimumBalance: hasBalance,
          requiredBalance: minimumRequired || dustBalanceService.estimateTransactionFee(operationType),
          operationType
        },
        metadata: {
          timestamp: Date.now(),
          requestId: req.requestId || '',
          version: '1.0.0'
        }
      });
    } catch (error) {
      logger.error('Failed to check minimum balance:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BALANCE_CHECK_FAILED',
          message: 'Failed to check minimum balance',
          statusCode: 500
        }
      });
    }
  }

  /**
   * Get estimated transaction fees
   */
  async getEstimatedFees(req: Request, res: Response) {
    const fees = {
      upload: dustBalanceService.estimateTransactionFee('upload'),
      proof: dustBalanceService.estimateTransactionFee('proof'),
      verify: dustBalanceService.estimateTransactionFee('verify')
    };

    res.json({
      success: true,
      data: {
        fees,
        formatted: {
          upload: dustBalanceService.formatBalance(fees.upload),
          proof: dustBalanceService.formatBalance(fees.proof),
          verify: dustBalanceService.formatBalance(fees.verify)
        }
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  /**
   * Get balance statistics for multiple addresses (admin only)
   */
  async getBalanceStats(req: Request, res: Response) {
    const { addresses } = req.body;

    try {
      const stats = await dustBalanceService.getBalanceStats(addresses);

      res.json({
        success: true,
        data: {
          stats,
          formatted: {
            totalBalance: dustBalanceService.formatBalance(stats.totalBalance),
            averageBalance: dustBalanceService.formatBalance(stats.averageBalance),
            minBalance: dustBalanceService.formatBalance(stats.minBalance),
            maxBalance: dustBalanceService.formatBalance(stats.maxBalance)
          }
        },
        metadata: {
          timestamp: Date.now(),
          requestId: req.requestId || '',
          version: '1.0.0'
        }
      });
    } catch (error) {
      logger.error('Failed to get balance stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_FETCH_FAILED',
          message: 'Failed to retrieve balance statistics',
          statusCode: 500
        }
      });
    }
  }
}

export const balanceController = new BalanceController();