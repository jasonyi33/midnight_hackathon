import { z } from 'zod';

export const proofGenerationSchema = z.object({
  body: z.object({
    traitType: z.enum(['BRCA1', 'BRCA2', 'CYP2D6']),
    genomeHash: z.string().length(66),
    threshold: z.number().min(0).max(1).optional(),
    parameters: z.object({
      optimizationLevel: z.enum(['fast', 'balanced', 'thorough']).optional(),
      circuitVersion: z.string().optional()
    }).optional()
  })
});

export const proofStatusSchema = z.object({
  params: z.object({
    jobId: z.string().uuid()
  })
});

export type ProofGenerationInput = z.infer<typeof proofGenerationSchema>['body'];

export interface ProofJob {
  id: string;
  userId: string;
  traitType: string;
  genomeHash: string;
  threshold?: number;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  proof?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Additional types for worker
export type TraitType = 'BRCA1' | 'BRCA2' | 'CYP2D6' | 'HER2' | 'APOE';
export type ProofStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProofJobData {
  userId: string;
  traitType: TraitType;
  genomeCommitmentHash: string;
  threshold?: number;
  requestId: string;
}

export interface ProofJobResult {
  proofId: string;
  proofHash: string;
  status: ProofStatus;
  timestamp: number;
}

export interface ZKProof {
  id: string;
  userId: string;
  traitType: TraitType;
  proofHash: string;
  publicInputs: {
    commitmentHash: string;
    threshold?: number;
    timestamp: number;
  };
  proof: string;
  verificationKey: string;
  createdAt: Date;
  expiresAt: Date;
}