export interface User {
  id: string;
  walletAddress: string;
  role: 'patient' | 'doctor' | 'researcher';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ProofGenerationRequest {
  traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  genomeHash: string;
  threshold?: number;
}

export interface ProofResult {
  proof: string;
  publicInputs: string[];
  verificationKey: string;
  metadata: {
    generationTime: number;
    circuitId: string;
    gasEstimate: number;
  };
}

export interface VerificationRequest {
  id: string;
  patientId: string;
  doctorId: string;
  traitType: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  proofHash?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: {
    timestamp: number;
    requestId: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  retryAfter?: number;
}