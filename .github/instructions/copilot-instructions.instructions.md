---
applyTo: '**'
---
# copilot-instructions.md

This file provides comprehensive guidance to GitHub Copilot when working with TypeScript, Compact (Midnight Framework), and zero-knowledge proof development in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Single Responsibility**: Each function, class, and module should have one clear purpose.
- **Fail Fast**: Check for potential errors early and raise exceptions immediately when issues occur.

## 🧱 Code Structure & Modularity

### File and Function Limits

- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 100 lines** and represent a single concept or entity.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Line length should be max 100 characters** following TypeScript/Prettier standards
- **Use TypeScript strict mode** for all source files

### Project Architecture

Follow the Genomic Privacy DApp architecture with frontend/backend separation and Compact contracts:

```
genomic-privacy-dapp/
    # Frontend (React + TypeScript + Vite)
    apps/
        frontend/
            src/
                components/
                    patient/
                        GenomeUpload.tsx
                        ProofGeneration.tsx
                    doctor/
                        RequestVerification.tsx
                    researcher/
                        AggregateAnalytics.tsx
                pages/
                    PatientDashboard.tsx
                    DoctorPortal.tsx
                    ResearcherPortal.tsx
                hooks/
                    useWallet.ts
                    useZKProofs.ts
                    useIPFS.ts
                types/
                    genomic.types.ts
                    proof.types.ts
                utils/
                    crypto.ts
                    validation.ts
                __tests__/
                    components/
                    hooks/
                    utils/

    # Backend (Node.js + Express + TypeScript)
    apps/
        backend/
            src/
                routes/
                    auth.ts
                    proof.ts
                    ipfs.ts
                controllers/
                    ProofController.ts
                    IPFSController.ts
                services/
                    ZKProofService.ts
                    IPFSService.ts
                    CryptoService.ts
                middleware/
                    auth.ts
                    validation.ts
                    rateLimit.ts
                models/
                    User.ts
                    GenomeCommitment.ts
                    VerificationRequest.ts
                __tests__/
                    routes/
                    services/
                    controllers/

    # Smart Contracts (Compact)
    contracts/
        genomic-verification/
            src/
                genomic_verifier.compact
                brca_circuit.compact
                cyp2d6_circuit.compact
            tests/
                genomic_verifier.test.ts
            deploy/
                deploy.ts
        
    # Shared utilities
    packages/
        shared-types/
            src/
                genomic.ts
                proof.ts
                api.ts
        crypto-utils/
            src/
                encryption.ts
                hashing.ts
                validation.ts
```

## 🛠️ Development Environment

### Midnight Framework & Compact Compiler

This project uses the Midnight Framework with Compact language for zero-knowledge proofs and TypeScript for application development.

```bash
# Setup Compact compiler (version 0.25.0)
export PATH="/Users/amogh/Projects/midnight_hackathon/compactc_v0.25.0_aarch64-darwin:$PATH"

# Verify Compact installation
compactc --version

# Install Node.js dependencies
npm install

# Install development dependencies
npm install --save-dev @types/node @types/react typescript jest

# Install Midnight SDK dependencies
npm install @midnight-ntwrk/midnight-js-sdk
npm install @midnight-ntwrk/compact-runtime

# Install crypto dependencies for ZK proofs
npm install @noble/hashes @noble/curves
npm install ipfs-http-client

# Install UI dependencies
npm install react react-dom @vitejs/plugin-react
npm install tailwindcss @headlessui/react framer-motion
npm install recharts three @react-three/fiber
```

### Development Commands

```bash
# Compile Compact contracts
compactc compile contracts/genomic-verification/src/genomic_verifier.compact

# Format Compact code
format-compact contracts/genomic-verification/src/

# Run TypeScript compiler
npx tsc --noEmit

# Run tests
npm test

# Run specific test suites
npm test -- --testPathPattern=zkproof
npm test -- --testPathPattern=contracts

# Frontend development server
cd apps/frontend && npm run dev

# Backend development server  
cd apps/backend && npm run dev

# Format TypeScript code
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

# Lint TypeScript code
npx eslint "**/*.{ts,tsx}" --fix

# Type checking
npx tsc --noEmit --project ./tsconfig.json

# Build for production
npm run build

# Deploy contracts to Midnight testnet
cd contracts && npm run deploy:testnet
```

## 📋 Style & Conventions

### TypeScript Style Guide

- **Follow TypeScript best practices** with these specific choices:
  - Line length: 100 characters (configured in Prettier)
  - Use double quotes for strings
  - Use trailing commas in multi-line structures
  - Use semicolons consistently
- **Always use TypeScript strict mode** with explicit type annotations
- **Format with Prettier** for consistent code style
- **Use Zod** for runtime data validation and type inference

### Documentation Standards

Use TSDoc for all public functions, classes, and modules:

```typescript
/**
 * Generate zero-knowledge proof for BRCA1 mutation status
 * 
 * @param genomeData - Encrypted genome data from IPFS
 * @param mutationStatus - Whether BRCA1 mutation is present
 * @param patientAddress - Patient's wallet address for proof binding
 * @returns Promise resolving to ZK proof and verification key
 * 
 * @throws {ValidationError} When genome data format is invalid
 * @throws {ProofGenerationError} When ZK circuit compilation fails
 * 
 * @example
 * ```typescript
 * const proof = await generateBRCA1Proof(
 *   encryptedGenome,
 *   false, // No mutation present
 *   "0x742d35Cc6634C0532925a3b8D1b9226d"
 * );
 * ```
 */
export async function generateBRCA1Proof(
  genomeData: EncryptedGenome,
  mutationStatus: boolean,
  patientAddress: string
): Promise<ZKProof> {
  // Implementation here
}
```

### Naming Conventions

- **Variables and functions**: `camelCase`
- **Classes and interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods/properties**: `private` keyword (not underscore prefix)
- **Type aliases**: `PascalCase`
- **Enum values**: `PascalCase`
- **Compact contracts**: `snake_case` (following Compact conventions)
- **File names**: `kebab-case.ts` or `PascalCase.tsx` for React components

## 🧪 Testing Strategy

### Test-Driven Development (TDD)

1. **Write the test first** - Define expected behavior before implementation
2. **Watch it fail** - Ensure the test actually tests something
3. **Write minimal code** - Just enough to make the test pass
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - One test at a time

### Testing Best Practices

