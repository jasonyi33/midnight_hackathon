import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { redis } from '@config/redis';

/**
 * Task 2.14: Enhanced Security Middleware
 * Implements correlation IDs, JWT refresh rotation, CORS, and request limits
 */

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      requestId?: string;
    }
  }
}

/**
 * Correlation ID middleware
 * Generates unique request ID for tracking
 */
export const correlationId = (req: Request, res: Response, next: NextFunction) => {
  // Check if correlation ID exists in headers
  const existingId = req.headers['x-correlation-id'] as string;
  const correlationId = existingId || uuidv4();

  // Attach to request object
  req.correlationId = correlationId;
  req.requestId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Log request with correlation ID
  logger.info('Incoming request', {
    correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  next();
};

/**
 * Enhanced CORS configuration
 * Restricts to frontend origin only
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:3000', // Development
      'https://genomic-privacy.vercel.app' // Production
    ];

    // Allow requests with no origin (Postman, mobile apps)
    if (!origin && config.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  exposedHeaders: ['X-Correlation-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
};

/**
 * Enhanced Helmet configuration
 */
export const helmetOptions = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'wss://localhost:3000',
        'https://ipfs.infura.io',
        'https://gateway.pinata.cloud',
        config.MIDNIGHT_RPC_URL || ''
      ],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Request size limiter
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    logger.warn(`Request size exceeded: ${contentLength} bytes from ${req.ip}`);
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds maximum size of 10MB',
        statusCode: 413
      }
    });
  }

  next();
};

/**
 * JWT Refresh Token Rotation
 * Implements secure token rotation on refresh
 */
export class RefreshTokenManager {
  private readonly REFRESH_TOKEN_TTL = 24 * 60 * 60; // 24 hours
  private readonly ROTATION_WINDOW = 5 * 60; // 5 minutes

  /**
   * Rotate refresh token
   */
  async rotateRefreshToken(
    oldRefreshToken: string,
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify old refresh token
      const decoded = jwt.verify(oldRefreshToken, config.JWT_REFRESH_SECRET) as any;

      if (decoded.type !== 'refresh' || decoded.userId !== userId) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is in Redis blacklist
      const isBlacklisted = await redis.get(`blacklist:${oldRefreshToken}`);
      if (isBlacklisted) {
        logger.error('Attempted to use blacklisted refresh token', { userId });
        throw new Error('Token has been revoked');
      }

      // Check if token is within rotation window
      const tokenAge = Date.now() / 1000 - decoded.iat;
      if (tokenAge < this.ROTATION_WINDOW) {
        logger.warn('Refresh token rotation attempted too soon', { userId, tokenAge });
      }

      // Blacklist old token
      await redis.setex(
        `blacklist:${oldRefreshToken}`,
        this.REFRESH_TOKEN_TTL,
        '1'
      );

      // Generate new tokens
      const newAccessToken = jwt.sign(
        { userId, type: 'access' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const newRefreshToken = jwt.sign(
        { userId, type: 'refresh' },
        config.JWT_REFRESH_SECRET,
        { expiresIn: '24h' }
      );

      // Store new refresh token in Redis
      await redis.setex(
        `refresh:${userId}`,
        this.REFRESH_TOKEN_TTL,
        newRefreshToken
      );

      logger.info('Refresh token rotated successfully', { userId });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Refresh token rotation failed', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllTokens(userId: string): Promise<void> {
    const refreshToken = await redis.get(`refresh:${userId}`);
    if (refreshToken) {
      await redis.setex(`blacklist:${refreshToken}`, this.REFRESH_TOKEN_TTL, '1');
      await redis.del(`refresh:${userId}`);
    }
    logger.info('All refresh tokens revoked', { userId });
  }
}

export const refreshTokenManager = new RefreshTokenManager();

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Remove sensitive headers
  res.removeHeader('X-Powered-By');

  next();
};

/**
 * IP-based access control
 */
export const ipAccessControl = (req: Request, res: Response, next: NextFunction) => {
  const blockedIPs = process.env.BLOCKED_IPS?.split(',') || [];
  const clientIP = req.ip || req.connection.remoteAddress || '';

  if (blockedIPs.includes(clientIP)) {
    logger.error(`Blocked IP attempted access: ${clientIP}`);
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Access denied',
        statusCode: 403
      }
    });
  }

  next();
};

/**
 * Combined security middleware
 */
export const applySecurity = [
  correlationId,
  ipAccessControl,
  requestSizeLimiter,
  securityHeaders,
  helmetOptions,
  cors(corsOptions)
];