/**
 * Unit tests for Enhanced WebSocket Service
 */

import { EnhancedSocketService } from './enhanced-socket.service';
import { Server as HTTPServer } from 'http';
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@config/index', () => ({
  config: {
    JWT_SECRET: 'test-secret',
    CORS_ORIGIN: 'http://localhost:5173'
  }
}));

jest.mock('@config/redis', () => ({
  redis: {
    setex: jest.fn()
  }
}));

jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock socket.io
jest.mock('socket.io', () => {
  const mockEmit = jest.fn();
  const mockTo = jest.fn(() => ({ emit: mockEmit }));
  const mockOn = jest.fn();
  const mockUse = jest.fn();

  return {
    Server: jest.fn().mockImplementation(() => ({
      on: mockOn,
      use: mockUse,
      to: mockTo,
      emit: mockEmit,
      disconnectSockets: jest.fn(),
      close: jest.fn()
    }))
  };
});

describe('EnhancedSocketService', () => {
  let service: EnhancedSocketService;
  let mockHttpServer: HTTPServer;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnhancedSocketService();
    mockHttpServer = {} as HTTPServer;
  });

  describe('Initialization', () => {
    it('should initialize WebSocket server with correct configuration', () => {
      service.initialize(mockHttpServer);

      const { Server } = require('socket.io');
      expect(Server).toHaveBeenCalledWith(mockHttpServer, {
        cors: {
          origin: 'http://localhost:5173',
          credentials: true
        },
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        pingTimeout: 60000,
        pingInterval: 25000
      });
    });

    it('should setup middleware and handlers', () => {
      service.initialize(mockHttpServer);

      const mockIo = (service as any).io;
      expect(mockIo.use).toHaveBeenCalled();
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('Authentication', () => {
    it('should authenticate valid JWT token', async () => {
      service.initialize(mockHttpServer);

      const mockSocket = {
        handshake: {
          auth: {
            token: jwt.sign(
              { userId: 'user-123', role: 'patient', walletAddress: '0xWallet' },
              'test-secret'
            )
          }
        },
        data: {}
      } as any;

      const mockNext = jest.fn();
      const middleware = (service as any).io.use.mock.calls[0][0];

      await middleware(mockSocket, mockNext);

      expect(mockSocket.data.userId).toBe('user-123');
      expect(mockSocket.data.role).toBe('patient');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid JWT token', async () => {
      service.initialize(mockHttpServer);

      const mockSocket = {
        handshake: {
          auth: {
            token: 'invalid-token'
          }
        },
        data: {}
      } as any;

      const mockNext = jest.fn();
      const middleware = (service as any).io.use.mock.calls[0][0];

      await middleware(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe('Authentication failed');
    });

    it('should reject missing token', async () => {
      service.initialize(mockHttpServer);

      const mockSocket = {
        handshake: { auth: {} },
        data: {}
      } as any;

      const mockNext = jest.fn();
      const middleware = (service as any).io.use.mock.calls[0][0];

      await middleware(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new Error('No authentication token provided')
      );
    });
  });

  describe('Proof Progress Events', () => {
    beforeEach(() => {
      service.initialize(mockHttpServer);
    });

    it('should emit proof progress to user rooms', () => {
      const mockIo = (service as any).io;
      const mockEmit = jest.fn();
      mockIo.to.mockReturnValue({ emit: mockEmit });

      service.emitProofProgress('user-123', 50, {
        jobId: 'job-456',
        stage: 'Generating proof',
        traitType: 'BRCA1'
      });

      expect(mockIo.to).toHaveBeenCalledWith('user:user-123');
      expect(mockIo.to).toHaveBeenCalledWith('patient:user-123');
      expect(mockIo.to).toHaveBeenCalledWith('proof:job-456');

      expect(mockEmit).toHaveBeenCalledWith('proof:progress', {
        jobId: 'job-456',
        progress: 50,
        stage: 'Generating proof',
        traitType: 'BRCA1'
      });
    });

    it('should emit proof error to user', () => {
      const mockIo = (service as any).io;
      const mockEmit = jest.fn();
      mockIo.to.mockReturnValue({ emit: mockEmit });

      const error = {
        message: 'Proof generation failed',
        code: 'PROOF_ERROR'
      };

      service.emitProofError('user-123', error);

      expect(mockIo.to).toHaveBeenCalledWith('user:user-123');
      expect(mockEmit).toHaveBeenCalledWith('proof:error', {
        ...error,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Verification Notifications', () => {
    beforeEach(() => {
      service.initialize(mockHttpServer);
    });

    it('should notify patient of verification request', () => {
      const mockIo = (service as any).io;
      const mockEmit = jest.fn();
      mockIo.to.mockReturnValue({ emit: mockEmit });

      service.notifyVerificationRequest('patient-123', 'Dr. Smith', 'req-456');

      expect(mockIo.to).toHaveBeenCalledWith('user:patient-123');
      expect(mockIo.to).toHaveBeenCalledWith('patient:patient-123');

      expect(mockEmit).toHaveBeenCalledWith('verification:request', {
        from: 'Dr. Smith',
        timestamp: expect.any(Date),
        action: 'REVIEW_REQUIRED',
        requestId: 'req-456'
      });
    });

    it('should notify doctor of verification approval', () => {
      const mockIo = (service as any).io;
      const mockEmit = jest.fn();
      mockIo.to.mockReturnValue({ emit: mockEmit });

      service.notifyVerificationApproval('doctor-123', 'patient-456', 'req-789');

      expect(mockIo.to).toHaveBeenCalledWith('user:doctor-123');
      expect(mockEmit).toHaveBeenCalledWith('verification:approved', {
        patientId: 'patient-456',
        requestId: 'req-789',
        status: 'approved',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Research Updates', () => {
    it('should broadcast research data update', () => {
      service.initialize(mockHttpServer);

      const mockIo = (service as any).io;
      const mockEmit = jest.fn();
      mockIo.to.mockReturnValue({ emit: mockEmit });

      const data = {
        newRecords: 5,
        totalRecords: 132
      };

      service.broadcastResearchUpdate(data);

      expect(mockIo.to).toHaveBeenCalledWith('research:updates');
      expect(mockEmit).toHaveBeenCalledWith('data:updated', {
        ...data,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('User Connection Management', () => {
    it('should track user connections', () => {
      service.initialize(mockHttpServer);

      const user = {
        userId: 'user-123',
        role: 'patient' as const,
        walletAddress: '0xWallet'
      };

      (service as any).addUserConnection('socket-1', user);

      expect(service.isUserConnected('user-123')).toBe(true);
      expect(service.getConnectedUsersCount()).toBe(1);
    });

    it('should handle multiple connections per user', () => {
      service.initialize(mockHttpServer);

      const user = {
        userId: 'user-123',
        role: 'patient' as const,
        walletAddress: '0xWallet'
      };

      (service as any).addUserConnection('socket-1', user);
      (service as any).addUserConnection('socket-2', user);

      expect(service.isUserConnected('user-123')).toBe(true);
      expect(service.getConnectedUsersCount()).toBe(1); // Still 1 user

      // Remove one connection
      (service as any).removeUserConnection('socket-1');
      expect(service.isUserConnected('user-123')).toBe(true);

      // Remove all connections
      (service as any).removeUserConnection('socket-2');
      expect(service.isUserConnected('user-123')).toBe(false);
    });

    it('should get connected users by role', () => {
      service.initialize(mockHttpServer);

      (service as any).addUserConnection('socket-1', {
        userId: 'patient-1',
        role: 'patient',
        walletAddress: '0x1'
      });

      (service as any).addUserConnection('socket-2', {
        userId: 'doctor-1',
        role: 'doctor',
        walletAddress: '0x2'
      });

      (service as any).addUserConnection('socket-3', {
        userId: 'patient-2',
        role: 'patient',
        walletAddress: '0x3'
      });

      const patients = service.getConnectedUsersByRole('patient');
      expect(patients).toEqual(['patient-1', 'patient-2']);

      const doctors = service.getConnectedUsersByRole('doctor');
      expect(doctors).toEqual(['doctor-1']);
    });
  });

  describe('Direct User Communication', () => {
    it('should emit events to specific user', () => {
      service.initialize(mockHttpServer);

      const mockIo = (service as any).io;
      const mockEmit = jest.fn();
      mockIo.to.mockReturnValue({ emit: mockEmit });

      const eventData = { message: 'Test message' };
      service.emitToUser('user-123', 'custom:event', eventData);

      expect(mockIo.to).toHaveBeenCalledWith('user:user-123');
      expect(mockEmit).toHaveBeenCalledWith('custom:event', eventData);
    });
  });

  describe('Shutdown', () => {
    it('should gracefully shutdown WebSocket server', async () => {
      service.initialize(mockHttpServer);

      const mockIo = (service as any).io;

      await service.shutdown();

      expect(mockIo.emit).toHaveBeenCalledWith('server:shutdown', {
        message: 'Server shutting down',
        timestamp: expect.any(Date)
      });

      expect(mockIo.disconnectSockets).toHaveBeenCalled();
      expect(mockIo.close).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle null io instance gracefully', () => {
      // Don't initialize, so io is null
      expect(() => {
        service.emitProofProgress('user-123', 50);
      }).not.toThrow();

      expect(() => {
        service.notifyVerificationRequest('patient-123', 'Dr. Smith', 'req-123');
      }).not.toThrow();
    });
  });
});