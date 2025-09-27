import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@config/index';
import { errorHandler } from '@middleware/errorHandler';
import { requestLogger } from '@middleware/requestLogger';
import { generalLimiter } from '@middleware/rateLimiter';
import { logger } from '@utils/logger';

import authRoutes from './auth/auth.routes';
import proofRoutes from './proof/proof.routes';
import verificationRoutes from './verification/verification.routes';
import genomeRoutes from './genome/genome.routes';
import balanceRoutes from './balance/balance.routes';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "wss://localhost:3000", "https://ipfs.infura.io"]
      }
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use(generalLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      environment: config.NODE_ENV,
      version: '1.0.0'
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/proof', proofRoutes);
  app.use('/api/verification', verificationRoutes);
  app.use('/api/genome', genomeRoutes);
  app.use('/api/balance', balanceRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        statusCode: 404
      }
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}