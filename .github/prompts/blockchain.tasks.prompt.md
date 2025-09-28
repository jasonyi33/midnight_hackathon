````prompt
---
mode: agent
---
# Blockchain Implementation Task List: Real Midnight Testnet Integration
**CRITICAL: These are Dev 4 (Blockchain) specific tasks for implementing REAL Midnight blockchain connectivity**

## Overview
Transform the existing mock blockchain infrastructure into a fully functional Midnight testnet integration with real tDUST tokens, actual ZK proof generation, and deployed Compact contracts.

## Current Infrastructure Analysis
```
✅ EXISTING CODEBASE:
- backend/src/blockchain/ (mock integration services)
- contracts/src/genomic_verifier.compact (basic circuits)
- contracts/scripts/ (deployment scripts)
- backend environment configured for mock mode

🎯 TARGET: Real Midnight Testnet Integration
- Live contract deployment to testnet
- Real tDUST token transactions
- Actual ZK proof generation with Compact circuits
- Integration with existing frontend/backend
```

## Prerequisites Setup (T-2 hours before implementation)

### P.1 Environment Setup
- [ ] **P.1.1** Verify macOS setup with Docker Desktop running
- [ ] **P.1.2** Install Node.js 18 LTS using NVM: `nvm install 18 --lts`
- [ ] **P.1.3** Verify Docker can access Midnight images: `docker search midnightnetwork`

### P.2 Lace Wallet Information Collection
**IMPORTANT: Ask the user to provide the following information from their existing Lace wallet:**

- [ ] **P.2.1** **Wallet Address**: Request the user's Midnight testnet wallet address
  - Format: `addr1...` (Bech32 format)
  - This will be used as `CONTRACT_OWNER_ADDRESS` and `DEPLOYER_ADDRESS`

- [ ] **P.2.2** **Private Key/Seed Phrase**: Request the user's wallet private key or seed phrase
  - This will be used as `DEPLOYER_PRIVATE_KEY` in environment variables
  - **SECURITY NOTE**: This should be handled securely and never logged

- [ ] **P.2.3** **tDUST Balance**: Ask user to confirm their current tDUST balance
  - Minimum required: 100 tDUST tokens for contract deployment and testing
  - If insufficient, guide user to Midnight Testnet Faucet: https://faucet.midnight.network/testnet

- [ ] **P.2.4** **Network Configuration**: Confirm user's wallet is configured for:
  - Network: Midnight testnet
  - Node endpoint: https://testnet.midnight.network/rpc
  - Indexer: https://testnet-indexer.midnight.network

### P.3 Wallet Information Validation
- [ ] **P.3.1** Validate wallet address format (should start with `addr1`)
- [ ] **P.3.2** Confirm tDUST balance is sufficient (≥100 tDUST)
- [ ] **P.3.3** Test wallet connectivity to Midnight testnet
- [ ] **P.3.4** Document all wallet information for integration

### P.4 Local Proof Server Setup
- [ ] **P.4.1** Pull Midnight proof server image: `docker pull midnightnetwork/proof-server:latest`
- [ ] **P.4.2** Run proof server on port 6300:
  ```bash
  docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'
  ```
- [ ] **P.4.3** Verify proof server logs show "targeting Testnet"
- [ ] **P.4.4** Test wallet connection to local proof server

### P.5 Compact Compiler Installation
- [ ] **P.5.1** Download Compact compiler for macOS from Midnight releases
- [ ] **P.5.2** Extract to `/Users/amogh/Projects/midnight_hackathon/compactc_v0.25.0_aarch64-darwin/`
- [ ] **P.5.3** Test installation: `./compactc --version`
- [ ] **P.5.4** Set environment variables:
  ```bash
  export COMPACT_HOME='/Users/amogh/Projects/midnight_hackathon/compactc_v0.25.0_aarch64-darwin'
  export PATH="$COMPACT_HOME:$PATH"
  ```
- [ ] **P.5.5** Add to shell profile (.zshrc) for persistence

## Phase 1: Midnight SDK Integration (Hours 0-4)

### 1.1 Install Midnight Dependencies
- [ ] **1.1.1** Navigate to contracts directory and install Midnight SDK:
  ```bash
  cd contracts/
  npm install @midnight-ntwrk/midnight-js-sdk@latest
  npm install @midnight-ntwrk/compact-runtime@latest
  npm install @midnight-ntwrk/midnight-js-testing@latest
  ```
