import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { encryptionIntegrationService } from '@/services/encryptionIntegration';
import {
  PinataOptions,
  PinataResponse,
  GenomicDataUpload,
  GenomicMetadata,
  IPFSFile
} from './ipfs.types';

export class IPFSService {
  private pinataApi: AxiosInstance;
  private readonly PINATA_BASE_URL = 'https://api.pinata.cloud';
  private readonly GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';
  private mockStorage: Map<string, string> = new Map();

  constructor() {
    // Get Pinata credentials from environment
    const apiKey = process.env.PINATA_API_KEY || process.env.IPFS_PROJECT_ID;
    const apiSecret = process.env.PINATA_API_SECRET || process.env.IPFS_PROJECT_SECRET;

    if (!apiKey || !apiSecret) {
      logger.warn('Pinata credentials not found, using mock IPFS service');
    }

    this.pinataApi = axios.create({
      baseURL: this.PINATA_BASE_URL,
      headers: {
        'pinata_api_key': apiKey || 'mock_key',
        'pinata_secret_api_key': apiSecret || 'mock_secret'
      }
    });
  }

  /**
   * Pin JSON data to IPFS via Pinata
   */
  async pinJSON(data: any, metadata?: GenomicMetadata): Promise<string> {
    try {
      const options: PinataOptions = {
        pinataMetadata: {
          name: metadata ? `genomic_${metadata.userId}_${Date.now()}` : `data_${Date.now()}`,
          keyvalues: metadata as any
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      // If Pinata not configured, use mock
      if (!process.env.PINATA_API_KEY) {
        return this.mockPin(data);
      }

      const response = await this.pinataApi.post<PinataResponse>(
        '/pinning/pinJSONToIPFS',
        {
          pinataContent: data,
          ...options
        }
      );

      logger.info(`Data pinned to IPFS: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } catch (error) {
      logger.error('Failed to pin to IPFS:', error);
      // Fallback to mock for development
      return this.mockPin(data);
    }
  }

  /**
   * Pin encrypted genomic data to IPFS
   */
  async pinGenomicData(
    userId: string,
    genomicData: object,
    encrypted: boolean = true
  ): Promise<{ cid: string; commitmentHash: string }> {
    try {
      let dataToPin: any = genomicData;

      // Encrypt if required
      if (encrypted) {
        const encryptionResult = await encryptionIntegrationService.encryptGenomeCommitment(
          userId,
          genomicData,
          '' // IPFS CID will be updated after pinning
        );
        dataToPin = JSON.parse(encryptionResult.encryptedData);
      }

      // Create metadata
      const metadata: GenomicMetadata = {
        userId,
        uploadDate: new Date().toISOString(),
        dataType: 'genomic_data',
        encrypted,
        version: '1.0.0'
      };

      // Pin to IPFS
      const cid = await this.pinJSON(dataToPin, metadata);

      // Generate commitment hash
      const crypto = await import('crypto');
      const commitmentData = JSON.stringify({ userId, cid, timestamp: Date.now() });
      const commitmentHash = `0x${crypto.createHash('sha256').update(commitmentData).digest('hex')}`;

      // Update database with CID
      if (encrypted) {
        await encryptionIntegrationService.encryptGenomeCommitment(
          userId,
          genomicData,
          cid
        );
      }

      logger.info(`Genomic data pinned for user ${userId}: CID=${cid}`);

      return { cid, commitmentHash };
    } catch (error) {
      logger.error('Failed to pin genomic data:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from IPFS
   */
  async getFromIPFS(cid: string): Promise<any> {
    try {
      // If using mock, return mock data
      if (!process.env.PINATA_API_KEY) {
        return this.mockGet(cid);
      }

      const response = await axios.get(`${this.GATEWAY_URL}/${cid}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to retrieve CID ${cid} from IPFS:`, error);
      throw error;
    }
  }

  /**
   * Verify a pin exists
   */
  async verifyPin(cid: string): Promise<boolean> {
    try {
      if (!process.env.PINATA_API_KEY) {
        return true; // Mock always returns true
      }

      const response = await this.pinataApi.get(`/data/pinList?hashContains=${cid}`);
      return response.data.count > 0;
    } catch (error) {
      logger.error(`Failed to verify pin ${cid}:`, error);
      return false;
    }
  }

  /**
   * Unpin data from IPFS
   */
  async unpin(cid: string): Promise<boolean> {
    try {
      if (!process.env.PINATA_API_KEY) {
        return true; // Mock always returns true
      }

      await this.pinataApi.delete(`/pinning/unpin/${cid}`);
      logger.info(`Unpinned CID: ${cid}`);
      return true;
    } catch (error) {
      logger.error(`Failed to unpin ${cid}:`, error);
      return false;
    }
  }

  /**
   * Get pinned data statistics
   */
  async getPinStats(): Promise<{ count: number; size: number }> {
    try {
      if (!process.env.PINATA_API_KEY) {
        return { count: 0, size: 0 };
      }

      const response = await this.pinataApi.get('/data/pinList?pageLimit=1');
      return {
        count: response.data.count,
        size: response.data.rows.reduce((sum: number, pin: any) => sum + pin.size, 0)
      };
    } catch (error) {
      logger.error('Failed to get pin stats:', error);
      return { count: 0, size: 0 };
    }
  }

  /**
   * Mock pin for development
   */
  private mockPin(data: any): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const mockCid = `Qm${hash.substring(0, 44)}`; // Mock IPFS CID format

    // Store in memory for development
    this.mockStorage.set(mockCid, JSON.stringify(data));

    logger.info(`[MOCK] Data pinned with CID: ${mockCid}`);
    return mockCid;
  }

  /**
   * Mock get for development
   */
  private mockGet(cid: string): any {
    const data = this.mockStorage.get(cid);
    if (data) {
      return JSON.parse(data);
    }

    // Return mock genomic data
    return {
      mock: true,
      cid,
      data: 'Mock genomic data for development'
    };
  }
}

export const ipfsService = new IPFSService();