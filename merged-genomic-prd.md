# Product Requirements Document: Genomic Privacy DApp on Midnight

**Version:** 3.0.0 (Merged)  
**Date:** October 2024  
**Hackathon:** MLH Midnight Hackathon  
**Team Size:** 4 Developers  
**Timeline:** 48 Hours

## Table of Contents

1. Introduction/Overview
2. Goals
3. User Stories
4. Functional Requirements
5. Non-Goals (Out of Scope)
6. Design Considerations
7. Technical Considerations
8. Success Metrics
9. Edge Cases & Error Handling
10. Implementation Priority & Timeline
11. Open Questions
12. Development Resources
13. Risk Mitigation
14. Development Setup Instructions
15. Appendices

---

## 1. Introduction/Overview

The Genomic Privacy DApp is a revolutionary healthcare application built on the Midnight blockchain that enables patients to prove specific genetic traits or medical eligibility without revealing their complete genomic sequence. Using zero-knowledge proofs and selective disclosure, the platform allows patients to maintain complete ownership and privacy of their genetic data while still participating in precision medicine, clinical trials, and insurance eligibility verification.

### Core Problem
Healthcare providers and researchers need access to genetic information for:
- Precision medicine treatment selection
- Clinical trial eligibility verification
- Population health studies
- Risk assessment and prevention

However, patients face an impossible choice:
- Share entire genome (risking discrimination, breaches, permanent exposure)
- Don't participate in personalized medicine at all

### Our Solution
Cryptographically prove only what's necessary, when it's necessary, to whom it's necessary using Midnight's zero-knowledge proof infrastructure.

### Data Architecture Clarification

**IMPORTANT**: This DApp does NOT process raw genomic sequencing data.

We handle:
- ✅ Pre-extracted clinical variants (5-10 KB JSON)
- ✅ Cryptographic proofs of variants (2 KB)
- ✅ On-chain commitments (32 bytes)

We do NOT handle:
- ❌ Raw FASTQ files (30-200 GB)
- ❌ Aligned BAM files (50-100 GB)
- ❌ Full VCF files (100-500 MB)
- ❌ Actual DNA sequences (ATCG strings)

Patients receive their extracted variant data from clinical labs and upload only the relevant markers to our system.

**Primary Goal:** Create a functional MVP demonstrating privacy-preserving genetic verification for medical treatment eligibility within 48 hours.

---

## 2. Goals

### Primary Objectives
1. **Enable Privacy-Preserving Genetic Verification**
	 - Prove presence/absence of BRCA1/BRCA2 mutations
	 - Prove CYP2D6 metabolizer status
	 - Demonstrate range proofs for genetic risk scores

2. **Implement Real Zero-Knowledge Proofs**
	 - Deploy actual Compact circuits on Midnight testnet
	 - Validate proofs both client-side and on-chain

3. **Create Professional User Experience**
	 - Premium animated interface with glass morphism design
	 - Real-time updates via WebSocket connections

4. **Demonstrate Blockchain Value**
	 - Immutable audit trail for medical-legal compliance
	 - Automated consent enforcement via smart contracts

5. **Achieve Production-Ready Architecture**
	 - Separated frontend/backend with clean API
	 - Comprehensive error handling for demo path

---

## 3. User Stories

### Patient Stories

**P1: Privacy-Conscious Insurance Applicant**
> As a patient with family history of breast cancer, I want to prove I don't carry BRCA1/BRCA2 mutations to qualify for better insurance rates without revealing my entire genetic profile, so that I can protect my privacy while accessing affordable coverage.

**P2: Precision Medicine Candidate**
> As a patient seeking cancer treatment, I want to prove I have specific genetic markers that make me eligible for targeted therapy without exposing unrelated genetic information, so that I can receive personalized treatment while maintaining genetic privacy.

**P3: Clinical Trial Participant**
> As a patient interested in research, I want to selectively share specific genetic traits with researchers while keeping my identity and full genome private, so that I can contribute to medical advancement without personal risk.

### Healthcare Provider Stories