- [ ] **1.1.2** Install backend dependencies:
  ```bash
  cd ../backend/
  npm install @midnight-ntwrk/midnight-js-sdk@latest
  npm install @midnight-ntwrk/compact-runtime@latest
  ```
- [ ] **1.1.3** Install additional cryptographic dependencies:
  ```bash
  npm install @noble/hashes @noble/curves
  npm install circomlib snarkjs
  ```

### 1.2 Environment Configuration
- [ ] **1.2.1** Update backend/.env with real Midnight configuration using user-provided wallet info:
  ```bash
  # Replace mock settings
  MIDNIGHT_RPC_URL=https://testnet.midnight.network/rpc
  MIDNIGHT_NETWORK=testnet
  MIDNIGHT_INDEXER_URL=https://testnet-indexer.midnight.network
  PROOF_SERVER_URL=http://localhost:6300
  USE_MOCK_BLOCKCHAIN=false
  USE_MOCK_PROOFS=false
  
  # Add Midnight-specific settings from user's wallet
  DEPLOYER_PRIVATE_KEY={USER_PROVIDED_PRIVATE_KEY}
  CONTRACT_OWNER_ADDRESS={USER_PROVIDED_WALLET_ADDRESS}
  GENOMIC_VERIFIER_ADDRESS=will-be-set-after-deployment
  
  # Wallet connection settings
  LACE_WALLET_ADDRESS={USER_PROVIDED_WALLET_ADDRESS}
  TDUST_BALANCE={USER_CONFIRMED_BALANCE}
  ```
- [ ] **1.2.2** Create contracts/.env file with user's wallet credentials:
  ```bash
  MIDNIGHT_NETWORK=testnet
  MIDNIGHT_RPC_URL=https://testnet.midnight.network/rpc
  DEPLOYER_PRIVATE_KEY={USER_PROVIDED_PRIVATE_KEY}
  CONTRACT_OWNER_ADDRESS={USER_PROVIDED_WALLET_ADDRESS}
  ```
- [ ] **1.2.3** **SECURITY REMINDER**: Never commit .env files with real private keys to version control

### 1.3 Update Existing Mock Services
- [ ] **1.3.1** Modify `backend/src/blockchain/blockchain-integration.service.ts`:
  - Remove mock mode checks
  - Replace mock RPC URL with real testnet URL
  - Update contract address to use environment variable
  - Add real Midnight SDK imports
- [ ] **1.3.2** Update `backend/src/blockchain/BlockchainEventService.ts`:
  - Implement real event listening using Midnight indexer
  - Replace mock events with actual blockchain event parsing
  - Add retry logic for network failures
- [ ] **1.3.3** Update `backend/src/blockchain/GenomicVerifierABI.ts`:
  - Replace mock ABI with actual Compact-generated ABI
  - Add proper TypeScript types for all contract methods

## Phase 2: Compact Contract Development (Hours 4-12)

### 2.1 Rewrite GenomicVerifier Contract
- [ ] **2.1.1** Enhance `contracts/src/genomic_verifier.compact` with proper Compact syntax:
  ```compact
  pragma language_version 0.25.0;
  import CompactStandardLibrary;
  
  // Ledger state (public on-chain data)
  export ledger verificationCount: Counter;
  export ledger authorizedVerifiers: Map<Address, Boolean>;
  export ledger genomeCommitments: Map<Address, Bytes<32>>;
  export ledger verificationEvents: List<VerificationEvent>;
  
  // Private state (off-chain encrypted data)
  private patientGenomes: Map<Address, EncryptedGenome>;
  private accessGrants: Map<(Address, Address), AccessGrant>;
  ```
- [ ] **2.1.2** Implement witness functions for private genomic data input:
  ```compact
  witness getGenomeData(): GenomicData;
  witness getPatientKey(): PrivateKey;
  witness getMutationStatus(): Boolean;
  ```
