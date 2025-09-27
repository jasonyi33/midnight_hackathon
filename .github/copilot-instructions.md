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

## Test-driven development (TDD) workflow for Copilot

When implementing features or fixes, prefer a TDD-style flow so Copilot can iterate safely and verify outcomes. Add this as a short checklist for every change that can be verified with tests.

Checklist (use for unit/integration/e2e tests):

1. Write failing tests first
  - Create tests that express the expected input → output behavior.
  - Do NOT write implementation code yet; tests should fail initially.
  - Keep tests focused and deterministic (no network calls or heavy randomness).

2. Run tests and confirm failure
  - Run the relevant test command (Jest, Vitest, or framework-specific).
  - Verify the failure is the one the test is intended to catch.

3. Commit the tests
  - Commit only the test files with a message like `test(<area>): add failing test for <behavior>`.

4. Implement minimal code to satisfy tests
  - Implement the smallest change necessary to make tests pass.
  - Do NOT modify the tests while implementing — iterate on code until green.

5. Run the full test suite
  - Ensure no regressions elsewhere. Fix additional issues as needed.

6. Add complementary tests
  - Add edge-case tests and at least one negative case to prevent regressions.

7. Commit implementation
  - Use a descriptive commit like `feat(<area>): implement <behavior> to satisfy tests`.

8. Optional: cross-verify
  - Have another developer or an automated agent run the tests independently to check for overfitting.

Examples of commands to run (project root or relevant package):
```bash
# Run unit tests (Jest/Vitest) in the frontend
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Typecheck
cd frontend && npx tsc --noEmit
```

Notes for Copilot:
- Prefer writing portable tests using dependency injection and small fakes rather than global mocks.
- Keep test files near the code under test (`__tests__` or `*.test.ts` next to module).
- When asked to produce code, follow the exact test contracts and do not alter test expectations unless explicitly requested.
- If tests need a mock SDK or network, provide a small deterministic fake implementation in the test itself.

