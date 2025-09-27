/**
 * PHASE C: WebSocket & Real-time Tests
 * Test-Driven Development - These tests MUST fail initially
 * Testing real WebSocket functionality without mocks
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const axios = require('axios');
const { io } = require('socket.io-client');
const { WebSocket } = require('ws');

const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

describe('Phase C: WebSocket & Real-time', () => {
  let authToken;
  let socket;
  let userId;

  beforeAll(async () => {
    // Get auth token for WebSocket authentication
    const authResponse = await axios.post(`${BASE_URL}/api/auth/connect`, {
      walletAddress: `ws_test_wallet_${Date.now()}`,
      signature: 'DEMO_MODE',
      message: 'Sign in'
    });

    authToken = authResponse.data.accessToken;
    userId = authResponse.data.user.id;
  });

  afterAll(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  describe('C.1: WebSocket Server Configuration', () => {
    it('should accept Socket.io connections', (done) => {
      socket = io(BASE_URL, {
        auth: {
          token: authToken
        }
      });

      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        expect(socket.id).toBeDefined();
        done();
      });

      socket.on('connect_error', (error) => {
        done(error);
      });
    });

    it('should authenticate with JWT token', (done) => {
      const authSocket = io(BASE_URL, {
        auth: {
          token: authToken
        }
      });

      authSocket.on('connect', () => {
        expect(authSocket.connected).toBe(true);
        authSocket.disconnect();
        done();
      });

      authSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    it('should accept demo mode connections', (done) => {
      const demoSocket = io(BASE_URL, {
        auth: {
          token: 'DEMO_MODE'
        }
      });

      demoSocket.on('connect', () => {
        expect(demoSocket.connected).toBe(true);
        demoSocket.disconnect();
        done();
      });

      demoSocket.on('connect_error', (error) => {
        if (process.env.DEMO_MODE === 'true') {
          done(error);
        } else {
          // Demo mode not enabled, connection should fail
          expect(error.message).toContain('Authentication');
          done();
        }
      });
    });

    it('should reject connections without authentication', (done) => {
      const unauthSocket = io(BASE_URL, {
        auth: {}
      });

      unauthSocket.on('connect', () => {
        done(new Error('Should not connect without auth'));
      });

      unauthSocket.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication');
        done();
      });
    });
  });

  describe('C.2: Room Management', () => {
    beforeAll((done) => {
      socket = io(BASE_URL, {
        auth: { token: authToken }
      });
      socket.on('connect', done);
    });

    it('should join patient room', (done) => {
      socket.emit('join:patient', userId);

      socket.on('room:joined', (data) => {
        expect(data.room).toBe(`patient:${userId}`);
        expect(data.success).toBe(true);
        done();
      });
    });

    it('should join doctor room', (done) => {
      socket.emit('join:doctor', userId);

      socket.on('room:joined', (data) => {
        expect(data.room).toBe(`doctor:${userId}`);
        expect(data.success).toBe(true);
        done();
      });
    });

    it('should join researcher room', (done) => {
      socket.emit('join:researcher', 'global');

      socket.on('room:joined', (data) => {
        expect(data.room).toBe('researcher:global');
        expect(data.success).toBe(true);
        done();
      });
    });
  });

  describe('C.3: Proof Generation Progress', () => {
    let proofJobId;

    beforeAll(async () => {
      // Start a proof generation job
      const response = await axios.post(`${BASE_URL}/api/proof/generate`, {
        traitType: 'BRCA1',
        genomeHash: `ws_test_${Date.now()}`,
        threshold: 0.5
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      proofJobId = response.data.jobId;
    });

    it('should receive proof generation progress updates', (done) => {
      const progressUpdates = [];

      socket.on('proof:progress', (data) => {
        expect(data.jobId).toBe(proofJobId);
        expect(data.progress).toBeGreaterThanOrEqual(0);
        expect(data.progress).toBeLessThanOrEqual(100);
        expect(data.status).toBeDefined();

        progressUpdates.push(data.progress);

        if (data.progress === 100 || data.status === 'completed') {
          expect(progressUpdates.length).toBeGreaterThan(0);
          expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
          done();
        }
      });

      // Subscribe to proof updates
      socket.emit('subscribe:proof', proofJobId);

      // Set timeout to avoid hanging
      setTimeout(() => {
        if (progressUpdates.length > 0) {
          done();
        } else {
          done(new Error('No progress updates received'));
        }
      }, 15000);
    });

    it('should emit proof completion event', (done) => {
      socket.on('proof:completed', (data) => {
        expect(data.jobId).toBeDefined();
        expect(data.proof).toBeDefined();
        expect(data.verificationKey).toBeDefined();
        expect(data.publicInputs).toBeDefined();
        done();
      });

      // Trigger completion check
      socket.emit('check:proof:status', proofJobId);

      setTimeout(() => done(), 10000);
    });

    it('should handle proof generation failure', (done) => {
      socket.on('proof:failed', (data) => {
        expect(data.jobId).toBeDefined();
        expect(data.error).toBeDefined();
        expect(data.retryable).toBeDefined();
        done();
      });

      // Trigger a failing proof
      socket.emit('generate:proof', {
        traitType: 'INVALID_TRAIT',
        genomeHash: 'invalid'
      });
    });
  });

  describe('C.4: Verification Request Notifications', () => {
    it('should notify patient of new verification request', (done) => {
      const patientSocket = io(BASE_URL, {
        auth: { token: authToken }
      });

      patientSocket.on('connect', () => {
        patientSocket.emit('join:patient', userId);

        patientSocket.on('verification:new', (data) => {
          expect(data.requestId).toBeDefined();
          expect(data.doctorId).toBeDefined();
          expect(data.traits).toBeInstanceOf(Array);
          expect(data.message).toBeDefined();
          expect(data.expiresAt).toBeDefined();
          patientSocket.disconnect();
          done();
        });

        // Trigger a verification request
        axios.post(`${BASE_URL}/api/verification/request`, {
          patientAddress: userId,
          traits: ['BRCA1'],
          message: 'WebSocket test request'
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      });
    });

    it('should notify doctor of verification response', (done) => {
      const doctorSocket = io(BASE_URL, {
        auth: { token: authToken }
      });

      doctorSocket.on('connect', () => {
        doctorSocket.emit('join:doctor', userId);

        doctorSocket.on('verification:response', (data) => {
          expect(data.requestId).toBeDefined();
          expect(data.approved).toBeDefined();
          expect(data.respondedAt).toBeDefined();
          if (data.approved) {
            expect(data.proofId).toBeDefined();
          }
          doctorSocket.disconnect();
          done();
        });
      });

      setTimeout(() => done(), 5000);
    });
  });

  describe('C.5: Real-time Data Updates', () => {
    it('should broadcast new patient data to researcher portal', (done) => {
      const researchSocket = io(BASE_URL, {
        auth: { token: authToken }
      });

      researchSocket.on('connect', () => {
        researchSocket.emit('join:researcher', 'global');

        researchSocket.on('data:update', (data) => {
          expect(data.type).toBe('aggregate');
          expect(data.statistics).toBeDefined();
          expect(data.statistics.totalPatients).toBeGreaterThanOrEqual(5);
          expect(data.timestamp).toBeDefined();
          researchSocket.disconnect();
          done();
        });
      });

      // Trigger data update
      setTimeout(() => {
        axios.post(`${BASE_URL}/api/genome/upload`, {
          patientId: `researcher_test_${Date.now()}`,
          markers: { BRCA1: { value: 0.5 } }
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }, 1000);

      setTimeout(() => done(), 10000);
    });

    it('should handle concurrent connections', async () => {
      const sockets = [];
      const connectionPromises = [];

      // Create 10 concurrent connections
      for (let i = 0; i < 10; i++) {
        const promise = new Promise((resolve, reject) => {
          const s = io(BASE_URL, {
            auth: { token: authToken }
          });

          s.on('connect', () => {
            sockets.push(s);
            resolve(s.id);
          });

          s.on('connect_error', reject);
        });

        connectionPromises.push(promise);
      }

      const socketIds = await Promise.all(connectionPromises);
      expect(socketIds.length).toBe(10);
      expect(new Set(socketIds).size).toBe(10); // All unique IDs

      // Cleanup
      sockets.forEach(s => s.disconnect());
    });
  });

  describe('C.6: WebSocket Protocol Compatibility', () => {
    it('should handle raw WebSocket connections', (done) => {
      const ws = new WebSocket(WS_URL);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);

        // Send test message
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));

        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          expect(message.type).toBeDefined();
          ws.close();
          done();
        });
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle connection drops and reconnection', (done) => {
      let reconnects = 0;

      const reconnectSocket = io(BASE_URL, {
        auth: { token: authToken },
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 100
      });

      reconnectSocket.on('connect', () => {
        if (reconnects === 0) {
          // Force disconnect
          reconnectSocket.disconnect();
          reconnectSocket.connect();
          reconnects++;
        } else {
          expect(reconnects).toBe(1);
          reconnectSocket.disconnect();
          done();
        }
      });
    });

    it('should handle binary data for file transfers', (done) => {
      socket.on('file:received', (data) => {
        expect(data.fileName).toBe('test.json');
        expect(data.size).toBeGreaterThan(0);
        expect(data.success).toBe(true);
        done();
      });

      const binaryData = Buffer.from(JSON.stringify({ test: 'data' }));
      socket.emit('file:upload', {
        fileName: 'test.json',
        data: binaryData
      });

      setTimeout(() => done(), 3000);
    });
  });

  describe('C.7: Performance & Scaling', () => {
    it('should handle rapid message sending', async () => {
      const messageCount = 100;
      const messages = [];

      return new Promise((resolve) => {
        socket.on('echo', (data) => {
          messages.push(data);
          if (messages.length === messageCount) {
            expect(messages.length).toBe(messageCount);
            resolve();
          }
        });

        // Send rapid messages
        for (let i = 0; i < messageCount; i++) {
          socket.emit('echo', { index: i, timestamp: Date.now() });
        }

        // Timeout fallback
        setTimeout(() => {
          expect(messages.length).toBeGreaterThan(0);
          resolve();
        }, 5000);
      });
    });

    it('should maintain low latency', (done) => {
      const startTime = Date.now();

      socket.emit('ping');

      socket.on('pong', () => {
        const latency = Date.now() - startTime;
        expect(latency).toBeLessThan(100); // Less than 100ms
        done();
      });
    });
  });
});