/**
 * Real Pinata IPFS Service for Production
 * Dev 1 & 3: Task 3.6 - Configure real Pinata IPFS integration
 */

import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { logger } from '@utils/logger';
import { encryptionIntegrationService } from '@/services/encryptionIntegration';
import crypto from 'crypto';

interface PinataMetadata {
  name: string;
  keyvalues?: Record<string, any>;
}

interface PinataOptions {
  pinataMetadata?: PinataMetadata;
  pinataOptions?: {
    cidVersion?: 0 | 1;
    wrapWithDirectory?: boolean;
    customPinPolicy?: {
      regions: Array<{
        id: string;
        desiredReplicationCount: number;
      }>;
    };
  };
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export class RealPinataService {
  private pinataApi: AxiosInstance;
  private readonly PINATA_BASE_URL = 'https://api.pinata.cloud';
  private readonly GATEWAY_URL: string;
  private isInitialized = false;

  constructor() {
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET;
    const jwt = process.env.PINATA_JWT;

    if (!apiKey || !apiSecret) {
      throw new Error('Pinata API credentials not configured. Please set PINATA_API_KEY and PINATA_API_SECRET');
    }

    // Use JWT if available, otherwise use API key/secret
    if (jwt) {
      this.pinataApi = axios.create({
        baseURL: this.PINATA_BASE_URL,
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
    } else {
      this.pinataApi = axios.create({
        baseURL: this.PINATA_BASE_URL,
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret
        }
      });
    }

    // Configure gateway URL
    this.GATEWAY_URL = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

    this.testConnection();
  }

  /**
   * Test Pinata connection on initialization
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await this.pinataApi.get('/data/testAuthentication');
      if (response.data.authenticated) {
        this.isInitialized = true;
        logger.info('✅ Pinata connection established successfully');
      } else {
        throw new Error('Pinata authentication failed');
      }
    } catch (error) {
      logger.error('Failed to connect to Pinata:', error);
      throw new Error('Pinata connection test failed. Check credentials.');
    }
  }

  /**
   * Pin JSON data to IPFS via Pinata with metadata
   */
  async pinJSON(
    data: any,
    metadata?: {
      name?: string;
      userId?: string;
      dataType?: string;
      encrypted?: boolean;
    }
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      const pinataMetadata: PinataMetadata = {
        name: metadata?.name || `genomic_data_${Date.now()}`,
        keyvalues: {
          userId: metadata?.userId || 'anonymous',
          dataType: metadata?.dataType || 'genomic',
          encrypted: String(metadata?.encrypted || true),
          uploadDate: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const options: PinataOptions = {
        pinataMetadata,
        pinataOptions: {
          cidVersion: 1,
          customPinPolicy: {
            regions: [
              {
                id: 'FRA1',
                desiredReplicationCount: 2
              },
              {
                id: 'NYC1',
                desiredReplicationCount: 2
              }
            ]
          }
        }
      };

      const response = await this.pinataApi.post<PinataResponse>(
        '/pinning/pinJSONToIPFS',
        {
          pinataContent: data,
          ...options
        }
      );

      logger.info(`✅ Data pinned to IPFS successfully`, {
        cid: response.data.IpfsHash,
        size: response.data.PinSize,
        duplicate: response.data.isDuplicate
      });

      return response.data.IpfsHash;
    } catch (error: any) {
      logger.error('Failed to pin data to Pinata:', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Pinata pinning failed: ${error.message}`);
    }
  }

  /**
   * Pin encrypted genomic data with commitment hash
   */
  async pinEncryptedGenomicData(
    userId: string,
    genomicData: object
  ): Promise<{
    ipfsCid: string;
    commitmentHash: string;
    encryptionKey: string;
    pinSize: number;
  }> {
    try {
      // Generate encryption key
      const encryptionKey = crypto.randomBytes(32).toString('hex');

      // Encrypt the genomic data
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from(encryptionKey, 'hex'),
        iv
      );

      const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(genomicData), 'utf8'),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      // Prepare encrypted payload
      const encryptedPayload = {
        encrypted: encrypted.toString('base64'),
        authTag: authTag.toString('base64'),
        iv: iv.toString('base64'),
        algorithm: 'aes-256-gcm'
      };

      // Pin to IPFS with metadata
      const metadata = {
        name: `patient_${userId}_genome_${Date.now()}`,
        userId,
        dataType: 'encrypted_genomic_data',
        encrypted: true
      };

      const ipfsCid = await this.pinJSON(encryptedPayload, metadata);

      // Generate commitment hash (hash of encrypted data + CID)
      const commitmentData = `${encrypted.toString('base64')}:${ipfsCid}:${userId}`;
      const commitmentHash = `0x${crypto
        .createHash('sha256')
        .update(commitmentData)
        .digest('hex')}`;

      // Get pin size
      const pinInfo = await this.getPinDetails(ipfsCid);

      return {
        ipfsCid,
        commitmentHash,
        encryptionKey,
        pinSize: pinInfo.size
      };
    } catch (error: any) {
      logger.error('Failed to pin encrypted genomic data:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from IPFS via Pinata gateway
   */
  async getFromIPFS(cid: string): Promise<any> {
    try {
      const url = `${this.GATEWAY_URL}/${cid}`;
      const response = await axios.get(url, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });

      logger.info(`✅ Retrieved data from IPFS`, { cid });
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to retrieve CID ${cid} from IPFS:`, error.message);
      throw new Error(`Failed to retrieve data from IPFS: ${error.message}`);
    }
  }

  /**
   * Verify a pin exists on Pinata
   */
  async verifyPin(cid: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      const response = await this.pinataApi.get('/data/pinList', {
        params: {
          hashContains: cid,
          status: 'pinned'
        }
      });

      const exists = response.data.count > 0;
      logger.info(`Pin verification for ${cid}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      return exists;
    } catch (error: any) {
      logger.error(`Failed to verify pin ${cid}:`, error);
      return false;
    }
  }

  /**
   * Get details about a specific pin
   */
  async getPinDetails(cid: string): Promise<{
    cid: string;
    size: number;
    dateAdded: Date;
    metadata?: any;
  }> {
    try {
      const response = await this.pinataApi.get('/data/pinList', {
        params: {
          hashContains: cid,
          status: 'pinned',
          pageLimit: 1
        }
      });

      if (response.data.count === 0) {
        throw new Error(`Pin not found: ${cid}`);
      }

      const pin = response.data.rows[0];
      return {
        cid: pin.ipfs_pin_hash,
        size: pin.size,
        dateAdded: new Date(pin.date_pinned),
        metadata: pin.metadata
      };
    } catch (error: any) {
      logger.error(`Failed to get pin details for ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Unpin data from IPFS
   */
  async unpin(cid: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      await this.pinataApi.delete(`/pinning/unpin/${cid}`);
      logger.info(`✅ Successfully unpinned CID: ${cid}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(`CID not found for unpinning: ${cid}`);
        return false;
      }
      logger.error(`Failed to unpin ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Get pinning statistics for the account
   */
  async getPinStats(): Promise<{
    count: number;
    totalSize: number;
    limitGB: number;
    usedGB: number;
    percentUsed: number;
  }> {
    try {
      // Get pin list stats
      const pinListResponse = await this.pinataApi.get('/data/pinList', {
        params: {
          status: 'pinned',
          pageLimit: 1
        }
      });

      // Get user subscription info (if available)
      let limitGB = 1; // Free tier default
      try {
        const userResponse = await this.pinataApi.get('/users/generateApiKey');
        if (userResponse.data?.maxPinSize) {
          limitGB = userResponse.data.maxPinSize / (1024 * 1024 * 1024);
        }
      } catch {
        // Ignore if endpoint not available
      }

      const totalSize = pinListResponse.data.rows.reduce(
        (sum: number, pin: any) => sum + (pin.size || 0),
        0
      );

      const usedGB = totalSize / (1024 * 1024 * 1024);
      const percentUsed = (usedGB / limitGB) * 100;

      return {
        count: pinListResponse.data.count,
        totalSize,
        limitGB,
        usedGB: parseFloat(usedGB.toFixed(2)),
        percentUsed: parseFloat(percentUsed.toFixed(1))
      };
    } catch (error: any) {
      logger.error('Failed to get pin stats:', error);
      throw error;
    }
  }

  /**
   * List all pins with optional filters
   */
  async listPins(options?: {
    pageLimit?: number;
    pageOffset?: number;
    metadata?: Record<string, string>;
  }): Promise<Array<{
    cid: string;
    size: number;
    dateAdded: Date;
    name?: string;
    metadata?: any;
  }>> {
    try {
      const params: any = {
        status: 'pinned',
        pageLimit: options?.pageLimit || 10,
        pageOffset: options?.pageOffset || 0
      };

      // Add metadata filters if provided
      if (options?.metadata) {
        params.metadata = options.metadata;
      }

      const response = await this.pinataApi.get('/data/pinList', { params });

      return response.data.rows.map((pin: any) => ({
        cid: pin.ipfs_pin_hash,
        size: pin.size,
        dateAdded: new Date(pin.date_pinned),
        name: pin.metadata?.name,
        metadata: pin.metadata?.keyvalues
      }));
    } catch (error: any) {
      logger.error('Failed to list pins:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const realPinataService = new RealPinataService();

// Export for testing
export default RealPinataService;