# Implementation Task List: Genomic Privacy DApp on Midnight Blockchain# Implementation Task List: Genomic Privacy DApp on Midnight Blockchain



## Developer Assignment Key## Developer Assignment Key

- **[Dev 1]** = Frontend Core (Patient Portal)- **[Dev 1]** = Frontend Core (Patient Portal)

- **[Dev 2]** = Frontend Secondary (Doctor/Researcher Portals & UI)- **[Dev 2]** = Frontend Secondary (Doctor/Researcher Portals & UI)

- **[Dev 3]** = Backend & Infrastructure- **[Dev 3]** = Backend & Infrastructure

- **[Dev 4]** = Blockchain & ZK Circuits- **[Dev 4]** = Blockchain & ZK Circuits



## Git Branch Structure## Git Branch Structure

``````

main → develop → feature/[frontend-patient|frontend-portals|backend|blockchain]main → develop → feature/[frontend-patient|frontend-portals|backend|blockchain]

``````



## Phase 0: Pre-Hackathon Setup (T-24 to T-0 hours)## Phase 0: Pre-Hackathon Setup (T-24 to T-0 hours)



### Environment Setup [All]### Environment Setup [All]

- [ ] **0.1** Install Node.js 20 LTS, Docker Desktop, Git, VS Code with TypeScript/ESLint/Prettier extensions- [ ] **0.1** Install Node.js 20 LTS, Docker Desktop, Git, VS Code with TypeScript/ESLint/Prettier extensions

- [ ] **0.2** Create GitHub repo "genomic-privacy-dapp" with branch protection on main- [ ] **0.2** Create GitHub repo "genomic-privacy-dapp" with branch protection on main

- [ ] **0.3** Initialize monorepo structure: frontend/, backend/, contracts/, shared/ folders- [ ] **0.3** Initialize monorepo structure: frontend/, backend/, contracts/, shared/ folders

- [ ] **0.4** Create feature branches: feature/frontend-patient, feature/frontend-portals, feature/backend, feature/blockchain- [ ] **0.4** Create feature branches: feature/frontend-patient, feature/frontend-portals, feature/backend, feature/blockchain



### Blockchain Setup [All]### Blockchain Setup [All]

- [ ] **0.5** Install Lace wallet browser extension and connect to Midnight testnet- [ ] **0.5** Install Lace wallet browser extension and connect to Midnight testnet

- [ ] **0.6** Get testnet tDUST from faucet (100 tokens per developer)- [ ] **0.6** Get testnet tDUST from faucet (100 tokens per developer)

- [ ] **0.7** [Dev 4] Install Midnight Compact compiler: `npm install -g @midnight-ntwrk/compact-compiler@0.24.0`- [ ] **0.7** [Dev 4] Install Midnight Compact compiler: `npm install -g @midnight-ntwrk/compact-compiler@0.24.0`



### Service Accounts [Dev 3]### Service Accounts [Dev 3]

- [ ] **0.8** Create Pinata account for IPFS, generate API keys (use free tier - 1GB storage)- [ ] **0.8** Create Pinata account for IPFS, generate API keys (use free tier - 1GB storage)

- [ ] **0.9** Create Vercel team account for frontend deployment- [ ] **0.9** Create Vercel team account for frontend deployment

- [ ] **0.10** Set up Railway account for backend hosting with PostgreSQL and Redis addons- [ ] **0.10** Set up Railway account for backend hosting with PostgreSQL and Redis addons

- [ ] **0.11** Create shared .env file with all API keys and share via secure channel- [ ] **0.11** Create shared .env file with all API keys and share via secure channel



### Project Initialization [Split by role]### Project Initialization [Split by role]

- [ ] **0.12** [Dev 1] Initialize React with Vite: `npm create vite@latest frontend -- --template react-ts`- [ ] **0.12** [Dev 1] Initialize React with Vite: `npm create vite@latest frontend -- --template react-ts`

- [ ] **0.13** [Dev 2] Install UI dependencies: tailwindcss, framer-motion, three, recharts, react-hot-toast- [ ] **0.13** [Dev 2] Install UI dependencies: tailwindcss, framer-motion, three, recharts, react-hot-toast

