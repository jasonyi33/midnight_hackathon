/**
 * Event Listener Service for GenomicVerifier Contract
 */

const fs = require('fs');
const path = require('path');

class EventListenerService {
    constructor(contractAddress, rpcUrl) {
        this.contractAddress = contractAddress;
        this.rpcUrl = rpcUrl;
        this.isListening = false;
        this.eventHandlers = new Map();
        this.lastProcessedBlock = 0;
        this.retryAttempts = 3;
        this.retryDelay = 5000;
        this.loadLastProcessedBlock();
    }

    async startListening() {
        console.log(`🎧 Starting event listener for contract: ${this.contractAddress}`);
        this.isListening = true;
        this.eventLoop();
    }

    stopListening() {
        console.log('⏹️ Stopping event listener...');
        this.isListening = false;
    }

    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName).push(handler);
        console.log(`📝 Registered handler for event: ${eventName}`);
    }

    async eventLoop() {
        while (this.isListening) {
            try {
                await this.pollForEvents();
                await this.sleep(5000);
            } catch (error) {
                console.error('❌ Error in event loop:', error);
                await this.handleError(error);
            }
        }
    }

    async pollForEvents() {
        const currentBlock = await this.getCurrentBlockNumber();
        
        if (currentBlock <= this.lastProcessedBlock) {
            return;
        }

        console.log(`🔍 Checking blocks ${this.lastProcessedBlock + 1} to ${currentBlock}`);
        
        const events = await this.fetchEvents(this.lastProcessedBlock + 1, currentBlock);
        
        for (const event of events) {
            await this.processEvent(event);
        }

        this.lastProcessedBlock = currentBlock;
        this.saveLastProcessedBlock();
    }

    async fetchEvents(fromBlock, toBlock) {
        const shouldGenerateMockEvent = Math.random() < 0.2; // 20% chance for testing
        
        if (!shouldGenerateMockEvent) {
            return [];
        }

        const mockEvent = {
            eventName: 'VerificationComplete',
            data: {
                patient: `midnight_patient_${Math.random().toString(36).substring(2, 8)}`,
                verifier: `midnight_doctor_${Math.random().toString(36).substring(2, 8)}`,
                traitType: ['BRCA1', 'BRCA2', 'CYP2D6'][Math.floor(Math.random() * 3)],
                timestamp: Date.now(),
                success: Math.random() > 0.1
            },
            transactionHash: `0x${Math.random().toString(16).substring(2, 16)}`,
            blockNumber: toBlock,
            timestamp: Date.now()
        };

        console.log(`📡 Mock event generated: ${mockEvent.eventName}`);
        return [mockEvent];
    }

    async processEvent(event) {
        console.log(`📨 Processing event: ${event.eventName} (${event.transactionHash})`);

        const handlers = this.eventHandlers.get(event.eventName) || [];
        for (const handler of handlers) {
            await handler(event.data, event);
        }

        const wildcardHandlers = this.eventHandlers.get('*') || [];
        for (const handler of wildcardHandlers) {
            await handler(event.data, event);
        }

        console.log(`✅ Event processed successfully: ${event.eventName}`);
    }

    async getCurrentBlockNumber() {
        return Math.floor(Date.now() / 1000);
    }

    async handleError(error) {
        console.error('🔄 Implementing retry logic...');
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔄 Retry attempt ${attempt}/${this.retryAttempts}`);
                await this.sleep(this.retryDelay * attempt);
                await this.getCurrentBlockNumber();
                console.log('✅ Connection restored');
                return;
            } catch (retryError) {
                console.error(`❌ Retry ${attempt} failed:`, retryError.message);
            }
        }
    }

    loadLastProcessedBlock() {
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

    saveLastProcessedBlock() {
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class GenomicEventHandlers {
    static async onVerificationComplete(data, event) {
        console.log(`🧬 Verification completed for ${data.traitType} (${data.patient})`);
        console.log(`   Patient: ${data.patient.substring(0, 10)}...`);
        console.log(`   Verifier: ${data.verifier.substring(0, 10)}...`);
        console.log(`   Trait: ${data.traitType}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   TX: ${event.transactionHash}`);
    }

    static async onAccessGranted(data, event) {
        console.log(`🔑 Access granted for ${data.traitType}`);
        console.log(`   Patient: ${data.patient.substring(0, 10)}...`);
        console.log(`   Doctor: ${data.doctor.substring(0, 10)}...`);
    }

    static async onAllEvents(data, event) {
        console.log(`📊 Event logged: ${event.eventName} at block ${event.blockNumber}`);
    }
}

function createEventListener(contractAddress, rpcUrl) {
    return new EventListenerService(contractAddress, rpcUrl);
}

module.exports = {
    EventListenerService,
    createEventListener,
    GenomicEventHandlers
};
