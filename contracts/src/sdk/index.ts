/**
 * Genomic Privacy ProofSDK - Main Export
 * 
 * This is the main entry point for the ProofSDK package.
 * Import this in your backend application to generate ZK proofs.
 */

export {
    ProofSDK,
    createProofSDK,
    validateGenomicData,
    isValidMetabolizerStatus
} from './ProofSDK';

export type {
    GenomicData,
    ProofResult,
    CircuitInfo
} from './ProofSDK';

// Version information
export const SDK_VERSION = '1.0.0';
export const SUPPORTED_TRAITS = ['BRCA1', 'BRCA2', 'CYP2D6'];

// Quick start example
export const QUICK_START_EXAMPLE = {
    usage: `
// Import the SDK
import { createProofSDK, validateGenomicData } from './sdk';

// Initialize with contract address
const sdk = createProofSDK('your-contract-address');

// Generate BRCA1 proof
const genomeData = {
    BRCA1: { variants: [], riskScore: 0.3, confidence: 0.95 },
    BRCA2: { variants: [], riskScore: 0.2, confidence: 0.95 },
    CYP2D6: { variants: [], metabolizerStatus: 'normal', activityScore: 1.0 }
};

const proof = await sdk.generateBRCA1Proof(genomeData, 0.5);
console.log('Proof generated:', proof);
    `
};

// Default export
import { ProofSDK } from './ProofSDK';
export default ProofSDK;
