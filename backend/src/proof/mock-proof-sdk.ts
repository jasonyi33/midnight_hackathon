/**
 * Mock ProofSDK for Phase 3 Integration Testing
 * This simulates the real ProofSDK that Dev 4 would provide
 */

import { EventEmitter } from 'events';

export interface GeneticMarker {
  type: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  value: any;
  metadata?: Record<string, any>;
}

export interface Proof {
  proofHash: string;
  publicInputs: string[];
  verificationKey: string;
  timestamp: string;
  traitType: string;
  status: 'valid' | 'invalid';
}

export interface ProofGenerationProgress {
  jobId: string;
  progress: number;
  stage: string;
}

export class MockProofSDK extends EventEmitter {
  private mockDelay: number;
  private progressInterval?: NodeJS.Timeout;

  constructor(options?: { mockDelay?: number }) {
    super();
    this.mockDelay = options?.mockDelay || parseInt(process.env.MOCK_PROOF_DELAY || '5000');
  }

  /**
   * Generate BRCA1 mutation proof
   */
  async generateBRCA1Proof(data: GeneticMarker, jobId?: string): Promise<Proof> {
    await this.simulateProofGeneration('BRCA1', jobId);

    return {
      proofHash: `0x${this.generateMockHash('BRCA1')}`,
      publicInputs: ['BRCA1', data.value ? '1' : '0'],
      verificationKey: `vk_BRCA1_${Date.now()}`,
      timestamp: new Date().toISOString(),
      traitType: 'BRCA1',
      status: 'valid'
    };
  }

  /**
   * Generate BRCA2 mutation proof
   */
  async generateBRCA2Proof(data: GeneticMarker, jobId?: string): Promise<Proof> {
    await this.simulateProofGeneration('BRCA2', jobId);

    return {
      proofHash: `0x${this.generateMockHash('BRCA2')}`,
      publicInputs: ['BRCA2', data.value ? '1' : '0'],
      verificationKey: `vk_BRCA2_${Date.now()}`,
      timestamp: new Date().toISOString(),
      traitType: 'BRCA2',
      status: 'valid'
    };
  }

  /**
   * Generate CYP2D6 metabolizer status proof
   */
  async generateCYP2D6Proof(data: GeneticMarker, jobId?: string): Promise<Proof> {
    await this.simulateProofGeneration('CYP2D6', jobId);

    const metabolizerStatus = data.metadata?.metabolizer || 'normal';

    return {
      proofHash: `0x${this.generateMockHash('CYP2D6')}`,
      publicInputs: ['CYP2D6', metabolizerStatus],
      verificationKey: `vk_CYP2D6_${Date.now()}`,
      timestamp: new Date().toISOString(),
      traitType: 'CYP2D6',
      status: 'valid'
    };
  }

  /**
   * Store proof on mock blockchain
   */
  async storeProofOnChain(proof: Proof, patientAddress: string): Promise<string> {
    // Simulate blockchain transaction
    await this.sleep(1000);

    // Emit event for listeners
    this.emit('VerificationComplete', {
      patientAddress,
      proofHash: proof.proofHash,
      traitType: proof.traitType,
      timestamp: proof.timestamp,
      txHash: `0x${this.generateMockHash('tx')}`
    });

    return `0x${this.generateMockHash('tx')}`;
  }

  /**
   * Verify proof (mock validation)
   */
  async verifyProof(proof: Proof): Promise<boolean> {
    await this.sleep(500);
    return proof.status === 'valid';
  }

  /**
   * Simulate proof generation with progress updates
   */
  private async simulateProofGeneration(traitType: string, jobId?: string): Promise<void> {
    const stages = [
      { progress: 10, stage: 'Initializing circuit' },
      { progress: 25, stage: 'Loading genetic data' },
      { progress: 40, stage: 'Computing witness' },
      { progress: 60, stage: 'Generating proof' },
      { progress: 80, stage: 'Verifying proof' },
      { progress: 95, stage: 'Finalizing' },
      { progress: 100, stage: 'Complete' }
    ];

    const stepDuration = this.mockDelay / stages.length;

    for (const stage of stages) {
      await this.sleep(stepDuration);

      if (jobId) {
        this.emit('progress', {
          jobId,
          progress: stage.progress,
          stage: stage.stage,
          traitType
        });
      }
    }
  }

  /**
   * Generate deterministic mock hash
   */
  private generateMockHash(prefix: string): string {
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).substr(2, 8);
    return `${prefix}_${timestamp}_${random}`.padEnd(64, '0');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.removeAllListeners();
  }
}

// Export factory function for easy switching between mock and real
export function createProofSDK(useMock: boolean = true): MockProofSDK {
  if (useMock || process.env.USE_MOCK_PROOF_SDK === 'true') {
    console.log('[ProofSDK] Using mock implementation for development');
    return new MockProofSDK();
  }

  // In production, this would import the real SDK
  // return require('@midnight/proof-sdk').ProofSDK;

  // For now, always return mock
  return new MockProofSDK();
}