- [ ] **2.1.3** Create BRCA1 verification circuit:
  ```compact
  export circuit verifyBRCA1Mutation(
    public patientAddress: Address,
    public verifierAddress: Address,
    public threshold: Field
  ): VerificationResult {
    // Get private genome data
    let genome = getGenomeData();
    let patientKey = getPatientKey();
    let mutationStatus = getMutationStatus();
    
    // Verify patient ownership
    assert(getAddress(patientKey) == patientAddress);
    
    // Check verifier authorization
    assert(ledger.authorizedVerifiers.get(verifierAddress));
    
    // Perform BRCA1 analysis on private data
    let brca1Markers = extractBRCA1Markers(genome);
    let hasPathogenicVariant = checkPathogenicVariants(brca1Markers);
    
    // Only disclose boolean result, not raw genome data
    let result = disclose(hasPathogenicVariant);
    
    // Update public ledger
    ledger.verificationCount.increment();
    ledger.verificationEvents.push(VerificationEvent {
      patient: patientAddress,
      verifier: verifierAddress,
      traitType: TRAIT_BRCA1,
      result: result,
      timestamp: getCurrentTime(),
      proofHash: getProofHash()
    });
    
    return VerificationResult {
      verified: true,
      hasVariant: result,
      proofHash: getProofHash(),
      timestamp: getCurrentTime()
    };
  }
  ```
- [ ] **2.1.4** Implement BRCA2 and CYP2D6 circuits with similar privacy-preserving logic
- [ ] **2.1.5** Add access control and emergency pause functionality:
  ```compact
  export circuit addAuthorizedVerifier(
    witness ownerKey: PrivateKey,
    public verifierAddress: Address
  ): Boolean {
    assert(getAddress(ownerKey) == contractOwner);
    ledger.authorizedVerifiers.set(verifierAddress, true);
    return true;
  }
  
  export circuit emergencyPause(
    witness ownerKey: PrivateKey
  ): Boolean {
    assert(getAddress(ownerKey) == contractOwner);
    ledger.paused = true;
    return true;
  }
  ```

### 2.2 Compile and Generate TypeScript Bindings
- [ ] **2.2.1** Compile Compact contract:
  ```bash
  cd contracts/
  compactc compile src/genomic_verifier.compact --output build/
  ```
- [ ] **2.2.2** Generate TypeScript API bindings:
  ```bash
  compactc generate-bindings \
    --input build/genomic_verifier.json \
    --output src/generated/ \
    --language typescript
  ```
- [ ] **2.2.3** Verify generated files:
  - `build/genomic_verifier.json` (compiled contract)
  - `build/genomic_verifier.wasm` (circuit WASM)
  - `src/generated/GenomicVerifier.ts` (TypeScript API)
- [ ] **2.2.4** Create ProofSDK wrapper in `contracts/src/proof-sdk/`:
  ```typescript
  import { GenomicVerifier } from '../generated/GenomicVerifier';
  import { MidnightProvider } from '@midnight-ntwrk/midnight-js-sdk';
  
  export class GenomicProofSDK {
    private contract: GenomicVerifier;
    
    constructor(provider: MidnightProvider, contractAddress: string) {
      this.contract = new GenomicVerifier(provider, contractAddress);
    }
    
    async generateBRCA1Proof(
      genomeData: GenomicData,
      mutationPresent: boolean,
      patientPrivateKey: string
    ): Promise<ZKProof> {
      // Implementation using generated contract API
    }
  }
  ```

### 2.3 Deploy to Midnight Testnet
- [ ] **2.3.1** Update deployment script `contracts/scripts/deploy.js`:
  ```javascript
  const { MidnightProvider, Wallet } = require('@midnight-ntwrk/midnight-js-sdk');
  const GenomicVerifierBuild = require('../build/genomic_verifier.json');
  
  async function deployGenomicVerifier() {
    // Connect to testnet
    const provider = new MidnightProvider({
      rpcUrl: process.env.MIDNIGHT_RPC_URL,
      network: 'testnet'
    });
    
    // Create wallet from private key
    const wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    // Deploy contract
    const deployment = await wallet.deployContract(
      GenomicVerifierBuild.bytecode,
      GenomicVerifierBuild.abi,
      [wallet.address] // constructor args: owner address
    );
    
    console.log('✅ GenomicVerifier deployed to:', deployment.address);
    console.log('📊 Transaction hash:', deployment.txHash);
    console.log('⛽ Gas used:', deployment.gasUsed);
    
    // Save deployment info
    const deploymentInfo = {
      address: deployment.address,
      txHash: deployment.txHash,
      blockNumber: deployment.blockNumber,
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };
    
    fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
    return deploymentInfo;
  }
  ```
- [ ] **2.3.2** Execute deployment:
  ```bash
  cd contracts/
  npm run deploy:testnet
  ```
