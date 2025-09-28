import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-for-hackathon-only';
const JWT_EXPIRE_TIME = '24h';

export interface JWTPayload {
  walletAddress: string;
  role: 'patient' | 'doctor' | 'researcher';
  userId?: string;
}

export interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: JWTPayload;
}

/**
 * Generate JWT token for wallet address
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRE_TIME,
    issuer: 'genomic-privacy-dapp'
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      walletAddress: decoded.walletAddress,
      role: decoded.role || 'patient',
      userId: decoded.userId
    };
  } catch (error: any) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Express middleware for JWT authentication
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Missing authorization header', { 
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      res.status(401).json({ 
        success: false,
        error: {
          code: 'MISSING_AUTH_HEADER',
          message: 'Authorization header required',
          retryable: false
        }
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Invalid authorization header format', { 
        authHeader: authHeader.substring(0, 20),
        ip: req.ip
      });
      res.status(401).json({ 
        success: false,
        error: {
          code: 'INVALID_AUTH_FORMAT',
          message: 'Authorization header must be Bearer token',
          retryable: false
        }
      });
      return;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = decoded;
    
    logger.debug('Token authenticated successfully', {
      walletAddress: decoded.walletAddress.slice(0, 10) + '...',
      role: decoded.role
    });
    
    next();
  } catch (error: any) {
    logger.warn('Token authentication failed', { 
      error: error.message,
      ip: req.ip,
      authHeader: req.headers.authorization?.substring(0, 20)
    });
    
    res.status(401).json({ 
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
        retryable: false
      }
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}

/**
 * Demo mode authentication - creates a test token
 */
export function demoAuth(): string {
  return generateToken({
    walletAddress: '0x742d35Cc6634C0532925a3b8Db4414fc7c2EcEE7',
    role: 'patient',
    userId: 'demo-patient-001'
  });
}
