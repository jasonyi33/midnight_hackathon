/**
 * PHASE A: Critical Infrastructure Tests
 * Test-Driven Development - These tests MUST fail initially
 * DO NOT create mock implementations - test real functionality
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const axios = require('axios');
const { Pool } = require('pg');
const Redis = require('ioredis');

const BASE_URL = 'http://localhost:3000';

describe('Phase A: Critical Infrastructure', () => {

  describe('A.1: Database Setup', () => {
    let pgPool;

    beforeAll(() => {
      // Expecting real PostgreSQL connection
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://genomic:genomic123@localhost/genomic_privacy'
      });
    });

    afterAll(async () => {
      await pgPool.end();
    });

    it('should connect to PostgreSQL database', async () => {
      const result = await pgPool.query('SELECT NOW()');
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].now).toBeInstanceOf(Date);
    });

    it('should have users table with correct schema', async () => {
      const result = await pgPool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      const columns = result.rows;
      expect(columns.find(c => c.column_name === 'id')).toBeDefined();
      expect(columns.find(c => c.column_name === 'wallet_address')).toBeDefined();
      expect(columns.find(c => c.column_name === 'role')).toBeDefined();
      expect(columns.find(c => c.column_name === 'created_at')).toBeDefined();
    });

    it('should have genome_commitments table', async () => {
      const result = await pgPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'genome_commitments'
        )
      `);
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have verification_requests table', async () => {
      const result = await pgPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'verification_requests'
        )
      `);
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have audit_log table', async () => {
      const result = await pgPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'audit_log'
        )
      `);
      expect(result.rows[0].exists).toBe(true);
    });
  });

  describe('A.2: Redis Setup', () => {
    let redisClient;

    beforeAll(() => {
      redisClient = new Redis({
        host: 'localhost',
        port: 6379,
        retryStrategy: () => null // Don't retry for tests
      });
    });

    afterAll(async () => {
      await redisClient.quit();
    });

    it('should connect to Redis', async () => {
      const pong = await redisClient.ping();
      expect(pong).toBe('PONG');
    });

    it('should be able to set and get values', async () => {
      await redisClient.set('test:key', 'test-value');
      const value = await redisClient.get('test:key');
      expect(value).toBe('test-value');
    });

    it('should support Bull queue operations', async () => {
      const testQueueKey = 'bull:test-queue:1';
      await redisClient.hset(testQueueKey, 'data', JSON.stringify({ test: true }));
      const data = await redisClient.hget(testQueueKey, 'data');
      expect(JSON.parse(data)).toEqual({ test: true });
    });
  });

  describe('A.3: Environment Configuration', () => {
    it('should have all required environment variables', () => {
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'REDIS_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'DEMO_MODE',
        'CORS_ORIGIN'
      ];

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
        expect(process.env[varName]).not.toBe('');
      });
    });

    it('should have JWT secrets with minimum 32 characters', () => {
      expect(process.env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
      expect(process.env.JWT_REFRESH_SECRET.length).toBeGreaterThanOrEqual(32);
    });

    it('should have demo mode enabled', () => {
      expect(process.env.DEMO_MODE).toBe('true');
    });
  });

  describe('A.4: Authentication Service', () => {
    it('should accept demo mode authentication', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: `demo_wallet_${Date.now()}`,
        signature: 'DEMO_MODE',
        message: 'Sign in to Genomic Privacy DApp'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
      expect(response.data.user).toBeDefined();
    });

    it('should skip signature verification when SKIP_SIGNATURE_VERIFICATION is true', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: `test_wallet_${Date.now()}`,
        signature: 'invalid_signature',
        message: 'Any message'
      });

      expect(response.status).toBe(200);
      expect(response.data.accessToken).toBeDefined();
    });

    it('should generate valid JWT tokens', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: `demo_wallet_${Date.now()}`,
        signature: 'DEMO_MODE',
        message: 'Sign in'
      });

      const token = response.data.accessToken;
      const parts = token.split('.');
      expect(parts.length).toBe(3); // header.payload.signature

      // Decode payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.userId).toBeDefined();
      expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
    });

    it('should create user in database', async () => {
      const walletAddress = `demo_wallet_${Date.now()}`;

      await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress,
        signature: 'DEMO_MODE',
        message: 'Sign in'
      });

      // Check user exists via API
      const response = await axios.get(`${BASE_URL}/api/users/check/${walletAddress}`);
      expect(response.data.exists).toBe(true);
    });
  });

  describe('A.5: Health Endpoint', () => {
    it('should report database connection status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data.database).toBeDefined();
      expect(response.data.database).toBe('connected');
    });

    it('should report Redis connection status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data.redis).toBeDefined();
      expect(response.data.redis).toBe('connected');
    });

    it('should report WebSocket status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data.websocket).toBeDefined();
      expect(response.data.websocket).toBe('initialized');
    });

    it('should include version and environment', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data.version).toBeDefined();
      expect(response.data.environment).toBe('development');
    });
  });
});