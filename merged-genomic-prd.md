# Product Requirements Document: Genomic Privacy DApp on Midnight

**Version:** 3.0.0 (Merged)  
**Date:** October 2024  
**Hackathon:** MLH Midnight Hackathon  
**Team Size:** 4 Developers  
**Timeline:** 48 Hours  

## Table of Contents

1. [Introduction/Overview](#1-introductionoverview)
2. [Goals](#2-goals)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Goals (Out of Scope)](#5-non-goals-out-of-scope)
6. [Design Considerations](#6-design-considerations)
7. [Technical Considerations](#7-technical-considerations)
8. [Success Metrics](#8-success-metrics)
9. [Edge Cases & Error Handling](#9-edge-cases--error-handling)
10. [Implementation Priority & Timeline](#10-implementation-priority--timeline-4-person-team)
11. [Open Questions](#11-open-questions)
12. [Development Resources](#12-development-resources)
13. [Risk Mitigation](#13-risk-mitigation)
14. [Development Setup Instructions](#14-development-setup-instructions)
15. [Appendices](#appendices)

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
   - Verify pharmacogenomic markers (CYP2D6) for drug compatibility
   - Demonstrate range proofs for genetic risk scores

2. **Implement Real Zero-Knowledge Proofs**
   - Deploy actual Compact circuits on Midnight testnet
   - Generate verifiable proofs using Halo2 framework
   - Validate proofs both client-side and on-chain

3. **Create Professional User Experience**
   - Premium animated interface with glass morphism design
   - Three distinct user portals (Patient, Doctor, Researcher)
   - Real-time updates via WebSocket connections

4. **Demonstrate Blockchain Value**
   - Immutable audit trail for medical-legal compliance
   - Public verifiability without data exposure
   - Trustless multi-party coordination
   - Automated consent enforcement via smart contracts

5. **Achieve Production-Ready Architecture**
   - Separated frontend/backend with clean API
   - Scalable proof generation queue system
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
  --primary-purple: #6c63ff;
  --accent-cyan: #00d9ff;
  --accent-magenta: #ff00ff;
  --glass-white: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: #b8b8d1;
  --success: #4ade80;
  --warning: #fbbf24;
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
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
    F --> G[Generate Proofs]
    G --> H[Manage Consents]
    
    D --> I[Request Verification]
    I --> J[View Results]
    
    E --> K[View Aggregates]
    K --> L[Export Data]
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
                      │ HTTPS/WSS
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
         ▼              ▼              ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │PostgreSQL│ │  Redis   │ │   IPFS   │
   └──────────┘ └──────────┘ └──────────┘
         │
         ▼
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
  async generateBRCA1Proof(data: GeneticMarker): Promise<Proof> {
    // Actual ZK circuit execution
    const circuit = await loadCircuit('BRCA1');
    return circuit.prove(data);
  }
}

// Dev 3 (Backend) integrates:
import { ProofSDK } from '@contracts/proof-sdk';

class ProofService {
  private sdk = new ProofSDK();
  
  async queueProofGeneration(request: ProofRequest) {
    // Add to Bull queue
    const job = await this.queue.add('generate', request);
    return job.id;
  }
  
  async processProof(job: Job) {
    // Call Dev 4's SDK
    const proof = await this.sdk.generateBRCA1Proof(job.data);
    // Cache in Redis
    await this.cache.set(job.id, proof);
    return proof;
  }
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
  "language": "TypeScript 5.2",
  "build": "Vite 4.4",
  "styling": "TailwindCSS 3.3 + Framer Motion 10",
  "state": "Zustand 4.4",
  "api": "Axios + React Query 5",
  "wallet": "Lace Wallet SDK",
  "charts": "Recharts 2.8 (Dev 2)",
  "3d": "Three.js r158 (Dev 2)",
  "responsibilities": {
    "dev1": "Patient portal, wallet, upload, consent",
    "dev2": "Doctor portal, researcher portal, animations, charts"
  }
}
```

#### Backend Stack (Dev 3)
```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Express 4.18",
  "language": "TypeScript 5.2",
  "database": "PostgreSQL 15 + Redis 7",
  "queue": "Bull 4.11",
  "blockchain": "Midnight.js SDK 2.0",
  "storage": "IPFS HTTP Client 60",
  "auth": "JWT + Passport",
  "websocket": "Socket.io 4.5"
}
```

#### Smart Contract Stack (Dev 4)
```json
{
  "language": "Compact 0.24.0+",
  "framework": "Midnight Halo2",
  "testing": "Midnight Test Suite",
  "deployment": "Hardhat-style Scripts",
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
  refreshToken: string; // JWT, expires 24h
  userId: string;
}
```

#### Proof Generation Flow
```typescript
POST /api/proof/generate
Headers: { Authorization: "Bearer {token}" }
Request: {
  traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  genomeHash: string;
  threshold?: number;
}
Response: {
  jobId: string;
  status: 'queued';
  estimatedTime: number; // seconds
}

GET /api/proof/status/{jobId}
Response: {
  jobId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number; // 0-100
  proof?: string;   // Base64 encoded
  error?: string;
}
```

### Database Schema

```sql
-- Core user table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genome commitments
CREATE TABLE genome_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  commitment_hash VARCHAR(66) NOT NULL,
  ipfs_cid VARCHAR(46),
  encrypted_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification requests
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  trait_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  proof_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);

-- Audit trail
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address INET,
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
  const key = pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}
```

#### API Security Middleware
```typescript
// Rate limiting per endpoint
app.use('/api/proof/generate', rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many proof requests'
}));

// Input validation
app.use('/api/*', validateInput({
  maxPayloadSize: '1mb',
  sanitizeStrings: true,
  rejectUnknownFields: true
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss://localhost:3000", "https://ipfs.infura.io"]
    }
  }
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
    'connectWallet',
    'uploadGenome', 
    'generateProof',
    'doctorRequest',
    'patientApprove',
    'viewResult'
  ];
  
  async executeStep(step: string, fn: Function) {
    if (!this.criticalPath.includes(step)) {
      return fn(); // Non-critical: basic error handling
    }
    
    // Critical path: comprehensive protection
    const maxRetries = 3;
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        this.logSuccess(step);
        return result;
      } catch (error) {
        lastError = error;
        await this.attemptRecovery(step, error, i);
      }
    }
    
    // Final fallback
    return this.useFallbackData(step, lastError);
  }
}
```

### Network & Wallet Failures

#### Wallet Connection Issues
```typescript
enum WalletError {
  NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
}

const walletErrorHandlers: Record<WalletError, () => void> = {
  [WalletError.NOT_INSTALLED]: () => {
    showModal({
      title: 'Lace Wallet Required',
      content: <WalletInstallGuide />,
      actions: [
        { label: 'Download Lace', onClick: () => window.open(LACE_URL) },
        { label: 'Use Demo Mode', onClick: () => enableDemoMode() }
      ]
    });
  },
  [WalletError.WRONG_NETWORK]: async () => {
    const switched = await requestNetworkSwitch('midnight-testnet');
    if (!switched) {
      showToast('Please switch to Midnight Testnet manually');
    }
  },
  [WalletError.INSUFFICIENT_FUNDS]: () => {
    showModal({
      title: 'Insufficient tDUST',
      content: `You need at least 10 tDUST. Current balance: ${balance}`,
      actions: [
        { label: 'Get from Faucet', onClick: () => window.open(FAUCET_URL) }
      ]
    });
  }
};
```

#### IPFS Failures
```typescript
class IPFSService {
  private readonly gateways = [
    'https://ipfs.infura.io:5001',
    'https://api.pinata.cloud',
    'https://ipfs.io'
  ];
  
  async upload(data: Buffer): Promise<string> {
    const errors: Error[] = [];
    
    // Try each gateway
    for (const gateway of this.gateways) {
      try {
        const cid = await this.uploadToGateway(gateway, data);
        return cid;
      } catch (error) {
        errors.push(error);
        continue;
      }
    }
    
    // All gateways failed - use local storage
    console.warn('All IPFS gateways failed, using local storage');
    return this.storeLocally(data);
  }
  
  private async storeLocally(data: Buffer): Promise<string> {
    const hash = createHash('sha256').update(data).digest('hex');
    const cid = `Qm${hash.substring(0, 44)}`; // Mock CID
    localStorage.setItem(cid, data.toString('base64'));
    return cid;
  }
}
```

#### Proof Generation Timeouts
```typescript
class ProofGenerator {
  private readonly TIMEOUT_MS = 30000;
  private readonly WARNING_MS = 15000;
  
  async generateProof(data: any): Promise<Proof> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
    
    const warning = setTimeout(() => {
      showToast({
        title: 'Proof generation taking longer than usual...',
        description: 'Complex proofs may take up to 30 seconds',
        status: 'warning'
      });
    }, this.WARNING_MS);
    
    try {
      const proof = await this.generate(data, { signal: controller.signal });
      clearTimeout(warning);
      clearTimeout(timeout);
      return proof;
    } catch (error) {
      if (error.name === 'AbortError') {
        const shouldContinue = await showConfirm({
          title: 'Proof Generation Timeout',
          message: 'Continue in background or cancel?',
          options: ['Continue', 'Cancel']
        });
        
        if (shouldContinue) {
          return this.generateInBackground(data);
        }
      }
      throw error;
    }
  }
}
```

---

## 10. Implementation Priority & Timeline (4-Person Team)

### Pre-Hackathon Preparation (T-24 hours)
- [ ] All team members install dependencies
- [ ] Set up development environments
- [ ] Create GitHub repository with branch protection
- [ ] Initialize monorepo structure
- [ ] Test Lace wallet on testnet
- [ ] Obtain tDUST from faucet

### Phase 1: Foundation (Hours 0-8)

| Time | Dev 1 (Frontend Core) | Dev 2 (Frontend UI) | Dev 3 (Backend) | Dev 4 (Blockchain) |
|------|----------------------|---------------------|-----------------|-------------------|
| 0-2h | React setup with TypeScript | Design system setup | Express API scaffold | Midnight env setup |
| 2-4h | Routing structure | Tailwind + Framer | Database schema | First contract compile |
| 4-6h | Wallet connection | Glass morphism components | Auth endpoints | BRCA1 circuit |
| 6-8h | State management | Animation library | IPFS integration | Deploy to testnet |

**Checkpoint:** Basic infrastructure working, wallet connects, contract deployed

### Phase 2: Core Features (Hours 8-16)

| Time | Dev 1 (Frontend Core) | Dev 2 (Frontend UI) | Dev 3 (Backend) | Dev 4 (Blockchain) |
|------|----------------------|---------------------|-----------------|-------------------|
| 8-10h | Patient dashboard | Doctor portal layout | Proof queue setup | BRCA2 circuit |
| 10-12h | File upload UI | Researcher portal | WebSocket server | CYP2D6 circuit |
| 12-14h | Proof generation UI | Shared components | Contract integration | Gas optimization |
| 14-16h | Results display | Loading states | Caching layer | Event listeners |

**Checkpoint:** Proof generation working end-to-end

### Phase 3: Integration (Hours 16-24)

| Time | Dev 1 (Frontend Core) | Dev 2 (Frontend UI) | Dev 3 (Backend) | Dev 4 (Blockchain) |
|------|----------------------|---------------------|-----------------|-------------------|
| 16-18h | API integration | Real-time updates | Proof generation worker | Circuit testing |
| 18-20h | Error handling | Animations polish | Queue processing | Access control |
| 20-22h | Consent management | Chart components | Aggregation logic | Mock remaining traits |
| 22-24h | Testing patient flow | Testing doctor flow | Load testing | Final deployment |

**Checkpoint:** All user flows functional

### Phase 4: Polish (Hours 24-32)

| Time | Dev 1 (Frontend Core) | Dev 2 (Frontend UI) | Dev 3 (Backend) | Dev 4 (Blockchain) |
|------|----------------------|---------------------|-----------------|-------------------|
| 24-26h | Performance optimization | Premium animations | Security hardening | Documentation |
| 26-28h | Edge case handling | Micro-interactions | Rate limiting | Gas optimization |
| 28-30h | Accessibility | Responsive design | Monitoring setup | Contract verification |
| 30-32h | Cross-browser testing | Final UI polish | API documentation | Architecture diagram |

**Checkpoint:** Production-quality polish

### Phase 5: Demo Preparation (Hours 32-40)

| Time | Dev 1 (Frontend Core) | Dev 2 (Frontend UI) | Dev 3 (Backend) | Dev 4 (Blockchain) |
|------|----------------------|---------------------|-----------------|-------------------|
| 32-34h | Demo data setup | Screen recording | Production deploy | README writing |
| 34-36h | Flow optimization | Demo script | Database seeding | Code comments |
| 36-38h | Backup recordings | UI bug fixes | Load testing | Security audit |
| 38-40h | Final testing | Polish animations | Performance tuning | Documentation |

**Checkpoint:** Demo-ready with backups

### Phase 6: Final Push (Hours 40-48)

| Time | All Team |
|------|----------|
| 40-42h | Full integration testing |
| 42-44h | Demo rehearsal |
| 44-46h | Bug fixes and final polish |
| 46-48h | Submission and documentation |

**Final Checkpoint:** Submitted and ready for judging

---

## 11. Open Questions

### Technical Questions (Need immediate answers)

1. **Midnight Testnet Stability**: What's the current block time and reliability?
   - *Impact*: Affects timeout settings and retry logic
   - *Decision needed by*: Hour 4

2. **Proof Generation Performance**: What's realistic for complex circuits?
   - *Impact*: UX design for loading states
   - *Decision needed by*: Hour 8

3. **IPFS Gateway Selection**: Infura vs Pinata for hackathon?
   - *Impact*: Configuration and API keys
   - *Decision needed by*: Hour 6

### Product Questions (Can decide during development)

4. **Demo Account Strategy**: Pre-seeded or live generation?
   - *Impact*: Demo reliability vs authenticity
   - *Decision by*: Hour 20

5. **Trait Complexity**: How medically accurate should descriptions be?
   - *Impact*: Development time vs realism
   - *Decision by*: Hour 16

---

## 12. Development Resources

### Essential Documentation
- [Midnight Developer Docs](https://docs.midnight.network) - PRIMARY REFERENCE
- [Compact Language Guide](https://docs.midnight.network/develop/tutorial)
- [Midnight.js SDK](https://github.com/midnight-network/midnight-js)
- [Create Midnight App](https://github.com/kaleababayneh/create-midnight-app)

### Quick Start Commands
```bash
# Create new Midnight project
npx create-midnight-app@latest genomic-privacy

# Install Compact compiler
npm install -g @midnight-ntwrk/compact-compiler

# Get testnet tokens
curl -X POST https://faucet.midnight.network/testnet \
  -H "Content-Type: application/json" \
  -d '{"address": "YOUR_WALLET_ADDRESS"}'
```

### Support Channels
- **Discord**: Midnight Network (developer-support)
- **GitHub Issues**: For SDK bugs
- **Telegram**: @MidnightDevs for quick questions

---

## 13. Risk Mitigation

### Technical Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| ZK proof generation too slow | Medium | High | Pre-generate common proofs, use simpler circuits |
| Testnet congestion | Low | High | Local testnet backup, cached demo data |
| IPFS gateway failure | Medium | Medium | Multiple gateways, local storage fallback |
| Wallet connection issues | Low | High | Demo mode with pre-funded accounts |
| Complex bugs in circuits | High | High | Focus on 2 traits perfectly, mock others |

### Demo Day Risks

| Risk | Mitigation |
|------|------------|
| Live demo failure | Pre-recorded video backup of all features |
| Network issues | Offline mode with cached data |
| Judge's machine compatibility | Deploy to public URL, test on multiple browsers |
| Time overrun in presentation | Practice with timer, have short version ready |

---

## 14. Development Setup Instructions

### Repository Structure
```
genomic-privacy-dapp/
├── .github/
│   └── workflows/         # CI/CD pipelines
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API clients
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand stores
│   │   └── utils/        # Helper functions
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Node.js API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── workers/      # Queue processors
│   │   ├── middleware/   # Express middleware
│   │   └── db/          # Database queries
│   ├── migrations/       # Database migrations
│   └── package.json
├── contracts/            # Midnight smart contracts
│   ├── src/             # Compact source files
│   ├── circuits/        # ZK circuits
│   ├── tests/           # Contract tests
│   ├── scripts/         # Deployment scripts
│   └── package.json
├── shared/              # Shared types and constants
│   ├── types/          # TypeScript interfaces
│   └── constants/      # Shared constants
├── docs/               # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEMO_SCRIPT.md
├── docker-compose.yml   # Local development services
├── .env.example        # Environment variables template
└── README.md           # Project documentation
```

### Initial Setup (All Developers)

```bash
# Clone repository
git clone https://github.com/team/genomic-privacy-dapp
cd genomic-privacy-dapp

# Install dependencies
npm install # Root dependencies
npm run install:all # All workspace dependencies

# Copy environment files
cp .env.example .env
# Edit .env with your values

# Start infrastructure
docker-compose up -d

# Verify setup
npm run verify:setup
```

### Environment Variables

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_MIDNIGHT_NETWORK=testnet
VITE_IPFS_GATEWAY=https://ipfs.infura.io
VITE_DEMO_MODE=false

# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://genomic:password@localhost:5432/genomic_privacy
REDIS_URL=redis://localhost:6379
MIDNIGHT_RPC_URL=https://testnet.midnight.network/rpc
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_secret
JWT_SECRET=generate-256-bit-secret-here
CORS_ORIGIN=http://localhost:5173

# Contracts (.env)
MIDNIGHT_NETWORK=testnet
DEPLOYER_PRIVATE_KEY=your-testnet-private-key
MIDNIGHT_RPC_URL=https://testnet.midnight.network/rpc
```

### Development Workflow

```bash
# Start all services (separate terminals)
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3000
npm run dev:contracts # Watches and compiles

# Run tests
npm run test:frontend
npm run test:backend
npm run test:contracts
npm run test:e2e

# Build for production
npm run build:all
```

---

## Appendices

### Appendix A: Genomic Data Format

```typescript
interface GenomicData {
  patientId: string;         // Wallet address
  sequenceDate: string;      // ISO 8601
  genome: {
    BRCA1: GeneticMarker;
    BRCA2: GeneticMarker;
    CYP2D6: PharmacogenomicMarker;
    // Additional markers for UI display only
    APOE?: GeneticMarker;
    HER2?: GeneticMarker;
  };
  metadata: {
    version: string;         // Format version
    laboratory?: string;     // Optional lab name
    qualityScore?: number;   // 0-100
  };
}

interface GeneticMarker {
  status: 'wild_type' | 'heterozygous' | 'homozygous' | 'mutation_detected';
  variants: string[];        // e.g., ["c.5946delT", "c.68_69delAG"]
  riskScore: number;         // 0.0 to 1.0
  confidence: number;        // 0.0 to 1.0
}

interface PharmacogenomicMarker extends GeneticMarker {
  phenotype: 'poor_metabolizer' | 'intermediate_metabolizer' | 
             'normal_metabolizer' | 'rapid_metabolizer' | 'ultrarapid_metabolizer';
  diplotype: string;         // e.g., "*1/*17"
  activityScore: number;     // 0.0 to 3.0
}
```

### Appendix B: Compact Contract Interface

```compact
include "std";

// Main verification contract
contract GenomicVerifier {
  // Public state
  ledger {
    verificationCount: Counter;
    authorizedVerifiers: Map<Address, Boolean>;
    commitments: Map<Address, Bytes32>;
    verificationEvents: List<VerificationEvent>;
  }
  
  // Private state (off-chain)
  private {
    patientGenomes: Map<Address, EncryptedGenome>;
    accessGrants: Map<(Address, Address), AccessGrant>;
  }
  
  // Main verification circuit
  export circuit verifyGeneticTrait(
    witness genome: GenomicData,
    witness patientKey: PrivateKey,
    public traitType: Field,
    public threshold: Field,
    public verifierAddress: Address
  ): VerificationResult {
    // Verify patient owns the genome
    assert(validateOwnership(genome, patientKey));
    
    // Check verifier authorization
    assert(ledger.authorizedVerifiers.get(verifierAddress));
    
    // Extract trait value based on type
    let traitValue = extractTrait(genome, traitType);
    
    // Generate proof based on trait type
    let proof = match traitType {
      TRAIT_BRCA1 => proveBRCA1(traitValue, threshold),
      TRAIT_BRCA2 => proveBRCA2(traitValue, threshold),
      TRAIT_CYP2D6 => proveCYP2D6(traitValue, threshold),
      _ => error("Unknown trait type")
    };
    
    // Record verification
    ledger.verificationCount.increment();
    ledger.verificationEvents.push(VerificationEvent {
      patient: getAddress(patientKey),
      verifier: verifierAddress,
      traitType: traitType,
      timestamp: getCurrentTime(),
      proofHash: hash(proof)
    });
    
    return VerificationResult {
      verified: proof.isValid,
      proofHash: hash(proof),
      timestamp: getCurrentTime()
    };
  }
  
  // Grant access to specific traits
  export circuit grantAccess(
    witness patientKey: PrivateKey,
    public doctorAddress: Address,
    public traitTypes: List<Field>,
    public expiryTime: Timestamp
  ): Boolean {
    let patientAddress = getAddress(patientKey);
    
    // Store access grant privately
    private.accessGrants.set(
      (patientAddress, doctorAddress),
      AccessGrant {
        traits: traitTypes,
        expiry: expiryTime,
        granted: getCurrentTime()
      }
    );
    
    return true;
  }
  
  // Aggregate anonymous data
  export circuit aggregatePopulationData(
    witness genomes: List<GenomicData>,
    public queryType: Field,
    public minCohortSize: Field
  ): AggregateResult {
    // Ensure minimum cohort size for privacy
    assert(genomes.length >= minCohortSize);
    
    // Compute statistics without revealing individuals
    let stats = computeStatistics(genomes, queryType);
    
    return AggregateResult {
      count: genomes.length,
      meanRiskScore: stats.mean,
      medianRiskScore: stats.median,
      variantFrequency: stats.frequency,
      timestamp: getCurrentTime()
    };
  }
}

// Helper types
struct VerificationResult {
  verified: Boolean;
  proofHash: Bytes32;
  timestamp: Timestamp;
}

struct VerificationEvent {
  patient: Address;
  verifier: Address;
  traitType: Field;
  timestamp: Timestamp;
  proofHash: Bytes32;
}

struct AccessGrant {
  traits: List<Field>;
  expiry: Timestamp;
  granted: Timestamp;
}

// Constants for trait types
const TRAIT_BRCA1: Field = 1;
const TRAIT_BRCA2: Field = 2;
const TRAIT_CYP2D6: Field = 3;
```

### Appendix C: API Response Schemas

```typescript
// Base response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: {
    timestamp: number;
    requestId: string;
    version: string;
  };
}

interface ApiError {
  code: string;           // e.g., "PROOF_GENERATION_FAILED"
  message: string;        // User-friendly message
  details?: any;          // Technical details for debugging
  retryable: boolean;     // Whether client should retry
  retryAfter?: number;    // Seconds to wait before retry
}

// Proof endpoints
interface ProofGenerationRequest {
  traitType: 'BRCA1' | 'BRCA2' | 'CYP2D6';
  genomeCommitment: string;
  threshold?: number;
  parameters?: {
    optimizationLevel?: 'fast' | 'balanced' | 'thorough';
    circuitVersion?: string;
  };
}

interface ProofGenerationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  queuePosition?: number;
  estimatedTime?: number;  // Seconds
  progress?: number;        // 0-100
}

interface ProofResult {
  proof: string;           // Base64 encoded
  publicInputs: string[];
  verificationKey: string;
  metadata: {
    generationTime: number; // Milliseconds
    circuitId: string;
    gasEstimate: number;
  };
}

// Verification endpoints  
interface VerificationRequest {
  patientAddress: string;
  traitType: string;
  requirements?: {
    minRiskScore?: number;
    maxRiskScore?: number;
    requiredVariants?: string[];
    excludedVariants?: string[];
  };
}

interface VerificationResponse {
  requestId: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  proof?: ProofResult;
  attestation?: {
    doctorAddress: string;
    timestamp: number;
    signature: string;
  };
}

// WebSocket events
interface WebSocketEvent {
  type: 'proof:progress' | 'proof:complete' | 'verification:requested' | 
        'verification:approved' | 'error';
  payload: any;
  timestamp: number;
}
```

### Appendix D: Demo Scenarios

#### Scenario 1: Insurance Risk Assessment
1. Patient Sarah connects wallet
2. Uploads her genomic data (pre-prepared JSON)
3. Insurance company requests BRCA1/BRCA2 status
4. Sarah approves the request
5. System generates ZK proof showing "no pathogenic mutations"
6. Insurance company receives proof without seeing genome
7. Sarah receives better premium rate

#### Scenario 2: Precision Medicine Treatment
1. Dr. Johnson treating Patient Mike for depression
2. Requests CYP2D6 metabolizer status
3. Mike approves from his phone
4. Proof shows "poor metabolizer" status
5. Doctor adjusts medication accordingly
6. Audit trail shows access with timestamp

#### Scenario 3: Anonymous Research Contribution
1. Researcher views population statistics dashboard
2. 127 anonymous participants contributed BRCA data
3. Aggregate shows 2.3% pathogenic variant frequency
4. Researcher can't identify any individual
5. Downloads aggregate data for publication

---

## Final Checklist

### Before Hour 0
- [ ] All developers have Midnight testnet access
- [ ] Lace wallets installed and funded with tDUST
- [ ] Development environments configured
- [ ] Repository created with branch protection
- [ ] Discord/Slack channel for coordination

### Before Hour 24
- [ ] Core smart contracts deployed
- [ ] Proof generation working end-to-end
- [ ] All three portals accessible
- [ ] IPFS integration functional
- [ ] Basic error handling in place

### Before Hour 40
- [ ] All features code complete
- [ ] Demo flow tested 5+ times
- [ ] Video backup recorded
- [ ] Documentation complete
- [ ] Production deployment successful

### Before Submission
- [ ] README with setup instructions
- [ ] Architecture diagram included
- [ ] Demo credentials provided
- [ ] Video demo linked
- [ ] All code committed and pushed
- [ ] Submission form completed

---

*This PRD is designed for execution by a 4-person development team within 48 hours for the MLH Midnight Hackathon. Each requirement has been validated for technical feasibility and clearly specified for implementation by developers of varying experience levels.*

**Document Status:** FINAL MERGED  
**Last Updated:** October 2024  
**Next Review:** Post-Hackathon Retrospective