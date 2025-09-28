/**
 * Blockchain Integration Service
 * Connects blockchain events to backend services
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';
import { GenomicVerifierABI } from './GenomicVerifierABI';
import { createBlockchainEventService, BlockchainEventService } from './BlockchainEventService';
// Note: Importing from local interfaces to avoid rootDir issues
// import { createBlockchainEventService } from '../../../contracts/src/services/event-listener.service';
// import GenomicVerifierABI from '../../../contracts/deployment.json';

interface BlockchainEvent {
  type: string;
  data: any;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
}

export class BlockchainIntegrationService extends EventEmitter {
  private eventService?: BlockchainEventService;
  private db: Pool;
  private wsClient?: Socket;
  private isInitialized = false;

  constructor() {
    super();

    // Initialize database pool
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Initialize blockchain event service
    const config = {
      rpcUrl: process.env.MIDNIGHT_RPC_URL || 'https://testnet-rpc.midnight.network',
      contractAddress: process.env.GENOMIC_VERIFIER_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc8e3c4A5F2E1b',
      contractABI: GenomicVerifierABI,
      privateKey: process.env.CONTRACT_OWNER_KEY,
      networkName: process.env.NETWORK_NAME || 'midnight-testnet'
    };

    // Only initialize if not in mock mode
    if (process.env.USE_MOCK_BLOCKCHAIN !== 'true') {
      this.eventService = createBlockchainEventService(config);
      this.setupEventHandlers();
    }
  }

  /**
   * Initialize the integration service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || process.env.USE_MOCK_BLOCKCHAIN === 'true') {
      return;
    }

    try {
      // Start blockchain event listening
      if (this.eventService) {
        await this.eventService.startListening();
      }

      // Connect to WebSocket server for broadcasting
      this.connectWebSocket();

      this.isInitialized = true;
      logger.info('✅ Blockchain integration service initialized');
    } catch (error) {
      logger.error('Failed to initialize blockchain integration:', error);
      throw error;
    }
  }

  /**
   * Setup event handlers for blockchain events
   */
  private setupEventHandlers(): void {
    if (!this.eventService) return;

    // Handle VerificationComplete events
    this.eventService.on('verification:complete', async (data: any) => {
      await this.handleVerificationComplete(data);
    });

    // Handle AccessGranted events
    this.eventService.on('access:granted', async (data: any) => {
      await this.handleAccessGranted(data);
    });

    // Handle AccessRevoked events
    this.eventService.on('access:revoked', async (data: any) => {
      await this.handleAccessRevoked(data);
    });

    // Handle ProofSubmitted events
    this.eventService.on('proof:submitted', async (data: any) => {
      await this.handleProofSubmitted(data);
    });

    // Handle new blocks
    this.eventService.on('newBlock', (blockNumber: number) => {
      logger.debug(`New block: ${blockNumber}`);
    });
  }

  /**
   * Connect to WebSocket server for event broadcasting
   */
  private connectWebSocket(): void {
    const wsUrl = process.env.WS_URL || 'http://localhost:3000';

    this.wsClient = io(wsUrl, {
      auth: {
        type: 'service',
        key: process.env.SERVICE_KEY || 'blockchain-service'
      }
    });

    this.wsClient.on('connect', () => {
      logger.info('Connected to WebSocket server for event broadcasting');
    });

    this.wsClient.on('error', (error) => {
      logger.error('WebSocket connection error:', error);
    });
  }

  /**
   * Handle VerificationComplete event
   */
  private async handleVerificationComplete(data: any): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Update verification count
      await client.query(`
        INSERT INTO blockchain_events (
          event_type, patient_address, proof_hash, trait_type,
          block_number, transaction_hash, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'VERIFICATION_COMPLETE',
        data.patient,
        data.proofHash,
        data.trait,
        data.blockNumber,
        data.transactionHash,
        new Date()
      ]);

      // Update patient verification count
      await client.query(`
        UPDATE users
        SET verification_count = COALESCE(verification_count, 0) + 1,
            last_verification = CURRENT_TIMESTAMP
        WHERE wallet_address = $1
      `, [data.patient]);

      // Update proof status
      await client.query(`
        UPDATE proofs
        SET blockchain_verified = true,
            verification_tx = $1,
            verified_at = CURRENT_TIMESTAMP
        WHERE proof_hash = $2
      `, [data.transactionHash, data.proofHash]);

      await client.query('COMMIT');

      // Broadcast via WebSocket
      if (this.wsClient) {
        this.wsClient.emit('blockchain:verification', {
          patient: data.patient,
          proofHash: data.proofHash,
          trait: data.trait,
          timestamp: data.timestamp,
          txHash: data.transactionHash
        });
      }

      // Emit local event
      this.emit('verificationComplete', data);

      logger.info('Processed VerificationComplete event', {
        patient: data.patient,
        trait: data.trait,
        txHash: data.transactionHash
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process VerificationComplete:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle AccessGranted event
   */
  private async handleAccessGranted(data: any): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Store access grant
      await client.query(`
        INSERT INTO access_grants (
          patient_address, doctor_address, granted_traits,
          expiry_timestamp, block_number, transaction_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (patient_address, doctor_address)
        DO UPDATE SET
          granted_traits = $3,
          expiry_timestamp = $4,
          block_number = $5,
          transaction_hash = $6,
          updated_at = CURRENT_TIMESTAMP
      `, [
        data.patient,
        data.doctor,
        data.traits,
        new Date(data.expiry * 1000), // Convert Unix timestamp
        data.blockNumber,
        data.transactionHash
      ]);

      // Update verification request status
      await client.query(`
        UPDATE verification_requests
        SET status = 'approved',
            responded_at = CURRENT_TIMESTAMP,
            blockchain_tx = $1
        WHERE patient_id = (SELECT id FROM users WHERE wallet_address = $2)
          AND doctor_id = (SELECT id FROM users WHERE wallet_address = $3)
          AND status = 'pending'
      `, [data.transactionHash, data.patient, data.doctor]);

      await client.query('COMMIT');

      // Broadcast via WebSocket
      if (this.wsClient) {
        this.wsClient.emit('blockchain:access', {
          type: 'granted',
          patient: data.patient,
          doctor: data.doctor,
          traits: data.traits,
          expiry: data.expiry,
          txHash: data.transactionHash
        });
      }

      // Emit local event
      this.emit('accessGranted', data);

      logger.info('Processed AccessGranted event', {
        patient: data.patient,
        doctor: data.doctor,
        traits: data.traits
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process AccessGranted:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle AccessRevoked event
   */
  private async handleAccessRevoked(data: any): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Remove access grant
      await client.query(`
        UPDATE access_grants
        SET revoked = true,
            revoked_at = CURRENT_TIMESTAMP,
            revoke_tx = $1
        WHERE patient_address = $2
          AND doctor_address = $3
          AND revoked = false
      `, [data.transactionHash, data.patient, data.doctor]);

      await client.query('COMMIT');

      // Broadcast via WebSocket
      if (this.wsClient) {
        this.wsClient.emit('blockchain:access', {
          type: 'revoked',
          patient: data.patient,
          doctor: data.doctor,
          txHash: data.transactionHash
        });
      }

      // Emit local event
      this.emit('accessRevoked', data);

      logger.info('Processed AccessRevoked event', {
        patient: data.patient,
        doctor: data.doctor
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process AccessRevoked:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle ProofSubmitted event
   */
  private async handleProofSubmitted(data: any): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Store proof submission
      await client.query(`
        INSERT INTO proof_submissions (
          patient_address, proof_hash, trait_type,
          block_number, transaction_hash, submitted_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [
        data.patient,
        data.proofHash,
        data.traitType,
        data.blockNumber,
        data.transactionHash
      ]);

      // Update aggregation statistics
      await this.updateAggregationStats(data.traitType);

      await client.query('COMMIT');

      // Broadcast via WebSocket
      if (this.wsClient) {
        this.wsClient.emit('blockchain:proof', {
          patient: data.patient,
          proofHash: data.proofHash,
          traitType: data.traitType,
          txHash: data.transactionHash
        });

        // Notify researchers of updated aggregation data
        this.wsClient.emit('data:updated', {
          type: 'aggregation',
          trait: data.traitType,
          timestamp: new Date().toISOString()
        });
      }

      // Emit local event
      this.emit('proofSubmitted', data);

      logger.info('Processed ProofSubmitted event', {
        patient: data.patient,
        traitType: data.traitType,
        proofHash: data.proofHash
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process ProofSubmitted:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update aggregation statistics
   */
  private async updateAggregationStats(traitType: string): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO aggregation_stats (trait_type, count, last_updated)
        VALUES ($1, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (trait_type)
        DO UPDATE SET
          count = aggregation_stats.count + 1,
          last_updated = CURRENT_TIMESTAMP
      `, [traitType]);
    } catch (error) {
      logger.error('Failed to update aggregation stats:', error);
    }
  }

  /**
   * Query historical blockchain events
   */
  async queryHistoricalEvents(
    eventType: string,
    fromBlock?: number,
    toBlock?: number | string
  ): Promise<BlockchainEvent[]> {
    if (!this.eventService) {
      return [];
    }

    try {
      const events = await this.eventService.queryHistoricalEvents(
        eventType,
        fromBlock || 0,
        toBlock || 'latest'
      );

      return events.map((event: any) => ({
        type: event.event,
        data: event.args,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.error('Failed to query historical events:', error);
      return [];
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<any> {
    if (!this.eventService) {
      return { status: 'mock mode' };
    }

    return await this.eventService.getNetworkInfo();
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.eventService) {
      this.eventService.destroy();
    }

    if (this.wsClient) {
      this.wsClient.disconnect();
    }

    await this.db.end();

    this.removeAllListeners();
    logger.info('Blockchain integration service destroyed');
  }
}

// Export singleton instance
export const blockchainIntegration = new BlockchainIntegrationService();

// Export for testing
export default BlockchainIntegrationService;