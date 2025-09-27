import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ConnectWalletInput, RefreshTokenInput } from './auth.types';
import { logger } from '@utils/logger';
import { refreshTokenManager } from '@middleware/security';
import { redis } from '@config/redis';

export class AuthController {
  async connect(req: Request<{}, {}, ConnectWalletInput>, res: Response) {
    const { walletAddress, signature, message } = req.body;

    const { user, tokens } = await authService.connectWallet(
      walletAddress,
      signature,
      message
    );

    logger.info(`User ${user.id} connected with wallet ${walletAddress}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          role: user.role
        },
        ...tokens
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async refresh(req: Request<{}, {}, RefreshTokenInput>, res: Response) {
    const { refreshToken } = req.body;

    // FR-061: Implement secure refresh token rotation
    try {
      // Get user ID from the refresh token first
      const { userId } = authService.verifyRefreshToken(refreshToken);

      // Use the refresh token manager for secure rotation
      const tokens = await refreshTokenManager.rotateRefreshToken(refreshToken, userId);

      logger.info(`Refresh token rotated for user ${userId}`);

      res.json({
        success: true,
        data: tokens,
        metadata: {
          timestamp: Date.now(),
          requestId: req.requestId || '',
          version: '1.0.0'
        }
      });
    } catch (error) {
      logger.error('Refresh token rotation failed:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          statusCode: 401
        }
      });
    }
  }

  async me(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        user: req.user
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }

  async disconnect(req: Request, res: Response) {
    const userId = req.user?.id;

    if (userId) {
      // FR-061: Revoke all refresh tokens on disconnect
      await refreshTokenManager.revokeAllTokens(userId);
      logger.info(`User ${userId} disconnected and tokens revoked`);
    }

    res.json({
      success: true,
      data: {
        message: 'Successfully disconnected'
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
  }
}

export const authController = new AuthController();