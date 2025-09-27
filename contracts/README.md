# Genomic Privacy Smart Contracts

This directory contains the Midnight blockchain smart contracts for the Genomic Privacy DApp.

## Structure

- `src/` - Compact smart contract source files
- `tests/` - Contract tests
- `scripts/` - Deployment and utility scripts
- `build/` - Compiled contract artifacts

## Contracts

### GenomicVerifier

The main contract for privacy-preserving genetic trait verification using zero-knowledge proofs.

**Features:**
- Store genome commitments on-chain
- Verify ZK proofs for genetic traits (BRCA1, BRCA2, CYP2D6)
- Access control for authorized verifiers
- Audit trail for all verifications

## Development

```bash
# Compile contracts
npm run build

# Run tests
npm test

# Deploy to testnet
npm run deploy:testnet

# Format code
npm run format
```

## Environment Variables

Create a `.env` file with:

```
MIDNIGHT_NETWORK=testnet
DEPLOYER_PRIVATE_KEY=your-testnet-private-key
MIDNIGHT_RPC_URL=https://testnet.midnight.network/rpc
```
