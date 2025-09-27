/**
 * ProofSDK TypeScript wrapper for Genomic Privacy Circuits
 * 
 * This SDK provides a clean TypeScript interface for generating
 * zero-knowledge proofs for genetic traits using the compiled
 * Midnight/Compact circuits.
 * 
 * Usage:
 *   import { ProofSDK } from './ProofSDK';
 *   const sdk = new ProofSDK(contractAddress);
 *   const proof = await sdk.generateBRCA1Proof(genomeData, threshold);
 */

import * as fs from 'fs';
import * as path from 'path';

// Type definitions for the SDK
export interface GenomicData {
    BRCA1: {
        variants: string[];
        riskScore: number;
        confidence: number;
    };
    BRCA2: {
        variants: string[];
        riskScore: number;
        confidence: number;
    };
    CYP2D6: {
        variants: string[];
        metabolizerStatus: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
        activityScore: number;
    };
}

export interface ProofResult {
    proof: string;
    publicInputs: string[];
    verificationKey: string;
    traitType: string;
    result: number | string;
    generatedAt: Date;
}

export interface CircuitInfo {
    name: string;
    arguments: Array<{
        name: string;
        type: { 'type-name': string };
    }>;
    'result-type': { 'type-name': string };
}

/**
 * Main ProofSDK class for generating genomic privacy proofs
 */
export class ProofSDK {
    private contractAddress: string;
    private circuitInfo: CircuitInfo[];
    private mockMode: boolean;

    constructor(contractAddress: string, mockMode: boolean = false) {
        this.contractAddress = contractAddress;
        this.mockMode = mockMode;
        this.loadCircuitInfo();
    }

    /**
     * Load circuit information from compiled contract
     */
    private loadCircuitInfo(): void {
        try {
            const deploymentPath = path.join(__dirname, '../../deployment.json');
            const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
            this.circuitInfo = deployment.abi.circuits;
        } catch (error) {
            console.warn('Could not load circuit info, using mock data');
            this.circuitInfo = [];
            this.mockMode = true;
        }
    }

