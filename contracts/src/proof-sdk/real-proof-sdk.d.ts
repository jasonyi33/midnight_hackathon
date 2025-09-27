/**
 * Real ProofSDK Implementation for Midnight Testnet
 * Dev 4: Task 3.3 - Real blockchain integration
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
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
}
export interface ProofSDKConfig {
    rpcUrl: string;
    contractAddress: string;
    privateKey?: string;
    networkName?: string;
    chainId?: number;
}
export declare class RealProofSDK extends EventEmitter {
    private provider;
    private contract;
    private signer?;
    private circuitWasm;
    private circuitZkey;
    constructor(config: ProofSDKConfig);
    /**
     * Initialize ZK circuits for proof generation
     */
    private initializeCircuits;
    /**
     * Generate BRCA1 mutation proof
     */
    generateBRCA1Proof(data: GeneticMarker, jobId?: string): Promise<Proof>;
    /**
     * Generate BRCA2 mutation proof
     */
    generateBRCA2Proof(data: GeneticMarker, jobId?: string): Promise<Proof>;
    /**
     * Generate CYP2D6 metabolizer status proof
     */
    generateCYP2D6Proof(data: GeneticMarker, jobId?: string): Promise<Proof>;
    /**
     * Store proof on Midnight blockchain
     */
    storeProofOnChain(proof: Proof, patientAddress: string): Promise<string>;
    /**
     * Verify proof on blockchain
     */
    verifyProofOnChain(proofHash: string): Promise<boolean>;
    /**
     * Listen for blockchain events
     */
    startEventListening(): void;
    /**
     * Stop event listening
     */
    stopEventListening(): void;
    /**
     * Generate ZK proof using snarkjs or Midnight's system
     */
    private generateZKProof;
    /**
     * Verify proof locally before submission
     */
    private verifyProofLocally;
    /**
     * Generate commitment hash for genetic data
     */
    private generateCommitment;
    /**
     * Generate simulated proof for development
     */
    private generateSimulatedProof;
    /**
     * Emit progress updates
     */
    private emitProgress;
    /**
     * Get network information
     */
    getNetworkInfo(): Promise<any>;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export declare function createRealProofSDK(config: ProofSDKConfig): RealProofSDK;
//# sourceMappingURL=real-proof-sdk.d.ts.map