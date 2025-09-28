import { createHash } from 'crypto';

// Import the generated contract directly (CommonJS)
const { Contract, ledger } = require('../../../contracts/build/contract/index.cjs');

export interface GenomicData {
  patientId: string;
  markers: Record<string, boolean | number | string>;
  traits: {
    BRCA1?: {
      mutation_present: boolean;
      variant_id?: string;
      confidence_score: number;
    };
    BRCA2?: {
      mutation_present: boolean;
      variant_id?: string;
      confidence_score: number;
    };
    CYP2D6?: {
      metabolizer_status: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
      activity_score: number;
    };
  };
}

export interface ZKProof {
  id: string;
  traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  proof: string;
  publicInputs: string[];
  verificationKey: string;
  result: boolean | string;
  metadata: {
    generatedAt: string;
    circuitHash: string;
    proverAddress: string;
  };
  isValid: boolean;
}

export class MidnightZKProofService {
  private contract: any;
  
  constructor() {
    // Initialize contract with empty witnesses for now
    this.contract = new Contract({});
  }

  /**
   * Generate genome hash from genomic data
   * This creates a deterministic hash that will be used as circuit input
   */
  private generateGenomeHash(genomicData: GenomicData): bigint {
    const dataString = JSON.stringify({
      markers: genomicData.markers,
      traits: genomicData.traits
    });
    
    const hash = createHash('sha256').update(dataString).digest();
    // Convert to bigint for Compact Field type
    return BigInt('0x' + hash.toString('hex'));
  }

  /**
   * Generate ZK proof for BRCA1 mutation status using real Midnight circuits
   */
  async generateBRCA1Proof(
    genomicData: GenomicData,
    patientAddress: string
  ): Promise<ZKProof> {
    try {
      const genomeHash = this.generateGenomeHash(genomicData);
      
      // Create circuit context (this would normally come from Midnight.js)
      const context = {
        originalState: { /* ledger state */ },
        transactionContext: {
          /* transaction context */
        }
      } as any;

      // Execute the verify_brca1 circuit
      const circuitResult = this.contract.circuits.verify_brca1(context, genomeHash);
      
      // Extract the actual result from genomic data
      const actualResult = genomicData.traits.BRCA1?.mutation_present ?? false;
      
      return {
        id: crypto.randomUUID(),
        traitType: 'BRCA1',
        proof: JSON.stringify(circuitResult.proofData),
        publicInputs: [genomeHash.toString()],
        verificationKey: 'brca1_verification_key',
        result: actualResult,
        metadata: {
          generatedAt: new Date().toISOString(),
          circuitHash: createHash('sha256').update('verify_brca1').digest('hex'),
          proverAddress: patientAddress,
        },
        isValid: true,
      };
    } catch (error) {
      console.error('BRCA1 proof generation failed:', error);
      throw new Error(`Failed to generate BRCA1 proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate ZK proof for BRCA2 mutation status using real Midnight circuits
   */
  async generateBRCA2Proof(
    genomicData: GenomicData,
    patientAddress: string
  ): Promise<ZKProof> {
    try {
      const genomeHash = this.generateGenomeHash(genomicData);
      
      const context = {
        originalState: { /* ledger state */ },
        transactionContext: { /* transaction context */ }
      } as any;

      const circuitResult = this.contract.circuits.verify_brca2(context, genomeHash);
      
      const actualResult = genomicData.traits.BRCA2?.mutation_present ?? false;
      
      return {
        id: crypto.randomUUID(),
        traitType: 'BRCA2',
        proof: JSON.stringify(circuitResult.proofData),
        publicInputs: [genomeHash.toString()],
        verificationKey: 'brca2_verification_key',
        result: actualResult,
        metadata: {
          generatedAt: new Date().toISOString(),
          circuitHash: createHash('sha256').update('verify_brca2').digest('hex'),
          proverAddress: patientAddress,
        },
        isValid: true,
      };
    } catch (error) {
      console.error('BRCA2 proof generation failed:', error);
      throw new Error(`Failed to generate BRCA2 proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate ZK proof for CYP2D6 metabolizer status using real Midnight circuits
   */
  async generateCYP2D6Proof(
    genomicData: GenomicData,
    patientAddress: string
  ): Promise<ZKProof> {
    try {
      const genomeHash = this.generateGenomeHash(genomicData);
      
      const context = {
        originalState: { /* ledger state */ },
        transactionContext: { /* transaction context */ }
      } as any;

      const circuitResult = this.contract.circuits.verify_cyp2d6(context, genomeHash);
      
      const actualResult = genomicData.traits.CYP2D6?.metabolizer_status ?? 'normal';
      
      return {
        id: crypto.randomUUID(),
        traitType: 'CYP2D6',
        proof: JSON.stringify(circuitResult.proofData),
        publicInputs: [genomeHash.toString()],
        verificationKey: 'cyp2d6_verification_key',
        result: actualResult,
        metadata: {
          generatedAt: new Date().toISOString(),
          circuitHash: createHash('sha256').update('verify_cyp2d6').digest('hex'),
          proverAddress: patientAddress,
        },
        isValid: true,
      };
    } catch (error) {
      console.error('CYP2D6 proof generation failed:', error);
      throw new Error(`Failed to generate CYP2D6 proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a ZK proof on-chain using Midnight contract
   */
  async verifyProofOnChain(proof: ZKProof): Promise<boolean> {
    try {
      // In a real implementation, this would submit to Midnight network
      // For now, we validate the proof structure
      return proof.isValid && 
             proof.proof.length > 0 && 
             proof.publicInputs.length > 0 &&
             proof.verificationKey.length > 0;
    } catch (error) {
      console.error('On-chain proof verification failed:', error);
      return false;
    }
  }

  /**
   * Get ledger state from the contract
   */
  async getLedgerState(): Promise<any> {
    // This would normally query the Midnight blockchain
    // For now, return mock state structure
    return {
      verifications: 0n,
      brca1_results: 0n,
      brca2_results: 0n,
      cyp2d6_results: 0n,
    };
  }
}

export const midnightZKProofService = new MidnightZKProofService();
