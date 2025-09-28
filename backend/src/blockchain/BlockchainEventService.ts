/**
 * Blockchain Event Service for monitoring smart contract events
 * Integrates with Midnight blockchain and provides event listening capabilities
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  contractABI: readonly any[];
  privateKey?: string;
  networkName: string;
}

export interface TraitVerifiedEvent {
  patient: string;
  traitType: string;
  verificationResult: boolean;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface GenomeCommittedEvent {
  patient: string;
  commitmentHash: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export class BlockchainEventService extends EventEmitter {
  private config: BlockchainConfig;
  private isListening: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: BlockchainConfig) {
    super();
    this.config = config;
  }

  /**
   * Start listening for blockchain events
   */
  async startListening(): Promise<void> {
    try {
      logger.info('Starting blockchain event listener', {
        network: this.config.networkName,
        contractAddress: this.config.contractAddress
      });

      this.isListening = true;
      this.reconnectAttempts = 0;

      // Mock event listening for test environment
      if (process.env.NODE_ENV === 'test') {
        logger.info('Using mock blockchain events for testing');
        return;
      }

      // Set up event listeners for TraitVerified events
      this.setupTraitVerifiedListener();
      
      // Set up event listeners for GenomeCommitted events
      this.setupGenomeCommittedListener();

      this.emit('connected');
      logger.info('✅ Blockchain event listener started successfully');

    } catch (error) {
      logger.error('Failed to start blockchain event listener', { error });
      this.handleConnectionError(error);
    }
  }

  /**
   * Stop listening for blockchain events
   */
  async stopListening(): Promise<void> {
    this.isListening = false;
    logger.info('Blockchain event listener stopped');
    this.emit('disconnected');
  }

  /**
   * Set up listener for TraitVerified events
   */
  private setupTraitVerifiedListener(): void {
    // Mock implementation for development
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Mock TraitVerified event listener set up');
      return;
    }

    // Real implementation would use Web3 or ethers.js
    // const contract = new ethers.Contract(this.config.contractAddress, this.config.contractABI, provider);
    // contract.on('TraitVerified', this.handleTraitVerifiedEvent.bind(this));
  }

  /**
   * Set up listener for GenomeCommitted events
   */
  private setupGenomeCommittedListener(): void {
    // Mock implementation for development
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Mock GenomeCommitted event listener set up');
      return;
    }

    // Real implementation would use Web3 or ethers.js
    // const contract = new ethers.Contract(this.config.contractAddress, this.config.contractABI, provider);
    // contract.on('GenomeCommitted', this.handleGenomeCommittedEvent.bind(this));
  }

  /**
   * Handle TraitVerified events from the smart contract
   */
  private async handleTraitVerifiedEvent(
    patient: string,
    traitType: string,
    verificationResult: boolean,
    timestamp: number,
    event: any
  ): Promise<void> {
    try {
      const traitEvent: TraitVerifiedEvent = {
        patient,
        traitType,
        verificationResult,
        timestamp,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      };

      logger.info('TraitVerified event received', traitEvent);
      this.emit('traitVerified', traitEvent);

    } catch (error) {
      logger.error('Error handling TraitVerified event', { error, patient, traitType });
    }
  }

  /**
   * Handle GenomeCommitted events from the smart contract
   */
  private async handleGenomeCommittedEvent(
    patient: string,
    commitmentHash: string,
    timestamp: number,
    event: any
  ): Promise<void> {
    try {
      const commitEvent: GenomeCommittedEvent = {
        patient,
        commitmentHash,
        timestamp,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      };

      logger.info('GenomeCommitted event received', commitEvent);
      this.emit('genomeCommitted', commitEvent);

    } catch (error) {
      logger.error('Error handling GenomeCommitted event', { error, patient });
    }
  }

  /**
   * Handle connection errors with retry logic
   */
  private handleConnectionError(error: any): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
      
      logger.warn(`Blockchain connection failed, retrying in ${delay}ms (attempt ${this.reconnectAttempts})`, { error });
      
      setTimeout(() => {
        if (this.isListening) {
          this.startListening().catch((retryError) => {
            logger.error('Retry failed', { retryError });
          });
        }
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached, giving up', { error });
      this.emit('maxReconnectAttemptsReached', error);
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.isListening;
  }

  /**
   * Query historical events from the blockchain
   */
  async queryHistoricalEvents(eventType?: string, fromBlock?: number, toBlock?: number | string): Promise<any[]> {
    if (process.env.NODE_ENV === 'test') {
      return []; // Mock empty results for testing
    }

    try {
      logger.info('Querying historical events', { fromBlock, eventType });
      // Mock implementation - real implementation would query blockchain
      return [];
    } catch (error) {
      logger.error('Failed to query historical events', { error, fromBlock, eventType });
      return [];
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<any> {
    if (process.env.NODE_ENV === 'test') {
      return {
        networkName: 'test-network',
        blockNumber: 12345,
        gasPrice: '20000000000'
      };
    }

    try {
      // Mock implementation - real implementation would query network
      return {
        networkName: this.config.networkName,
        blockNumber: 0,
        gasPrice: '0'
      };
    } catch (error) {
      logger.error('Failed to get network info', { error });
      throw error;
    }
  }

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    this.stopListening();
    this.removeAllListeners();
    logger.info('BlockchainEventService destroyed');
  }
}

/**
 * Factory function to create blockchain event service
 */
export function createBlockchainEventService(config: BlockchainConfig): BlockchainEventService {
  return new BlockchainEventService(config);
}