```typescript
// Use Jest with TypeScript for testing
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ZKProofService } from '../services/ZKProofService';
import { mockEncryptedGenome } from '../__mocks__/genomic-data';

describe('ZKProofService', () => {
  let proofService: ZKProofService;

  beforeEach(() => {
    proofService = new ZKProofService();
  });

  // Use descriptive test names
  it('should generate valid BRCA1 proof when mutation is absent', async () => {
    const proof = await proofService.generateBRCA1Proof(
      mockEncryptedGenome,
      false, // No mutation
      '0x742d35Cc6634C0532925a3b8D1b9226d'
    );

    expect(proof.isValid).toBe(true);
    expect(proof.traitType).toBe('BRCA1');
    expect(proof.result).toBe(false);
  });

  // Test edge cases and error conditions
  it('should throw ValidationError for invalid genome format', async () => {
    const invalidGenome = { invalid: 'format' } as any;

    await expect(
      proofService.generateBRCA1Proof(invalidGenome, false, 'valid-address')
    ).rejects.toThrow('Invalid genome data format');
  });

  // Test contract integration
  it('should verify proof on-chain successfully', async () => {
    const proof = await proofService.generateBRCA1Proof(
      mockEncryptedGenome,
      false,
      '0x742d35Cc6634C0532925a3b8D1b9226d'
    );

    const isVerified = await proofService.verifyProofOnChain(proof);
    expect(isVerified).toBe(true);
  });
});
```

### Test Organization

- **Unit tests**: Test individual functions/methods in isolation
- **Integration tests**: Test component interactions and API endpoints
- **Contract tests**: Test Compact smart contracts and ZK circuits
- **End-to-end tests**: Test complete user workflows with Playwright
- Keep test files in `__tests__` directories or adjacent with `.test.ts` suffix
- Use Jest setup files for shared test utilities
- Aim for 80%+ code coverage, focusing on critical ZK proof generation paths

## 🚨 Error Handling

### Exception Best Practices

```typescript
// Create custom error classes for domain-specific errors
export class GenomicPrivacyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GenomicPrivacyError';
  }
}

export class ProofGenerationError extends GenomicPrivacyError {
  constructor(message: string, public readonly circuitType: string) {
    super(message, 'PROOF_GENERATION_FAILED', { circuitType });
    this.name = 'ProofGenerationError';
  }
}

export class WalletConnectionError extends GenomicPrivacyError {
  constructor(message: string, public readonly walletType: string) {
    super(message, 'WALLET_CONNECTION_FAILED', { walletType });
    this.name = 'WalletConnectionError';
  }
}

// Use Result pattern for better error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export async function generateZKProof(
  traitType: TraitType,
  genomeData: EncryptedGenome
): Promise<Result<ZKProof, ProofGenerationError>> {
  try {
    const proof = await compileAndGenerateProof(traitType, genomeData);
    return { success: true, data: proof };
  } catch (error) {
    const proofError = new ProofGenerationError(
      `Failed to generate ${traitType} proof: ${error.message}`,
      traitType
    );
    return { success: false, error: proofError };
  }
}

// Resource management with proper cleanup
export class IPFSManager {
  private client: IPFSHTTPClient | null = null;

  async connect(): Promise<void> {
    try {
      this.client = create({ url: process.env.IPFS_GATEWAY });
      await this.client.id(); // Test connection
    } catch (error) {
      throw new GenomicPrivacyError(
        'Failed to connect to IPFS',
        'IPFS_CONNECTION_FAILED',
        { error: error.message }
      );
    }
  }

  async cleanup(): Promise<void> {
    if (this.client) {
      // Proper cleanup of IPFS connection
      this.client = null;
    }
  }
}
```

### Logging Strategy

```typescript
import winston from 'winston';

// Configure structured logging
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'genomic-privacy' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Decorator for logging function execution
export function logExecution<T extends (...args: any[]) => any>(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  const method = descriptor.value!;

  descriptor.value = ((...args: any[]) => {
    const correlationId = crypto.randomUUID();
    logger.debug('Function execution started', {
      function: propertyName,
      correlationId,
      args: process.env.NODE_ENV === 'development' ? args : '[REDACTED]'
    });

    try {
      const result = method.apply(target, args);
      
      if (result instanceof Promise) {
        return result
          .then((res) => {
            logger.debug('Function execution completed', {
              function: propertyName,
              correlationId
            });
            return res;
          })
          .catch((error) => {
            logger.error('Function execution failed', {
              function: propertyName,
              correlationId,
              error: error.message,
              stack: error.stack
            });
            throw error;
          });
      }

      logger.debug('Function execution completed', {
        function: propertyName,
        correlationId
      });
      return result;
    } catch (error) {
      logger.error('Function execution failed', {
        function: propertyName,
        correlationId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }) as T;

  return descriptor;
}

// Usage example
export class ZKProofService {
  @logExecution
  async generateBRCA1Proof(
    genomeData: EncryptedGenome,
    mutationStatus: boolean
  ): Promise<ZKProof> {
    // Implementation here
    logger.info('Generating BRCA1 proof', {
      hasGenomeData: !!genomeData,
      mutationStatus
    });
  }
}
```

## 🔧 Configuration Management

### Environment Variables and Settings

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define configuration schema with Zod
const configSchema = z.object({
  // Application settings
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database settings
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // Midnight/Blockchain settings
  MIDNIGHT_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  MIDNIGHT_RPC_URL: z.string().url(),
  DEPLOYER_PRIVATE_KEY: z.string().min(64),
  
  // IPFS settings
  IPFS_GATEWAY: z.string().url().default('https://ipfs.infura.io'),
  IPFS_PROJECT_ID: z.string(),
  IPFS_PROJECT_SECRET: z.string(),
  
  // Security settings
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url(),
  
  // Frontend settings (for Vite)
  VITE_API_URL: z.string().url().optional(),
  VITE_WS_URL: z.string().url().optional(),
  VITE_MIDNIGHT_NETWORK: z.string().optional(),
  VITE_DEMO_MODE: z.coerce.boolean().default(false),
});

export type Config = z.infer<typeof configSchema>;

// Validate and export configuration
export const config: Config = configSchema.parse(process.env);

// Helper function to get network-specific settings
export function getMidnightConfig() {
  return {
    network: config.MIDNIGHT_NETWORK,
    rpcUrl: config.MIDNIGHT_RPC_URL,
    deployerKey: config.DEPLOYER_PRIVATE_KEY,
  };
}

// Helper function to get IPFS settings
export function getIPFSConfig() {
  return {
    gateway: config.IPFS_GATEWAY,
    projectId: config.IPFS_PROJECT_ID,
    projectSecret: config.IPFS_PROJECT_SECRET,
  };
}

// Usage example
import { config, getMidnightConfig } from './config';

export class MidnightService {
  private midnightConfig = getMidnightConfig();
  
