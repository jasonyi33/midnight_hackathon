#!/usr/bin/env node

/**
 * Test Runner for All Phase Tests
 * Runs all TDD tests and reports which ones are failing
 * These tests SHOULD fail initially as per TDD methodology
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const testFiles = [
  'phase-a-infrastructure.test.js',
  'phase-b-core-apis.test.js',
  'phase-c-websocket.test.js',
  'phase-d-frontend-integration.test.js',
  'phase-e-demo-data.test.js'
];

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  byPhase: {}
};

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\n${colors.cyan}Running ${testFile}...${colors.reset}`);

    const testPath = path.join(__dirname, testFile);

    if (!fs.existsSync(testPath)) {
      console.log(`${colors.yellow}⚠ Test file not found: ${testFile}${colors.reset}`);
      results.skipped++;
      resolve({ file: testFile, status: 'skipped' });
      return;
    }

    const jest = spawn('npx', ['jest', testPath, '--no-coverage', '--verbose'], {
      cwd: __dirname,
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let output = '';
    let errorOutput = '';

    jest.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    jest.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    jest.on('close', (code) => {
      const phase = testFile.match(/phase-([a-e])/)[1].toUpperCase();

      // Parse test results from output
      const testMatch = output.match(/Tests:\s+(\d+)\s+failed.*?(\d+)\s+passed.*?(\d+)\s+total/);
      const failedMatch = output.match(/(\d+)\s+failed/);
      const passedMatch = output.match(/(\d+)\s+passed/);

      let phaseResults = {
        file: testFile,
        status: code === 0 ? 'passed' : 'failed',
        tests: {
          failed: 0,
          passed: 0,
          total: 0
        }
      };

      if (failedMatch) {
        phaseResults.tests.failed = parseInt(failedMatch[1]);
      }
      if (passedMatch) {
        phaseResults.tests.passed = parseInt(passedMatch[1]);
      }
      phaseResults.tests.total = phaseResults.tests.failed + phaseResults.tests.passed;

      results.byPhase[phase] = phaseResults;
      results.total += phaseResults.tests.total;
      results.passed += phaseResults.tests.passed;
      results.failed += phaseResults.tests.failed;

      resolve(phaseResults);
    });
  });
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}${colors.blue}  TEST-DRIVEN DEVELOPMENT - PHASE TESTS${colors.reset}`);
  console.log(`${colors.cyan}  These tests SHOULD fail initially (TDD approach)${colors.reset}`);
  console.log('='.repeat(60));

  // Check if backend is running
  try {
    const axios = require('axios');
    await axios.get('http://localhost:3000/health');
    console.log(`${colors.green}✓ Backend is running${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Backend is not running on port 3000${colors.reset}`);
    console.log(`${colors.yellow}  Please start the backend before running tests${colors.reset}`);
  }

  // Check if frontend is running
  try {
    const axios = require('axios');
    await axios.get('http://localhost:5173');
    console.log(`${colors.green}✓ Frontend is running${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}⚠ Frontend is not running on port 5173${colors.reset}`);
    console.log(`${colors.yellow}  Frontend integration tests will fail${colors.reset}`);
  }

  console.log('\nStarting test execution...\n');

  // Run tests sequentially
  for (const testFile of testFiles) {
    await runTest(testFile);
  }

  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}${colors.blue}  TEST SUMMARY REPORT${colors.reset}`);
  console.log('='.repeat(60));

  console.log(`\n${colors.bold}Overall Results:${colors.reset}`);
  console.log(`  Total Tests: ${results.total}`);
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);

  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(`  Pass Rate: ${passRate}%`);

  console.log(`\n${colors.bold}Results by Phase:${colors.reset}`);
  Object.entries(results.byPhase).forEach(([phase, data]) => {
    const phasePassRate = data.tests.total > 0
      ? ((data.tests.passed / data.tests.total) * 100).toFixed(1)
      : 0;

    const statusColor = data.status === 'passed' ? colors.green : colors.red;
    const statusSymbol = data.status === 'passed' ? '✓' : '✗';

    console.log(`\n  ${colors.bold}Phase ${phase}:${colors.reset} ${statusColor}${statusSymbol}${colors.reset}`);
    console.log(`    File: ${data.file}`);
    console.log(`    Tests: ${data.tests.passed}/${data.tests.total} passed (${phasePassRate}%)`);
  });

  // TDD Expectations
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}${colors.cyan}  TDD EXPECTATIONS${colors.reset}`);
  console.log('='.repeat(60));

  if (results.failed > results.passed) {
    console.log(`${colors.green}✓ CORRECT: Most tests are failing as expected in TDD${colors.reset}`);
    console.log(`  This confirms no mock implementations exist yet`);
  } else {
    console.log(`${colors.yellow}⚠ UNEXPECTED: Many tests are passing${colors.reset}`);
    console.log(`  In TDD, tests should fail before implementation`);
  }

  console.log(`\n${colors.bold}Next Steps:${colors.reset}`);
  console.log('1. Review failing tests to understand requirements');
  console.log('2. Implement functionality to make tests pass');
  console.log('3. Refactor code while keeping tests green');
  console.log('4. Repeat for each phase');

  // Implementation guidance
  console.log(`\n${colors.bold}Implementation Priority:${colors.reset}`);

  const phases = ['A', 'B', 'C', 'D', 'E'];
  phases.forEach(phase => {
    const phaseData = results.byPhase[phase];
    if (phaseData && phaseData.tests.failed > 0) {
      const priority = phase === 'A' ? 'CRITICAL' :
                      phase === 'B' ? 'HIGH' :
                      phase === 'C' ? 'MEDIUM' : 'LOW';
      const priorityColor = priority === 'CRITICAL' ? colors.red :
                          priority === 'HIGH' ? colors.yellow :
                          colors.cyan;

      console.log(`  Phase ${phase}: ${priorityColor}${priority}${colors.reset} - ${phaseData.tests.failed} failing tests`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}Run individual phase tests:${colors.reset}`);
  testFiles.forEach(file => {
    console.log(`  npx jest ${file}`);
  });
  console.log('='.repeat(60));

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(console.error);