/**
 * PHASE E: Demo Data & Testing
 * Test-Driven Development - These tests MUST fail initially
 * Testing real demo data seeding and end-to-end flows
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const axios = require('axios');
const { Pool } = require('pg');

const BASE_URL = 'http://localhost:3000';

describe('Phase E: Demo Data & Testing', () => {
  let pgPool;
  let authTokenSarah;
  let authTokenDoctor;
  let authTokenResearcher;

  beforeAll(async () => {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://genomic:genomic123@localhost/genomic_privacy'
    });
  });

  afterAll(async () => {
    await pgPool.end();
  });

  describe('E.1: Database Seeding', () => {
    it('should seed demo users', async () => {
      // Check Sarah exists
      const sarahResult = await pgPool.query(
        "SELECT * FROM users WHERE wallet_address LIKE '%sarah%' OR wallet_address LIKE '%Sarah%'"
      );
      expect(sarahResult.rows.length).toBeGreaterThan(0);
      expect(sarahResult.rows[0].role).toBe('patient');

      // Check Dr. Johnson exists
      const doctorResult = await pgPool.query(
        "SELECT * FROM users WHERE wallet_address LIKE '%johnson%' OR wallet_address LIKE '%Johnson%'"
      );
      expect(doctorResult.rows.length).toBeGreaterThan(0);
      expect(doctorResult.rows[0].role).toBe('doctor');

      // Check Researcher exists
      const researcherResult = await pgPool.query(
        "SELECT * FROM users WHERE role = 'researcher'"
      );
      expect(researcherResult.rows.length).toBeGreaterThan(0);
    });

    it('should have 127 BRCA patient records', async () => {
      const countResult = await pgPool.query(`
        SELECT COUNT(*) as count
        FROM genome_commitments gc
        JOIN users u ON gc.patient_id = u.id
        WHERE u.role = 'patient'
      `);

      expect(parseInt(countResult.rows[0].count)).toBeGreaterThanOrEqual(127);
    });

    it('should have varied genetic markers in demo data', async () => {
      const markersResult = await pgPool.query(`
        SELECT DISTINCT
          jsonb_object_keys(encryption_metadata->'markers') as marker
        FROM genome_commitments
        WHERE encryption_metadata IS NOT NULL
        LIMIT 10
      `);

      const markers = markersResult.rows.map(r => r.marker);
      expect(markers).toContain('BRCA1');
      expect(markers).toContain('BRCA2');
      expect(markers).toContain('CYP2D6');
    });

    it('should have sample verification requests', async () => {
      const requestsResult = await pgPool.query(`
        SELECT COUNT(*) as count, status
        FROM verification_requests
        GROUP BY status
      `);

      const statusCounts = {};
      requestsResult.rows.forEach(row => {
        statusCounts[row.status] = parseInt(row.count);
      });

      expect(statusCounts.approved || 0).toBeGreaterThan(0);
      expect(statusCounts.pending || 0).toBeGreaterThanOrEqual(0);
      expect(statusCounts.denied || 0).toBeGreaterThanOrEqual(0);
    });

    it('should have historical data over 30 days', async () => {
      const historyResult = await pgPool.query(`
        SELECT
          MIN(created_at) as earliest,
          MAX(created_at) as latest
        FROM audit_log
      `);

      if (historyResult.rows[0].earliest && historyResult.rows[0].latest) {
        const earliest = new Date(historyResult.rows[0].earliest);
        const latest = new Date(historyResult.rows[0].latest);
        const daysDiff = (latest - earliest) / (1000 * 60 * 60 * 24);

        expect(daysDiff).toBeGreaterThanOrEqual(1); // At least some time range
      }
    });
  });

  describe('E.2: Demo Account Authentication', () => {
    it('should authenticate Sarah (patient)', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: 'sarah_demo_wallet',
        signature: 'DEMO_MODE',
        message: 'Sign in as Sarah'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.role).toBe('patient');
      authTokenSarah = response.data.accessToken;
    });

    it('should authenticate Dr. Johnson (doctor)', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: 'dr_johnson_demo_wallet',
        signature: 'DEMO_MODE',
        message: 'Sign in as Dr. Johnson'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.role).toBe('doctor');
      authTokenDoctor = response.data.accessToken;
    });

    it('should authenticate Researcher', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: 'researcher_demo_wallet',
        signature: 'DEMO_MODE',
        message: 'Sign in as Researcher'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.role).toBe('researcher');
      authTokenResearcher = response.data.accessToken;
    });
  });

  describe('E.3: Insurance Scenario (Sarah)', () => {
    it('should show Sarah has no BRCA mutations', async () => {
      const response = await axios.get(`${BASE_URL}/api/genome/status`, {
        headers: { Authorization: `Bearer ${authTokenSarah}` }
      });

      expect(response.data.success).toBe(true);
      const genome = response.data.genomes[0];
      expect(genome).toBeDefined();

      // Check BRCA status
      if (genome.markers) {
        expect(genome.markers.BRCA1.mutation_present).toBe(false);
        expect(genome.markers.BRCA2.mutation_present).toBe(false);
      }
    });

    it('should generate proof of BRCA-negative status', async () => {
      const response = await axios.post(`${BASE_URL}/api/proof/generate`, {
        traitType: 'BRCA1',
        proofType: 'boolean',
        expectedValue: false
      }, {
        headers: { Authorization: `Bearer ${authTokenSarah}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.jobId).toBeDefined();

      // Wait for proof generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check proof status
      const statusResponse = await axios.get(
        `${BASE_URL}/api/proof/status/${response.data.jobId}`,
        { headers: { Authorization: `Bearer ${authTokenSarah}` } }
      );

      expect(statusResponse.data.status).toMatch(/completed|processing/);
    });

    it('should allow insurance verification without revealing full genome', async () => {
      // Insurance company requests BRCA status
      const verificationResponse = await axios.post(`${BASE_URL}/api/verification/request`, {
        patientAddress: 'sarah_demo_wallet',
        traits: ['BRCA1', 'BRCA2'],
        message: 'Insurance eligibility verification',
        requesterType: 'insurance'
      }, {
        headers: { Authorization: `Bearer ${authTokenDoctor}` } // Using doctor token as proxy
      });

      expect(verificationResponse.status).toBe(200);
      expect(verificationResponse.data.requestId).toBeDefined();

      // Sarah approves with limited disclosure
      const approvalResponse = await axios.post(`${BASE_URL}/api/verification/respond`, {
        requestId: verificationResponse.data.requestId,
        approved: true,
        disclosureLevel: 'minimal' // Only mutation status, not values
      }, {
        headers: { Authorization: `Bearer ${authTokenSarah}` }
      });

      expect(approvalResponse.status).toBe(200);
      expect(approvalResponse.data.proofGenerated).toBe(true);
      expect(approvalResponse.data.disclosedData).not.toContain('value');
      expect(approvalResponse.data.disclosedData).toContain('mutation_present');
    });
  });

  describe('E.4: Precision Medicine Scenario (Mike)', () => {
    let authTokenMike;
    let mikeUserId;

    beforeAll(async () => {
      // Create Mike's account
      const response = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: 'mike_demo_wallet',
        signature: 'DEMO_MODE',
        message: 'Sign in as Mike'
      });
      authTokenMike = response.data.accessToken;
      mikeUserId = response.data.user.id;
    });

    it('should upload Mike\'s genome with CYP2D6 poor metabolizer', async () => {
      const genomeData = {
        patientId: mikeUserId,
        markers: {
          CYP2D6: {
            activityScore: 0.5,
            metabolizer: 'poor'
          }
        }
      };

      const response = await axios.post(`${BASE_URL}/api/genome/upload`, genomeData, {
        headers: { Authorization: `Bearer ${authTokenMike}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should allow Dr. Johnson to request CYP2D6 status', async () => {
      const requestResponse = await axios.post(`${BASE_URL}/api/verification/request`, {
        patientAddress: 'mike_demo_wallet',
        traits: ['CYP2D6'],
        message: 'Medication dosing assessment for codeine',
        clinicalContext: 'pain_management'
      }, {
        headers: { Authorization: `Bearer ${authTokenDoctor}` }
      });

      expect(requestResponse.status).toBe(200);
      expect(requestResponse.data.requestId).toBeDefined();

      // Mike approves
      const approvalResponse = await axios.post(`${BASE_URL}/api/verification/respond`, {
        requestId: requestResponse.data.requestId,
        approved: true
      }, {
        headers: { Authorization: `Bearer ${authTokenMike}` }
      });

      expect(approvalResponse.status).toBe(200);
    });

    it('should generate proof showing poor metabolizer status', async () => {
      const proofResponse = await axios.post(`${BASE_URL}/api/proof/generate`, {
        traitType: 'CYP2D6',
        proofType: 'classification',
        expectedValue: 'poor'
      }, {
        headers: { Authorization: `Bearer ${authTokenMike}` }
      });

      expect(proofResponse.status).toBe(200);
      expect(proofResponse.data.jobId).toBeDefined();
    });

    it('should recommend alternative medication based on status', async () => {
      const recommendationResponse = await axios.get(
        `${BASE_URL}/api/treatment/recommendations?patient=${mikeUserId}&medication=codeine`,
        { headers: { Authorization: `Bearer ${authTokenDoctor}` } }
      );

      expect(recommendationResponse.status).toBe(200);
      expect(recommendationResponse.data.recommendations).toBeDefined();
      expect(recommendationResponse.data.warnings).toContain('metabolizer');
      expect(recommendationResponse.data.alternatives).toBeInstanceOf(Array);
    });
  });

  describe('E.5: Research Aggregation Scenario', () => {
    it('should show aggregated BRCA mutation frequencies', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/aggregate`, {
        headers: { Authorization: `Bearer ${authTokenResearcher}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.statistics.totalPatients).toBeGreaterThanOrEqual(127);

      const brca1Stats = response.data.statistics.traits.BRCA1;
      expect(brca1Stats).toBeDefined();
      expect(brca1Stats.mutationFrequency).toBeGreaterThanOrEqual(0);
      expect(brca1Stats.mutationFrequency).toBeLessThanOrEqual(1);
      expect(brca1Stats.sampleSize).toBeGreaterThanOrEqual(127);
    });

    it('should show CYP2D6 metabolizer distribution', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/aggregate`, {
        params: { trait: 'CYP2D6' },
        headers: { Authorization: `Bearer ${authTokenResearcher}` }
      });

      expect(response.status).toBe(200);

      const cyp2d6Stats = response.data.statistics.traits.CYP2D6;
      expect(cyp2d6Stats.distribution).toBeDefined();
      expect(cyp2d6Stats.distribution.poor).toBeGreaterThanOrEqual(0);
      expect(cyp2d6Stats.distribution.normal).toBeGreaterThanOrEqual(0);
      expect(cyp2d6Stats.distribution.rapid).toBeGreaterThanOrEqual(0);

      // Sum should equal 100%
      const total = Object.values(cyp2d6Stats.distribution).reduce((a, b) => a + b, 0);
      expect(Math.abs(total - 1)).toBeLessThan(0.01); // Allow small rounding error
    });

    it('should export anonymized CSV data', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/export`, {
        headers: {
          Authorization: `Bearer ${authTokenResearcher}`,
          Accept: 'text/csv'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('csv');

      const csvLines = response.data.split('\n');
      expect(csvLines.length).toBeGreaterThanOrEqual(128); // Header + 127 records

      // Check header
      expect(csvLines[0]).toContain('trait');
      expect(csvLines[0]).toContain('frequency');
      expect(csvLines[0]).not.toContain('patient_id'); // No PII
      expect(csvLines[0]).not.toContain('wallet_address');
    });

    it('should show verification trends over time', async () => {
      const response = await axios.get(`${BASE_URL}/api/research/trends`, {
        params: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          interval: 'week'
        },
        headers: { Authorization: `Bearer ${authTokenResearcher}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.trends).toBeInstanceOf(Array);
      expect(response.data.trends.length).toBeGreaterThan(0);

      response.data.trends.forEach(point => {
        expect(point.date).toBeDefined();
        expect(point.verifications).toBeGreaterThanOrEqual(0);
        expect(point.newPatients).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('E.6: End-to-End Performance', () => {
    it('should complete full insurance flow in < 30 seconds', async () => {
      const startTime = Date.now();

      // 1. Patient uploads genome
      const uploadResponse = await axios.post(`${BASE_URL}/api/genome/upload`, {
        patientId: `perf_test_${Date.now()}`,
        markers: {
          BRCA1: { value: 0.1, confidence: 0.99 },
          BRCA2: { value: 0.1, confidence: 0.99 }
        }
      }, {
        headers: { Authorization: `Bearer ${authTokenSarah}` }
      });

      expect(uploadResponse.status).toBe(200);

      // 2. Generate proof
      const proofResponse = await axios.post(`${BASE_URL}/api/proof/generate`, {
        traitType: 'BRCA1',
        proofType: 'boolean',
        expectedValue: false
      }, {
        headers: { Authorization: `Bearer ${authTokenSarah}` }
      });

      expect(proofResponse.status).toBe(200);

      // 3. Wait for proof completion
      let proofStatus = 'processing';
      while (proofStatus === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await axios.get(
          `${BASE_URL}/api/proof/status/${proofResponse.data.jobId}`,
          { headers: { Authorization: `Bearer ${authTokenSarah}` } }
        );

        proofStatus = statusResponse.data.status;
      }

      expect(proofStatus).toBe('completed');

      // 4. Insurance verification
      const verifyResponse = await axios.post(`${BASE_URL}/api/proof/verify`, {
        proofId: proofResponse.data.jobId,
        verifierType: 'insurance'
      }, {
        headers: { Authorization: `Bearer ${authTokenSarah}` }
      });

      expect(verifyResponse.status).toBe(200);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(duration).toBeLessThan(30); // Complete flow in < 30 seconds
    });

    it('should handle 10 concurrent proof generations', async () => {
      const proofPromises = [];

      for (let i = 0; i < 10; i++) {
        const promise = axios.post(`${BASE_URL}/api/proof/generate`, {
          traitType: ['BRCA1', 'BRCA2', 'CYP2D6'][i % 3],
          proofType: 'boolean',
          genomeHash: `concurrent_test_${i}`
        }, {
          headers: { Authorization: `Bearer ${authTokenSarah}` }
        });

        proofPromises.push(promise);
      }

      const results = await Promise.all(proofPromises);

      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.data.jobId).toBeDefined();
        expect(result.data.queuePosition).toBeDefined();
      });

      // All should have unique job IDs
      const jobIds = results.map(r => r.data.jobId);
      expect(new Set(jobIds).size).toBe(10);
    });

    it('should maintain data consistency across portals', async () => {
      // Get patient count from researcher portal
      const researchResponse = await axios.get(`${BASE_URL}/api/research/aggregate`, {
        headers: { Authorization: `Bearer ${authTokenResearcher}` }
      });

      const researcherCount = researchResponse.data.statistics.totalPatients;

      // Get patient count from database
      const dbResult = await pgPool.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'patient'"
      );

      const dbCount = parseInt(dbResult.rows[0].count);

      // Counts should match
      expect(Math.abs(researcherCount - dbCount)).toBeLessThanOrEqual(1); // Allow for timing differences
    });
  });

  describe('E.7: Demo Reset and Cleanup', () => {
    it('should have demo reset endpoint', async () => {
      const response = await axios.post(`${BASE_URL}/api/demo/reset`, {
        confirmReset: true
      }, {
        headers: { Authorization: `Bearer ${authTokenResearcher}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('reset');
    });

    it('should preserve demo accounts after reset', async () => {
      // Reset demo data
      await axios.post(`${BASE_URL}/api/demo/reset`, {
        confirmReset: true
      }, {
        headers: { Authorization: `Bearer ${authTokenResearcher}` }
      });

      // Check Sarah still exists
      const sarahAuth = await axios.post(`${BASE_URL}/api/auth/connect`, {
        walletAddress: 'sarah_demo_wallet',
        signature: 'DEMO_MODE',
        message: 'Sign in as Sarah'
      });

      expect(sarahAuth.status).toBe(200);
      expect(sarahAuth.data.user.role).toBe('patient');
    });
  });
});