**D1: Oncologist Prescribing Treatment**
> As an oncologist, I want to verify a patient's HER2 status and BRCA mutations to prescribe appropriate targeted therapy without accessing their full genome, so that I can provide personalized care while respecting patient privacy.

**D2: Pharmacist Checking Drug Interactions**
> As a pharmacist, I want to verify a patient's CYP2D6 metabolizer status before dispensing codeine without seeing other genetic information, so that I can prevent adverse drug reactions while maintaining HIPAA compliance.

### Researcher Stories

**R1: Epidemiologist Studying Disease Prevalence**
> As a medical researcher, I want to analyze aggregate BRCA1/2 mutation frequencies across populations without accessing individual patient data, so that I can study cancer risk factors while preserving participant anonymity.

**R2: Clinical Trial Coordinator**
> As a trial coordinator, I want to verify that participants meet specific genetic inclusion criteria without storing their genomic data, so that I can ensure trial validity while minimizing data liability.

---

## 4. Functional Requirements

### 4.1 Authentication & Wallet Integration (Priority: Critical)

**FR-001:** System MUST integrate with Lace wallet for Midnight testnet authentication  
**FR-002:** System MUST generate unique patient identifier from wallet address using deterministic hashing  
**FR-003:** System MUST maintain session persistence using JWT tokens with 24-hour expiry  
**FR-004:** System MUST handle wallet disconnection with automatic session pause and resume capability  
**FR-005:** System MUST display current tDUST balance and estimated transaction costs before operations  
**FR-006:** System MUST support wallet switching without losing application state  

### 4.2 Genomic Data Management (Priority: Critical)

**FR-007:** System MUST accept genomic data in simplified JSON format (see Appendix A)  
**FR-008:** System MUST validate JSON structure and genetic marker formats before processing  
**FR-009:** System MUST encrypt genomic data using AES-256-GCM before any transmission  
**FR-010:** System MUST generate deterministic IPFS CID for encrypted genome data  
**FR-011:** System MUST pin encrypted data to IPFS with verification of successful pinning  
**FR-012:** System MUST create on-chain commitment using SHA-256 hash of encrypted data  
**FR-013:** System MUST NEVER transmit or store unencrypted genomic data  
**FR-014:** System MUST support data re-encryption with new keys for access revocation  

### 4.3 Zero-Knowledge Proof Generation (Priority: Critical)

**FR-015:** System MUST generate real ZK proofs for BRCA1 mutations using Compact circuits  
**FR-016:** System MUST generate real ZK proofs for BRCA2 mutations using Compact circuits  
**FR-017:** System MUST generate real ZK proofs for CYP2D6 metabolizer status  
**FR-018:** System MUST show proof generation progress with percentage updates every 500ms  
**FR-019:** System MUST handle proof generation timeout after 30 seconds with retry option  
**FR-020:** System MUST cache generated proofs in Redis with 1-hour TTL  
**FR-021:** Backend MUST process proof generation in worker queue (not frontend)  
**FR-022:** System MUST support concurrent proof generation for up to 3 traits  
**FR-023:** Blockchain developer MUST provide TypeScript SDK for proof generation  

### 4.4 Trait Verification Logic (Priority: High)

**FR-024:** System MUST allow patients to select specific traits for verification  
**FR-025:** System MUST display medical description of each trait in layman's terms  
**FR-026:** System MUST generate boolean proofs (mutation present/absent)  
**FR-027:** System MUST generate range proofs (risk score < threshold)  
**FR-028:** System MUST generate set membership proofs (variant in approved list)  
**FR-029:** System MUST prevent proof generation for traits not present in uploaded genome  
**FR-030:** System MUST validate proof inputs against known medical ranges  

### 4.5 Doctor Portal (Priority: High)

**FR-031:** System MUST provide separate `/doctor` route with distinct UI theme  
**FR-032:** System MUST authenticate doctors using wallet address + role verification  
**FR-033:** System MUST allow doctors to request specific trait verifications by patient address  
**FR-034:** System MUST show pending/approved/denied status for each request  
**FR-035:** System MUST display cryptographic proof with on-chain verification link  
**FR-036:** System MUST maintain request history with timestamps and outcomes  
**FR-037:** System MUST send real-time notifications to patients for new requests  

