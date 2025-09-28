import type { AuthTokens, UserProfile } from '../../../types/auth'

export type TraitType = 'BRCA1' | 'BRCA2' | 'CYP2D6'

export type AuthRequestPayload = {
  walletAddress: string
  message: string
  signature: string
  role?: 'patient' | 'doctor' | 'researcher'
}

export type AuthResponse = {
  success: boolean
  data: {
    accessToken: string
    user: UserProfile
  }
  metadata: {
    timestamp: number
    requestId: string
    version: string
  }
}

export type GenomeSummary = {
  cid: string | null
  commitmentHash: string | null
  uploadedAt: string | null
  markers: Array<{
    id: TraitType
    label: string
    description: string
    available: boolean
  }>
}

export type GenomeUploadPayload = {
  genomicData: {
    patientId: string
    metadata?: Record<string, any>
    markers: Record<string, any>
    traits: Record<string, any>
    clinical_annotations?: Record<string, any>
  }
  encrypt: boolean
}

export type GenomeUploadResponse = GenomeSummary & {
  status: 'uploaded' | 'pending' | 'failed'
}

export type ProofGenerationPayload = {
  traitType: TraitType
  proofKind: 'boolean' | 'range' | 'set'
  threshold?: number
}

export type ProofJob = {
  jobId: string
  traitType: TraitType
  status: 'queued' | 'running' | 'completed' | 'failed' | 'expired'
  progress: number
  startedAt: string
  completedAt?: string
  verificationUrl?: string
  error?: string
}

export type VerificationRequest = {
  id: string
  doctorId: string
  doctorDisplayName: string
  patientId: string
  traitType: TraitType
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
  respondedAt?: string
  expiresAt?: string
}

export type ConsentResponsePayload = {
  requestId: string
  decision: 'approved' | 'denied'
  expiresAt?: string
}

export type ProofRecord = {
  id: string
  traitType: TraitType
  generatedAt: string
  verificationUrl: string
  status: 'valid' | 'revoked'
}

export type ApiClient = {
  authenticate(payload: AuthRequestPayload): Promise<AuthResponse>
  refreshToken(refreshToken: string): Promise<AuthTokens>
  getGenomeSummary(): Promise<GenomeSummary>
  uploadGenome(payload: GenomeUploadPayload): Promise<GenomeUploadResponse>
  requestProof(payload: ProofGenerationPayload): Promise<{ jobId: string }>
  getProofJob(jobId: string): Promise<ProofJob>
  listProofs(): Promise<ProofRecord[]>
  listVerificationRequests(): Promise<VerificationRequest[]>
  respondToVerification(payload: ConsentResponsePayload): Promise<VerificationRequest>
}
