# ProofSDK Integration Guide for Backend (Dev 3)

## Overview

The ProofSDK provides a TypeScript interface for generating zero-knowledge proofs for genetic traits. This document explains how to integrate it into the backend proof generation worker.

## Installation & Setup

```bash
# In your backend directory
cd ../backend
npm install --save-dev typescript @types/node

# Copy the SDK files (or use as npm package later)
cp -r ../contracts/src/sdk ./src/proof-sdk
```

## Integration in Proof Worker

### 1. Import the SDK in your worker process

```typescript
// backend/src/workers/proof-worker.ts
import { createProofSDK, validateGenomicData, GenomicData, ProofResult } from '../proof-sdk';

// Initialize SDK with deployed contract address
const contractAddress = process.env.GENOMIC_CONTRACT_ADDRESS || 'mock-address';
const mockMode = process.env.NODE_ENV === 'development';
const proofSDK = createProofSDK(contractAddress, mockMode);
```

### 2. Job Processing Logic

```typescript
// Example job processor using Bull queue
import Bull from 'bull';

interface ProofJob {
    traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
    genomeData: GenomicData;
    threshold?: number;
    targetStatus?: string;
    patientId: string;
    requestId: string;
}

const proofQueue = new Bull('proof generation', process.env.REDIS_URL);

proofQueue.process(async (job: Bull.Job<ProofJob>, done) => {
    const { traitType, genomeData, threshold, targetStatus, patientId, requestId } = job.data;
    
    try {
        // Validate input data
        if (!validateGenomicData(genomeData)) {
            throw new Error('Invalid genomic data format');
        }
        
        // Report progress
        job.progress(10);
        
        let proof: ProofResult;
        
        // Generate proof based on trait type
        switch (traitType) {
            case 'BRCA1':
                proof = await proofSDK.generateBRCA1Proof(genomeData, threshold || 0.5);
                break;
            case 'BRCA2':
                proof = await proofSDK.generateBRCA2Proof(genomeData, threshold || 0.5);
                break;
            case 'CYP2D6':
                proof = await proofSDK.generateCYP2D6Proof(genomeData, targetStatus || 'normal');
                break;
            default:
                throw new Error(`Unsupported trait type: ${traitType}`);
        }
        
        job.progress(90);
        
        // Store proof result in database
        await storeProofResult(patientId, requestId, proof);
        
        job.progress(100);
        done(null, proof);
        
    } catch (error) {
        console.error(`Proof generation failed for ${traitType}:`, error);
        done(error);
    }
});
```

### 3. Progress Reporting via WebSocket

```typescript
// Update progress every 500ms as specified in requirements
proofQueue.on('progress', (job: Bull.Job, progress: number) => {
    // Emit progress to WebSocket clients
    io.to(`patient:${job.data.patientId}`).emit('proof-progress', {
        requestId: job.data.requestId,
        traitType: job.data.traitType,
        progress: progress
    });
});

proofQueue.on('completed', (job: Bull.Job, result: ProofResult) => {
    // Emit completion
    io.to(`patient:${job.data.patientId}`).emit('proof-completed', {
        requestId: job.data.requestId,
        traitType: job.data.traitType,
        result: result
    });
});
```

### 4. Caching Integration

```typescript
// Cache proofs in Redis with 1-hour TTL
import Redis from 'redis';
const redis = Redis.createClient(process.env.REDIS_URL);

async function getCachedProof(cacheKey: string): Promise<ProofResult | null> {
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
}

async function cacheProof(cacheKey: string, proof: ProofResult): Promise<void> {
    await redis.setex(cacheKey, 3600, JSON.stringify(proof)); // 1 hour TTL
}

// Generate cache key from genomic data hash
function generateCacheKey(traitType: string, genomeData: GenomicData, parameter: any): string {
    const hash = crypto.createHash('sha256')
        .update(JSON.stringify({ traitType, genomeData, parameter }))
        .digest('hex');
    return `proof:${traitType}:${hash}`;
}
```

### 5. Error Handling & Retries

```typescript
// Configure job retries and timeout
proofQueue.process(async (job: Bull.Job<ProofJob>) => {
    const timeout = 30000; // 30 seconds as per requirements
    
    return Promise.race([
        generateProof(job.data),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Proof generation timeout')), timeout)
        )
    ]);
});

// Configure job options
const jobOptions: Bull.JobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000
    },
    removeOnComplete: 10,
    removeOnFail: 5
};
```

## Environment Variables

Add these to your backend `.env` file:

```bash
# Contract configuration
GENOMIC_CONTRACT_ADDRESS=midnight_1234567890_abcdef

# Development settings
NODE_ENV=development
MOCK_PROOFS=true

# Redis for caching and queues
REDIS_URL=redis://localhost:6379

# Proof generation settings
PROOF_TIMEOUT_MS=30000
MAX_CONCURRENT_PROOFS=3
CACHE_TTL_SECONDS=3600
```

## API Integration

### Endpoint to trigger proof generation

```typescript
// POST /api/proof/generate
app.post('/api/proof/generate', async (req: Request, res: Response) => {
    const { traitType, genomeData, threshold, targetStatus } = req.body;
    const patientId = req.user.id;
    const requestId = uuidv4();
    
    // Add job to queue
    const job = await proofQueue.add('generate-proof', {
        traitType,
        genomeData,
        threshold,
        targetStatus,
        patientId,
        requestId
    }, jobOptions);
    
    res.json({
        success: true,
        jobId: job.id,
        requestId,
        estimatedTime: proofSDK.isMockMode() ? '5-10 seconds' : '10-30 seconds'
    });
});
```

## Testing

```typescript
// Test the SDK integration
import { createProofSDK } from '../proof-sdk';

describe('ProofSDK Integration', () => {
    const sdk = createProofSDK('test-address', true); // Mock mode
    
    const mockGenomeData = {
        BRCA1: { variants: [], riskScore: 0.3, confidence: 0.95 },
        BRCA2: { variants: [], riskScore: 0.2, confidence: 0.95 },
        CYP2D6: { variants: [], metabolizerStatus: 'normal' as const, activityScore: 1.0 }
    };
    
    test('generates BRCA1 proof', async () => {
        const proof = await sdk.generateBRCA1Proof(mockGenomeData, 0.5);
        expect(proof.traitType).toBe('BRCA1');
        expect(proof.result).toBe(0); // Below threshold
    });
    
    test('generates CYP2D6 proof', async () => {
        const proof = await sdk.generateCYP2D6Proof(mockGenomeData, 'normal');
        expect(proof.traitType).toBe('CYP2D6');
        expect(proof.result).toBe(1); // Matches status
    });
});
```

## Performance Notes

- Mock mode generates proofs in 2-5 seconds
- Real circuit mode may take 5-30 seconds depending on complexity
- Use caching aggressively to avoid regenerating identical proofs
- Limit concurrent proof generation to 3 as specified in requirements
- Implement proper timeout handling (30s) with retry options

## Next Steps

1. **Integration**: Copy SDK to backend and implement in worker
2. **Testing**: Test with mock data first, then with real circuits
3. **Monitoring**: Add logging and metrics for proof generation
4. **Optimization**: Fine-tune caching and concurrency settings

## Support

If you encounter issues integrating the SDK:
1. Check that contract deployment was successful
2. Verify Redis connection for caching
3. Test in mock mode first
4. Check logs for detailed error messages