### 4.6 Researcher Portal (Priority: Medium)

**FR-038:** System MUST provide `/researcher` route with data visualization focus  
**FR-039:** System MUST compute aggregate statistics without accessing raw data  
**FR-040:** System MUST display mutation frequency charts using Recharts  
**FR-041:** System MUST enforce minimum cohort size of 5 to prevent identification  
**FR-042:** System MUST update statistics when new anonymous data is added  
**FR-043:** System MUST export aggregate data in CSV format  

### 4.7 User Interface Requirements (Priority: High)

**FR-044:** System MUST implement dark theme with purple/cyan gradient backgrounds  
**FR-045:** System MUST use glass morphism effects (backdrop-filter: blur(10px))  
**FR-046:** System MUST include particle.js or Three.js background animations  
**FR-047:** System MUST implement page transitions using Framer Motion  
**FR-048:** System MUST show skeleton loaders during data fetching  
**FR-049:** System MUST provide haptic-style micro-interactions on buttons  
**FR-050:** System MUST be responsive for viewport widths 768px to 1920px  
**FR-051:** System MUST achieve 60fps animation performance on mid-range hardware  

### 4.8 Smart Contract Requirements (Priority: Critical)

**FR-052:** System MUST deploy GenomicVerifier contract to Midnight testnet  
**FR-053:** System MUST implement access control with onlyAuthorized modifier  
**FR-054:** System MUST emit VerificationComplete event with proof hash  
**FR-055:** System MUST track verification count per patient address  
**FR-056:** System MUST store commitment hashes with timestamps  
**FR-057:** System MUST validate proof verification on-chain  
**FR-058:** System MUST implement circuit breaker for emergency pause  
**FR-059:** Contract MUST provide immutable audit trail for all verifications  

### 4.9 Backend API Requirements (Priority: Critical)

**FR-060:** System MUST expose RESTful API on port 3000  
**FR-061:** System MUST implement JWT authentication with refresh tokens  
**FR-062:** System MUST rate limit to 100 requests/minute per IP  
**FR-063:** System MUST validate all inputs against JSON schemas  
**FR-064:** System MUST log all operations with correlation IDs  
**FR-065:** System MUST implement health check endpoint  
**FR-066:** System MUST support CORS for frontend origin  
**FR-067:** Backend MUST integrate blockchain developer's proof generation SDK  

### 4.10 Data Storage Requirements (Priority: High)

**FR-068:** System MUST use PostgreSQL for audit trails and user data  
**FR-069:** System MUST use Redis for session management and proof caching  
**FR-070:** System MUST implement database migrations with version control  
**FR-071:** System MUST encrypt sensitive fields in database  
**FR-072:** System MUST implement soft deletes for audit compliance  
**FR-073:** System MUST backup database every 6 hours during hackathon  

---

## 5. Non-Goals (Out of Scope)

To maintain focus and deliver a polished MVP within 48 hours, the following are explicitly OUT of scope:

1. **Real Medical File Formats**: No FASTQ, VCF, or BAM file parsing - simplified JSON only
2. **Mobile Native Apps**: No iOS/Android apps - responsive web application only  
3. **Complex Multi-Signature**: No multi-party approval workflows
4. **Production Security**: No HSM integration or production-grade key management
5. **EHR Integration**: No HL7/FHIR or hospital system connections
6. **Payment Processing**: No insurance claims or payment handling
7. **Machine Learning**: No predictive models or risk calculations
8. **Cross-chain Bridges**: No Ethereum/Polygon/other chain integration
9. **Regulatory Compliance**: No formal HIPAA/GDPR certification
10. **Advanced Genomics**: No polygenic risk scores or complex trait analysis
11. **Raw Genome Processing**: No handling of actual DNA sequences or large genomic files
12. **Multiple Language Support**: English only for MVP

---

## 6. Design Considerations

