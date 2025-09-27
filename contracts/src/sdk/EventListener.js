/**
 * Event Listener Service for GenomicVerifier Contract
 * 
 * This service listens for blockchain events from the deployed contract
 * and handles verification completions, access grants, and other events.
 */

const fs = require('fs');
const path = require('path');

/**
 * Service for listening to contract events and handling them
 */
class EventListenerService {
    constructor(contractAddress, rpcUrl) {
        this.contractAddress = contractAddress;
        this.rpcUrl = rpcUrl;
        this.isListening = false;
        this.eventHandlers = new Map();
        this.lastProcessedBlock = 0;
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds
        this.loadLastProcessedBlock();
    }

    /**
     * Start listening for contract events
     */
    async startListening(): Promise<void> {
        console.log(`🎧 Starting event listener for contract: ${this.contractAddress}`);
        this.isListening = true;

        // Start the main event loop
        this.eventLoop();
    }

    /**
     * Stop listening for events
     */
    stopListening(): void {
        console.log('⏹️ Stopping event listener...');
        this.isListening = false;
    }

    /**
     * Register event handler for specific event type
     */
    on(eventName: string, handler: Function): void {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName)!.push(handler);
        console.log(`📝 Registered handler for event: ${eventName}`);
    }

    /**
     * Remove event handler
     */
    off(eventName: string, handler: Function): void {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Main event listening loop
     */
    private async eventLoop(): Promise<void> {
        while (this.isListening) {
            try {
                await this.pollForEvents();
                await this.sleep(5000); // Poll every 5 seconds
            } catch (error) {
                console.error('❌ Error in event loop:', error);
                await this.handleError(error);
            }
        }
    }

    /**
     * Poll blockchain for new events
     */
    private async pollForEvents(): Promise<void> {
        try {
            // Get current block number
            const currentBlock = await this.getCurrentBlockNumber();
            
            if (currentBlock <= this.lastProcessedBlock) {
                return; // No new blocks
            }

            console.log(`🔍 Checking blocks ${this.lastProcessedBlock + 1} to ${currentBlock}`);

            // Fetch events from new blocks
            const events = await this.fetchEvents(this.lastProcessedBlock + 1, currentBlock);
            
            // Process each event
            for (const event of events) {
                await this.processEvent(event);
            }

            // Update last processed block
            this.lastProcessedBlock = currentBlock;
            this.saveLastProcessedBlock();

        } catch (error) {
            throw new Error(`Failed to poll for events: ${error.message}`);
        }
    }

    /**
     * Fetch events from blockchain (mock implementation)
     */
    private async fetchEvents(fromBlock: number, toBlock: number): Promise<ContractEvent[]> {
        // TODO: Replace with actual blockchain query using Midnight SDK
        // For now, return mock events occasionally
        
        const shouldGenerateMockEvent = Math.random() < 0.1; // 10% chance
        
        if (!shouldGenerateMockEvent) {
            return [];
        }

        // Generate mock event
        const mockEvent: ContractEvent = {
            eventName: 'VerificationComplete',
            data: {
                patient: `midnight_patient_${Math.random().toString(36).substring(2, 8)}`,
                verifier: `midnight_doctor_${Math.random().toString(36).substring(2, 8)}`,
                traitType: ['BRCA1', 'BRCA2', 'CYP2D6'][Math.floor(Math.random() * 3)],
                timestamp: Date.now(),
                success: Math.random() > 0.1 // 90% success rate
            },
            transactionHash: `0x${Math.random().toString(16).substring(2, 16)}`,
            blockNumber: toBlock,
            timestamp: Date.now()
        };

        console.log(`📡 Mock event generated: ${mockEvent.eventName}`);
        return [mockEvent];
    }

    /**
     * Process a single event
     */
    private async processEvent(event: ContractEvent): Promise<void> {
        console.log(`📨 Processing event: ${event.eventName} (${event.transactionHash})`);

        try {
            // Emit to registered handlers
            const handlers = this.eventHandlers.get(event.eventName) || [];
            for (const handler of handlers) {
                await handler(event.data, event);
            }

            // Emit to wildcard handlers
            const wildcardHandlers = this.eventHandlers.get('*') || [];
            for (const handler of wildcardHandlers) {
                await handler(event.data, event);
            }

            console.log(`✅ Event processed successfully: ${event.eventName}`);

        } catch (error) {
            console.error(`❌ Failed to process event ${event.eventName}:`, error);
            throw error;
        }
    }

    /**
     * Get current block number (mock implementation)
     */
    private async getCurrentBlockNumber(): Promise<number> {
        // TODO: Replace with actual blockchain query
        // Simulate increasing block numbers
        return Math.floor(Date.now() / 1000); // Use timestamp as mock block number
    }

    /**
     * Handle errors with retry logic
     */
    private async handleError(error: any): Promise<void> {
        console.error('🔄 Implementing retry logic...');
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔄 Retry attempt ${attempt}/${this.retryAttempts}`);
                await this.sleep(this.retryDelay * attempt); // Exponential backoff
                
                // Test connection
                await this.getCurrentBlockNumber();
                console.log('✅ Connection restored');
                return;
                
            } catch (retryError) {
                console.error(`❌ Retry ${attempt} failed:`, retryError.message);
                if (attempt === this.retryAttempts) {
                    console.error('🚨 All retry attempts failed. Event listener may be offline.');
                }
            }
        }
    }

    /**
     * Load last processed block from storage
     */
    private loadLastProcessedBlock(): void {
        try {
            const statePath = path.join(__dirname, '../../event-listener-state.json');
            if (fs.existsSync(statePath)) {
                const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
                this.lastProcessedBlock = state.lastProcessedBlock || 0;
                console.log(`📁 Loaded last processed block: ${this.lastProcessedBlock}`);
            }
        } catch (error) {
            console.warn('⚠️ Could not load last processed block, starting from 0');
            this.lastProcessedBlock = 0;
        }
    }

    /**
     * Save last processed block to storage
     */
    private saveLastProcessedBlock(): void {
        try {
            const statePath = path.join(__dirname, '../../event-listener-state.json');
            const state = {
                lastProcessedBlock: this.lastProcessedBlock,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        } catch (error) {
            console.error('❌ Failed to save event listener state:', error);
        }
    }

    /**
     * Sleep for specified milliseconds
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get service status
     */
    getStatus(): {
        isListening: boolean;
        contractAddress: string;
        lastProcessedBlock: number;
        registeredEvents: string[];
    } {
        return {
            isListening: this.isListening,
            contractAddress: this.contractAddress,
            lastProcessedBlock: this.lastProcessedBlock,
            registeredEvents: Array.from(this.eventHandlers.keys())
        };
    }
}

/**
 * Factory function to create event listener
 */
export function createEventListener(contractAddress: string, rpcUrl: string): EventListenerService {
    return new EventListenerService(contractAddress, rpcUrl);
}

/**
 * Pre-configured event handlers for common use cases
 */
export class GenomicEventHandlers {
    
    /**
     * Handle verification complete events
     */
    static async onVerificationComplete(
        data: VerificationCompleteEvent,
        event: ContractEvent
    ): Promise<void> {
        console.log(`🧬 Verification completed for ${data.traitType} (${data.patient})`);
        
        // TODO: Update database with verification result
        // TODO: Send notification to patient/doctor
        // TODO: Update analytics
        
        console.log(`   Patient: ${data.patient.substring(0, 10)}...`);
        console.log(`   Verifier: ${data.verifier.substring(0, 10)}...`);
        console.log(`   Trait: ${data.traitType}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   TX: ${event.transactionHash}`);
    }

    /**
     * Handle access granted events
     */
    static async onAccessGranted(
        data: AccessGrantedEvent,
        event: ContractEvent
    ): Promise<void> {
        console.log(`🔑 Access granted for ${data.traitType}`);
        console.log(`   Patient: ${data.patient.substring(0, 10)}...`);
        console.log(`   Doctor: ${data.doctor.substring(0, 10)}...`);
        console.log(`   Expires: ${new Date(data.expiresAt * 1000).toISOString()}`);
        
        // TODO: Update access control database
        // TODO: Send notification to doctor
    }

    /**
     * Handle all events for logging/analytics
     */
    static async onAllEvents(data: any, event: ContractEvent): Promise<void> {
        console.log(`📊 Event logged: ${event.eventName} at block ${event.blockNumber}`);
        
        // TODO: Store in analytics database
        // TODO: Update metrics
    }
}

module.exports = {
    EventListenerService,
    createEventListener,
    GenomicEventHandlers
};