  async deployContract() {
    logger.info('Deploying to network', {
      network: this.midnightConfig.network,
      rpcUrl: this.midnightConfig.rpcUrl
    });
  }
}
```

## 🏗️ Data Models and Validation

### TypeScript Types and Zod Schemas for Genomic Privacy

```typescript
import { z } from 'zod';

// Base genetic trait types
export const TraitTypeSchema = z.enum(['BRCA1', 'BRCA2', 'CYP2D6']);
export type TraitType = z.infer<typeof TraitTypeSchema>;

// Genomic data validation
export const GenomicDataSchema = z.object({
  patientId: z.string().uuid(),
  markers: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
  traits: z.object({
    BRCA1: z.object({
      mutation_present: z.boolean(),
      variant_id: z.string().optional(),
      confidence_score: z.number().min(0).max(1),
    }).optional(),
    BRCA2: z.object({
      mutation_present: z.boolean(),
      variant_id: z.string().optional(),
      confidence_score: z.number().min(0).max(1),
    }).optional(),
    CYP2D6: z.object({
      metabolizer_status: z.enum(['poor', 'intermediate', 'normal', 'rapid', 'ultrarapid']),
      activity_score: z.number().min(0).max(3),
    }).optional(),
  })
});

export type GenomicData = z.infer<typeof GenomicDataSchema>;

// Encrypted genome storage
export const EncryptedGenomeSchema = z.object({
  cid: z.string(), // IPFS content identifier
  encryptionKey: z.string(),
  hash: z.string(), // SHA-256 hash for integrity
  metadata: z.object({
    uploadedAt: z.string().datetime(),
    fileSize: z.number(),
    compressionType: z.enum(['gzip', 'none']),
  })
});

export type EncryptedGenome = z.infer<typeof EncryptedGenomeSchema>;

// Zero-knowledge proof types
export const ZKProofSchema = z.object({
  id: z.string().uuid(),
  traitType: TraitTypeSchema,
  proof: z.string(), // Serialized ZK proof
  publicInputs: z.array(z.string()),
  verificationKey: z.string(),
  result: z.union([z.boolean(), z.number(), z.string()]),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    circuitHash: z.string(),
    proverAddress: z.string(),
  }),
  isValid: z.boolean(),
});

export type ZKProof = z.infer<typeof ZKProofSchema>;