- [ ] **2.3.3** Verify deployment on Midnight testnet explorer
- [ ] **2.3.4** Update environment variables with deployed contract address
- [ ] **2.3.5** Test basic contract interaction (read verificationCount)

## Phase 3: Backend Integration (Hours 12-20)

### 3.1 Replace Mock Proof Generation
- [ ] **3.1.1** Update `backend/src/proof/proof.service.ts`:
  ```typescript
  import { GenomicProofSDK } from '../../../contracts/src/proof-sdk/GenomicProofSDK';
  import { MidnightProvider } from '@midnight-ntwrk/midnight-js-sdk';
  
  export class ProofService {
    private proofSDK: GenomicProofSDK;
    private provider: MidnightProvider;
    
    constructor() {
      this.provider = new MidnightProvider({
        rpcUrl: process.env.MIDNIGHT_RPC_URL,
        network: process.env.MIDNIGHT_NETWORK
      });
      
      this.proofSDK = new GenomicProofSDK(
        this.provider,
        process.env.GENOMIC_VERIFIER_ADDRESS
      );
    }
    
    async generateBRCA1Proof(
      genomeData: GenomicData,
      patientPrivateKey: string
    ): Promise<ZKProof> {
      try {
        const proof = await this.proofSDK.generateBRCA1Proof(
          genomeData,
          genomeData.traits.BRCA1.mutation_present,
          patientPrivateKey
        );
        
        // Cache proof in Redis
        await this.cacheProof(proof);
        
        return proof;
      } catch (error) {
        logger.error('BRCA1 proof generation failed', { error: error.message });
        throw new ProofGenerationError(`Failed to generate BRCA1 proof: ${error.message}`);
      }
    }
  }
  ```
- [ ] **3.1.2** Remove all mock proof generation logic
- [ ] **3.1.3** Implement real proof caching with 1-hour TTL in Redis
- [ ] **3.1.4** Add proof verification against deployed contract

### 3.2 Implement Real Wallet Authentication
- [ ] **3.2.1** Update `backend/src/auth/auth.service.ts`:
  ```typescript
  import { verifySignature } from '@midnight-ntwrk/midnight-js-sdk';
  
  export class AuthService {
    async verifyWalletSignature(
      message: string,
      signature: string,
      publicKey: string
    ): Promise<boolean> {
      try {
        // Use Midnight SDK for signature verification
        return verifySignature(message, signature, publicKey);
      } catch (error) {
        logger.error('Signature verification failed', { error: error.message });
        return false;
      }
    }
    
    async connectWallet(walletAddress: string, signature: string): Promise<AuthResult> {
      const message = `Authenticate with Genomic Privacy DApp at ${Date.now()}`;
      
      if (!await this.verifyWalletSignature(message, signature, walletAddress)) {
        throw new AuthenticationError('Invalid wallet signature');
      }
      
      // Create or update user
      const user = await this.createOrUpdateUser(walletAddress);
      
      // Generate JWT tokens
      const tokens = this.generateTokens(user);
      
      return { user, tokens };
    }
  }
  ```
- [ ] **3.2.2** Remove mock signature verification
- [ ] **3.2.3** Add real tDUST balance checking using Midnight SDK
- [ ] **3.2.4** Implement wallet switching support

### 3.3 Real Blockchain Event Listening
- [ ] **3.3.1** Update `backend/src/blockchain/BlockchainEventService.ts`:
  ```typescript
  import { MidnightProvider, EventFilter } from '@midnight-ntwrk/midnight-js-sdk';
  
  export class BlockchainEventService {
    private provider: MidnightProvider;
    private contract: any;
    
    async startEventListening(): Promise<void> {
      // Listen for VerificationComplete events
      const filter: EventFilter = {
        address: process.env.GENOMIC_VERIFIER_ADDRESS,
        topics: ['VerificationComplete']
      };
      
      this.provider.on(filter, (event) => {
        this.handleVerificationEvent(event);
      });
      
      logger.info('✅ Blockchain event listening started');
    }
    
    private async handleVerificationEvent(event: any): Promise<void> {
      const { patient, verifier, traitType, proofHash } = event.args;
      
      // Update database
      await this.updateVerificationStatus(patient, verifier, traitType, proofHash);
      
      // Notify frontend via WebSocket
      this.notifyFrontend('verification_complete', {
        patient,
        verifier,
        traitType,
        proofHash,
        timestamp: event.timestamp
      });
    }
  }
  ```
