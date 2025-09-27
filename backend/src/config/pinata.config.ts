/**
 * Pinata IPFS Configuration
 * Phase 3: Real IPFS Integration
 */

import { z } from 'zod';

// Pinata environment schema
const pinataEnvSchema = z.object({
  PINATA_API_KEY: z.string().min(1, 'Pinata API key is required'),
  PINATA_API_SECRET: z.string().min(1, 'Pinata API secret is required'),
  PINATA_JWT: z.string().optional(),
  IPFS_GATEWAY_URL: z.string().url().default('https://gateway.pinata.cloud/ipfs'),
  USE_MOCK_IPFS: z.string().transform(val => val === 'true').default('false')
});

// Validate and export configuration
const validatePinataConfig = () => {
  const env = process.env;

  // Allow mock in development/test
  if (env.NODE_ENV !== 'production' && env.USE_MOCK_IPFS === 'true') {
    return {
      useMock: true,
      apiKey: 'mock_key',
      apiSecret: 'mock_secret',
      jwt: undefined,
      gatewayUrl: 'https://gateway.pinata.cloud/ipfs'
    };
  }

  // Require real credentials in production
  const result = pinataEnvSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid Pinata configuration:', result.error.flatten());

    if (env.NODE_ENV === 'production') {
      throw new Error('Pinata configuration is required in production');
    }

    // Return mock config for development
    console.warn('⚠️  Using mock IPFS service for development');
    return {
      useMock: true,
      apiKey: 'mock_key',
      apiSecret: 'mock_secret',
      jwt: undefined,
      gatewayUrl: 'https://gateway.pinata.cloud/ipfs'
    };
  }

  return {
    useMock: result.data.USE_MOCK_IPFS,
    apiKey: result.data.PINATA_API_KEY,
    apiSecret: result.data.PINATA_API_SECRET,
    jwt: result.data.PINATA_JWT,
    gatewayUrl: result.data.IPFS_GATEWAY_URL
  };
};

export const pinataConfig = validatePinataConfig();

// Export helper to check if using real Pinata
export const isUsingRealIPFS = () => !pinataConfig.useMock;

// Pinata limits for free tier
export const PINATA_LIMITS = {
  FREE_TIER: {
    MAX_FILE_SIZE_MB: 200,
    TOTAL_STORAGE_GB: 1,
    MAX_REQUESTS_PER_SECOND: 10,
    GATEWAY_BANDWIDTH_GB: 200
  },
  PAID_TIER: {
    MAX_FILE_SIZE_MB: 5000,
    TOTAL_STORAGE_GB: 500,
    MAX_REQUESTS_PER_SECOND: 100,
    GATEWAY_BANDWIDTH_GB: 2000
  }
};

// File validation settings
export const FILE_VALIDATION = {
  ALLOWED_MIME_TYPES: ['application/json'],
  MAX_JSON_SIZE_MB: 10,
  MAX_GENOME_SIZE_MB: 50
};

// Pinning policies
export const PINNING_POLICIES = {
  GENOMIC_DATA: {
    cidVersion: 1 as const,
    replicationCount: 2,
    regions: ['FRA1', 'NYC1'] // Europe and US regions
  },
  PROOF_DATA: {
    cidVersion: 1 as const,
    replicationCount: 3,
    regions: ['FRA1', 'NYC1', 'SIN1'] // Global distribution
  }
};

// Helper function to format IPFS gateway URL
export const getIPFSUrl = (cid: string): string => {
  return `${pinataConfig.gatewayUrl}/${cid}`;
};

// Helper function to check file size
export const validateFileSize = (sizeInBytes: number, type: 'genome' | 'json' = 'json'): boolean => {
  const maxSizeMB = type === 'genome'
    ? FILE_VALIDATION.MAX_GENOME_SIZE_MB
    : FILE_VALIDATION.MAX_JSON_SIZE_MB;

  const sizeMB = sizeInBytes / (1024 * 1024);
  return sizeMB <= maxSizeMB;
};