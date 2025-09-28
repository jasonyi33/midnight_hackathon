import { apiError } from './errors'
import { demoApiClient } from './demo-client'
import type {
  ApiClient,
  AuthRequestPayload,
  AuthResponse,
  ConsentResponsePayload,
  GenomeSummary,
  GenomeUploadPayload,
  GenomeUploadResponse,
  ProofGenerationPayload,
  ProofJob,
  ProofRecord,
  VerificationRequest,
} from './types'
import type { AuthTokens } from '../../../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() === 'true'

class HttpApiClient implements ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = sessionStorage.getItem('gp-access-token')
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw await apiError(response)
    }

    if (response.status === 204) {
      return null as unknown as T
    }

    return (await response.json()) as T
  }

  async authenticate(payload: AuthRequestPayload): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/api/auth/connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    sessionStorage.setItem('gp-access-token', result.data.accessToken)
    return result
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const result = await this.request<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
    sessionStorage.setItem('gp-access-token', result.accessToken)
    return result
  }

  async getGenomeSummary(): Promise<GenomeSummary> {
    return this.request<GenomeSummary>('/api/genome')
  }

  async uploadGenome(payload: GenomeUploadPayload): Promise<GenomeUploadResponse> {
    return this.request<GenomeUploadResponse>('/api/genome/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async requestProof(payload: ProofGenerationPayload): Promise<{ jobId: string }> {
    return this.request<{ jobId: string }>('/api/proof/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getProofJob(jobId: string): Promise<ProofJob> {
    return this.request<ProofJob>(`/api/proof/status/${jobId}`)
  }

  async listProofs(): Promise<ProofRecord[]> {
    return this.request<ProofRecord[]>('/api/proof/history')
  }

  async listVerificationRequests(): Promise<VerificationRequest[]> {
    return this.request<VerificationRequest[]>('/api/verification')
  }

  async respondToVerification(payload: ConsentResponsePayload): Promise<VerificationRequest> {
    return this.request<VerificationRequest>('/api/verification/respond', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

const apiClient: ApiClient = !DEMO_MODE && API_BASE_URL ? new HttpApiClient(API_BASE_URL) : demoApiClient

export { apiClient }
