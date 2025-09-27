/**
 * Unit tests for Mock ProofSDK
 */

import { MockProofSDK, GeneticMarker } from './mock-proof-sdk';

describe('MockProofSDK', () => {
  let sdk: MockProofSDK;

  beforeEach(() => {
    sdk = new MockProofSDK({ mockDelay: 100 }); // Fast delay for testing
  });

  afterEach(() => {
    sdk.destroy();
  });

  describe('BRCA1 Proof Generation', () => {
    it('should generate valid BRCA1 proof for positive mutation', async () => {
      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: true
      };

      const proof = await sdk.generateBRCA1Proof(marker);

      expect(proof).toBeDefined();
      expect(proof.traitType).toBe('BRCA1');
      expect(proof.publicInputs).toContain('BRCA1');
      expect(proof.publicInputs).toContain('1'); // true = 1
      expect(proof.status).toBe('valid');
      expect(proof.proofHash).toMatch(/^0x/);
    });

    it('should generate valid BRCA1 proof for negative mutation', async () => {
      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: false
      };

      const proof = await sdk.generateBRCA1Proof(marker);

      expect(proof.publicInputs).toContain('0'); // false = 0
      expect(proof.status).toBe('valid');
    });

    it('should emit progress events during generation', async () => {
      const progressEvents: any[] = [];
      const jobId = 'test-job-1';

      sdk.on('progress', (data) => {
        progressEvents.push(data);
      });

      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: true
      };

      await sdk.generateBRCA1Proof(marker, jobId);

      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0].jobId).toBe(jobId);
      expect(progressEvents[progressEvents.length - 1].progress).toBe(100);
    });
  });

  describe('BRCA2 Proof Generation', () => {
    it('should generate valid BRCA2 proof', async () => {
      const marker: GeneticMarker = {
        type: 'BRCA2',
        value: true
      };

      const proof = await sdk.generateBRCA2Proof(marker);

      expect(proof.traitType).toBe('BRCA2');
      expect(proof.publicInputs).toContain('BRCA2');
      expect(proof.status).toBe('valid');
    });
  });

  describe('CYP2D6 Proof Generation', () => {
    it('should generate proof for poor metabolizer', async () => {
      const marker: GeneticMarker = {
        type: 'CYP2D6',
        value: 0.5,
        metadata: {
          metabolizer: 'poor',
          activityScore: 0.5
        }
      };

      const proof = await sdk.generateCYP2D6Proof(marker);

      expect(proof.traitType).toBe('CYP2D6');
      expect(proof.publicInputs).toContain('CYP2D6');
      expect(proof.publicInputs).toContain('poor');
      expect(proof.status).toBe('valid');
    });

    it('should default to normal metabolizer if not specified', async () => {
      const marker: GeneticMarker = {
        type: 'CYP2D6',
        value: 1.5
      };

      const proof = await sdk.generateCYP2D6Proof(marker);

      expect(proof.publicInputs).toContain('normal');
    });

    it('should handle all metabolizer types', async () => {
      const metabolizerTypes = ['poor', 'intermediate', 'normal', 'rapid', 'ultrarapid'];

      for (const metabolizer of metabolizerTypes) {
        const marker: GeneticMarker = {
          type: 'CYP2D6',
          value: 1,
          metadata: { metabolizer }
        };

        const proof = await sdk.generateCYP2D6Proof(marker);
        expect(proof.publicInputs).toContain(metabolizer);
      }
    });
  });

  describe('Blockchain Integration', () => {
    it('should store proof on chain and emit event', async () => {
      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: true
      };

      const proof = await sdk.generateBRCA1Proof(marker);
      const patientAddress = '0xPatient123';

      let eventEmitted = false;
      sdk.on('VerificationComplete', (event) => {
        eventEmitted = true;
        expect(event.patientAddress).toBe(patientAddress);
        expect(event.proofHash).toBe(proof.proofHash);
        expect(event.traitType).toBe('BRCA1');
        expect(event.txHash).toMatch(/^0x/);
      });

      const txHash = await sdk.storeProofOnChain(proof, patientAddress);

      expect(txHash).toMatch(/^0x/);
      expect(eventEmitted).toBe(true);
    });

    it('should verify valid proofs', async () => {
      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: true
      };

      const proof = await sdk.generateBRCA1Proof(marker);
      const isValid = await sdk.verifyProof(proof);

      expect(isValid).toBe(true);
    });

    it('should reject invalid proofs', async () => {
      const invalidProof = {
        proofHash: '0xinvalid',
        publicInputs: [],
        verificationKey: 'invalid',
        timestamp: new Date().toISOString(),
        traitType: 'BRCA1',
        status: 'invalid' as const
      };

      const isValid = await sdk.verifyProof(invalidProof);

      expect(isValid).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should generate proof within expected time', async () => {
      const start = Date.now();
      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: true
      };

      await sdk.generateBRCA1Proof(marker);
      const duration = Date.now() - start;

      // Should complete within mockDelay + buffer
      expect(duration).toBeLessThan(200); // 100ms delay + 100ms buffer
    });

    it('should handle concurrent proof generation', async () => {
      const markers: GeneticMarker[] = [
        { type: 'BRCA1', value: true },
        { type: 'BRCA2', value: false },
        { type: 'CYP2D6', value: 1, metadata: { metabolizer: 'normal' } }
      ];

      const proofs = await Promise.all([
        sdk.generateBRCA1Proof(markers[0]),
        sdk.generateBRCA2Proof(markers[1]),
        sdk.generateCYP2D6Proof(markers[2])
      ]);

      expect(proofs).toHaveLength(3);
      expect(proofs[0].traitType).toBe('BRCA1');
      expect(proofs[1].traitType).toBe('BRCA2');
      expect(proofs[2].traitType).toBe('CYP2D6');
    });
  });

  describe('Error Handling', () => {
    it('should handle cleanup properly', () => {
      const spy = jest.spyOn(sdk, 'removeAllListeners');
      sdk.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('should generate unique proof hashes', async () => {
      const marker: GeneticMarker = {
        type: 'BRCA1',
        value: true
      };

      const proof1 = await sdk.generateBRCA1Proof(marker);
      const proof2 = await sdk.generateBRCA1Proof(marker);

      expect(proof1.proofHash).not.toBe(proof2.proofHash);
      expect(proof1.verificationKey).not.toBe(proof2.verificationKey);
    });
  });
});