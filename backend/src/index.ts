import { createServer } from 'http';
import { createApp } from './app';
import { config } from '@config/index';
import { checkDatabaseConnection } from '@config/database';
import { checkRedisConnection } from '@config/redis';
import { logger } from '@utils/logger';
import { SocketService } from './websocket/socket.service';
import { backupService } from './services/backup.service';

async function startServer() {
  try {
    // Check database connections
    const dbConnected = await checkDatabaseConnection();
    const redisConnected = await checkRedisConnection();

    if (!dbConnected || !redisConnected) {
      throw new Error('Failed to connect to required services');
    }

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket
    const socketService = new SocketService();
    socketService.initialize(httpServer);

    // Start automated backups if enabled
    if (process.env.ENABLE_AUTOMATED_BACKUPS === 'true') {
      backupService.startAutomatedBackups();
      logger.info('Automated backup service started');
    }

    // Start server
    httpServer.listen(config.PORT, () => {
      logger.info(`
        🚀 Genomic Privacy Backend Server Started
        =======================================
        Environment: ${config.NODE_ENV}
        Port: ${config.PORT}
        API: http://localhost:${config.PORT}
        WebSocket: ws://localhost:${config.PORT}
        Health: http://localhost:${config.PORT}/health
        =======================================
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      httpServer.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connections
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();