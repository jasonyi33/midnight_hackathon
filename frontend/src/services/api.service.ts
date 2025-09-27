/**
 * Frontend API Service Layer
 * Dev 1: Task 3.1 - Connect patient portal to backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// Types
export interface ProofGenerationRequest {
  traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  genomeHash: string;
  threshold?: number;
}

export interface ProofGenerationResponse {
  jobId: string;
  estimatedTime: number;
}

export interface ProofStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  proof?: string;
  error?: string;
}

export interface GenomeUploadResponse {
  ipfsCid: string;
  commitmentHash: string;
  encrypted: boolean;
}

export interface VerificationRequest {
  patientAddress: string;
  requestedTraits: string[];
  message?: string;
  expiresIn?: number; // hours
}

export interface VerificationResponse {
  requestId: string;
  status: string;
  createdAt: string;
}

class ApiService {
  private api: AxiosInstance;
  private authInterceptor?: number;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for auth and error handling
   */
  private setupInterceptors() {
    // Request interceptor for auth token
    this.authInterceptor = this.api.interceptors.request.use(
      (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 - try refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const { accessToken } = useAuthStore.getState();
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            useAuthStore.getState().logout();
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors with toast notifications
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: AxiosError) {
    let message = 'An unexpected error occurred';

    if (error.response) {
      const data = error.response.data as any;
      message = data.message || data.error || `Error ${error.response.status}`;

      switch (error.response.status) {
        case 400:
          message = `Bad Request: ${message}`;
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 429:
          message = 'Too many requests. Please try again later';
          break;
        case 500:
          message = 'Server error. Please try again later';
          break;
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection';
    }

    toast.error(message);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<void> {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await this.api.post('/auth/refresh', { refreshToken });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

    useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
  }

  // ============= Authentication APIs =============

  /**
   * Connect wallet and authenticate
   */
  async connectWallet(walletAddress: string, signature: string, message: string) {
    const response = await this.api.post('/auth/connect', {
      walletAddress,
      signature,
      message,
    });
    return response.data;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // ============= Genome APIs =============

  /**
   * Upload genome data
   */
  async uploadGenome(file: File, onProgress?: (progress: number) => void): Promise<GenomeUploadResponse> {
    const formData = new FormData();
    formData.append('genome', file);

    const response = await this.api.post('/genome/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    toast.success('Genome uploaded successfully!');
    return response.data;
  }

  /**
   * Get uploaded genomes for current user
   */
  async getMyGenomes() {
    const response = await this.api.get('/genome/my-genomes');
    return response.data;
  }

  // ============= Proof Generation APIs =============

  /**
   * Queue proof generation
   */
  async generateProof(request: ProofGenerationRequest): Promise<ProofGenerationResponse> {
    const response = await this.api.post('/proof/generate', request);
    toast.success('Proof generation started');
    return response.data;
  }

  /**
   * Get proof generation status
   */
  async getProofStatus(jobId: string): Promise<ProofStatus> {
    const response = await this.api.get(`/proof/status/${jobId}`);
    return response.data;
  }

  /**
   * Get all proofs for current user
   */
  async getMyProofs() {
    const response = await this.api.get('/proof/my-proofs');
    return response.data;
  }

  /**
   * Verify proof on blockchain
   */
  async verifyProofOnChain(proofHash: string) {
    const response = await this.api.post('/proof/verify', { proofHash });
    return response.data;
  }

  // ============= Verification APIs =============

  /**
   * Get pending verification requests (patient)
   */
  async getPendingVerifications() {
    const response = await this.api.get('/verification/pending');
    return response.data;
  }

  /**
   * Respond to verification request (patient)
   */
  async respondToVerification(requestId: string, approved: boolean, expiresIn?: number) {
    const response = await this.api.post('/verification/respond', {
      requestId,
      approved,
      expiresIn,
    });

    toast.success(approved ? 'Verification approved' : 'Verification denied');
    return response.data;
  }

  /**
   * Request verification (doctor)
   */
  async requestVerification(request: VerificationRequest): Promise<VerificationResponse> {
    const response = await this.api.post('/verification/request', request);
    toast.success('Verification request sent');
    return response.data;
  }

  /**
   * Get verification history (doctor)
   */
  async getVerificationHistory(doctorId?: string) {
    const endpoint = doctorId
      ? `/verification/history/${doctorId}`
      : '/verification/history';
    const response = await this.api.get(endpoint);
    return response.data;
  }

  // ============= Research/Aggregation APIs =============

  /**
   * Get aggregated mutation data
   */
  async getAggregatedData() {
    const response = await this.api.get('/research/aggregate');
    return response.data;
  }

  /**
   * Get mutation frequencies
   */
  async getMutationFrequencies() {
    const response = await this.api.get('/research/mutations');
    return response.data;
  }

  /**
   * Get metabolizer distribution
   */
  async getMetabolizerDistribution() {
    const response = await this.api.get('/research/metabolizers');
    return response.data;
  }

  /**
   * Export aggregated data as CSV
   */
  async exportData(dataType: 'mutations' | 'metabolizers' | 'trends') {
    const response = await this.api.get(`/research/export/${dataType}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success('Data exported successfully');
  }

  // ============= Balance APIs =============

  /**
   * Get wallet balance
   */
  async getBalance(walletAddress: string) {
    const response = await this.api.get(`/balance/${walletAddress}`);
    return response.data;
  }

  // ============= Health Check =============

  /**
   * Check API health
   */
  async checkHealth() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ProofGenerationRequest, ProofGenerationResponse, ProofStatus, GenomeUploadResponse };