### Visual Design System

#### Color Palette
```css
:root {
	--primary-dark: #1a1a2e;
	--primary-light: #6ee7b7;
	--glass-white: rgba(255,255,255,0.06);
	--glass-dark: rgba(3,7,18,0.6);
	--accent: linear-gradient(90deg,#8b5cf6,#06b6d4);
	--success: #10b981;
	--error: #f87171;
}
```

#### Typography
- **Headers**: Space Grotesk, 600 weight
- **Body**: Inter, 400 weight  
- **Data/Code**: JetBrains Mono
- **Sizes**: 14px base, 1.5rem scale

#### Component Library
```javascript
// Glass morphism card component
const GlassCard = styled.div`
	background: var(--glass-white);
	border-radius: 16px;
	backdrop-filter: blur(10px) saturate(120%);
	box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
`;
```

#### Animation Patterns
- Page transitions: 300ms ease-out
- Micro-interactions: 150ms ease
- Loading states: Infinite pulse at 2s intervals
- Proof generation: Progressive wave animation
- Success states: Confetti or particle burst

### User Flow Architecture

```mermaid
graph LR
		A[Landing] --> B{User Type}
		B --> C[Patient Dashboard]
		B --> D[Doctor Portal]
		B --> E[Researcher Portal]
		C --> F[Upload Genome]
		F --> G[Encrypt & Pin to IPFS]
		G --> H[Create On-chain Commitment]
		H --> I[Request Proof Generation]
		I --> J[Proof Generated]
		J --> K[Share Proof with Doctor/Researcher]
		K --> L[On-chain Verification]
		K --> M[Aggregate Data (Research)]
```

---

## 7. Technical Considerations

### Team Structure and Responsibilities

| Role | Developer | Primary Responsibilities | Key Deliverables |
|------|-----------|-------------------------|------------------|
| **Frontend Core (Patient)** | Dev 1 | Patient portal, wallet integration, upload UI | Dashboard, consent management, proof status display |
| **Frontend Secondary (Portals/UI)** | Dev 2 | Doctor/Researcher portals, animations, design system | Premium UI/UX, data viz, responsive design |
| **Backend & Infrastructure** | Dev 3 | API, database, proof queue, IPFS integration | REST endpoints, WebSocket server, worker queues |
| **Blockchain & ZK Circuits** | Dev 4 | Smart contracts, ZK proof circuits, SDK | Compact contracts, proof generation SDK, gas optimization |

### Architecture Decisions (Frontend/Backend Separation)

#### System Architecture
```
┌──────────────────────────────────────────────┐
│                   Frontend                   │
│         React + TypeScript + Vite            │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Patient  │ │  Doctor  │ │Researcher│   │
│  │  Portal  │ │  Portal  │ │  Portal  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│      Dev 1         Dev 2        Dev 2        │
└──────────────────────────────────────────────┘
											│
											▼
┌──────────────────────────────────────────────┐
│              Backend API                     │
│         Node.js + Express + TypeScript       │
│                  Dev 3                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   Auth   │ │  Proof   │ │   IPFS   │   │
│  │ Service  │ │  Queue   │ │ Service  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
				 │              │              │
┌──────────────────────────────────────────────┐
│           Midnight Blockchain                │
│            Compact Contracts                 │
│                  Dev 4                       │
└──────────────────────────────────────────────┘
```

### Proof Generation Architecture (CLARIFIED)

```typescript
// Clear ownership model for proof generation

// Dev 4 (Blockchain) provides:
export class ProofSDK {
	async generateBRCA1Proof(data: GeneticMarker): Promise<Proof> {/* Implementation omitted for brevity */}
}

// Dev 3 (Backend) integrates:
import { ProofSDK } from '@contracts/proof-sdk';

class ProofService {
	private sdk = new ProofSDK();
	// Worker queue integration and caching omitted for brevity
}

// Dev 1 (Frontend - Patient) consumes:
const { jobId } = await api.post('/proof/generate', { trait: 'BRCA1' });
// Show progress UI in patient dashboard
const proof = await api.get(`/proof/status/${jobId}`);

// Dev 2 (Frontend - Doctor/Researcher) consumes:
const verificationResult = await api.get(`/verify/${patientId}/${traitType}`);
// Display in doctor/researcher portal
```

