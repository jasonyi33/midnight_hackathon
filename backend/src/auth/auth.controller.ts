import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ConnectWalletInput, RefreshTokenInput } from './auth.types';
import { logger } from '@utils/logger';

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

    const tokens = await authService.refreshTokens(refreshToken);

    res.json({
      success: true,
      data: tokens,
      metadata: {
        timestamp: Date.now(),
        requestId: req.requestId || '',
        version: '1.0.0'
      }
    });
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
    // In a real implementation, you might want to blacklist the token
    logger.info(`User ${req.user?.id} disconnected`);

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