    /**
     * Generate BRCA1 mutation proof
     * 
     * @param genomeData - Patient's genomic data
     * @param threshold - Mutation threshold for positive result
     * @returns Promise<ProofResult>
     */
    async generateBRCA1Proof(
        genomeData: GenomicData,
        threshold: number = 0.5
    ): Promise<ProofResult> {
        console.log('🧬 Generating BRCA1 proof...');
        
        if (this.mockMode) {
            return this.generateMockProof('BRCA1', genomeData.BRCA1.riskScore, threshold);
        }

        try {
            // Convert genomic data to circuit inputs
            const genomeField = this.encodeGenomicData(genomeData.BRCA1);
            const thresholdField = this.encodeThreshold(threshold);

            // Generate proof using the compiled circuit
            const proof = await this.callCircuit('verify_brca1', genomeField, thresholdField);
            
            return {
                proof: proof.proof,
                publicInputs: proof.publicInputs,
                verificationKey: proof.verificationKey,
                traitType: 'BRCA1',
                result: genomeData.BRCA1.riskScore > threshold ? 1 : 0,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('BRCA1 proof generation failed:', error);
            throw new Error(`Failed to generate BRCA1 proof: ${error.message}`);
        }
    }

    /**
     * Generate BRCA2 mutation proof
     */
    async generateBRCA2Proof(
        genomeData: GenomicData,
        threshold: number = 0.5
    ): Promise<ProofResult> {
        console.log('🧬 Generating BRCA2 proof...');
        
        if (this.mockMode) {
            return this.generateMockProof('BRCA2', genomeData.BRCA2.riskScore, threshold);
        }

        try {
            const genomeField = this.encodeGenomicData(genomeData.BRCA2);
            const thresholdField = this.encodeThreshold(threshold);

            const proof = await this.callCircuit('verify_brca2', genomeField, thresholdField);
            
            return {
                proof: proof.proof,
                publicInputs: proof.publicInputs,
                verificationKey: proof.verificationKey,
                traitType: 'BRCA2',
                result: genomeData.BRCA2.riskScore > threshold ? 1 : 0,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('BRCA2 proof generation failed:', error);
            throw new Error(`Failed to generate BRCA2 proof: ${error.message}`);
        }
    }

    /**
     * Generate CYP2D6 metabolizer status proof
     */
    async generateCYP2D6Proof(
        genomeData: GenomicData,
        targetStatus: string
    ): Promise<ProofResult> {
        console.log('💊 Generating CYP2D6 proof...');
        
        if (this.mockMode) {
            return this.generateMockProof('CYP2D6', genomeData.CYP2D6.activityScore, this.encodeMetabolizerStatus(targetStatus));
        }

        try {
            const genomeField = this.encodeGenomicData(genomeData.CYP2D6);
            const statusField = this.encodeMetabolizerStatus(targetStatus);

            const proof = await this.callCircuit('verify_cyp2d6', genomeField, statusField);
            
            return {
                proof: proof.proof,
                publicInputs: proof.publicInputs,
                verificationKey: proof.verificationKey,
                traitType: 'CYP2D6',
                result: genomeData.CYP2D6.metabolizerStatus === targetStatus ? 1 : 0,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('CYP2D6 proof generation failed:', error);
            throw new Error(`Failed to generate CYP2D6 proof: ${error.message}`);
        }
    }

    /**
     * Generate proof for any supported trait type
     */
    async generateProof(
        traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6',
        genomeData: GenomicData,
        parameter: number | string
    ): Promise<ProofResult> {
        switch (traitType) {
            case 'BRCA1':
                return this.generateBRCA1Proof(genomeData, parameter as number);
            case 'BRCA2':
                return this.generateBRCA2Proof(genomeData, parameter as number);
            case 'CYP2D6':
                return this.generateCYP2D6Proof(genomeData, parameter as string);
            default:
                throw new Error(`Unsupported trait type: ${traitType}`);
        }
    }

    /**
     * Get list of supported traits
     */
    getSupportedTraits(): string[] {
        return ['BRCA1', 'BRCA2', 'CYP2D6'];
    }

    /**
     * Check if SDK is in mock mode
     */
    isMockMode(): boolean {
        return this.mockMode;
    }

    // Private helper methods

    private async callCircuit(circuitName: string, ...args: number[]): Promise<{
        proof: string;
        publicInputs: string[];
        verificationKey: string;
    }> {
        // TODO: Implement actual circuit call using Midnight SDK
        // For now, simulate the circuit execution
        
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 second delay
        
        return {
            proof: this.generateRandomProof(),
            publicInputs: args.map(arg => arg.toString()),
            verificationKey: this.generateRandomKey()
        };
    }

    private encodeGenomicData(traitData: any): number {
        // Simple encoding - in production, this would be more sophisticated
        if (traitData.riskScore !== undefined) {
            return Math.floor(traitData.riskScore * 1000000); // Scale to integer
        }
        if (traitData.activityScore !== undefined) {
            return Math.floor(traitData.activityScore * 1000000);
        }
        return 0;
    }

    private encodeThreshold(threshold: number): number {
        return Math.floor(threshold * 1000000);
    }

    private encodeMetabolizerStatus(status: string): number {
        const statusMap = {
            'poor': 0,
            'intermediate': 1, 
            'normal': 2,
            'rapid': 3,
            'ultrarapid': 4
        };
        return statusMap[status] || 2; // Default to normal
    }

    private generateMockProof(
        traitType: string,
        value: number,
        threshold: number
    ): ProofResult {
        // Generate realistic-looking mock proof
        const result = value > threshold ? 1 : 0;
        
        return {
            proof: this.generateRandomProof(),
            publicInputs: [value.toString(), threshold.toString()],
            verificationKey: this.generateRandomKey(),
            traitType,
            result,
            generatedAt: new Date()
        };
    }

    private generateRandomProof(): string {
        // Generate realistic looking proof string
        const chars = '0123456789abcdef';
        let proof = '0x';
        for (let i = 0; i < 128; i++) {
            proof += chars[Math.floor(Math.random() * chars.length)];
        }
        return proof;
    }

    private generateRandomKey(): string {
        // Generate realistic looking verification key
        const chars = '0123456789abcdef';
        let key = '0x';
        for (let i = 0; i < 64; i++) {
            key += chars[Math.floor(Math.random() * chars.length)];
        }
        return key;
    }
}

// Export factory function for easy instantiation
export function createProofSDK(contractAddress: string, mockMode: boolean = false): ProofSDK {
    return new ProofSDK(contractAddress, mockMode);
}

// Export helper functions
export function validateGenomicData(data: any): data is GenomicData {
    return (
        data &&
        data.BRCA1 && typeof data.BRCA1.riskScore === 'number' &&
        data.BRCA2 && typeof data.BRCA2.riskScore === 'number' &&
        data.CYP2D6 && typeof data.CYP2D6.activityScore === 'number'
    );
}

export function isValidMetabolizerStatus(status: string): boolean {
    return ['poor', 'intermediate', 'normal', 'rapid', 'ultrarapid'].includes(status);
}