- [ ] **3.3.2** Remove mock event generation
- [ ] **3.3.3** Add reconnection logic for network failures
- [ ] **3.3.4** Implement event filtering and processing

### 3.4 Update API Endpoints
- [ ] **3.4.1** Modify proof generation endpoints to use real Midnight integration
- [ ] **3.4.2** Add transaction status tracking for on-chain operations
- [ ] **3.4.3** Implement gas estimation for contract calls
- [ ] **3.4.4** Add proper error handling for blockchain failures

## Phase 4: Frontend Integration (Hours 20-28)

### 4.1 Wallet Integration with User-Provided Credentials
- [ ] **4.1.1** Update frontend wallet service to use user-provided wallet information:
  ```typescript
  // frontend/src/services/walletService.ts
  export class WalletService {
    private walletAddress: string;
    private balance: number;
    
    constructor() {
      // Use wallet info provided by user during setup
      this.walletAddress = process.env.VITE_LACE_WALLET_ADDRESS!;
      this.balance = parseFloat(process.env.VITE_TDUST_BALANCE || '0');
    }
    
    async connectWallet(): Promise<WalletConnection> {
      // Simulate wallet connection using user-provided credentials
      // In production, this would integrate with actual Lace wallet
      
      return {
        address: this.walletAddress,
        balance: this.balance,
        network: 'midnight-testnet',
        connected: true
      };
    }
    
    async signTransaction(txData: any): Promise<string> {
      // Use Midnight SDK to sign transaction with user's private key
      const signature = await this.signWithPrivateKey(txData);
      return signature;
    }
    
    async getBalance(): Promise<number> {
      // Query balance from Midnight testnet using user's address
      try {
        const provider = new MidnightProvider({
          rpcUrl: process.env.VITE_MIDNIGHT_RPC_URL,
          network: 'testnet'
        });
        
        const balance = await provider.getBalance(this.walletAddress);
        return this.parseTDustBalance(balance);
      } catch (error) {
        console.warn('Failed to fetch live balance, using cached value');
        return this.balance;
      }
    }
  }
  ```
- [ ] **4.1.2** Update frontend environment variables with user's wallet info:
  ```bash
  # frontend/.env
  VITE_LACE_WALLET_ADDRESS={USER_PROVIDED_WALLET_ADDRESS}
  VITE_TDUST_BALANCE={USER_CONFIRMED_BALANCE}
  VITE_MIDNIGHT_RPC_URL=https://testnet.midnight.network/rpc
  VITE_MIDNIGHT_NETWORK=testnet
  ```
- [ ] **4.1.3** Remove dependencies on browser wallet extensions
- [ ] **4.1.4** Add validation for wallet address format and network compatibility

### 4.2 Real-time Transaction Status
- [ ] **4.2.1** Add transaction monitoring component:
  ```typescript
  // frontend/src/components/TransactionMonitor.tsx
  export const TransactionMonitor: React.FC<{ txHash: string }> = ({ txHash }) => {
    const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
    
    useEffect(() => {
      const pollTransaction = async () => {
        try {
          const receipt = await provider.getTransactionReceipt(txHash);
          if (receipt) {
            setStatus(receipt.status === 1 ? 'confirmed' : 'failed');
          }
        } catch (error) {
          // Continue polling
        }
      };
      
      const interval = setInterval(pollTransaction, 2000);
      return () => clearInterval(interval);
    }, [txHash]);
    
    return (
      <div className="transaction-status">
        {status === 'pending' && <Spinner />}
        {status === 'confirmed' && <CheckIcon className="text-green-500" />}
        {status === 'failed' && <XIcon className="text-red-500" />}
      </div>
    );
  };
  ```
- [ ] **4.2.2** Show transaction hashes and links to testnet explorer
- [ ] **4.2.3** Display estimated gas costs before transactions
- [ ] **4.2.4** Add retry functionality for failed transactions

### 4.3 Real Proof Generation UI Updates
- [ ] **4.3.1** Update proof generation to show actual progress from Midnight SDK
- [ ] **4.3.2** Display real constraint counts and proof sizes
- [ ] **4.3.3** Add proof verification step with on-chain confirmation
- [ ] **4.3.4** Show real tDUST costs for proof generation

## Phase 5: Testing and Validation (Hours 28-36)