// Verification request types
export const VerificationRequestSchema = z.object({
  id: z.string().uuid(),
  patientAddress: z.string(),
  doctorAddress: z.string(),
  requestedTraits: z.array(TraitTypeSchema),
  status: z.enum(['pending', 'approved', 'denied', 'expired']),
  message: z.string().optional(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  respondedAt: z.string().datetime().optional(),
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

// Database models with validation
export class GenomeCommitment {
  constructor(
    public readonly id: string,
    public readonly patientAddress: string,
    public readonly commitmentHash: string,
    public readonly ipfsCid: string,
    public readonly createdAt: Date = new Date(),
  ) {
    // Validate commitment hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(commitmentHash)) {
      throw new Error('Invalid commitment hash format');
    }
  }

  static fromJSON(data: unknown): GenomeCommitment {
    const parsed = z.object({
      id: z.string().uuid(),
      patientAddress: z.string(),
      commitmentHash: z.string(),
      ipfsCid: z.string(),
      createdAt: z.string().datetime(),
    }).parse(data);

    return new GenomeCommitment(
      parsed.id,
      parsed.patientAddress,
      parsed.commitmentHash,
      parsed.ipfsCid,
      new Date(parsed.createdAt)
    );
  }

  toJSON() {
    return {
      id: this.id,
      patientAddress: this.patientAddress,
      commitmentHash: this.commitmentHash,
      ipfsCid: this.ipfsCid,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

// API request/response types
export const GenerateProofRequestSchema = z.object({
  traitType: TraitTypeSchema,
  threshold: z.number().optional(),
  patientAddress: z.string(),
});

export const GenerateProofResponseSchema = z.object({
  jobId: z.string().uuid(),
  estimatedTime: z.number(), // seconds
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
});

export type GenerateProofRequest = z.infer<typeof GenerateProofRequestSchema>;
export type GenerateProofResponse = z.infer<typeof GenerateProofResponseSchema>;
```

## 🔄 Git Workflow

### Branch Strategy

- `main` - Production-ready code (protected)
- `develop` - Integration branch for features  
- `feature/*` - New features (e.g., `feature/zk-proof-generation`)
- `fix/*` - Bug fixes (e.g., `fix/wallet-connection`)
- `contracts/*` - Smart contract updates (e.g., `contracts/brca-circuit`)
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or fixes

### Commit Message Format

Never include AI assistance references in commit messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore, contracts

Examples:
```
feat(zk-proofs): implement BRCA1 mutation verification

- Add Compact circuit for BRCA1 proof generation
- Integrate with frontend proof generation UI
- Add comprehensive test coverage for proof validation

Closes #45

contracts(genomic-verifier): deploy to Midnight testnet

- Update contract with gas optimizations
- Add access control for authorized verifiers
- Configure deployment scripts for testnet

fix(wallet): resolve Lace wallet connection timeout

- Increase connection timeout to 30 seconds
- Add retry logic for failed connections
- Improve error handling for unsupported wallets

Fixes #67
```

### Hackathon-Specific Workflow

```bash
# Quick feature development during hackathon
git checkout main
git pull origin main
git checkout -b feature/proof-generation
# Make changes
git add -A
git commit -m "feat(proofs): add BRCA1 proof generation"
git push origin feature/proof-generation
# Create PR and merge quickly after review
```

## 🗄️ Database Schema & API Standards

### Genomic Privacy Database Schema

Entity-specific primary keys for genomic privacy domain:

```sql
-- Core tables for genomic privacy
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genome_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  commitment_hash VARCHAR(66) NOT NULL, -- 0x + 64 hex chars
  ipfs_cid VARCHAR(59) NOT NULL, -- IPFS CID
  encryption_metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  requested_traits TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);

CREATE TABLE zk_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  trait_type VARCHAR(20) NOT NULL,
  proof_data TEXT NOT NULL,
  public_inputs TEXT[] NOT NULL,
  verification_key TEXT NOT NULL,
  result_value JSONB NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_verification_patient ON verification_requests(patient_id);
CREATE INDEX idx_verification_doctor ON verification_requests(doctor_id);
CREATE INDEX idx_proofs_patient_trait ON zk_proofs(patient_id, trait_type);
CREATE INDEX idx_commitments_patient ON genome_commitments(patient_id);
```

### API Route Standards

```typescript
import { Router } from 'express';
import { z } from 'zod';

// RESTful API routes for genomic privacy
const router = Router();

// Authentication routes
router.post('/api/v1/auth/connect', connectWallet);
router.post('/api/v1/auth/disconnect', disconnectWallet);
router.get('/api/v1/auth/profile', getProfile);

// Genomic data routes
router.post('/api/v1/genome/upload', uploadGenome);
router.get('/api/v1/genome/commitment/:patientId', getCommitment);
router.delete('/api/v1/genome/commitment/:patientId', deleteCommitment);

// ZK proof routes  
router.post('/api/v1/proofs/generate', generateProof);
router.get('/api/v1/proofs/status/:jobId', getProofStatus);
router.get('/api/v1/proofs/:proofId', getProof);
router.post('/api/v1/proofs/:proofId/verify', verifyProof);

// Verification request routes
router.post('/api/v1/requests', createVerificationRequest);
router.get('/api/v1/requests/patient/:patientId', getPatientRequests);
router.get('/api/v1/requests/doctor/:doctorId', getDoctorRequests);
router.put('/api/v1/requests/:requestId', respondToRequest);

// Research/aggregation routes
router.get('/api/v1/research/stats', getAggregateStats);
router.get('/api/v1/research/frequencies', getTraitFrequencies);
```

### Repository Pattern for TypeScript

```typescript
import { Pool } from 'pg';
import { z } from 'zod';

export abstract class BaseRepository<T> {
  constructor(
    protected db: Pool,
    protected tableName: string,
    protected schema: z.ZodType<T>
  ) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    return this.schema.parse(result.rows[0]);
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return this.schema.parse(result.rows[0]);
  }
}

// Usage for genomic privacy domain
export class GenomeCommitmentRepository extends BaseRepository<GenomeCommitment> {
  constructor(db: Pool) {
    super(db, 'genome_commitments', GenomeCommitmentSchema);
  }

  async findByPatientId(patientId: string): Promise<GenomeCommitment | null> {
    const result = await this.db.query(
      'SELECT * FROM genome_commitments WHERE patient_id = $1',
      [patientId]
    );
    
    if (result.rows.length === 0) return null;
    return this.schema.parse(result.rows[0]);
  }
}
```

## 📝 Documentation Standards

### Code Documentation

- Every module should have TSDoc comments explaining its purpose
- Public functions must have complete TSDoc documentation
- Complex ZK logic should have inline comments with `// Reason:` prefix
- Keep README.md updated with setup instructions and Compact compilation steps
- Maintain CHANGELOG.md for version history

### API Documentation with OpenAPI

```typescript
import { Request, Response } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';

/**
 * @swagger
 * /api/v1/proofs/generate:
 *   post:
 *     summary: Generate zero-knowledge proof for genetic trait
 *     tags: [ZK Proofs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - traitType
 *               - patientAddress
 *             properties:
 *               traitType:
 *                 type: string
 *                 enum: [BRCA1, BRCA2, CYP2D6]
 *                 description: Type of genetic trait to prove
 *               threshold:
 *                 type: number
 *                 description: Threshold for range proofs (optional)
 *               patientAddress:
 *                 type: string
 *                 description: Patient's wallet address
 *     responses:
 *       202:
 *         description: Proof generation job queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                   format: uuid
 *                 estimatedTime:
 *                   type: number
 *                   description: Estimated completion time in seconds
 */
export async function generateProof(req: Request, res: Response) {
  // Implementation with proper error handling
}
```

### Compact Contract Documentation

```typescript
// genomic_verifier.compact - Main contract for genetic verification

/**
 * Compact contract for privacy-preserving genetic trait verification
 * 
 * This contract enables patients to prove specific genetic traits without
 * revealing their complete genomic sequence using zero-knowledge proofs.
 * 
 * Supported traits:
 * - BRCA1/BRCA2 mutations (boolean proofs)
 * - CYP2D6 metabolizer status (set membership proofs)
 * - Risk scores (range proofs)
 */
contract GenomicVerifier {
    // State variables for access control and verification tracking
    field authorized_verifiers: Map<PublicKey, Bool>;
    field verification_count: Map<PublicKey, Uint64>;
    
    /**
     * Verify BRCA1 mutation status proof
     * 
     * @param proof - ZK proof of mutation presence/absence
     * @param patient_commitment - Hash commitment to patient's genome
     * @param mutation_status - Boolean result (true = mutation present)
     * @returns Bool - True if proof is valid
     */
    function verify_brca1_proof(
        proof: BooleanProof,
        patient_commitment: Hash,
        mutation_status: Bool
    ) -> Bool {
        // Circuit verification logic
        // Reason: BRCA1 circuit validates mutation markers in genomic data
        assert(verify_boolean_circuit(proof, patient_commitment, mutation_status));
        
        // Update verification count
        let current_count = verification_count.get(msg.sender) || 0u64;
        verification_count.set(msg.sender, current_count + 1u64);
        
        return true;
    }
}
```

## � Compact Smart Contract Development

### Compact Language Best Practices

```typescript
// Use descriptive names for circuit functions
contract GenomicVerifier {
    // State should be minimal for gas efficiency
    field commitment_registry: Map<PublicKey, Hash>;
    field verification_timestamps: Map<PublicKey, Uint64>;
    
    /**
     * Boolean circuit for BRCA1 mutation verification
     * Optimized for minimal constraint count
     */
    function verify_brca1_mutation(
        genome_commitment: Hash,
        mutation_present: Bool,
        proof_witness: BooleanWitness
    ) -> Bool {
        // Reason: Use built-in hash functions for efficiency
        let computed_hash = poseidon_hash([
            proof_witness.genome_data,
            proof_witness.mutation_markers
        ]);
        
        // Verify commitment matches
        assert(computed_hash == genome_commitment);
        
        // Check mutation status in witness
        let has_mutation = check_brca1_markers(proof_witness.mutation_markers);
        assert(has_mutation == mutation_present);
        
        return true;
    }
    
    // Helper function for BRCA1 marker validation
    private function check_brca1_markers(markers: Field) -> Bool {
        // Implement specific BRCA1 mutation logic
        // Known pathogenic variants: 5266dupC, 185delAG, etc.
        let known_variants = [0x1234, 0x5678, 0x9ABC]; // Encoded variants
        
        for variant in known_variants {
            if (markers & variant) != 0 {
                return true;
            }
        }
        return false;
    }
}
```

### Circuit Optimization Guidelines

- **Minimize constraints**: Each assertion adds to proof size and generation time
- **Use efficient hash functions**: Poseidon is optimized for ZK circuits
- **Batch operations**: Group similar checks to reduce circuit complexity
- **Avoid loops**: Use fixed-size arrays and unroll loops when possible
- **Optimize field arithmetic**: Prefer addition over multiplication

### Deployment and Testing

```bash
# Compile Compact contract
compactc compile contracts/genomic-verification/src/genomic_verifier.compact

# Format Compact code
format-compact contracts/genomic-verification/src/

# Run circuit tests
npm test -- --testPathPattern=circuits

# Deploy to Midnight testnet
cd contracts && npm run deploy:testnet

# Verify contract on explorer
npm run verify:testnet -- --contract-address <deployed_address>
```

## 🚀 Performance Considerations

### TypeScript & ZK Proof Optimization

- **Profile ZK proof generation** - Use performance marks to identify bottlenecks
- **Cache computed proofs** in Redis with appropriate TTL
- **Use Web Workers** for proof generation to prevent UI blocking  
- **Implement proof queues** for concurrent processing
- **Optimize IPFS uploads** with compression and chunking
- **Database query optimization** with proper indexing

### Example Performance Optimization

```typescript
import { performance } from 'perf_hooks';

export class OptimizedZKProofService {
  private proofCache = new Map<string, ZKProof>();
  
  @logExecution
  async generateBRCA1Proof(
    genomeData: EncryptedGenome,
    mutationStatus: boolean
  ): Promise<ZKProof> {
    const cacheKey = `brca1:${genomeData.hash}:${mutationStatus}`;
    
    // Check cache first
    const cached = this.proofCache.get(cacheKey);
    if (cached && this.isProofValid(cached)) {
      logger.debug('Returning cached BRCA1 proof', { cacheKey });
      return cached;
    }
    
    const startTime = performance.now();
    
    try {
      // Use Web Worker for heavy computation
      const proof = await this.generateProofInWorker({
        type: 'BRCA1',
        genomeData,
        mutationStatus
      });
      
      const endTime = performance.now();
      logger.info('BRCA1 proof generated', {
        duration: endTime - startTime,
        constraints: proof.circuitConstraints,
        proofSize: proof.proof.length
      });
      
      // Cache successful proof
      this.proofCache.set(cacheKey, proof);
      
      return proof;
    } catch (error) {
      logger.error('BRCA1 proof generation failed', {
        duration: performance.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  private async generateProofInWorker(params: ProofParams): Promise<ZKProof> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./proof-generation-worker.js');
      
      worker.postMessage(params);
      
      worker.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.proof);
        } else {
          reject(new Error(event.data.error));
        }
        worker.terminate();
      };
      
      // 30 second timeout
      setTimeout(() => {
        worker.terminate();
        reject(new Error('Proof generation timeout'));
      }, 30000);
    });
  }
}

// IPFS optimization with compression
export class OptimizedIPFSService {
  async uploadEncryptedGenome(genome: GenomicData): Promise<EncryptedGenome> {
    const startTime = performance.now();
    
    // Compress before encryption
    const compressed = await this.compressData(JSON.stringify(genome));
    const encrypted = await this.encryptData(compressed);
    
    // Upload to IPFS with chunking for large files
    const cid = await this.uploadWithChunking(encrypted);
    
    logger.info('Genome uploaded to IPFS', {
      originalSize: JSON.stringify(genome).length,
      compressedSize: compressed.length,
      uploadTime: performance.now() - startTime,
      cid
    });
    
    return {
      cid,
      encryptionKey: this.encryptionKey,
      hash: this.computeHash(encrypted),
      metadata: {
        uploadedAt: new Date().toISOString(),
        fileSize: encrypted.length,
        compressionType: 'gzip'
      }
    };
  }
}
```

## 🛡️ Security Best Practices

### Genomic Privacy Security Guidelines

- **Never commit secrets** - Use environment variables for all keys and sensitive data
- **Validate all inputs** with Zod schemas before processing
- **Encrypt genomic data** with AES-256-GCM before any transmission or storage
- **Use parameterized queries** for all database operations
- **Implement rate limiting** especially for ZK proof generation endpoints
- **Keep dependencies updated** with npm audit and automated security scanning
- **Use HTTPS everywhere** including IPFS gateways and Midnight RPC endpoints
- **Implement proper wallet authentication** with message signing verification
- **Never log sensitive data** - genomic information, private keys, or proof witnesses

### Cryptographic Security Implementation

```typescript
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';

export class CryptoService {  
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypt genomic data with AES-256-GCM
   * CRITICAL: This is the primary protection for patient genomic data
   */
  static encryptGenomicData(
    data: string, 
    password: string
  ): { encrypted: string; iv: string; tag: string; salt: string } {
    try {
      // Generate secure random values
      const salt = randomBytes(32);
      const iv = randomBytes(this.IV_LENGTH);
      
      // Derive key using PBKDF2
      const key = crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
      
      // Encrypt with AES-256-GCM
      const cipher = createCipheriv(this.ALGORITHM, key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt.toString('hex')
      };
    } catch (error) {
      logger.error('Genomic data encryption failed', { error: error.message });
      throw new GenomicPrivacyError(
        'Failed to encrypt genomic data',
        'ENCRYPTION_FAILED'
      );
    }
  }

  /**
   * Decrypt genomic data
   * CRITICAL: Verify integrity with authentication tag
   */
  static decryptGenomicData(
    encryptedData: { encrypted: string; iv: string; tag: string; salt: string },
    password: string
  ): string {
    try {
      // Derive same key
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const key = crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
      
      // Setup decipher
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      const decipher = createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt and verify integrity
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Genomic data decryption failed', { error: error.message });
      throw new GenomicPrivacyError(
        'Failed to decrypt genomic data - data may be corrupted',
        'DECRYPTION_FAILED'
      );
    }
  }

  /**
   * Generate secure commitment hash for genome data
   * Uses SHA-256 for blockchain compatibility
   */
  static generateCommitmentHash(
    encryptedData: string,
    patientAddress: string,
    nonce: string
  ): string {
    const hash = createHash('sha256');
    hash.update(encryptedData);
    hash.update(patientAddress);
    hash.update(nonce);
    return '0x' + hash.digest('hex');
  }

  /**
   * Verify wallet signature for authentication
   * CRITICAL: Prevents unauthorized access to patient data
   */
  static verifyWalletSignature(
    message: string,
    signature: string,
    publicKey: string
  ): boolean {
    try {
      const messageHash = sha256(Buffer.from(message, 'utf8'));
      const sig = secp256k1.Signature.fromDER(signature);
      return secp256k1.verify(sig, messageHash, publicKey);
    } catch (error) {
      logger.warn('Wallet signature verification failed', { 
        error: error.message,
        publicKey: publicKey.slice(0, 10) + '...' // Log partial key only
      });
      return false;
    }
  }

  /**
   * Generate secure random tokens for session management
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Create proof binding to prevent replay attacks
   * Binds proof to specific patient and timestamp
   */
  static createProofBinding(
    proofData: string,
    patientAddress: string,
    timestamp: number
  ): string {
    const hash = createHash('sha256');
    hash.update(proofData);
    hash.update(patientAddress);
    hash.update(timestamp.toString());
    return hash.digest('hex');
  }
}

// Rate limiting for proof generation endpoints
export const proofGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 proof generations per 15 minutes
  message: {
    error: 'Too many proof generation requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Wallet authentication middleware
export async function authenticateWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    // Verify wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(decoded.walletAddress)) {
      return res.status(401).json({ error: 'Invalid wallet address format' });
    }

    req.user = {
      walletAddress: decoded.walletAddress,
      role: decoded.role || 'patient'
    };

    next();
  } catch (error) {
    logger.warn('Wallet authentication failed', { error: error.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

## 🔍 Debugging Tools

### TypeScript & Node.js Debugging

```bash
# Interactive debugging with Node.js built-in debugger
node --inspect-brk apps/backend/dist/server.js

# Debug TypeScript with ts-node
node --inspect-brv apps/backend/src/server.ts

# Frontend debugging with Vite
npm run dev -- --debug

# Debug Compact contracts
compactc compile --debug contracts/genomic-verification/src/genomic_verifier.compact

# Memory profiling with clinic.js
npm install -g clinic
clinic doctor -- node apps/backend/dist/server.js

# Performance profiling  
clinic flame -- node apps/backend/dist/server.js

# Heap analysis
clinic heapprofiler -- node apps/backend/dist/server.js
```

### ZK Proof Debugging

```typescript
import { performance } from 'perf_hooks';

export class ZKProofDebugger {
  private static debugMode = process.env.NODE_ENV === 'development';

  static debugProofGeneration<T>(
    proofType: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.debugMode) {
      return operation();
    }

    return new Promise(async (resolve, reject) => {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();

      logger.debug(`Starting ${proofType} proof generation`, {
        startMemory: {
          heapUsed: Math.round(startMemory.heapUsed / 1024 / 1024) + 'MB',
          external: Math.round(startMemory.external / 1024 / 1024) + 'MB'
        }
      });

      try {
        const result = await operation();
        
        const endTime = performance.now();
        const endMemory = process.memoryUsage();
        
        logger.debug(`Completed ${proofType} proof generation`, {
          duration: Math.round(endTime - startTime) + 'ms',
          memoryDelta: {
            heap: Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024) + 'MB',
            external: Math.round((endMemory.external - startMemory.external) / 1024 / 1024) + 'MB'
          }
        });

        resolve(result);
      } catch (error) {
        const endTime = performance.now();
        logger.error(`Failed ${proofType} proof generation`, {
          duration: Math.round(endTime - startTime) + 'ms',
          error: error.message,
          stack: error.stack
        });
        reject(error);
      }
    });
  }

  // Debug circuit constraints and witness data
  static logCircuitInfo(circuitName: string, constraints: number, witnesses: number) {
    if (this.debugMode) {
      logger.debug(`Circuit analysis: ${circuitName}`, {
        constraints,
        witnesses,
        estimatedProofTime: this.estimateProofTime(constraints),
        memoryRequired: this.estimateMemoryUsage(constraints)
      });
    }
  }

  private static estimateProofTime(constraints: number): string {
    // Rough estimation based on circuit complexity
    const timeMs = Math.round(constraints * 0.1); // 0.1ms per constraint estimate
    return timeMs > 1000 ? `${Math.round(timeMs / 1000)}s` : `${timeMs}ms`;
  }

  private static estimateMemoryUsage(constraints: number): string {
    const memoryMB = Math.round(constraints * 0.001); // 1KB per constraint estimate
    return `${memoryMB}MB`;
  }
}

// Usage in proof generation
export class ZKProofService {
  async generateBRCA1Proof(genomeData: EncryptedGenome): Promise<ZKProof> {
    return ZKProofDebugger.debugProofGeneration(
      'BRCA1',
      async () => {
        ZKProofDebugger.logCircuitInfo('BRCA1_BOOLEAN', 1500, 300);
        
        // Actual proof generation logic
        const circuit = await this.loadBRCA1Circuit();
        const witness = await this.generateWitness(genomeData);
        const proof = await this.generateProof(circuit, witness);
        
        return proof;
      }
    );
  }
}
```

## 📊 Monitoring and Observability

### Genomic Privacy Monitoring

```typescript
import { createPrometheusMetrics } from 'prom-client';
import { EventEmitter } from 'events';

// Define metrics for genomic privacy operations
export const metrics = {
  proofGenerationDuration: new Histogram({
    name: 'zk_proof_generation_duration_seconds',
    help: 'Time taken to generate ZK proofs',
    labelNames: ['trait_type', 'success'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
  }),

  genomicDataUploads: new Counter({
    name: 'genomic_data_uploads_total',
    help: 'Total number of genomic data uploads',
    labelNames: ['encryption_status', 'ipfs_status']
  }),

  verificationRequests: new Counter({
    name: 'verification_requests_total',
    help: 'Total verification requests by doctors',
    labelNames: ['trait_type', 'status']
  }),

  walletConnections: new Counter({
    name: 'wallet_connections_total',
    help: 'Total wallet connection attempts',
    labelNames: ['wallet_type', 'success']
  }),

  circuitConstraints: new Gauge({
    name: 'zk_circuit_constraints',
    help: 'Number of constraints in ZK circuits',
    labelNames: ['circuit_name']
  })
};

// Event-driven monitoring system
export class GenomicPrivacyMonitor extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Monitor proof generation
    this.on('proof:generation:started', (data) => {
      logger.info('ZK proof generation started', {
        correlationId: data.correlationId,
        traitType: data.traitType,
        patientAddress: data.patientAddress?.slice(0, 10) + '...',
        timestamp: new Date().toISOString()
      });
    });

    this.on('proof:generation:completed', (data) => {
      metrics.proofGenerationDuration.observe(
        { trait_type: data.traitType, success: 'true' },
        data.duration / 1000
      );

      logger.info('ZK proof generation completed', {
        correlationId: data.correlationId,
        traitType: data.traitType,
        duration: data.duration,
        constraints: data.constraints,
        proofSize: data.proofSize,
        success: true
      });
    });

    this.on('proof:generation:failed', (data) => {
      metrics.proofGenerationDuration.observe(
        { trait_type: data.traitType, success: 'false' },
        data.duration / 1000
      );

      logger.error('ZK proof generation failed', {
        correlationId: data.correlationId,
        traitType: data.traitType,
        duration: data.duration,
        error: data.error,
        success: false
      });
    });

    // Monitor genomic data operations
    this.on('genome:upload:started', (data) => {
      logger.info('Genomic data upload started', {
        correlationId: data.correlationId,
        patientAddress: data.patientAddress?.slice(0, 10) + '...',
        dataSize: data.dataSize,
        encryptionType: data.encryptionType
      });
    });

    this.on('genome:upload:completed', (data) => {
      metrics.genomicDataUploads.inc({
        encryption_status: 'success',
        ipfs_status: data.ipfsSuccess ? 'success' : 'failed'
      });

      logger.info('Genomic data upload completed', {
        correlationId: data.correlationId,
        ipfsCid: data.ipfsCid,
        commitmentHash: data.commitmentHash,
        uploadDuration: data.uploadDuration,
        success: true
      });
    });

    // Monitor verification requests
    this.on('verification:request:created', (data) => {
      metrics.verificationRequests.inc({
        trait_type: data.traitType,
        status: 'created'
      });

      logger.info('Verification request created', {
        requestId: data.requestId,
        doctorAddress: data.doctorAddress?.slice(0, 10) + '...',
        patientAddress: data.patientAddress?.slice(0, 10) + '...',
        traitType: data.traitType,
        expiresAt: data.expiresAt
      });
    });

    // Monitor wallet connections
    this.on('wallet:connection:attempt', (data) => {
      logger.info('Wallet connection attempt', {
        walletType: data.walletType,
        userAgent: data.userAgent,
        timestamp: new Date().toISOString()
      });
    });

    this.on('wallet:connection:success', (data) => {
      metrics.walletConnections.inc({
        wallet_type: data.walletType,
        success: 'true'
      });

      logger.info('Wallet connection successful', {
        walletType: data.walletType,
        walletAddress: data.walletAddress?.slice(0, 10) + '...',
        networkId: data.networkId
      });
    });
  }

  // Emit events with correlation IDs for tracing
  emitProofGenerationStarted(traitType: string, patientAddress: string) {
    const correlationId = crypto.randomUUID();
    this.emit('proof:generation:started', {
      correlationId,
      traitType,
      patientAddress,
      timestamp: Date.now()
    });
    return correlationId;
  }

  emitProofGenerationCompleted(
    correlationId: string,
    traitType: string,
    duration: number,
    constraints: number,
    proofSize: number
  ) {
    this.emit('proof:generation:completed', {
      correlationId,
      traitType,
      duration,
      constraints,
      proofSize
    });
  }
}

// Health check endpoint for monitoring
export function setupHealthChecks(app: Express) {
  app.get('/health', async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await checkDatabaseHealth(),
        redis: await checkRedisHealth(),
        ipfs: await checkIPFSHealth(),
        midnight: await checkMidnightHealth()
      }
    };

    const isHealthy = Object.values(health.services).every(
      service => service.status === 'healthy'
    );

    res.status(isHealthy ? 200 : 503).json(health);
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.end(await register.metrics());
  });
}

// Global monitor instance
export const monitor = new GenomicPrivacyMonitor();
```

## 📚 Useful Resources

### Midnight Framework & Compact

- **Midnight Developer Docs**: https://docs.midnight.network - PRIMARY REFERENCE
- **Compact Language Guide**: https://docs.midnight.network/develop/tutorial
- **Midnight.js SDK**: https://github.com/midnight-network/midnight-js
- **Create Midnight App**: https://github.com/kaleababayneh/create-midnight-app
- **Compact Compiler Manual**: Located in `/compact docs/Compact Compiler Manual Page _ Midnight Docs.pdf`
- **ZK Circuit Examples**: https://github.com/midnight-network/compact-examples

### TypeScript & Development Tools

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Zod Documentation**: https://zod.dev/ - Runtime type validation
- **Jest Testing Framework**: https://jestjs.io/docs/getting-started
- **Vite Build Tool**: https://vitejs.dev/guide/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

### Zero-Knowledge Proofs & Cryptography

- **ZK-SNARKs Explained**: https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell/
- **Noble Cryptography Libraries**: https://github.com/paulmillr/noble-curves
- **IPFS Documentation**: https://docs.ipfs.tech/
- **Web3 Security Best Practices**: https://consensys.github.io/smart-contract-best-practices/

### Healthcare & Genomics Domain

- **HIPAA Compliance Guide**: https://www.hhs.gov/hipaa/index.html
- **Genomic Data Standards**: https://www.ga4gh.org/genomic-data-toolkit/
- **BRCA Mutation Information**: https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet
- **Pharmacogenomics (CYP2D6)**: https://www.pharmgkb.org/gene/PA128

## ⚠️ Important Notes

### Critical Security Reminders

- **NEVER LOG GENOMIC DATA** - Patient genomic information must never appear in logs, even in development
- **ALWAYS ENCRYPT BEFORE STORAGE** - Genomic data must be encrypted before IPFS upload or database storage
- **VERIFY PROOF INTEGRITY** - Always validate ZK proofs on-chain and client-side
- **USE SECURE RANDOMNESS** - Use cryptographically secure random number generation for all keys and nonces
- **VALIDATE WALLET SIGNATURES** - Always verify wallet signatures for authentication

### Development Guidelines

- **NEVER ASSUME OR GUESS** - When in doubt about Compact syntax or Midnight APIs, consult documentation
- **Always verify smart contract addresses** before deployment or interaction
- **Keep COPILOT.md updated** when adding new patterns or dependencies
- **Test ZK circuits thoroughly** - Proof generation is computationally expensive, ensure circuits are correct
- **Document your decisions** - Especially circuit design choices and cryptographic implementations
- **Follow the PRD requirements** - Refer to `prd-genomic-privacy-final.md` for functional requirements

### Hackathon-Specific Notes

- **Demo path MUST work flawlessly** - Focus error handling on the main demo flow
- **Time box features** - 48 hours is limited, prioritize core ZK proof functionality
- **Cache expensive operations** - Proof generation, IPFS uploads, and circuit compilation
- **Prepare fallback strategies** - Have offline demo data ready in case of network issues
- **Track progress against FR requirements** - Reference the PRD's functional requirements list

## 🔍 Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) for fast code searching in the genomic privacy codebase:

```bash
# ❌ Don't use grep
grep -r "ZKProof" .

# ✅ Use rg instead for TypeScript/Compact code
rg "ZKProof"

# Search for specific file types
rg --type ts "generateProof"
rg --type js "walletConnect"
rg "contract" -g "*.compact"

# Search for Compact contract functions
rg "function.*verify.*proof" -g "*.compact"

# Search for TypeScript interfaces and types
rg "interface.*Genomic" --type ts

# Find environment variables
rg "process\.env\." --type ts

# Search for specific imports
rg "from.*midnight" --type ts
```

**File Type Patterns for Genomic Privacy:**

```bash
# TypeScript application code
rg "pattern" --type ts

# React components
rg "pattern" -g "*.tsx"

# Compact smart contracts  
rg "pattern" -g "*.compact"

# Configuration files
rg "pattern" -g "*.json" -g "*.env*"

# Test files
rg "pattern" -g "*test*" -g "*spec*"
```

## 🚀 Hackathon Development Workflow

```
main (protected) ←── PR ←── feature/zk-proof-generation
    ↓                           
    └─── contracts/brca-circuit
    └─── feature/wallet-integration  
    └─── fix/ipfs-upload
```

### Hackathon Daily Workflow:

1. **Start each feature branch from main**
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/zk-proof-generation
   ```

2. **Make focused changes with tests**
   - Implement feature according to PRD requirements
   - Add comprehensive tests for ZK circuits
   - Update documentation if needed

3. **Commit frequently with descriptive messages**
   ```bash
   git add -A
   git commit -m "feat(proofs): implement BRCA1 circuit with boolean proof"
   ```

4. **Push and create PR quickly**
   ```bash
   git push origin feature/zk-proof-generation
   # Create PR via GitHub UI with checklist from PRD
   ```

5. **Fast review and merge for hackathon pace**
   - Quick code review focusing on security and functionality
   - Merge to main once basic tests pass
   - Deploy to testnet immediately for integration testing

### Compact Contract Deployment Workflow:

```bash
# 1. Compile contracts
compactc compile contracts/genomic-verification/src/genomic_verifier.compact

# 2. Test locally
npm test -- --testPathPattern=contracts

# 3. Deploy to testnet
cd contracts && npm run deploy:testnet

# 4. Verify deployment
npm run verify:testnet -- --contract-address <address>

# 5. Update frontend with new contract address
git checkout -b contracts/update-addresses
# Update contract addresses in config
git commit -m "contracts: update deployed addresses for testnet"
```

## 🛠️ Compact Compiler Tools

### Available Compact Tools (v0.25.0)

Located in `/Users/amogh/Projects/midnight_hackathon/compactc_v0.25.0_aarch64-darwin/`:

```bash
# Main compiler
compactc - Compact language compiler for ZK circuits

# Supporting tools
compactc.bin - Core compiler binary
fixup-compact - Code formatting and fix utility
format-compact - Automatic code formatting
zkir - Zero-knowledge intermediate representation tool
```

### Compact Compilation Pipeline

```bash
# 1. Format Compact code
format-compact contracts/genomic-verification/src/

# 2. Compile to circuits
compactc compile contracts/genomic-verification/src/genomic_verifier.compact \
  --output contracts/genomic-verification/build/ \
  --optimize

# 3. Generate TypeScript bindings
compactc generate-bindings \
  --input contracts/genomic-verification/build/genomic_verifier.json \
  --output apps/backend/src/contracts/

# 4. Verify circuit constraints
zkir analyze contracts/genomic-verification/build/genomic_verifier.zkir
```

### Compact Development Best Practices

```typescript
// genomic_verifier.compact
contract GenomicVerifier {
    // Use descriptive names for public inputs
    public function verify_brca1_mutation(
        genome_commitment: Hash,
        mutation_present: Bool
    ) -> Bool {
        // Reason: Minimize circuit constraints by using efficient operations
        let witness = private_input();
        let computed_hash = poseidon_hash(witness.genome_data);
        
        // Verify commitment
        assert(computed_hash == genome_commitment);
        
        // Check BRCA1 markers efficiently
        return check_brca1_variants(witness.markers);
    }
    
    // Private helper functions reduce code duplication
    private function check_brca1_variants(markers: Field) -> Bool {
        // Known pathogenic BRCA1 variants as bit flags
        let pathogenic_variants = 0x1A2B3C4D; // Encoded variant IDs
        return (markers & pathogenic_variants) != 0;
    }
}
``` 

### Integration with TypeScript

```typescript
// Generated bindings usage
import { GenomicVerifier } from './contracts/GenomicVerifier';
import { MidnightProvider } from '@midnight-ntwrk/midnight-js-sdk';

export class ContractService {
  private contract: GenomicVerifier;
  
  constructor(provider: MidnightProvider) {
    this.contract = new GenomicVerifier(
      provider,
      config.GENOMIC_VERIFIER_ADDRESS
    );
  }

  async verifyBRCA1Proof(
    genomeCommitment: string,
    mutationPresent: boolean,
    proof: ZKProof
  ): Promise<boolean> {
    try {
      const tx = await this.contract.verify_brca1_mutation(
        genomeCommitment,
        mutationPresent,
        {
          proof: proof.proof,
          publicInputs: proof.publicInputs
        }
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      logger.error('On-chain proof verification failed', {
        error: error.message,
        genomeCommitment,
        mutationPresent
      });
      return false;
    }
  }
}
```

---

## 📋 Quick Reference Checklist

### Before Starting Development

- [ ] Compact compiler (`compactc`) is in PATH and working
- [ ] Node.js environment is set up with all dependencies
- [ ] Environment variables are configured (see PRD section 14)
- [ ] Lace wallet is installed and connected to Midnight testnet
- [ ] IPFS gateway credentials are configured
- [ ] Database is running (PostgreSQL + Redis)

### Before Each Commit

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] All tests pass (`npm test`)
- [ ] Code is formatted (`npx prettier --write "**/*.{ts,tsx}"`)
- [ ] No genomic data in logs or console output
- [ ] Compact contracts compile successfully
- [ ] Security review for crypto operations

### Before Demo/Deployment

- [ ] All ZK circuits tested with valid/invalid inputs
- [ ] Smart contracts deployed to Midnight testnet
- [ ] Frontend connects to deployed contracts
- [ ] IPFS uploads working with encryption
- [ ] Wallet authentication flow complete
- [ ] Error boundaries handle edge cases
- [ ] Performance acceptable for demo (<10s proof generation)

---

_This document is the definitive guide for GitHub Copilot when working on the Genomic Privacy DApp. Update it as the project evolves and new patterns emerge during the hackathon._