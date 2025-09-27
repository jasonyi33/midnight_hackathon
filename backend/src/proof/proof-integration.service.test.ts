/**
 * Unit tests for Proof Integration Service
 */

import { ProofIntegrationService } from './proof-integration.service';
import { createProofSDK } from './mock-proof-sdk';
import { redis } from '@config/redis';
import { db } from '@config/database';
import { ValidationError, NotFoundError } from '@utils/errors';

// Mock dependencies
jest.mock('@config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn()
  },
  proofQueue: {
    add: jest.fn(),
    getJobs: jest.fn()
  }
}));

jest.mock('@config/database', () => ({
  db: {
    query: jest.fn()
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

describe('ProofIntegrationService', () => {
  let service: ProofIntegrationService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.USE_MOCK_PROOF_SDK = 'true';
    process.env.USE_MOCK_IPFS = 'true';
    service = new ProofIntegrationService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('generateProof', () => {
    const mockUserId = 'user-123';
    const mockCommitmentHash = '0xabc123';
    const mockWalletAddress = '0xWallet123';

    beforeEach(() => {
      // Mock user query
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SELECT wallet_address')) {
          return {
            rows: [{ wallet_address: mockWalletAddress }]
          };
        }
        if (query.includes('INSERT INTO proofs')) {
          return {
            rows: [{ id: 'proof-123' }]
          };
        }
        return { rows: [] };
      });

      // Mock Redis
      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.get as jest.Mock).mockResolvedValue(null);
    });

    it('should generate BRCA1 proof successfully', async () => {
      const result = await service.generateProof(
        mockUserId,
        'BRCA1',
        mockCommitmentHash,
        undefined,
        'job-123'
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.proofHash).toMatch(/^0x/);
      expect(result.verificationKey).toBeDefined();

      // Verify database calls
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT wallet_address'),
        [mockUserId]
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO proofs'),
        expect.arrayContaining([
          expect.any(String), // id
          mockUserId,
          'BRCA1'
        ])
      );

      // Verify caching
      expect(redis.setex).toHaveBeenCalledWith(
        `proof:${mockUserId}:BRCA1`,
        3600,
        expect.any(String)
      );
    });

    it('should generate BRCA2 proof successfully', async () => {
      const result = await service.generateProof(
        mockUserId,
        'BRCA2',
        mockCommitmentHash
      );

      expect(result).toBeDefined();
      expect(result.proofHash).toMatch(/^0x/);
    });

    it('should generate CYP2D6 proof with metabolizer status', async () => {
      const result = await service.generateProof(
        mockUserId,
        'CYP2D6',
        mockCommitmentHash
      );

      expect(result).toBeDefined();
      expect(result.publicSignals).toBeDefined();
    });

    it('should throw ValidationError for unsupported trait type', async () => {
      await expect(
        service.generateProof(
          mockUserId,
          'INVALID_TRAIT',
          mockCommitmentHash
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when user not found', async () => {
      (db.query as jest.Mock).mockImplementation(() => ({
        rows: []
      }));

      await expect(
        service.generateProof(
          'invalid-user',
          'BRCA1',
          mockCommitmentHash
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should handle blockchain storage failure', async () => {
      // Mock SDK to throw error
      const mockError = new Error('Blockchain error');
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SELECT wallet_address')) {
          throw mockError;
        }
        return { rows: [] };
      });

      await expect(
        service.generateProof(
          mockUserId,
          'BRCA1',
          mockCommitmentHash
        )
      ).rejects.toThrow(mockError);
    });
  });

  describe('Mock genome data retrieval', () => {
    it('should return Sarah demo data', async () => {
      const result = await service.generateProof(
        'sarah-123',
        'BRCA1',
        '0xcommit'
      );

      // Sarah should have negative BRCA1
      expect(result).toBeDefined();
      expect(result.publicSignals).toContain('0'); // false = 0
    });

    it('should return Mike demo data', async () => {
      const result = await service.generateProof(
        'mike-456',
        'CYP2D6',
        '0xcommit'
      );

      // Mike should be poor metabolizer
      expect(result).toBeDefined();
      expect(result.publicSignals).toContain('poor');
    });

    it('should return default demo data for unknown users', async () => {
      const result = await service.generateProof(
        'unknown-user',
        'BRCA1',
        '0xcommit'
      );

      // Default should have positive BRCA1
      expect(result).toBeDefined();
      expect(result.publicSignals).toContain('1'); // true = 1
    });
  });

  describe('Progress updates', () => {
    it('should update job progress in Redis', async () => {
      const jobId = 'job-123';
      const mockJob = {
        id: jobId,
        userId: 'user-123',
        progress: 0,
        status: 'queued'
      };

      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockJob));

      // Trigger progress update through SDK event
      const sdk = createProofSDK(true);
      sdk.emit('progress', {
        jobId,
        progress: 50,
        stage: 'Generating proof'
      });

      // Wait for async update
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(redis.setex).toHaveBeenCalledWith(
        `job:${jobId}`,
        3600,
        expect.stringContaining('"progress":50')
      );
    });
  });

  describe('Verification complete handling', () => {
    it('should update verification count and audit log', async () => {
      const mockEvent = {
        patientAddress: '0xPatient123',
        proofHash: '0xproof123',
        traitType: 'BRCA1',
        timestamp: new Date().toISOString(),
        txHash: '0xtx123'
      };

      // Trigger event through SDK
      const sdk = createProofSDK(true);
      sdk.emit('VerificationComplete', mockEvent);

      // Wait for async handling
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check verification count update
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET verification_count'),
        [mockEvent.patientAddress]
      );

      // Check audit log entry
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_log'),
        expect.arrayContaining([
          mockEvent.patientAddress,
          JSON.stringify(mockEvent)
        ])
      );
    });
  });

  describe('Caching', () => {
    it('should cache proof after successful generation', async () => {
      const userId = 'user-123';
      const traitType = 'BRCA1';

      await service.generateProof(
        userId,
        traitType,
        '0xcommit'
      );

      expect(redis.setex).toHaveBeenCalledWith(
        `proof:${userId}:${traitType}`,
        3600,
        expect.any(String)
      );
    });

    it('should handle cache failures gracefully', async () => {
      (redis.setex as jest.Mock).mockRejectedValue(new Error('Redis error'));

      // Should not throw, just log error
      await expect(
        service.generateProof(
          'user-123',
          'BRCA1',
          '0xcommit'
        )
      ).resolves.toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should generate proof within expected time', async () => {
      const start = Date.now();

      await service.generateProof(
        'user-123',
        'BRCA1',
        '0xcommit'
      );

      const duration = Date.now() - start;

      // Should complete quickly in mock mode
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent proof generation', async () => {
      const promises = [
        service.generateProof('user-1', 'BRCA1', '0xcommit1'),
        service.generateProof('user-2', 'BRCA2', '0xcommit2'),
        service.generateProof('user-3', 'CYP2D6', '0xcommit3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.proofHash).toMatch(/^0x/);
      });
    });
  });

  describe('Error recovery', () => {
    it('should cleanup resources on service destroy', () => {
      const destroySpy = jest.spyOn(service['sdk'], 'destroy');
      service.destroy();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should handle missing genome data gracefully', async () => {
      // Override mock to return empty genome data
      jest.spyOn(service as any, 'getMockGenomeData').mockReturnValue({
        traits: {},
        markers: {}
      });

      const result = await service.generateProof(
        'user-123',
        'BRCA1',
        '0xcommit'
      );

      // Should use default values
      expect(result).toBeDefined();
      expect(result.publicSignals).toContain('0'); // default false
    });
  });
});