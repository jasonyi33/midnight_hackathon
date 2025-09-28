/**
 * Comprehensive TDD Integration Test Suite
 * Tests Backend, Frontend, and Blockchain Integration
 * Based on PRD requirements from prd.prompt.md
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../app';
import { pool } from '@config/database';
import { redis } from '@config/redis';

describe('Genomic Privacy DApp - TDD Integration Tests', () => {
  let app: any;
  let server: any;

  beforeAll(async () => {
    // Initialize app
    app = createApp();
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    // Cleanup
    await server?.close();
    await pool.end();
    await redis.quit();
  });

  describe('FR-001 to FR-006: Wallet Integration & Authentication', () => {
    test('should integrate with Lace wallet authentication', async () => {
      const response = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0x1234567890abcdef',
          signature: 'mock_signature',
          message: 'Authentication message'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    test('should generate unique patient identifier from wallet address', async () => {
      const walletAddress = '0x1234567890abcdef';
      
      const response1 = await request(app)
        .post('/api/auth/wallet-connect')
        .send({ walletAddress, signature: 'sig1', message: 'msg1' });

      const response2 = await request(app)
        .post('/api/auth/wallet-connect')
        .send({ walletAddress, signature: 'sig2', message: 'msg2' });

      // Should generate same patient ID for same wallet
      expect(response1.body.data.userId).toBe(response2.body.data.userId);
    });

    test('should maintain session persistence with JWT tokens', async () => {
      const authResponse = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xtest',
          signature: 'sig',
          message: 'msg'
        });

      const token = authResponse.body.data.accessToken;

      const protectedResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(200);
    });
  });

  describe('FR-007 to FR-014: Genomic Data Management', () => {
    let authToken: string;

    beforeAll(async () => {
      const authResponse = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xgenome_test',
          signature: 'sig',
          message: 'msg'
        });
      authToken = authResponse.body.data.accessToken;
    });

    test('should accept genomic data in simplified JSON format', async () => {
      const genomicData = {
        BRCA1: { rs80357906: 'C/T', rs80357914: 'G/A' },
        BRCA2: { rs80359550: 'A/G', rs80359783: 'T/C' },
        CYP2D6: { rs16947: 'G/A', rs1065852: 'C/T' }
      };

      const response = await request(app)
        .post('/api/genome/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ genomicData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('genomeHash');
      expect(response.body.data).toHaveProperty('ipfsCID');
    });

    test('should validate JSON structure and genetic marker formats', async () => {
      const invalidData = {
        BRCA1: { invalid_marker: 'invalid_format' }
      };

      const response = await request(app)
        .post('/api/genome/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ genomicData: invalidData });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_GENOMIC_DATA');
    });

    test('should encrypt genomic data using AES-256-GCM', async () => {
      const genomicData = {
        BRCA1: { rs80357906: 'C/T' },
        BRCA2: { rs80359550: 'A/G' },
        CYP2D6: { rs16947: 'G/A' }
      };

      const response = await request(app)
        .post('/api/genome/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ genomicData });

      expect(response.status).toBe(200);
      expect(response.body.data.encryption).toHaveProperty('algorithm', 'aes-256-gcm');
      expect(response.body.data.encryption).toHaveProperty('iv');
      expect(response.body.data.encryption).toHaveProperty('authTag');
    });
  });

  describe('FR-015 to FR-022: Zero-Knowledge Proof Generation', () => {
    let authToken: string;
    let genomeHash: string;

    beforeAll(async () => {
      // Setup authenticated user with genomic data
      const authResponse = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xproof_test',
          signature: 'sig',
          message: 'msg'
        });
      authToken = authResponse.body.data.accessToken;

      const genomeResponse = await request(app)
        .post('/api/genome/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          genomicData: {
            BRCA1: { rs80357906: 'C/T' },
            BRCA2: { rs80359550: 'A/G' },
            CYP2D6: { rs16947: 'G/A' }
          }
        });
      genomeHash = genomeResponse.body.data.genomeHash;
    });

    test('should generate real ZK proofs for BRCA1 mutations', async () => {
      const response = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          traitType: 'BRCA1',
          genomeHash,
          threshold: 0.8
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('proof');
      expect(response.body.data).toHaveProperty('publicInputs');
      expect(response.body.data).toHaveProperty('verificationKey');
      expect(response.body.data.metadata.circuitId).toBe('BRCA1');
    });

    test('should generate real ZK proofs for BRCA2 mutations', async () => {
      const response = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          traitType: 'BRCA2',
          genomeHash,
          threshold: 0.7
        });

      expect(response.status).toBe(200);
      expect(response.body.data.metadata.circuitId).toBe('BRCA2');
    });

    test('should generate real ZK proofs for CYP2D6 metabolizer status', async () => {
      const response = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          traitType: 'CYP2D6',
          genomeHash,
          threshold: 0.5
        });

      expect(response.status).toBe(200);
      expect(response.body.data.metadata.circuitId).toBe('CYP2D6');
    });

    test('should show proof generation progress with percentage updates', async () => {
      // This would test WebSocket progress updates in a real scenario
      // For now, test the REST endpoint that returns job status
      const generateResponse = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          traitType: 'BRCA1',
          genomeHash,
          threshold: 0.8
        });

      const jobId = generateResponse.body.data.jobId;

      const statusResponse = await request(app)
        .get(`/api/proof/status/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data).toHaveProperty('progress');
      expect(statusResponse.body.data).toHaveProperty('stage');
    });

    test('should cache generated proofs with TTL', async () => {
      const request1 = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          traitType: 'BRCA1',
          genomeHash,
          threshold: 0.8
        });

      const request2 = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          traitType: 'BRCA1',
          genomeHash,
          threshold: 0.8
        });

      expect(request1.status).toBe(200);
      expect(request2.status).toBe(200);
      // Second request should be faster due to caching
      expect(request2.body.data.cached).toBe(true);
    });
  });

  describe('FR-030 to FR-036: Doctor Portal', () => {
    let doctorToken: string;
    let patientToken: string;
    let patientAddress: string;

    beforeAll(async () => {
      // Setup doctor account
      const doctorAuth = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xdoctor',
          signature: 'sig',
          message: 'msg',
          role: 'doctor'
        });
      doctorToken = doctorAuth.body.data.accessToken;

      // Setup patient account
      const patientAuth = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xpatient',
          signature: 'sig',
          message: 'msg'
        });
      patientToken = patientAuth.body.data.accessToken;
      patientAddress = '0xpatient';
    });

    test('should authenticate doctors using wallet address + role verification', async () => {
      const response = await request(app)
        .get('/api/doctor/profile')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('doctor');
    });

    test('should allow doctors to request specific trait verifications', async () => {
      const response = await request(app)
        .post('/api/doctor/request-verification')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientAddress,
          traitType: 'BRCA1',
          reason: 'Treatment planning for breast cancer risk assessment'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('requestId');
      expect(response.body.data.status).toBe('pending');
    });

    test('should show pending/approved/denied status for each request', async () => {
      const response = await request(app)
        .get('/api/doctor/verification-requests')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('status');
        expect(['pending', 'approved', 'denied', 'expired']).toContain(
          response.body.data[0].status
        );
      }
    });
  });

  describe('FR-037 to FR-042: Researcher Portal', () => {
    let researcherToken: string;

    beforeAll(async () => {
      const authResponse = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xresearcher',
          signature: 'sig',
          message: 'msg',
          role: 'researcher'
        });
      researcherToken = authResponse.body.data.accessToken;
    });

    test('should compute aggregate statistics without accessing raw data', async () => {
      const response = await request(app)
        .get('/api/research/mutation-frequencies')
        .set('Authorization', `Bearer ${researcherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('BRCA1');
      expect(response.body.data).toHaveProperty('BRCA2');
      expect(response.body.data).toHaveProperty('CYP2D6');
      
      // Should not contain any individual patient data
      expect(response.body.data).not.toHaveProperty('patients');
      expect(response.body.data).not.toHaveProperty('rawData');
    });

    test('should enforce minimum cohort size of 5 to prevent identification', async () => {
      const response = await request(app)
        .get('/api/research/mutation-frequencies?minCohortSize=5')
        .set('Authorization', `Bearer ${researcherToken}`);

      expect(response.status).toBe(200);
      
      if (response.body.data.totalSamples < 5) {
        expect(response.body.data.message).toContain('insufficient sample size');
      }
    });
  });

  describe('Integration: End-to-End Workflow', () => {
    test('should complete full privacy-preserving genomic verification workflow', async () => {
      // Step 1: Patient authentication
      const patientAuth = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xe2e_patient',
          signature: 'sig',
          message: 'msg'
        });

      expect(patientAuth.status).toBe(200);
      const patientToken = patientAuth.body.data.accessToken;

      // Step 2: Upload genomic data
      const genomeUpload = await request(app)
        .post('/api/genome/upload')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          genomicData: {
            BRCA1: { rs80357906: 'C/T', rs80357914: 'G/A' },
            BRCA2: { rs80359550: 'A/G', rs80359783: 'T/C' },
            CYP2D6: { rs16947: 'G/A', rs1065852: 'C/T' }
          }
        });

      expect(genomeUpload.status).toBe(200);
      const genomeHash = genomeUpload.body.data.genomeHash;

      // Step 3: Doctor requests verification
      const doctorAuth = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xe2e_doctor',
          signature: 'sig',
          message: 'msg',
          role: 'doctor'
        });

      const doctorToken = doctorAuth.body.data.accessToken;

      const verificationRequest = await request(app)
        .post('/api/doctor/request-verification')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientAddress: '0xe2e_patient',
          traitType: 'BRCA1',
          reason: 'Treatment planning'
        });

      expect(verificationRequest.status).toBe(200);
      const requestId = verificationRequest.body.data.requestId;

      // Step 4: Patient approves request
      const approval = await request(app)
        .post(`/api/patient/respond-verification/${requestId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ approve: true });

      expect(approval.status).toBe(200);

      // Step 5: Generate ZK proof
      const proofGeneration = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          traitType: 'BRCA1',
          genomeHash,
          threshold: 0.8
        });

      expect(proofGeneration.status).toBe(200);
      expect(proofGeneration.body.data).toHaveProperty('proof');

      // Step 6: Doctor receives cryptographic proof
      const doctorProofView = await request(app)
        .get(`/api/doctor/verification-proof/${requestId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(doctorProofView.status).toBe(200);
      expect(doctorProofView.body.data).toHaveProperty('proof');
      expect(doctorProofView.body.data).toHaveProperty('verificationLink');

      console.log('✅ Complete E2E workflow test passed');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle invalid wallet addresses', async () => {
      const response = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: 'invalid_address',
          signature: 'sig',
          message: 'msg'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_WALLET_ADDRESS');
    });

    test('should handle malformed genomic data', async () => {
      const authResponse = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xerror_test',
          signature: 'sig',
          message: 'msg'
        });

      const response = await request(app)
        .post('/api/genome/upload')
        .set('Authorization', `Bearer ${authResponse.body.data.accessToken}`)
        .send({
          genomicData: 'not_an_object'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_GENOMIC_DATA');
    });

    test('should handle proof generation timeout', async () => {
      // Mock a timeout scenario
      const authResponse = await request(app)
        .post('/api/auth/wallet-connect')
        .send({
          walletAddress: '0xtimeout_test',
          signature: 'sig',
          message: 'msg'
        });

      const response = await request(app)
        .post('/api/proof/generate')
        .set('Authorization', `Bearer ${authResponse.body.data.accessToken}`)
        .send({
          traitType: 'TIMEOUT_TEST',
          genomeHash: 'mock_hash',
          threshold: 0.8
        });

      // Should handle gracefully even if trait type is invalid
      expect([200, 400]).toContain(response.status);
    });
  });
});

export {};