#### Frontend Stack (Dev 1 - Patient Portal, Dev 2 - Doctor/Researcher Portals)
```json
{
	"framework": "React 18.2",
	"bundler": "Vite",
	"language": "TypeScript 5.x",
	"ui": ["TailwindCSS", "Framer Motion"],
	"dataViz": ["Recharts"],
	"3d": ["three", "@react-three/fiber"]
}
```

#### Backend Stack (Dev 3)
```json
{
	"runtime": "Node.js 20 LTS",
	"framework": "Express",
	"db": "PostgreSQL",
	"cache": "Redis",
	"worker": "bullmq",
	"websocket": "Socket.io 4.5"
}
```

#### Smart Contract Stack (Dev 4)
```json
{
	"language": "Compact 0.24.0+",
	"compiler": "compactc",
	"sdk": "TypeScript wrapper for frontend/backend integration"
}
```

### API Specification

#### Authentication Flow
```typescript
POST /api/auth/connect
Request: {
	walletAddress: string;
	signature: string;
	message: string;
}
Response: {
	accessToken: string;  // JWT, expires 1h
	refreshToken: string; // rotates
	userId: string;
}
```

#### Proof Generation Flow
```typescript
POST /api/proof/generate
Headers: { Authorization: "Bearer {token}" }
Request: {
	traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
	patientAddress: string;
	threshold?: number;
}
Response: {
	jobId: string;
	estimatedTime: number; // seconds
}

GET /api/proof/status/{jobId}
Response: {
	jobId: string;
	status: 'queued' | 'processing' | 'completed' | 'failed';
	progress: number; // 0..100
	proof?: string;
	error?: string;
}
```

### Database Schema

```sql
-- Core user table
CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	wallet_address VARCHAR(66) UNIQUE NOT NULL,
	role VARCHAR(20) DEFAULT 'patient',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genome commitments
CREATE TABLE genome_commitments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	patient_id UUID REFERENCES users(id),
	commitment_hash VARCHAR(66) NOT NULL,
	ipfs_cid VARCHAR(255) NOT NULL,
	encryption_metadata JSONB,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification requests
CREATE TABLE verification_requests (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	patient_id UUID REFERENCES users(id),
	doctor_id UUID REFERENCES users(id),
	requested_traits TEXT[] NOT NULL,
	status VARCHAR(20) DEFAULT 'pending',
	message TEXT,
	expires_at TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	responded_at TIMESTAMP
);

-- Audit trail
CREATE TABLE audit_log (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID,
	action VARCHAR(255),
	details JSONB,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_verification_patient ON verification_requests(patient_id);
CREATE INDEX idx_verification_doctor ON verification_requests(doctor_id);
CREATE INDEX idx_audit_user_time ON audit_log(user_id, created_at DESC);
```

### Security Implementation

#### Encryption Standards
```typescript
// Client-side encryption before IPFS
import { createCipheriv, randomBytes } from 'crypto';

function encryptGenome(data: string, password: string): EncryptedData {
	const salt = randomBytes(32);
	// Derive key and encrypt with AES-256-GCM; implementation omitted for brevity
	return {
		encrypted: '...hex...',
		iv: '...iv...'
	};
}
```

#### API Security Middleware
```typescript
// Rate limiting per endpoint
app.use('/api/proof/generate', rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: 'Too many proof requests'
}));

// Input validation
app.use('/api/*', validateInput({
	maxPayloadSize: '1mb',
	rejectUnknownFields: true
}));

// Security headers
app.use(helmet({
	contentSecurityPolicy: {/* content security policy omitted */}
}));
```

---

## 8. Success Metrics

### Hackathon Judging Criteria

