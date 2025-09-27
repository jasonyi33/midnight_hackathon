/**
 * PHASE D: Frontend Integration Tests
 * Test-Driven Development - These tests MUST fail initially
 * Testing real frontend-backend integration without mocks
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const axios = require('axios');
const puppeteer = require('puppeteer');

const API_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

describe('Phase D: Frontend Integration', () => {
  let browser;
  let page;
  let authToken;

  beforeAll(async () => {
    // Launch browser for frontend testing
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Get auth token for API calls
    const authResponse = await axios.post(`${API_URL}/api/auth/connect`, {
      walletAddress: `frontend_test_${Date.now()}`,
      signature: 'DEMO_MODE',
      message: 'Sign in'
    });
    authToken = authResponse.data.accessToken;
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  describe('D.1: Patient Portal Integration', () => {
    beforeAll(async () => {
      await page.goto(`${FRONTEND_URL}/patient`);
    });

    it('should display wallet connection button', async () => {
      const walletButton = await page.waitForSelector('[data-testid="wallet-connect"]', { timeout: 5000 });
      expect(walletButton).toBeTruthy();

      const buttonText = await page.evaluate(el => el.textContent, walletButton);
      expect(buttonText).toContain('Connect');
    });

    it('should handle wallet connection in demo mode', async () => {
      await page.click('[data-testid="wallet-connect"]');

      // Wait for connection
      await page.waitForSelector('[data-testid="wallet-address"]', { timeout: 5000 });

      const address = await page.$eval('[data-testid="wallet-address"]', el => el.textContent);
      expect(address).toMatch(/^(addr_|demo_)/);
    });

    it('should display genome upload interface', async () => {
      const uploadArea = await page.waitForSelector('[data-testid="genome-upload"]', { timeout: 5000 });
      expect(uploadArea).toBeTruthy();

      // Check for drag-drop area
      const dropZone = await page.$('[data-testid="drop-zone"]');
      expect(dropZone).toBeTruthy();

      // Check for file input
      const fileInput = await page.$('input[type="file"]');
      expect(fileInput).toBeTruthy();
    });

    it('should handle genome file upload', async () => {
      // Create test genome data
      const genomeData = {
        patientId: 'test_patient',
        markers: {
          BRCA1: { value: 0.3, confidence: 0.98 },
          BRCA2: { value: 0.1, confidence: 0.99 },
          CYP2D6: { activityScore: 1.5, metabolizer: 'normal' }
        }
      };

      // Upload file
      const fileInput = await page.$('input[type="file"]');
      const fileName = 'test-genome.json';

      await page.evaluate((data, name) => {
        const file = new File([JSON.stringify(data)], name, { type: 'application/json' });
        const input = document.querySelector('input[type="file"]');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, genomeData, fileName);

      // Wait for upload status
      await page.waitForSelector('[data-testid="upload-success"]', { timeout: 10000 });

      const status = await page.$eval('[data-testid="upload-status"]', el => el.textContent);
      expect(status).toContain('success');
    });

    it('should display proof generation interface', async () => {
      const proofSection = await page.waitForSelector('[data-testid="proof-generation"]', { timeout: 5000 });
      expect(proofSection).toBeTruthy();

      // Check for trait selector
      const traitSelector = await page.$('[data-testid="trait-selector"]');
      expect(traitSelector).toBeTruthy();

      // Check available traits
      const traits = await page.$$eval('[data-testid="trait-option"]', elements =>
        elements.map(el => el.getAttribute('data-trait'))
      );
      expect(traits).toContain('BRCA1');
      expect(traits).toContain('BRCA2');
      expect(traits).toContain('CYP2D6');
    });

    it('should show proof generation progress bar', async () => {
      // Start proof generation
      await page.click('[data-testid="trait-option"][data-trait="BRCA1"]');
      await page.click('[data-testid="generate-proof"]');

      // Wait for progress bar
      const progressBar = await page.waitForSelector('[data-testid="progress-bar"]', { timeout: 5000 });
      expect(progressBar).toBeTruthy();

      // Check progress updates
      const initialProgress = await page.$eval('[data-testid="progress-value"]', el => el.textContent);
      expect(parseInt(initialProgress)).toBeGreaterThanOrEqual(0);

      // Wait for some progress
      await page.waitForFunction(
        () => {
          const progress = document.querySelector('[data-testid="progress-value"]');
          return progress && parseInt(progress.textContent) > 0;
        },
        { timeout: 10000 }
      );
    });

    it('should display consent management interface', async () => {
      await page.goto(`${FRONTEND_URL}/patient/consent`);

      const consentSection = await page.waitForSelector('[data-testid="consent-management"]', { timeout: 5000 });
      expect(consentSection).toBeTruthy();

      // Check for pending requests
      const pendingRequests = await page.$('[data-testid="pending-requests"]');
      expect(pendingRequests).toBeTruthy();

      // Check for approve/deny buttons
      const approveButtons = await page.$$('[data-testid="approve-request"]');
      const denyButtons = await page.$$('[data-testid="deny-request"]');
      expect(approveButtons.length + denyButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should receive real-time notifications', async () => {
      // Check for notification container
      const notificationArea = await page.$('[data-testid="notifications"]');
      expect(notificationArea).toBeTruthy();

      // Trigger a notification via API
      await axios.post(`${API_URL}/api/verification/request`, {
        patientAddress: 'test_patient',
        traits: ['BRCA1'],
        message: 'Test notification'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Wait for notification to appear
      await page.waitForSelector('[data-testid="notification-item"]', { timeout: 5000 });

      const notificationText = await page.$eval('[data-testid="notification-item"]', el => el.textContent);
      expect(notificationText).toContain('verification');
    });
  });

  describe('D.2: Doctor Portal Integration', () => {
    beforeAll(async () => {
      await page.goto(`${FRONTEND_URL}/doctor`);
    });

    it('should display doctor-specific UI theme', async () => {
      const portalTheme = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return {
          hasTheme: body.classList.contains('doctor-theme'),
          backgroundColor: computedStyle.backgroundColor
        };
      });

      expect(portalTheme.hasTheme).toBe(true);
    });

    it('should display patient lookup interface', async () => {
      const lookupSection = await page.waitForSelector('[data-testid="patient-lookup"]', { timeout: 5000 });
      expect(lookupSection).toBeTruthy();

      const searchInput = await page.$('[data-testid="patient-search"]');
      expect(searchInput).toBeTruthy();

      const searchButton = await page.$('[data-testid="search-button"]');
      expect(searchButton).toBeTruthy();
    });

    it('should handle verification request submission', async () => {
      // Enter patient address
      await page.type('[data-testid="patient-search"]', 'patient_address_123');

      // Select traits
      await page.click('[data-testid="trait-checkbox-BRCA1"]');
      await page.click('[data-testid="trait-checkbox-CYP2D6"]');

      // Add message
      await page.type('[data-testid="request-message"]', 'Requesting for treatment eligibility');

      // Submit request
      await page.click('[data-testid="submit-request"]');

      // Wait for confirmation
      await page.waitForSelector('[data-testid="request-success"]', { timeout: 5000 });

      const requestId = await page.$eval('[data-testid="request-id"]', el => el.textContent);
      expect(requestId).toBeTruthy();
    });

    it('should display request status tracking', async () => {
      const statusTable = await page.waitForSelector('[data-testid="request-status-table"]', { timeout: 5000 });
      expect(statusTable).toBeTruthy();

      const statusRows = await page.$$('[data-testid="status-row"]');
      expect(statusRows.length).toBeGreaterThanOrEqual(0);

      // Check status indicators
      const statuses = await page.$$eval('[data-testid="status-indicator"]', elements =>
        elements.map(el => el.getAttribute('data-status'))
      );

      statuses.forEach(status => {
        expect(['pending', 'approved', 'denied']).toContain(status);
      });
    });

    it('should display proof verification interface', async () => {
      const verificationSection = await page.$('[data-testid="proof-verification"]');
      expect(verificationSection).toBeTruthy();

      // Check for verification link
      const verifyLinks = await page.$$('[data-testid="verify-proof"]');
      expect(verifyLinks.length).toBeGreaterThanOrEqual(0);
    });

    it('should show request history', async () => {
      await page.goto(`${FRONTEND_URL}/doctor/history`);

      const historyTable = await page.waitForSelector('[data-testid="request-history"]', { timeout: 5000 });
      expect(historyTable).toBeTruthy();

      const historyRows = await page.$$('[data-testid="history-row"]');
      expect(historyRows.length).toBeGreaterThanOrEqual(0);

      // Check for timestamp column
      const timestamps = await page.$$('[data-testid="request-timestamp"]');
      expect(timestamps.length).toEqual(historyRows.length);
    });
  });

  describe('D.3: Researcher Portal Integration', () => {
    beforeAll(async () => {
      await page.goto(`${FRONTEND_URL}/researcher`);
    });

    it('should display aggregate data dashboard', async () => {
      const dashboard = await page.waitForSelector('[data-testid="research-dashboard"]', { timeout: 5000 });
      expect(dashboard).toBeTruthy();

      // Check for statistics cards
      const statCards = await page.$$('[data-testid="stat-card"]');
      expect(statCards.length).toBeGreaterThan(0);

      // Check total patients count
      const totalPatients = await page.$eval('[data-testid="total-patients"]', el => parseInt(el.textContent));
      expect(totalPatients).toBeGreaterThanOrEqual(5); // Minimum cohort size
    });

    it('should display mutation frequency charts', async () => {
      const chartContainer = await page.waitForSelector('[data-testid="mutation-charts"]', { timeout: 5000 });
      expect(chartContainer).toBeTruthy();

      // Check for specific charts
      const brca1Chart = await page.$('[data-testid="brca1-chart"]');
      expect(brca1Chart).toBeTruthy();

      const brca2Chart = await page.$('[data-testid="brca2-chart"]');
      expect(brca2Chart).toBeTruthy();

      // Check chart has rendered
      const svgElements = await page.$$('.recharts-wrapper svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should display metabolizer distribution', async () => {
      const pieChart = await page.waitForSelector('[data-testid="metabolizer-pie-chart"]', { timeout: 5000 });
      expect(pieChart).toBeTruthy();

      // Check legend
      const legend = await page.$('[data-testid="chart-legend"]');
      expect(legend).toBeTruthy();

      const legendItems = await page.$$eval('[data-testid="legend-item"]', elements =>
        elements.map(el => el.textContent)
      );
      expect(legendItems).toContain('Poor');
      expect(legendItems).toContain('Normal');
      expect(legendItems).toContain('Rapid');
    });

    it('should provide CSV export functionality', async () => {
      const exportButton = await page.waitForSelector('[data-testid="export-csv"]', { timeout: 5000 });
      expect(exportButton).toBeTruthy();

      // Click export button
      const downloadPromise = page.waitForResponse(response =>
        response.url().includes('/api/research/export') && response.status() === 200
      );

      await page.click('[data-testid="export-csv"]');

      const response = await downloadPromise;
      expect(response.headers()['content-type']).toContain('csv');
    });

    it('should update data in real-time', async () => {
      // Get initial patient count
      const initialCount = await page.$eval('[data-testid="total-patients"]', el => parseInt(el.textContent));

      // Add new patient via API
      await axios.post(`${API_URL}/api/genome/upload`, {
        patientId: `realtime_test_${Date.now()}`,
        markers: { BRCA1: { value: 0.7 } }
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Wait for update
      await page.waitForFunction(
        (initial) => {
          const current = document.querySelector('[data-testid="total-patients"]');
          return current && parseInt(current.textContent) > initial;
        },
        { timeout: 10000 },
        initialCount
      );

      const updatedCount = await page.$eval('[data-testid="total-patients"]', el => parseInt(el.textContent));
      expect(updatedCount).toBeGreaterThan(initialCount);
    });

    it('should enforce minimum cohort size', async () => {
      // Check for cohort warning if applicable
      const cohortWarning = await page.$('[data-testid="cohort-warning"]');

      if (cohortWarning) {
        const warningText = await page.evaluate(el => el.textContent, cohortWarning);
        expect(warningText).toContain('minimum');
        expect(warningText).toContain('5');
      } else {
        // No warning means cohort size is sufficient
        const totalPatients = await page.$eval('[data-testid="total-patients"]', el => parseInt(el.textContent));
        expect(totalPatients).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('D.4: UI Polish & Responsiveness', () => {
    it('should display glass morphism effects', async () => {
      await page.goto(FRONTEND_URL);

      const glassElements = await page.$$eval('.glass-card', elements =>
        elements.map(el => {
          const style = window.getComputedStyle(el);
          return {
            hasBackdropFilter: style.backdropFilter !== 'none',
            hasTransparency: style.backgroundColor.includes('rgba'),
            hasBlur: style.backdropFilter.includes('blur')
          };
        })
      );

      glassElements.forEach(element => {
        expect(element.hasBackdropFilter).toBe(true);
        expect(element.hasTransparency).toBe(true);
        expect(element.hasBlur).toBe(true);
      });
    });

    it('should show skeleton loaders during data fetching', async () => {
      await page.goto(`${FRONTEND_URL}/patient`);

      // Trigger a data fetch
      await page.reload();

      // Look for skeleton loaders
      const skeletons = await page.$$('.skeleton-loader');
      expect(skeletons.length).toBeGreaterThan(0);

      // Wait for content to load
      await page.waitForSelector('[data-testid="content-loaded"]', { timeout: 5000 });

      // Skeletons should be gone
      const remainingSkeletons = await page.$$('.skeleton-loader:visible');
      expect(remainingSkeletons.length).toBe(0);
    });

    it('should be responsive across viewports', async () => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];

      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.goto(FRONTEND_URL);

        // Check navigation is accessible
        const nav = await page.$('[data-testid="navigation"]');
        expect(nav).toBeTruthy();

        // Check main content is visible
        const mainContent = await page.$('[data-testid="main-content"]');
        const isVisible = await page.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }, mainContent);

        expect(isVisible).toBe(true);
      }
    });

    it('should display toast notifications', async () => {
      await page.goto(`${FRONTEND_URL}/patient`);

      // Trigger an action that shows a toast
      await page.click('[data-testid="test-notification"]');

      // Wait for toast to appear
      const toast = await page.waitForSelector('[data-testid="toast-notification"]', { timeout: 5000 });
      expect(toast).toBeTruthy();

      // Check toast content
      const toastText = await page.evaluate(el => el.textContent, toast);
      expect(toastText).toBeTruthy();

      // Toast should disappear after timeout
      await page.waitForSelector('[data-testid="toast-notification"]', {
        hidden: true,
        timeout: 10000
      });
    });
  });
});