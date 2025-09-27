# Copilot Instructions for Genomic Privacy DApp

## Project Architecture
- **Three main components:**
  - `contracts/`: Midnight blockchain smart contracts (Compact language)
  - `backend/`: Node.js API, proof generation, event monitoring
  - `frontend/`: React app for patient/doctor/researcher portals
- **Data flow:**
  - Patients upload encrypted genome data
  - Backend generates ZK proofs using ProofSDK
  - Smart contracts verify proofs and store commitments
  - Frontend displays verification status and analytics

## Key Workflows
- **Contract compilation:**
  - Use Compact compiler: `npm run build` in `contracts/`
  - Format Compact code: `npm run format`
- **Testing:**
  - Run contract tests: `npm test` in `contracts/`
- **Deployment:**
  - Deploy to Midnight testnet: `npm run deploy:testnet`
  - Requires `.env` with `MIDNIGHT_NETWORK`, `DEPLOYER_PRIVATE_KEY`, `MIDNIGHT_RPC_URL`
- **Integration:**
  - Backend integrates ProofSDK from `cont  racts/src/sdk`
  - EventListener monitors blockchain events for proof verification

## Conventions & Patterns
- **Smart contracts:**
  - Main contract: `genomic_verifier.compact` (handles ZK proof verification, genome commitments)
  - Use access control for verifiers
  - Audit trail for all verification actions
- **TypeScript:**
  - Strict mode, max 100 char line length, functions <50 lines, classes <100 lines
  - Organize by feature (see `apps/frontend/src/components/`, `apps/backend/src/services/`)
- **Zero-knowledge proofs:**
  - Traits supported: BRCA1, BRCA2, CYP2D6
  - ProofSDK wraps contract calls and proof generation
- **Environment:**
  - Compact compiler binaries in `compactc_v0.25.0_aarch64-darwin/`
  - Use provided scripts in `contracts/scripts/` for deployment and event listening

## Examples
- **Compile contract:**
  ```zsh
  cd contracts && npm run build
  ```
- **Run tests:**
  ```zsh
  cd contracts && npm test
  ```
- **Deploy contract:**
  ```zsh
  cd contracts && npm run deploy:testnet
  ```
- **Integrate ProofSDK:**
  ```zsh
  cp -r contracts/src/sdk backend/src/proof-sdk
  ```

## References
- See `contracts/README.md` and project root `README.md` for integration and workflow details.
- For code style and architecture, follow `.github/instructions/copilot-instructions.instructions.md`.