#### Technology (25% weight)
- ✅ Real ZK proof generation using Midnight's Compact language
- ✅ Working IPFS integration with encryption
- ✅ Multiple proof types (boolean, range, membership)
- ✅ Clean separation of concerns in architecture
- **Target Score: 23/25**

#### Originality (20% weight)
- ✅ Novel application of ZK to genomic privacy
- ✅ Creative visualization of privacy-preserving operations
- ✅ Unique consent management mechanism
- **Target Score: 18/20**

#### Execution (20% weight)
- ✅ Premium UI with smooth animations
- ✅ Complete user journeys without errors
- ✅ Professional error handling
- **Target Score: 19/20**

#### Completion (15% weight)
- ✅ All core features functional
- ✅ Three complete user personas
- ✅ End-to-end demo ready
- **Target Score: 14/15**

#### Documentation (10% weight)
- ✅ Comprehensive README
- ✅ API documentation
- ✅ Code comments
- ✅ Architecture diagrams
- **Target Score: 10/10**

#### Business Value (10% weight)
- ✅ Clear healthcare market need
- ✅ Scalable architecture
- ✅ Path to production
- **Target Score: 9/10**

**Total Target: 93/100**

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Proof Generation Time | <10s simple, <30s complex | Timer in UI |
| Concurrent Users | 10+ simultaneous | Load testing |
| API Response Time | <200ms cached, <2s computed | Network tab |
| UI Frame Rate | 60fps animations | Performance monitor |
| Zero Knowledge | No genomic data in logs | Security audit |
| Uptime During Demo | 100% | Monitoring |

---

## 9. Edge Cases & Error Handling

### Critical Path Protection

The demo flow MUST work flawlessly. All error handling focuses on this path:

```typescript
// Demo flow with comprehensive error handling
class DemoFlowProtection {
	private readonly criticalPath = [
		'upload', 'encrypt', 'pin', 'commit', 'generateProof', 'verify'
	];
	// Implementation omitted for brevity
}
```

### Network & Wallet Failures

#### Wallet Connection Issues
```typescript
enum WalletError {
	NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
	CONNECT_FAILED = 'WALLET_CONNECT_FAILED',
	TIMEOUT = 'WALLET_TIMEOUT',
	INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
}

const walletErrorHandlers: Record<WalletError, () => void> = {
	[WalletError.NOT_INSTALLED]: () => { /* show install instructions */ },
	[WalletError.CONNECT_FAILED]: () => { /* show retry modal */ },
	[WalletError.TIMEOUT]: () => { /* fallback to polling */ },
	[WalletError.INSUFFICIENT_FUNDS]: () => { /* show funding instructions */ }
};
```

#### IPFS Failures

```typescript
class IPFSService {
	async upload(data: Buffer): Promise<string> {
		// Retry strategy with exponential backoff
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				const cid = await this.client.add(data);
				return cid.toString();
			} catch (err) {
				if (attempt === 3) throw err;
				await sleep(attempt * 500);
			}
		}
		throw new Error('IPFS upload failed');
	}
}
```

---

## 10. Implementation Priority & Timeline

### 48-hour hackathon plan (high level)

Day 0: Project kickoff (1 hour)
- Finalize PRD & assign roles
- Prepare demo data and accounts

Day 1 (12 hours): Core implementation
- Frontend: patient upload, wallet auth, proof request flow
- Backend: proof queue, IPFS client, DB schema
- Contracts: BRCA boolean circuit

Day 1 (evening): Integration and polish
- Wire frontend to backend
- Implement skeleton loaders and transitions
- Basic unit tests for critical paths

Day 2 (12 hours): Demo polish
- Researcher portal with aggregate charts
- Export CSV and demo scripts
- Performance tuning and retries

Final 6 hours: End-to-end testing and deployment
- Deploy contracts to Midnight testnet
- Run demo script and record walkthrough

---

## 11. Open Questions

1. What exact variant encodings will labs provide? (VCF subset or custom JSON?)
2. Will we accept multiple proof formats (Groth16, PLONK) or standardize on Compact?
3. Which wallets will be used for demo participants (Lace, MetaMask, others)?
4. Do we need formal IRB approval for research demo participants?
5. What datasets are allowed for demo (synthetic vs. real)?

