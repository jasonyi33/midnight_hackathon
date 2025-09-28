import { Router, Request, Response } from 'express';
import { generateToken, JWTPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Connect wallet and get JWT token
 */
router.post('/connect', async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, signature, message, role = 'patient' } = req.body;

    // Validate required fields
    if (!walletAddress) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_WALLET_ADDRESS',
          message: 'Wallet address is required',
          retryable: false
        }
      });
      return;
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WALLET_ADDRESS',
          message: 'Invalid wallet address format',
          retryable: false
        }
      });
      return;
    }

    // For hackathon demo - skip signature validation
    // In production, verify the signature against the message
    
    const payload: JWTPayload = {
      walletAddress,
      role: role as 'patient' | 'doctor' | 'researcher',
      userId: `${role}-${walletAddress.slice(2, 8)}`
    };

    const token = generateToken(payload);

    logger.info('Wallet connected successfully', {
      walletAddress: walletAddress.slice(0, 10) + '...',
      role,
      userId: payload.userId
    });

    res.json({
      success: true,
      data: {
        accessToken: token,
        user: {
          walletAddress,
          role,
          userId: payload.userId
        }
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0'
      }
    });

  } catch (error: any) {
    logger.error('Wallet connection failed', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'WALLET_CONNECTION_FAILED',
        message: 'Failed to connect wallet',
        retryable: true
      }
    });
  }
});

/**
 * Disconnect wallet (invalidate token)
 */
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    // In a production app, we'd add the token to a blacklist
    // For hackathon demo, just return success
    
    logger.info('Wallet disconnected', {
      authHeader: req.headers.authorization?.substring(0, 20)
    });

    res.json({
      success: true,
      data: {
        message: 'Wallet disconnected successfully'
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0'
      }
    });

  } catch (error: any) {
    logger.error('Wallet disconnection failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'WALLET_DISCONNECTION_FAILED',
        message: 'Failed to disconnect wallet',
        retryable: true
      }
    });
  }
});

/**
 * Get current user profile
 */
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    // This endpoint will be protected by auth middleware when used
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          retryable: false
        }
      });
      return;
    }

    // For demo purposes, return basic profile info
    res.json({
      success: true,
      data: {
        user: {
          walletAddress: '0x742d35Cc6634C0532925a3b8Db4414fc7c2EcEE7',
          role: 'patient',
          userId: 'patient-742d35'
        },
        permissions: ['upload_genome', 'generate_proof', 'manage_consent']
      },
      metadata: {
        timestamp: Date.now(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0'
      }
    });

  } catch (error: any) {
    logger.error('Profile retrieval failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_RETRIEVAL_FAILED',
        message: 'Failed to retrieve user profile',
        retryable: true
      }
    });
  }
});

export default router;