### 5.1 End-to-End Integration Testing
- [ ] **5.1.1** Test complete flow on Midnight testnet:
  1. Connect Lace wallet
  2. Upload genomic data
  3. Generate real ZK proof using Compact circuits
  4. Submit proof to deployed contract
  5. Verify on-chain storage and event emission
- [ ] **5.1.2** Test doctor verification request flow with real blockchain interactions
- [ ] **5.1.3** Validate researcher aggregation using on-chain data
- [ ] **5.1.4** Test error scenarios (insufficient tDUST, network failures, invalid proofs)

### 5.2 Performance and Security Validation
- [ ] **5.2.1** Measure real proof generation times (target <30s)
- [ ] **5.2.2** Verify no genomic data appears in blockchain transactions
- [ ] **5.2.3** Test concurrent proof generation (up to 3 simultaneous)
- [ ] **5.2.4** Validate access controls on deployed contract

### 5.3 Network Resilience Testing
- [ ] **5.3.1** Test behavior during testnet congestion
- [ ] **5.3.2** Validate retry logic for failed transactions
- [ ] **5.3.3** Test wallet disconnection and reconnection
- [ ] **5.3.4** Verify proof server connectivity fallbacks

## Phase 6: Demo Preparation and Documentation (Hours 36-40)

### 6.1 Demo Environment Setup
- [ ] **6.1.1** Use user-provided wallet address for demo scenarios
- [ ] **6.1.2** Deploy demo contracts with user's wallet as pre-authorized verifier
- [ ] **6.1.3** Prepare realistic genomic test data that works with user's wallet
- [ ] **6.1.4** Pre-generate some proofs using user's credentials for faster demo flow

### 6.2 Integration Documentation
- [ ] **6.2.1** Document deployed contract addresses and ABIs
- [ ] **6.2.2** Create architecture diagram showing real Midnight integration
- [ ] **6.2.3** Document proof generation performance metrics
- [ ] **6.2.4** Create troubleshooting guide for common issues

### 6.3 Final Validation
- [ ] **6.3.1** Verify all functional requirements (FR-015 through FR-057) work with real blockchain
- [ ] **6.3.2** Test demo scenarios end-to-end on testnet
- [ ] **6.3.3** Validate privacy guarantees (no genomic data on-chain)
- [ ] **6.3.4** Confirm hackathon judging criteria are met with real implementation

## Success Criteria Checklist

### ✅ Real Midnight Blockchain Integration
- [ ] Lace wallet connected to Midnight testnet
- [ ] Real tDUST tokens acquired and used for transactions
- [ ] GenomicVerifier contract deployed to testnet
- [ ] Contract interactions confirmed on blockchain explorer

### ✅ Functional ZK Proof System  
- [ ] BRCA1/BRCA2/CYP2D6 circuits implemented in Compact
- [ ] Real proof generation using Midnight SDK
- [ ] Proofs verified on deployed contract
- [ ] No genomic data exposed on-chain

### ✅ Full-Stack Integration
- [ ] Frontend connects to real Lace wallet
- [ ] Backend integrates with Midnight SDK
- [ ] Real-time blockchain event processing
- [ ] Transaction status monitoring

### ✅ Demo Readiness
- [ ] Complete user flows work on testnet
- [ ] Performance meets targets (<30s proof generation)
- [ ] Error handling for network issues
- [ ] Documentation and architecture diagrams complete

## Emergency Fallbacks

**If testnet is down:** Switch to local Midnight development network using Docker
**If user's tDUST balance insufficient:** Guide user to faucet or provide instructions for funding
**If proof generation too slow:** Implement progress indicators and async processing
**If contract deployment fails:** Use pre-deployed backup contract
**If user's wallet credentials invalid:** Implement validation and guide user to correct format

## Required User Information Checklist

Before starting implementation, ensure you have collected from the user:

- [ ] **Midnight Testnet Wallet Address** (format: `addr1...`)
- [ ] **Private Key or Seed Phrase** (for contract deployment and signing)
- [ ] **Current tDUST Balance** (minimum 100 tDUST required)
- [ ] **Network Confirmation** (wallet configured for Midnight testnet)
- [ ] **Security Acknowledgment** (user understands private key handling)

---

**FINAL VALIDATION:** This implementation transforms the existing mock system into a real Midnight blockchain integration that meets all PRD requirements and hackathon judging criteria for a production-ready privacy-preserving genomic DApp.
````