---

## 12. Development Resources

### Useful Links
- Midnight docs: https://docs.midnight.network
- Compact language reference: /compact docs/
- IPFS docs: https://docs.ipfs.tech
- Zod validation: https://zod.dev

### Demo Data

Provide small JSON files with variant markers for:
- BRCA1 (positive/negative)
- BRCA2 (positive/negative)
- CYP2D6 metabolizer statuses

---

## 13. Risk Mitigation

1. Proof Generation Slowness: Use worker queues and cache proofs in Redis to avoid blocking the frontend
2. IPFS Unavailability: Pin to multiple gateways and provide offline fallback data in demo
3. Wallet Issues: Provide recorded wallet interactions and a fallback 'demo account' login
4. Regulatory Concerns: Use synthetic/demo data and clearly label in the demo

---

## 14. Development Setup Instructions

1. Install compact compiler and add to PATH
```bash
export PATH="$PWD/compactc_v0.25.0_aarch64-darwin:$PATH"
compactc --version
```

2. Install Node.js dependencies
```bash
npm install
```

3. Frontend: run dev server
```bash
cd frontend
npm run dev
```

4. Backend: run server
```bash
cd backend
npm run dev
```

5. Contracts: compile and test
```bash
cd contracts
npm run build
npm test
```

---

## 15. Appendices

### Appendix A: Simplified Genomic JSON Schema

```json
{
	"patientId": "uuid",
	"markers": {
		"BRCA1_185delAG": true,
		"BRCA1_5266dupC": false,
		"CYP2D6": {
			"activityScore": 1.5,
			"metabolizer": "normal"
		}
	},
	"traits": {
		"BRCA1": {"mutation_present": true, "confidence": 0.98},
		"BRCA2": {"mutation_present": false, "confidence": 0.99}
	}
}
```

### Appendix B: Contract Interface (compact)

```compact
contract GenomicVerifier {
	public function verify_brca1_mutation(commitment: Hash, mutation_present: Bool) -> Bool {
		// Implementation omitted for brevity
	}
}
```

### Appendix C: Demo Checklist

1. Create demo patient accounts and fund with tDUST
2. Upload demo genomic JSON files
3. Generate proofs for BRCA1/BRCA2/CYP2D6
4. Doctor requests and verifies proofs
5. Researcher runs aggregate queries and exports CSV

**Next Review:** Post-Hackathon Retrospective

---

## 1. Introduction/Overview

The Genomic Privacy DApp is a healthcare application built on the Midnight blockchain that enables patients to prove specific genetic traits without revealing their complete genomic sequence. Using zero-knowledge proofs and selective disclosure, the platform allows patients to maintain ownership and privacy of their genetic data while participating in precision medicine, clinical trials, and research.

... (full PRD available earlier in repo attachments)
# Product Requirements Document: Genomic Privacy DApp on Midnight

**Version:** 3.0.0 (Merged)
**Date:** October 2024
**Hackathon:** MLH Midnight Hackathon
**Team Size:** 4 Developers
**Timeline:** 48 Hours

## Table of Contents

1. [Introduction/Overview](#1-introductionoverview)
2. [Goals]
3. [User Stories]
4. [Functional Requirements]
5. [Non-Goals (Out of Scope)]
6. [Design Considerations]
7. [Technical Considerations]
8. [Success Metrics]
9. [Edge Cases & Error Handling]
10. [Implementation Priority & Timeline]
11. [Open Questions]
12. [Development Resources]
13. [Risk Mitigation]
14. [Development Setup Instructions]
15. [Appendices]

---

## 1. Introduction/Overview

The Genomic Privacy DApp is a healthcare application built on the Midnight blockchain that enables patients to prove specific genetic traits without revealing their complete genomic sequence. Using zero-knowledge proofs and selective disclosure, the platform allows patients to maintain ownership and privacy of their genetic data while participating in precision medicine, clinical trials, and research.

... (full PRD available earlier in repo attachments)