- [ ] **0.14** [Dev 3] Initialize Express backend with TypeScript, install: express, pg, redis, bull, socket.io, jsonwebtoken- [ ] **0.14** [Dev 3] Initialize Express backend with TypeScript, install: express, pg, redis, bull, socket.io, jsonwebtoken

- [ ] **0.15** [Dev 4] Initialize contracts with create-midnight-app, install Midnight SDK- [ ] **0.15** [Dev 4] Initialize contracts with create-midnight-app, install Midnight SDK



## Phase 1: Foundation (Hours 0-8)## Phase 1: Foundation (Hours 0-8)



### 1.0 Core Infrastructure### 1.0 Core Infrastructure



- [ ] **1.1** [Dev 1] **Set up React routing**- [ ] **1.1** [Dev 1] **Set up React routing**

  - Create routes for /patient, /doctor, /researcher using react-router-dom  - Create routes for /patient, /doctor, /researcher using react-router-dom

  - Implement ProtectedRoute component checking authentication and role  - Implement ProtectedRoute component checking authentication and role

  - Set up QueryClient with 5min stale time, 3 retries with exponential backoff  - Set up QueryClient with 5min stale time, 3 retries with exponential backoff



- [ ] **1.2** [Dev 2] **Create glass morphism design system**- [ ] **1.2** [Dev 2] **Create glass morphism design system**

  - Configure Tailwind with custom colors: primary-dark (#1a1a2e), primary-purple (#6c63ff), accent-cyan (#00d9ff)  - Configure Tailwind with custom colors: primary-dark (#1a1a2e), primary-purple (#6c63ff), accent-cyan (#00d9ff)

  - Create .glass-card utility with backdrop-filter: blur(10px) and rgba(255,255,255,0.1) background  - Create .glass-card utility with backdrop-filter: blur(10px) and rgba(255,255,255,0.1) background

  - Add custom animations: float (6s), gradient (15s), pulse-slow (3s)  - Add custom animations: float (6s), gradient (15s), pulse-slow (3s)



- [ ] **1.3** [Dev 3] **Set up Express server**- [ ] **1.3** [Dev 3] **Set up Express server**

  - Configure middleware stack: helmet (CSP headers), cors (frontend origin), compression, rate-limit (100/min)  - Configure middleware stack: helmet (CSP headers), cors (frontend origin), compression, rate-limit (100/min)

  - Create health check endpoint returning uptime and environment  - Create health check endpoint returning uptime and environment

  - Set up error handling middleware with custom error classes  - Set up error handling middleware with custom error classes



- [ ] **1.4** [Dev 4] **Create GenomicVerifier contract skeleton**- [ ] **1.4** [Dev 4] **Create GenomicVerifier contract skeleton**

  - Define ledger state: verificationCount, authorizedVerifiers map, commitments map, verificationEvents list  - Define ledger state: verificationCount, authorizedVerifiers map, commitments map, verificationEvents list

  - Define private state: patientGenomes map, accessGrants map, proofCache map  - Define private state: patientGenomes map, accessGrants map, proofCache map

  - Implement storeCommitment function accepting patient address, commitment hash, IPFS CID  - Implement storeCommitment function accepting patient address, commitment hash, IPFS CID



### 1.1 Authentication System (FR-001 to FR-006)### 1.1 Authentication System (FR-001 to FR-006)



- [ ] **1.5** [Dev 1] **Implement Lace wallet connection**- [ ] **1.5** [Dev 1] **Implement Lace wallet connection**

  - Check for window.cardano.lace existence, throw error if not installed  - Check for window.cardano.lace existence, throw error if not installed

  - Call lace.enable() to request access, get addresses with getUsedAddresses()  - Call lace.enable() to request access, get addresses with getUsedAddresses()

  - Sign authentication message with timestamp using signData()  - Sign authentication message with timestamp using signData()

  - Display tDUST balance from getBalance() in UI  - Display tDUST balance from getBalance() in UI



- [ ] **1.6** [Dev 3] **Create authentication endpoints**- [ ] **1.6** [Dev 3] **Create authentication endpoints**

  - POST /api/auth/connect - verify signature, generate JWT (1hr) and refresh token (24hr)  - POST /api/auth/connect - verify signature, generate JWT (1hr) and refresh token (24hr)

  - Hash wallet address to create deterministic patient ID  - Hash wallet address to create deterministic patient ID

  - Store user in database with role defaulting to 'patient'  - Store user in database with role defaulting to 'patient'

  - Return tokens and user object  - Return tokens and user object



- [ ] **1.7** [Dev 1] **Create Zustand auth store**- [ ] **1.7** [Dev 1] **Create Zustand auth store**

  - Store: isAuthenticated, user, accessToken, refreshToken, balance  - Store: isAuthenticated, user, accessToken, refreshToken, balance

  - Actions: connectWallet, disconnect, refreshAuth, setBalance  - Actions: connectWallet, disconnect, refreshAuth, setBalance

  - Persist tokens to localStorage with encryption  - Persist tokens to localStorage with encryption

  - Handle wallet switching without losing state  - Handle wallet switching without losing state



### 1.2 Database Setup (FR-068 to FR-073)### 1.2 Database Setup (FR-068 to FR-073)



- [ ] **1.8** [Dev 3] **Configure PostgreSQL and Redis**- [ ] **1.8** [Dev 3] **Configure PostgreSQL and Redis**

  - Create docker-compose.yml with postgres:15 and redis:7.2 images  - Create docker-compose.yml with postgres:15 and redis:7.2 images

  - Set up connection pools: PostgreSQL (max 20), Redis (with password)  - Set up connection pools: PostgreSQL (max 20), Redis (with password)

  - Implement health checks for both services  - Implement health checks for both services



- [ ] **1.9** [Dev 3] **Create database schema**- [ ] **1.9** [Dev 3] **Create database schema**

  - Tables: users, genome_commitments, verification_requests, audit_log  - Tables: users, genome_commitments, verification_requests, audit_log

  - Add indexes on foreign keys and frequently queried columns  - Add indexes on foreign keys and frequently queried columns

  - Implement soft deletes with deleted_at column  - Implement soft deletes with deleted_at column

  - Create migration scripts with node-pg-migrate  - Create migration scripts with node-pg-migrate



- [ ] **1.10** [Dev 3] **Set up data encryption**- [ ] **1.10** [Dev 3] **Set up data encryption**

  - Encrypt sensitive fields using AES-256-GCM before storage  - Encrypt sensitive fields using AES-256-GCM before storage

  - Store encryption keys in environment variables  - Store encryption keys in environment variables

  - Create automated backup script running every 6 hours  - Create automated backup script running every 6 hours



### 1.3 Smart Contract Foundation (FR-052 to FR-059)### 1.3 Smart Contract Foundation (FR-052 to FR-059)



- [ ] **1.11** [Dev 4] **Deploy GenomicVerifier to testnet**- [ ] **1.11** [Dev 4] **Deploy GenomicVerifier to testnet**

  - Compile contract with compactc, generate ABI  - Compile contract with compactc, generate ABI

  - Deploy using deployment script with owner address  - Deploy using deployment script with owner address

  - Verify contract on Midnight explorer  - Verify contract on Midnight explorer



- [ ] **1.12** [Dev 4] **Implement access control**- [ ] **1.12** [Dev 4] **Implement access control**

  - Create onlyAuthorized modifier checking authorizedVerifiers mapping  - Create onlyAuthorized modifier checking authorizedVerifiers mapping

  - Add addVerifier/removeVerifier functions restricted to owner  - Add addVerifier/removeVerifier functions restricted to owner

  - Implement emergency pause circuit breaker  - Implement emergency pause circuit breaker



- [ ] **1.13** [Dev 4] **Create BRCA1 proof circuit**- [ ] **1.13** [Dev 4] **Create BRCA1 proof circuit**

  - Define circuit accepting genome data and threshold  - Define circuit accepting genome data and threshold

  - Implement boolean logic for mutation present/absent  - Implement boolean logic for mutation present/absent

  - Generate proof with Halo2 backend  - Generate proof with Halo2 backend

  - Return proof hash and public inputs  - Return proof hash and public inputs



### 1.4 UI Foundation (FR-044 to FR-051)### 1.4 UI Foundation (FR-044 to FR-051)



- [ ] **1.14** [Dev 2] **Implement dark theme**- [ ] **1.14** [Dev 2] **Implement dark theme**

  - Set body background to #1a1a2e, text to white  - Set body background to #1a1a2e, text to white

  - Configure fonts: Inter (body), Space Grotesk (headers), JetBrains Mono (code)  - Configure fonts: Inter (body), Space Grotesk (headers), JetBrains Mono (code)

  - Create consistent spacing scale: 4px base unit  - Create consistent spacing scale: 4px base unit



- [ ] **1.15** [Dev 2] **Create animated background**- [ ] **1.15** [Dev 2] **Create animated background**

  - Implement Three.js particle system or use particles.js  - Implement Three.js particle system or use particles.js

  - Add floating geometric shapes with subtle rotation  - Add floating geometric shapes with subtle rotation

  - Ensure 60fps performance with requestAnimationFrame  - Ensure 60fps performance with requestAnimationFrame



- [ ] **1.16** [Dev 2] **Build component library**- [ ] **1.16** [Dev 2] **Build component library**

  - GlassCard: glass morphism container with customizable padding  - GlassCard: glass morphism container with customizable padding

  - GlassButton: interactive button with hover state lifting effect  - GlassButton: interactive button with hover state lifting effect

  - SkeletonLoader: pulsing placeholder for async content  - SkeletonLoader: pulsing placeholder for async content

  - Add Framer Motion page transitions (300ms ease-out)  - Add Framer Motion page transitions (300ms ease-out)



**HOUR 8 GIT MERGE:** All developers merge to develop branch**HOUR 8 GIT MERGE:** All developers merge to develop branch



## Phase 2: Core Features (Hours 8-16)## Phase 2: Core Features (Hours 8-16)



### 2.0 Genomic Data Management (FR-007 to FR-014)### 2.0 Genomic Data Management (FR-007 to FR-014)



- [ ] **2.1** [Dev 1] **Create genome upload component**- [ ] **2.1** [Dev 1] **Create genome upload component**

  - Accept JSON file upload with drag-and-drop  - Accept JSON file upload with drag-and-drop

  - Validate structure: check for required fields (BRCA1, BRCA2, CYP2D6)  - Validate structure: check for required fields (BRCA1, BRCA2, CYP2D6)

  - Display file preview with syntax highlighting  - Display file preview with syntax highlighting

  - Show upload progress with percentage  - Show upload progress with percentage



- [ ] **2.2** [Dev 3] **Implement encryption service**- [ ] **2.2** [Dev 3] **Implement encryption service**

  - Use crypto-js for AES-256-GCM encryption  - Use crypto-js for AES-256-GCM encryption

  - Generate random salt and IV for each encryption  - Generate random salt and IV for each encryption

  - Return encrypted data with salt, IV, and auth tag  - Return encrypted data with salt, IV, and auth tag

  - Never store unencrypted genomic data  - Never store unencrypted genomic data



- [ ] **2.3** [Dev 3] **Create IPFS service**- [ ] **2.3** [Dev 3] **Create IPFS service**

  - Initialize Pinata client with API keys  - Initialize Pinata client with API keys

  - Pin encrypted JSON with metadata (patient ID, timestamp)  - Pin encrypted JSON with metadata (patient ID, timestamp)

  - Verify pinning success with getPinByHash  - Verify pinning success with getPinByHash

  - Store IPFS CID in database with commitment hash  - Store IPFS CID in database with commitment hash



### 2.1 Proof Generation System (FR-015 to FR-023)### 2.1 Proof Generation System (FR-015 to FR-023)



- [ ] **2.4** [Dev 4] **Complete ZK circuits**n- [ ] **2.4** [Dev 4] **Complete ZK circuits**

- [ ] **2.5** [Dev 4] **Build ProofSDK TypeScript wrapper**  - BRCA1: boolean proof for mutation detection

- [ ] **2.6** [Dev 3] **Set up proof generation queue**  - BRCA2: boolean proof with same logic

  - CYP2D6: metabolizer status (poor/intermediate/normal/rapid/ultrarapid)

... (task list continues in repo attachments)  - All circuits output proof hash and verification key


- [ ] **2.5** [Dev 4] **Build ProofSDK TypeScript wrapper**
  - Export functions: generateBRCA1Proof, generateBRCA2Proof, generateCYP2D6Proof
  - Each function accepts genetic marker data, returns proof object
  - Include mock mode for testing without actual circuits
  - Package as npm module for backend integration
  - **Coordinate with Dev 3**: Provide clear integration documentation

- [ ] **2.6** [Dev 3] **Set up proof generation queue**
  - Configure Bull queue with Redis backend
  - **Integrate Dev 4's ProofSDK**: Import SDK and call functions in worker process
  - Implement progress reporting via WebSocket (every 500ms)
  - Cache completed proofs in Redis with 1-hour TTL
  - Support 3 concurrent proof generations

### 2.2 Patient Portal (FR-024 to FR-030)

- [ ] **2.7** [Dev 1] **Build patient dashboard**
  - Display uploaded genome status and IPFS CID
  - List available traits for verification (BRCA1, BRCA2, CYP2D6)
  - Show medical descriptions in layman's terms
  - Create proof generation interface with trait selection

- [ ] **2.8** [Dev 1] **Implement proof generation UI**
  - Select proof type: boolean (present/absent), range (<threshold), set membership
  - Show real-time progress bar updating every 500ms
  - Handle timeout (30s) with retry option
  - Display completed proofs with verification links

- [ ] **2.8a** [Dev 3] **Create medical validation constants**
  - Define validation constants file with acceptable ranges
  - BRCA1/BRCA2 risk scores: 0.0 to 1.0
  - CYP2D6 activity scores: 0.0 to 3.0
  - Confidence scores: 0.0 to 1.0
  - Implement validation logic in proof generation service

- [ ] **2.9** [Dev 1] **Create consent management**
  - List pending verification requests from doctors
  - Grant/deny access with expiry time selection
  - View access history with timestamps
  - Revoke active consents (re-encryption deferred as nice-to-have)

### 2.3 Healthcare Provider Portals (FR-031 to FR-043)

- [ ] **2.10** [Dev 2] **Build doctor portal**
  - Distinct purple theme variant for medical professionals
  - Patient lookup by wallet address
  - Request specific trait verifications
  - Display request status: pending/approved/denied
  - Show cryptographic proofs with on-chain verification links
  - **Display full request history** with timestamps and outcomes (FR-036)

- [ ] **2.11** [Dev 2] **Build researcher portal**
  - Data visualization focus with charts
  - Display aggregate mutation frequencies
  - Implement minimum cohort size check (5 patients)
  - Export functionality for CSV download
  - Real-time updates when new data added

- [ ] **2.12** [Dev 2] **Implement data visualizations**
  - Use Recharts for mutation frequency bar charts
  - Create pie charts for metabolizer status distribution
  - Add time series for verification trends
  - Ensure no PII in any visualization

### 2.4 Backend API (FR-060 to FR-067)

- [ ] **2.13** [Dev 3] **Create core API endpoints**
  - POST /api/proof/generate - queue proof generation job
  - GET /api/proof/status/:jobId - check progress and result
  - POST /api/verification/request - doctor requests patient verification
  - GET /api/verification/list - list requests for patient
  - POST /api/verification/respond - patient approves/denies
  - GET /api/verification/history/:doctorId - get full request history

- [ ] **2.14** [Dev 3] **Implement security middleware**
  - JWT validation with refresh token rotation
  - Rate limiting: 10 req/min for proof generation, 100 req/min general
  - Input validation using express-validator schemas
  - Correlation ID generation for request tracking
  - CORS configuration for frontend origin only

**HOUR 16 GIT MERGE:** All developers merge to develop branch

## Phase 3: Integration & Real-time (Hours 16-24)

### 3.0 Frontend-Backend Integration

- [ ] **3.1** [Dev 1 & Dev 3] **Connect patient portal to API**
  - Wire wallet authentication to backend auth endpoint
  - Connect genome upload to IPFS pinning service
  - Integrate proof generation UI with queue API
  - Handle errors with user-friendly messages

- [ ] **3.2** [Dev 2 & Dev 3] **Connect provider portals**
  - Wire doctor verification requests to backend
  - Connect researcher portal to aggregation endpoints
  - Implement real-time status updates
  - Add loading states for all async operations

### 3.1 Smart Contract Integration

- [ ] **3.3** [Dev 4 & Dev 3] **Integrate ProofSDK with backend**
  - Import SDK in proof worker process
  - Call appropriate circuit based on trait type
  - Store proof results on-chain
  - Emit VerificationComplete events
  - **Clear handoff**: Dev 4 provides SDK → Dev 3 integrates into worker

- [ ] **3.4** [Dev 4] **Set up event listeners**
  - Listen for VerificationComplete events
  - Update verification count on each proof
  - Maintain audit trail in contract
  - Implement retry logic for failed transactions

### 3.2 Real-time Features (FR-037)

- [ ] **3.5** [Dev 3] **Implement WebSocket server**
  - Initialize Socket.io with JWT authentication
  - Create rooms for patient-doctor pairs
  - Broadcast proof generation progress
  - Send notifications for new verification requests

- [ ] **3.6** [Dev 1 & Dev 2] **Add WebSocket client**
  - Connect to WebSocket on dashboard mount
  - Subscribe to relevant rooms based on user role
  - Display real-time notifications with toast
  - Update UI optimistically on status changes

### 3.3 Data Aggregation (FR-039 to FR-043)

- [ ] **3.7** [Dev 3] **Build aggregation service**
  - Query database for anonymous trait data
  - Calculate frequencies without exposing individuals
  - Enforce minimum cohort size of 5
  - Generate CSV exports with headers

### 3.4 Mock & Demo Systems

- [ ] **3.8** [All] **Create demo mode**
  - Generate 10 mock patient JSON files with varied genetic data
  - Create demo accounts: Sarah (patient), Dr. Johnson, Researcher
  - Implement mock proof generator with realistic 5-10s delays
  - Add DEMO_MODE flag toggling between real and mock

- [ ] **3.9** [Dev 3] **Seed demo data**
  - Pre-populate 127 BRCA records for researcher portal
  - Create historical verification requests
  - Generate realistic timestamps over past 30 days
  - Include variety of approved/denied statuses

**HOUR 24 GIT MERGE:** All developers merge to develop branch

## Phase 4: Polish & Testing (Hours 24-32)

### 4.0 UI Polish

- [ ] **4.1** [Dev 2] **Refine animations**
  - Add particle burst on successful proof generation
  - Smooth all transitions to 300ms ease-out
  - Implement skeleton loaders for all async content
  - Add micro-interactions to buttons (scale on hover)

- [ ] **4.2** [Dev 1 & Dev 2] **Optimize performance and responsive design**
  - Test responsive breakpoints: 768px (tablet), 1024px (desktop), 1920px (wide)
  - Implement React.memo on expensive components
  - Add lazy loading for portal routes
  - Optimize bundle with code splitting
  - Ensure 60fps on all animations

### 4.1 Security Hardening

- [ ] **4.3** [Dev 3] **Backend security**
  - Verify no sensitive data in logs
  - Tighten CORS to production domain only
  - Add request size limits (10MB)
  - Implement IP-based rate limiting

- [ ] **4.4** [Dev 4] **Contract security**
  - Gas optimization for all functions
  - Verify access control on all state changes
  - Test circuit breaker functionality
  - Audit for reentrancy vulnerabilities

### 4.2 Critical Path Testing

- [ ] **4.5** [All] **Test wallet edge cases**
  - No wallet installed → show installation guide
  - Wrong network → prompt network switch
  - Insufficient funds → link to faucet
  - Connection timeout → retry mechanism

- [ ] **4.6** [All] **Test proof generation flow**
  - Upload genome → generate proof → verify on-chain
  - Handle IPFS failures with local storage fallback
  - Test timeout and retry for proof generation
  - Verify caching works for repeated proofs

- [ ] **4.7** [All] **Test verification flow**
  - Doctor requests → patient approves → proof generated
  - Test expiry of access grants
  - Verify audit trail creation
  - Check researcher aggregation updates

**HOUR 32 GIT MERGE:** All developers merge to develop branch

## Phase 5: Demo Preparation (Hours 32-40)

### 5.0 Demo Data Setup

- [ ] **5.1** [Dev 3] **Create demo scenarios**
  - Sarah: BRCA-negative patient for insurance scenario
  - Mike: CYP2D6 poor metabolizer for medication scenario
  - Dr. Johnson: authorized verifier account
  - 127 anonymous records for researcher portal

- [ ] **5.2** [All] **Optimize demo flow**
  - Pre-generate common proofs for instant demo
  - Ensure all transitions under 2 seconds
  - Test on 3G network throttling
  - Practice complete flow 5 times

### 5.1 Documentation

- [ ] **5.3** [Lead] **Create README**
  - Project overview and problem statement
  - Setup instructions with prerequisites
  - List of features with checkmarks
  - Team members and contributions
  - Demo credentials and URLs

- [ ] **5.4** [Dev 4] **Technical documentation**
  - Architecture diagram showing all components
  - Smart contract addresses and ABI
  - API endpoint documentation
  - Known issues and workarounds

### 5.2 Deployment Preparation

- [ ] **5.5** [Dev 1] **Prepare frontend deployment**
  - Build production bundle with vite build
  - Configure vercel.json with rewrites
  - Set environment variables in Vercel dashboard
  - Test production build locally

- [ ] **5.6** [Dev 3] **Prepare backend deployment**
  - Configure Railway/Render environment variables
  - Set up PostgreSQL and Redis addons
  - Configure production Pinata keys
  - Test WebSocket in production

**HOUR 40 GIT MERGE:** All developers merge to develop branch

## Phase 6: Deployment & Final Integration (Hours 40-48)

### 6.0 Production Deployment

- [ ] **6.1** [Dev 1] **Deploy frontend**
  - Run `vercel --prod` from frontend directory
  - Verify custom domain if available
  - Test all routes work correctly
  - Ensure API calls point to production backend

- [ ] **6.2** [Dev 3] **Deploy backend**
  - Push to Railway/Render with git
  - Run production migrations
  - Seed demo accounts
  - Verify WebSocket connectivity

- [ ] **6.3** [Dev 4] **Deploy contracts**
  - Deploy final version to Midnight testnet
  - Verify on block explorer
  - Update contract addresses in frontend/backend
  - Test all contract interactions

### 6.1 Final Testing

- [ ] **6.4** [All] **End-to-end testing**
  - Test complete insurance scenario
  - Test precision medicine scenario
  - Test research aggregation scenario
  - Load test with 10 concurrent users

- [ ] **6.5** [All] **Demo rehearsal**
  - Assign presentation sections to team members
  - Practice 5-minute presentation
  - Prepare answers for likely questions
  - Record backup video

### 6.2 Submission

- [ ] **6.6** [Lead] **Final submission**
  - Create git tag v1.0.0
  - Merge develop to main
  - Submit URLs on hackathon platform
  - Upload demo video as backup
  - Verify submission confirmation

## Emergency Procedures

**If Midnight testnet down:** Use demo mode with mock proofs
**If IPFS fails:** Use PostgreSQL for encrypted storage with mock CIDs  
**If deployment fails:** Use ngrok for local tunneling
**If team member unavailable:** Pre-assigned backup responsibilities

## Success Checklist

- [ ] All 73 functional requirements implemented
- [ ] Demo flows work without errors
- [ ] Three user portals functional
- [ ] Real-time updates working
- [ ] Glass morphism UI with smooth animations
- [ ] Deployed to production URLs
- [ ] Documentation complete
- [ ] Medical validation ranges implemented
- [ ] Full request history for doctors
- [ ] Responsive design tested at all breakpoints