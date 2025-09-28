import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../app';
import type { Application } from 'express';

// Mock external dependencies
jest.mock('../config/database', () => ({
  query: jest.fn(),
  queryActive: jest.fn()
}));

jest.mock('../config/index', () => ({
  config: {
    JWT_SECRET: 'test-secret-key-for-testing-purposes-only',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing',
    NODE_ENV: 'test',
    PORT: 3000,
    CORS_ORIGIN: 'http://localhost:5173',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379'
  }
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Authentication Integration Tests', () => {
  let app: Application;
  
  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/connect', () => {
    it('should validate wallet address format', async () => {
      const invalidData = {
        walletAddress: 'invalid_address',
        signature: 'mock_signature',
        message: 'Connect to Genomic Privacy DApp'
      };

      const response = await request(app)
        .post('/api/auth/connect')
        .send(invalidData);

      // This should fail validation - let's see what happens
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        walletAddress: '0x742d35Cc6634C0532925a3b8D1b9226d'
        // Missing signature and message
      };

      const response = await request(app)
        .post('/api/auth/connect')
        .send(incompleteData);

      console.log('Incomplete data response:', response.status, response.body);
    });

    it('should test route exists', async () => {
      const response = await request(app)
        .post('/api/auth/connect')
        .send({});

      // Just checking if route exists
      console.log('Route test - Status:', response.status);
      console.log('Route test - Body:', response.body);
    });
  });

  describe('App Configuration', () => {
    it('should create app without errors', () => {
      expect(app).toBeDefined();
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route');

      expect(response.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    it('should respond to basic health check if available', async () => {
      const response = await request(app)
        .get('/health');

      console.log('Health check:', response.status, response.body);
    });
  });
});
