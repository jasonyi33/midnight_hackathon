/**
 * PHASE B: Core API Tests
 * Test-Driven Development - These tests MUST fail initially
 * Testing real API endpoints without mock implementations
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3000';

describe('Phase B: Core APIs', () => {
  let authToken;
  let refreshToken;
  let userId;

  beforeAll(async () => {
    // Get auth token for authenticated endpoints
    const authResponse = await axios.post(`${BASE_URL}/api/auth/connect`, {
      walletAddress: `test_wallet_${Date.now()}`,
      signature: 'DEMO_MODE',
      message: 'Sign in'
    });

    authToken = authResponse.data.accessToken;
    refreshToken = authResponse.data.refreshToken;
    userId = authResponse.data.user.id;
  });

  describe('B.1: Authentication Endpoints', () => {
    it('POST /api/auth/connect - should authenticate user', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: `wallet_${Date.now()}`,
        signature: 'DEMO_MODE',
        message: 'Sign in to Genomic Privacy DApp'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.accessToken).toMatch(/^eyJ/); // JWT token
      expect(response.data.refreshToken).toMatch(/^eyJ/);
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('walletAddress');
      expect(response.data.user).toHaveProperty('role');
    });

    it('POST /api/auth/refresh - should refresh access token', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.accessToken).not.toBe(authToken); // New token
    });

    it('GET /api/auth/me - should return current user', async () => {
      const response = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.id).toBe(userId);
      expect(response.data.user.walletAddress).toBeDefined();
    });

    it('POST /api/auth/logout - should invalidate session', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Logged out successfully');
    });
  });

  describe('B.2: Genome Management', () => {
    let genomeId;
    let ipfsCid;

    it('POST /api/genome/upload - should accept genome data', async () => {
      const genomeData = {
        patientId: userId,
        markers: {
          BRCA1: { value: 0.3, confidence: 0.98 },
          BRCA2: { value: 0.1, confidence: 0.99 },
          CYP2D6: { activityScore: 1.5, metabolizer: 'normal' }
        },
        traits: {
          BRCA1: { mutation_present: false, confidence: 0.98 },
          BRCA2: { mutation_present: false, confidence: 0.99 }
        }
      };

      const response = await axios.post(`${BASE_URL}/api/genome/upload`, genomeData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.genomeId).toBeDefined();
      expect(response.data.status).toBe('processing');

      genomeId = response.data.genomeId;
    });

    it('GET /api/genome/status - should return upload status', async () => {
      const response = await axios.get(`${BASE_URL}/api/genome/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.genomes).toBeInstanceOf(Array);
      expect(response.data.genomes[0]).toHaveProperty('id');
      expect(response.data.genomes[0]).toHaveProperty('status');
      expect(response.data.genomes[0]).toHaveProperty('uploadedAt');
    });

    it('POST /api/genome/encrypt - should encrypt and store to IPFS', async () => {
      const response = await axios.post(`${BASE_URL}/api/genome/encrypt`, {
        genomeId
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.ipfsCid).toBeDefined();
      expect(response.data.commitmentHash).toBeDefined();
      expect(response.data.encryptionMetadata).toBeDefined();

      ipfsCid = response.data.ipfsCid;
    });

    it('GET /api/genome/commitment/:id - should return commitment details', async () => {
      const response = await axios.get(`${BASE_URL}/api/genome/commitment/${genomeId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.commitment).toHaveProperty('hash');
      expect(response.data.commitment).toHaveProperty('ipfsCid');
      expect(response.data.commitment).toHaveProperty('timestamp');
      expect(response.data.commitment).toHaveProperty('verified');
    });
  });

  describe('B.3: Proof Generation System', () => {
    let jobId;

    it('POST /api/proof/generate - should queue proof generation', async () => {
      const proofRequest = {
        traitType: 'BRCA1',
        genomeHash: `hash_${Date.now()}`,
        threshold: 0.5,
        proofType: 'boolean' // boolean, range, or membership
      };

      const response = await axios.post(`${BASE_URL}/api/proof/generate`, proofRequest, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.jobId).toBeDefined();
      expect(response.data.estimatedTime).toBeGreaterThan(0);
      expect(response.data.queuePosition).toBeDefined();

      jobId = response.data.jobId;
    });

    it('GET /api/proof/status/:jobId - should return generation progress', async () => {
      const response = await axios.get(`${BASE_URL}/api/proof/status/${jobId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.jobId).toBe(jobId);
      expect(['queued', 'processing', 'completed', 'failed']).toContain(response.data.status);
      expect(response.data.progress).toBeGreaterThanOrEqual(0);
      expect(response.data.progress).toBeLessThanOrEqual(100);
    });

    it('GET /api/proof/list - should return user proofs', async () => {
      const response = await axios.get(`${BASE_URL}/api/proof/list`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.proofs).toBeInstanceOf(Array);
      if (response.data.proofs.length > 0) {
        expect(response.data.proofs[0]).toHaveProperty('id');
        expect(response.data.proofs[0]).toHaveProperty('traitType');
        expect(response.data.proofs[0]).toHaveProperty('status');
        expect(response.data.proofs[0]).toHaveProperty('createdAt');
      }
    });

    it('POST /api/proof/verify - should verify proof on-chain', async () => {
      const response = await axios.post(`${BASE_URL}/api/proof/verify`, {
        proofId: jobId,
        proofData: 'mock_proof_data'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.verified).toBeDefined();
      expect(response.data.transactionHash).toBeDefined();
      expect(response.data.blockNumber).toBeDefined();
    });
  });

  describe('B.4: Verification System', () => {
    let requestId;
    const patientAddress = `patient_${Date.now()}`;

    it('POST /api/verification/request - should create verification request', async () => {
      const verificationRequest = {
        patientAddress,
        traits: ['BRCA1', 'CYP2D6'],
        message: 'Request for treatment eligibility',
        expiresIn: 86400 // 24 hours
      };

      const response = await axios.post(`${BASE_URL}/api/verification/request`, verificationRequest, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.requestId).toBeDefined();
      expect(response.data.status).toBe('pending');
      expect(response.data.expiresAt).toBeDefined();

      requestId = response.data.requestId;
    });

    it('GET /api/verification/list - should list pending requests', async () => {
      const response = await axios.get(`${BASE_URL}/api/verification/list`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.requests).toBeInstanceOf(Array);
      expect(response.data.requests[0]).toHaveProperty('id');
      expect(response.data.requests[0]).toHaveProperty('doctorId');
      expect(response.data.requests[0]).toHaveProperty('traits');
      expect(response.data.requests[0]).toHaveProperty('status');
      expect(response.data.requests[0]).toHaveProperty('message');
    });

    it('POST /api/verification/respond - should handle approval/denial', async () => {
      const response = await axios.post(`${BASE_URL}/api/verification/respond`, {
        requestId,
        approved: true,
        message: 'Access granted for treatment'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.status).toBe('approved');
      expect(response.data.respondedAt).toBeDefined();
      expect(response.data.proofGenerated).toBe(true);
    });

    it('GET /api/verification/history - should return request history', async () => {
      const response = await axios.get(`${BASE_URL}/api/verification/history`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.history).toBeInstanceOf(Array);
      expect(response.data.totalRequests).toBeGreaterThanOrEqual(0);
      expect(response.data.approvedCount).toBeGreaterThanOrEqual(0);
      expect(response.data.deniedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('B.5: Research Portal APIs', () => {
    it('GET /api/research/aggregate - should return anonymized statistics', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/aggregate`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.statistics).toBeDefined();
      expect(response.data.statistics.totalPatients).toBeGreaterThanOrEqual(5); // Minimum cohort
      expect(response.data.statistics.traits).toBeDefined();
      expect(response.data.statistics.traits.BRCA1).toBeDefined();
      expect(response.data.statistics.traits.BRCA1.mutationFrequency).toBeGreaterThanOrEqual(0);
      expect(response.data.statistics.traits.BRCA1.mutationFrequency).toBeLessThanOrEqual(1);
    });

    it('GET /api/research/export - should export CSV data', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/export`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'text/csv'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('csv');
      expect(response.data).toContain('trait,frequency,confidence,sampleSize');
      expect(response.data.split('\n').length).toBeGreaterThan(1); // Header + data
    });

    it('GET /api/research/trends - should return time series data', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/trends`, {
        params: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          interval: 'day'
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.trends).toBeInstanceOf(Array);
      expect(response.data.trends[0]).toHaveProperty('date');
      expect(response.data.trends[0]).toHaveProperty('verifications');
      expect(response.data.trends[0]).toHaveProperty('newPatients');
      expect(response.data.trends[0]).toHaveProperty('proofGenerations');
    });

    it('should enforce minimum cohort size', async () => {
      // Request with filter that would result in < 5 patients
      const response = await axios.get(`${BASE_URL}/api/research/aggregate`, {
        params: {
          filter: 'rare_mutation_xyz'
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.data.statistics.totalPatients < 5) {
        expect(response.data.error).toBe('Insufficient cohort size for privacy protection');
        expect(response.data.minimumRequired).toBe(5);
      } else {
        expect(response.data.statistics.totalPatients).toBeGreaterThanOrEqual(5);
      }
    });
  });
});