/**
 * Enhanced Server Entry Point for Phase 3
 * Integrates WebSocket server and all Phase 3 features
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './utils/logger';
import { enhancedSocketService } from './websocket/enhanced-socket.service';
import { proofIntegrationService } from './proof/proof-integration.service';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';

// Import routes
import authRoutes from './auth/auth.routes';
import genomeRoutes from './genome/genome.routes';
import proofRoutes from './proof/proof.routes';
import verificationRoutes from './verification/verification.routes';
import balanceRoutes from './balance/balance.routes';

// Create Express app
const app = express();

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Initialize WebSocket server (Task 3.5)
enhancedSocketService.initialize(server);

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
}));
app.use(cors({
  origin: config.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseHealth();

    // Check Redis connection
    const redisHealthy = await checkRedisHealth();

    // Check WebSocket status
    const wsConnections = enhancedSocketService.getConnectedUsersCount();

    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
        websocket: {
          status: 'active',
          connections: wsConnections
        }
      },
      environment: process.env.NODE_ENV,
      demoMode: process.env.DEMO_MODE === 'true'
    };

    res.json(status);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/genome', genomeRoutes);
app.use('/api/proof', proofRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/balance', balanceRoutes);

// Demo mode indicator
if (process.env.DEMO_MODE === 'true') {
  app.get('/api/demo-status', (req, res) => {
    res.json({
      demoMode: true,
      message: 'Running in demo mode with mock data',
      features: {
        mockProofSDK: process.env.USE_MOCK_PROOF_SDK === 'true',
        mockIPFS: process.env.USE_MOCK_IPFS === 'true',
        mockBlockchain: process.env.USE_MOCK_BLOCKCHAIN === 'true'
      }
    });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Database health check
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { pool } = require('./config/database');
    const result = await pool.query('SELECT 1');
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

// Redis health check
async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Shutdown WebSocket server
  await enhancedSocketService.shutdown();

  // Cleanup ProofSDK
  proofIntegrationService.destroy();

  // Close database connections
  const { pool } = require('./config/database');
  await pool.end();

  // Close Redis connection
  await redis.quit();

  console.log('Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const PORT = config.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    console.log('✅ Redis connected');

    // Start listening
    server.listen(PORT, () => {
      console.log(`
========================================
🚀 Genomic Privacy Backend - Phase 3
========================================
Environment: ${process.env.NODE_ENV}
Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'}
Port: ${PORT}
WebSocket: ws://localhost:${PORT}
API: http://localhost:${PORT}/api
Health: http://localhost:${PORT}/health
========================================
      `);

      // Log active features
      if (process.env.DEMO_MODE === 'true') {
        console.log('📌 Demo Mode Features:');
        console.log('  - Mock ProofSDK:', process.env.USE_MOCK_PROOF_SDK === 'true');
        console.log('  - Mock IPFS:', process.env.USE_MOCK_IPFS === 'true');
        console.log('  - Mock Blockchain:', process.env.USE_MOCK_BLOCKCHAIN === 'true');
        console.log('========================================\n');
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app, server };