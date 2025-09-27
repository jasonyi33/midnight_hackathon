/**
 * Blockchain Event Listener Service
 * Dev 4: Task 3.4 - Set up blockchain event listeners
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';

interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  contractABI: any[];
  privateKey?: string;
  networkName?: string;
}

interface EventData {
  event: string;
  args: any;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  removed: boolean;
}

export class BlockchainEventService extends EventEmitter {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer?: ethers.Signer;
  private isListening = false;
  private reconnectTimer?: NodeJS.Timeout;
  private eventHandlers: Map<string, Function> = new Map();
  private lastProcessedBlock: number = 0;

  constructor(private config: BlockchainConfig) {
    super();

    // Initialize provider
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    // Initialize contract
    this.contract = new ethers.Contract(
      config.contractAddress,
      config.contractABI,
      this.provider
    );

    // If private key provided, create signer
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
      this.contract = this.contract.connect(this.signer);
    }

    console.log(`✅ Blockchain event service initialized for ${config.networkName || 'network'}`);
  }

  /**
   * Start listening for blockchain events
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('Already listening for events');
      return;
    }

    try {
      this.isListening = true;

      // Get current block number
      this.lastProcessedBlock = await this.provider.getBlockNumber();
      console.log(`Starting event listener from block ${this.lastProcessedBlock}`);

      // Listen for VerificationComplete events
      this.contract.on('VerificationComplete', async (patient, proofHash, trait, event) => {
        console.log('📢 VerificationComplete event:', {
          patient,
          proofHash,
          trait,
          blockNumber: event.blockNumber
        });

        await this.handleVerificationComplete({
          patient,
          proofHash,
          trait,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Listen for AccessGranted events
      this.contract.on('AccessGranted', async (patient, doctor, traits, expiry, event) => {
        console.log('📢 AccessGranted event:', {
          patient,
          doctor,
          traits,
          expiry
        });

        await this.handleAccessGranted({
          patient,
          doctor,
          traits,
          expiry,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Listen for AccessRevoked events
      this.contract.on('AccessRevoked', async (patient, doctor, event) => {
        console.log('📢 AccessRevoked event:', {
          patient,
          doctor
        });

        await this.handleAccessRevoked({
          patient,
          doctor,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Listen for ProofSubmitted events
      this.contract.on('ProofSubmitted', async (patient, proofHash, traitType, event) => {
        console.log('📢 ProofSubmitted event:', {
          patient,
          proofHash,
          traitType
        });

        await this.handleProofSubmitted({
          patient,
          proofHash,
          traitType,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Listen for new blocks to detect connection issues
      this.provider.on('block', (blockNumber) => {
        this.lastProcessedBlock = blockNumber;
        this.emit('newBlock', blockNumber);
      });

      // Handle provider errors
      this.provider.on('error', (error) => {
        console.error('Provider error:', error);
        this.handleConnectionError(error);
      });

      console.log('✅ Event listeners started successfully');
      this.emit('listening', true);

    } catch (error) {
      console.error('Failed to start event listeners:', error);
      this.isListening = false;
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Stop listening for blockchain events
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    console.log('Stopping event listeners...');

    // Remove all contract event listeners
    this.contract.removeAllListeners();

    // Remove provider listeners
    this.provider.removeAllListeners();

    this.isListening = false;

    // Clear reconnect timer if exists
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    console.log('Event listeners stopped');
    this.emit('listening', false);
  }

  /**
   * Handle VerificationComplete event
   */
  private async handleVerificationComplete(data: any): Promise<void> {
    try {
      // Update database verification count
      await this.updateVerificationCount(data.patient, data.trait);

      // Emit WebSocket notification
      this.emit('verification:complete', {
        patient: data.patient,
        proofHash: data.proofHash,
        trait: data.trait,
        timestamp: new Date().toISOString(),
        blockNumber: data.blockNumber,
        transactionHash: data.transactionHash
      });

      // Log to audit trail
      await this.logAuditEvent('VERIFICATION_COMPLETE', data);

      // Execute custom handler if registered
      const handler = this.eventHandlers.get('VerificationComplete');
      if (handler) {
        await handler(data);
      }
    } catch (error) {
      console.error('Error handling VerificationComplete:', error);
    }
  }

  /**
   * Handle AccessGranted event
   */
  private async handleAccessGranted(data: any): Promise<void> {
    try {
      // Update access permissions in database
      await this.updateAccessPermissions(data.patient, data.doctor, data.traits, data.expiry);

      // Emit WebSocket notification to both parties
      this.emit('access:granted', {
        patient: data.patient,
        doctor: data.doctor,
        traits: data.traits,
        expiry: data.expiry,
        timestamp: new Date().toISOString(),
        blockNumber: data.blockNumber,
        transactionHash: data.transactionHash
      });

      // Log to audit trail
      await this.logAuditEvent('ACCESS_GRANTED', data);

      // Execute custom handler if registered
      const handler = this.eventHandlers.get('AccessGranted');
      if (handler) {
        await handler(data);
      }
    } catch (error) {
      console.error('Error handling AccessGranted:', error);
    }
  }

  /**
   * Handle AccessRevoked event
   */
  private async handleAccessRevoked(data: any): Promise<void> {
    try {
      // Remove access permissions from database
      await this.revokeAccessPermissions(data.patient, data.doctor);

      // Emit WebSocket notification
      this.emit('access:revoked', {
        patient: data.patient,
        doctor: data.doctor,
        timestamp: new Date().toISOString(),
        blockNumber: data.blockNumber,
        transactionHash: data.transactionHash
      });

      // Log to audit trail
      await this.logAuditEvent('ACCESS_REVOKED', data);

      // Execute custom handler if registered
      const handler = this.eventHandlers.get('AccessRevoked');
      if (handler) {
        await handler(data);
      }
    } catch (error) {
      console.error('Error handling AccessRevoked:', error);
    }
  }

  /**
   * Handle ProofSubmitted event
   */
  private async handleProofSubmitted(data: any): Promise<void> {
    try {
      // Store proof in database
      await this.storeProofRecord(data.patient, data.proofHash, data.traitType);

      // Update aggregation data
      await this.updateAggregationData(data.traitType);

      // Emit WebSocket notification
      this.emit('proof:submitted', {
        patient: data.patient,
        proofHash: data.proofHash,
        traitType: data.traitType,
        timestamp: new Date().toISOString(),
        blockNumber: data.blockNumber,
        transactionHash: data.transactionHash
      });

      // Log to audit trail
      await this.logAuditEvent('PROOF_SUBMITTED', data);

      // Execute custom handler if registered
      const handler = this.eventHandlers.get('ProofSubmitted');
      if (handler) {
        await handler(data);
      }
    } catch (error) {
      console.error('Error handling ProofSubmitted:', error);
    }
  }

  /**
   * Handle connection errors and attempt reconnection
   */
  private handleConnectionError(error: any): void {
    console.error('Blockchain connection error:', error);

    if (!this.reconnectTimer) {
      console.log('Attempting to reconnect in 5 seconds...');

      this.reconnectTimer = setTimeout(async () => {
        this.reconnectTimer = undefined;

        try {
          await this.reconnect();
        } catch (reconnectError) {
          console.error('Reconnection failed:', reconnectError);
          // Try again
          this.handleConnectionError(reconnectError);
        }
      }, 5000);
    }
  }

  /**
   * Reconnect to blockchain
   */
  private async reconnect(): Promise<void> {
    console.log('Attempting to reconnect to blockchain...');

    // Stop existing listeners
    this.stopListening();

    // Create new provider
    this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);

    // Recreate contract
    this.contract = new ethers.Contract(
      this.config.contractAddress,
      this.config.contractABI,
      this.provider
    );

    if (this.config.privateKey) {
      this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
      this.contract = this.contract.connect(this.signer);
    }

    // Restart listening
    await this.startListening();

    console.log('✅ Reconnected successfully');
  }

  /**
   * Register custom event handler
   */
  registerEventHandler(eventName: string, handler: Function): void {
    this.eventHandlers.set(eventName, handler);
    console.log(`Registered handler for ${eventName} event`);
  }

  /**
   * Query historical events
   */
  async queryHistoricalEvents(
    eventName: string,
    fromBlock: number = 0,
    toBlock: number | string = 'latest'
  ): Promise<EventData[]> {
    try {
      const filter = this.contract.filters[eventName]();
      const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

      return events.map(event => ({
        event: eventName,
        args: event.args,
        blockNumber: event.blockNumber,
        blockHash: event.blockHash,
        transactionHash: event.transactionHash,
        transactionIndex: event.transactionIndex,
        logIndex: event.logIndex,
        removed: event.removed
      }));
    } catch (error) {
      console.error(`Failed to query historical events for ${eventName}:`, error);
      throw error;
    }
  }

  /**
   * Get current network information
   */
  async getNetworkInfo(): Promise<any> {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    const gasPrice = await this.provider.getGasPrice();

    return {
      name: network.name,
      chainId: network.chainId,
      blockNumber,
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      rpcUrl: this.config.rpcUrl,
      contractAddress: this.config.contractAddress
    };
  }

  // Database update methods (would be implemented with actual database connection)

  private async updateVerificationCount(patient: string, trait: string): Promise<void> {
    // TODO: Update database with verification count
    console.log(`[DB] Updated verification count for ${patient} - ${trait}`);
  }

  private async updateAccessPermissions(patient: string, doctor: string, traits: string[], expiry: number): Promise<void> {
    // TODO: Update database with access permissions
    console.log(`[DB] Updated access permissions: ${patient} -> ${doctor} for ${traits.join(', ')}`);
  }

  private async revokeAccessPermissions(patient: string, doctor: string): Promise<void> {
    // TODO: Remove access permissions from database
    console.log(`[DB] Revoked access permissions: ${patient} -> ${doctor}`);
  }

  private async storeProofRecord(patient: string, proofHash: string, traitType: string): Promise<void> {
    // TODO: Store proof record in database
    console.log(`[DB] Stored proof record for ${patient} - ${traitType}: ${proofHash}`);
  }

  private async updateAggregationData(traitType: string): Promise<void> {
    // TODO: Update aggregation statistics
    console.log(`[DB] Updated aggregation data for ${traitType}`);
  }

  private async logAuditEvent(eventType: string, data: any): Promise<void> {
    // TODO: Log to audit trail
    console.log(`[AUDIT] ${eventType}:`, data);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopListening();
    this.removeAllListeners();
    this.eventHandlers.clear();
    console.log('BlockchainEventService destroyed');
  }
}

// Export factory function
export function createBlockchainEventService(config: BlockchainConfig): BlockchainEventService {
  return new BlockchainEventService(config);
}