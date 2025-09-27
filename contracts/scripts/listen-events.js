#!/usr/bin/env node

/**
 * Event Listener CLI Tool
 * 
 * Test the event listener service with the deployed contract
 */

const { createEventListener, GenomicEventHandlers } = require('../src/sdk/EventListener');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🎧 Starting Genomic Contract Event Listener...');
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, '../deployment.json');
    if (!fs.existsSync(deploymentPath)) {
        console.error('❌ No deployment found! Run: npm run deploy:testnet');
        process.exit(1);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contractAddress = deployment.contractAddress;
    const rpcUrl = process.env.MIDNIGHT_RPC_URL || 'https://testnet.midnight.network/rpc';
    
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    
    // Create event listener
    const eventListener = createEventListener(contractAddress, rpcUrl);
    
    // Register event handlers
    eventListener.on('VerificationComplete', GenomicEventHandlers.onVerificationComplete);
    eventListener.on('AccessGranted', GenomicEventHandlers.onAccessGranted);
    eventListener.on('*', GenomicEventHandlers.onAllEvents); // All events
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down event listener...');
        eventListener.stopListening();
        process.exit(0);
    });
    
    // Start listening
    await eventListener.startListening();
    
    // Keep the process running
    process.stdin.resume();
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Failed to start event listener:', error);
        process.exit(1);
    });
}
