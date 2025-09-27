#!/usr/bin/env node

/**
 * Backend Phase 3 Functionality Test
 * Tests all backend components through Phase 3
 */

const axios = require('axios');
const { WebSocket } = require('ws');

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let testResults = [];
let authToken = null;

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}\n${'─'.repeat(40)}`)
};

// Helper to track test results
function trackTest(name, passed, error = null) {
  testResults.push({ name, passed, error });
  if (passed) {
    log.success(name);
  } else {
    log.error(`${name}: ${error?.message || 'Failed'}`);
  }
}

// Test utilities
async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) config.data = data;

    const response = await axios(config);
    trackTest(name, true);
    return response.data;
  } catch (error) {
    trackTest(name, false, error.response?.data || error);
    return null;
  }
}

// Phase 1: Foundation Tests
async function testPhase1() {
  log.section('PHASE 1: FOUNDATION TESTS');

  // 1.1 Health Check
  const health = await testEndpoint('Health Check', 'GET', '/health');

  // 1.2 Authentication with demo mode
  const authData = await testEndpoint('Authentication (Demo Mode)', 'POST', '/api/auth/connect', {
    walletAddress: 'demo_wallet_' + Date.now(),
    signature: 'DEMO_MODE',
    message: 'Sign in to Genomic Privacy DApp'
  });

  if (authData?.accessToken) {
    authToken = authData.accessToken;
    log.info(`Auth token received: ${authToken.substring(0, 20)}...`);
  }

  // 1.3 Database connectivity (through health check)
  if (health?.database) {
    trackTest('Database Connectivity', true);
  } else {
    trackTest('Database Connectivity', false, new Error('Database not connected'));
  }

  // 1.4 Redis connectivity
  if (health?.redis) {
    trackTest('Redis Connectivity', true);
  } else {
    trackTest('Redis Connectivity', false, new Error('Redis not connected'));
  }
}

// Phase 2: Core Features Tests
async function testPhase2() {
  log.section('PHASE 2: CORE FEATURES TESTS');

  if (!authToken) {
    log.error('No auth token available, skipping authenticated endpoints');
    return;
  }

  const authHeaders = { Authorization: `Bearer ${authToken}` };

  // 2.1 Genome Upload
  const genomeData = {
    patientId: 'test_patient_' + Date.now(),
    markers: {
      BRCA1: { value: 0.3, confidence: 0.98 },
      BRCA2: { value: 0.1, confidence: 0.99 },
      CYP2D6: { activityScore: 1.5, metabolizer: 'normal' }
    }
  };

  const uploadResult = await testEndpoint(
    'Genome Upload',
    'POST',
    '/api/genome/upload',
    genomeData,
    authHeaders
  );

  // 2.2 Proof Generation
  const proofRequest = {
    traitType: 'BRCA1',
    genomeHash: 'test_hash_' + Date.now(),
    threshold: 0.5
  };

  const proofResult = await testEndpoint(
    'Proof Generation',
    'POST',
    '/api/proof/generate',
    proofRequest,
    authHeaders
  );

  // 2.3 Proof Status Check
  if (proofResult?.jobId) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const statusResult = await testEndpoint(
      'Proof Status Check',
      'GET',
      `/api/proof/status/${proofResult.jobId}`,
      null,
      authHeaders
    );
  }

  // 2.4 Verification Request
  const verificationRequest = {
    patientAddress: 'patient_addr_' + Date.now(),
    traits: ['BRCA1', 'CYP2D6'],
    message: 'Request for treatment eligibility'
  };

  const verificationResult = await testEndpoint(
    'Verification Request',
    'POST',
    '/api/verification/request',
    verificationRequest,
    authHeaders
  );

  // 2.5 List Verification Requests
  await testEndpoint(
    'List Verification Requests',
    'GET',
    '/api/verification/list',
    null,
    authHeaders
  );
}

// Phase 3: Integration Tests
async function testPhase3() {
  log.section('PHASE 3: INTEGRATION TESTS');

  // 3.1 WebSocket Connection
  await testWebSocket();

  // 3.2 Data Aggregation
  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  await testEndpoint(
    'Research Aggregation',
    'GET',
    '/api/research/aggregate',
    null,
    authHeaders
  );

  // 3.3 Demo Data Verification
  await testEndpoint(
    'Demo Data Check',
    'GET',
    '/api/demo/status',
    null,
    authHeaders
  );
}

// WebSocket test
async function testWebSocket() {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:3000`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });

    const timeout = setTimeout(() => {
      trackTest('WebSocket Connection', false, new Error('Connection timeout'));
      ws.close();
      resolve();
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      trackTest('WebSocket Connection', true);

      // Test real-time message
      ws.send(JSON.stringify({
        type: 'ping',
        timestamp: Date.now()
      }));

      setTimeout(() => {
        ws.close();
        resolve();
      }, 1000);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        trackTest('WebSocket Real-time Message', true);
      } catch (error) {
        trackTest('WebSocket Real-time Message', false, error);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      trackTest('WebSocket Connection', false, error);
      resolve();
    });
  });
}

// Summary report
function generateReport() {
  log.section('TEST SUMMARY');

  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n${colors.bold}Results:${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`  Total: ${total}`);
  console.log(`  Success Rate: ${percentage}%`);

  if (failed > 0) {
    console.log(`\n${colors.bold}${colors.red}Failed Tests:${colors.reset}`);
    testResults
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error?.message || 'Unknown error'}`);
      });
  }

  console.log('\n' + '='.repeat(50));
  if (percentage >= 80) {
    console.log(`${colors.green}${colors.bold}✅ PHASE 3 BACKEND: FUNCTIONAL (${percentage}%)${colors.reset}`);
  } else if (percentage >= 60) {
    console.log(`${colors.yellow}${colors.bold}⚠️ PHASE 3 BACKEND: PARTIALLY FUNCTIONAL (${percentage}%)${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ PHASE 3 BACKEND: NOT FUNCTIONAL (${percentage}%)${colors.reset}`);
  }
  console.log('='.repeat(50));
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bold}${colors.cyan}  BACKEND PHASE 3 FUNCTIONALITY TEST${colors.reset}`);
  console.log(`${colors.cyan}  Testing all components through Phase 3${colors.reset}`);
  console.log('='.repeat(50));

  try {
    // Check if backend is running
    try {
      await axios.get(`${BASE_URL}/health`);
      log.success('Backend is running on port 3000');
    } catch (error) {
      log.error('Backend is not running! Please start it first.');
      process.exit(1);
    }

    // Run test phases
    await testPhase1();
    await testPhase2();
    await testPhase3();

  } catch (error) {
    console.error('Unexpected error during testing:', error);
  } finally {
    generateReport();
  }
}

// Run tests
runTests().catch(console.error);