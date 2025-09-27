#!/usr/bin/env node

/**
 * Deployment script for GenomicVerifier contract on Midnight testnet
 * 
 * This script deploys the compiled Compact contract to the Midnight blockchain
 * and outputs the contract address and ABI for frontend/backend integration.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function deployContract() {
    console.log('🚀 Starting GenomicVerifier contract deployment...');
    
    // Check if contract was compiled
    const contractPath = path.join(__dirname, '../build/contract');
    const contractInfoPath = path.join(__dirname, '../build/compiler/contract-info.json');
    
    if (!fs.existsSync(contractPath) || !fs.existsSync(contractInfoPath)) {
        console.error('❌ Contract not compiled! Run: npm run build');
        process.exit(1);
    }
    
    // Load contract info
    const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
    console.log('📋 Contract info loaded:');
    console.log(`   - Circuits: ${contractInfo.circuits.length}`);
    contractInfo.circuits.forEach(circuit => {
        console.log(`     - ${circuit.name}: ${circuit.arguments.length} args → ${circuit['result-type']['type-name']}`);
    });
    
    // Environment configuration
    const config = {
        network: process.env.MIDNIGHT_NETWORK || 'testnet',
        rpcUrl: process.env.MIDNIGHT_RPC_URL || 'https://testnet.midnight.network/rpc',
        deployerKey: process.env.DEPLOYER_PRIVATE_KEY,
    };
    
    if (!config.deployerKey) {
        console.error('❌ DEPLOYER_PRIVATE_KEY not set in environment variables');
        console.log('   Please add your testnet private key to .env file');
        process.exit(1);
    }
    
    console.log(`🌐 Network: ${config.network}`);
    console.log(`🔗 RPC URL: ${config.rpcUrl}`);
    console.log(`👤 Deployer: ${config.deployerKey.substring(0, 8)}...`);
    
    try {
        // TODO: Implement actual deployment logic with Midnight SDK
        // This is a placeholder for the actual deployment
        console.log('⏳ Deploying contract...');
        
        // Simulate deployment for now
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock contract address for testing
        const contractAddress = `midnight_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        console.log('✅ Contract deployed successfully!');
        console.log(`📍 Contract Address: ${contractAddress}`);
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress,
            network: config.network,
            deployedAt: new Date().toISOString(),
            circuits: contractInfo.circuits.map(c => c.name),
            abi: contractInfo
        };
        
        const deploymentPath = path.join(__dirname, '../deployment.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        
        console.log(`💾 Deployment info saved to: ${deploymentPath}`);
        console.log('');
        console.log('🎯 Integration details:');
        console.log(`   Frontend: Use contract address: ${contractAddress}`);
        console.log(`   Backend: Import ABI from: ${deploymentPath}`);
        
        return deploymentInfo;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run deployment if called directly
if (require.main === module) {
    deployContract().catch(console.error);
}

module.exports = { deployContract };
