# Comprehensive Test Suite for Genomic Privacy DApp
## Phase 1-3 Implementation Testing

This test suite validates all functional requirements (FR-001 to FR-073) implemented through Phase 3.

---

## Test Environment Setup

### Prerequisites
- Node.js 20 LTS installed
- Docker running with PostgreSQL and Redis containers
- Midnight testnet access via Lace wallet
- Test tDUST tokens (100+) in wallet
- Frontend running on http://localhost:5173
- Backend running on http://localhost:3000

### Test Data
- Demo accounts seeded (Sarah, Dr. Johnson, Researcher)
- 127 BRCA records pre-populated
- Mock genomic JSON files in `/demo/data/`

---

## Phase 1: Foundation Tests (Hours 0-8)

### 1.1 Authentication System Tests (FR-001 to FR-006)

#### TEST-AUTH-001: Wallet Connection
**Objective:** Verify Lace wallet integration
**Steps:**
1. Open http://localhost:5173
2. Click "Connect Wallet" button
3. Approve connection in Lace extension
4. Verify wallet address displays
5. Check tDUST balance shown

**Expected Result:**
- Wallet connects successfully
- Address format: `addr_test1...` (66 chars)
- Balance displays with 6 decimal places
- JWT token stored in localStorage

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-AUTH-002: Session Persistence
**Objective:** Verify JWT tokens maintain session
**Steps:**
1. Connect wallet and authenticate
2. Note access token in DevTools > Application > Local Storage
3. Refresh page
4. Verify still authenticated
5. Wait 1 hour, verify token refresh

**Expected Result:**
- Session persists across refresh
- Token auto-refreshes before expiry
- User remains logged in for 24 hours

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-AUTH-003: Wallet Disconnection
**Objective:** Test graceful disconnection
**Steps:**
1. While authenticated, click "Disconnect"
2. Verify logout confirmation modal
3. Confirm logout
4. Check localStorage cleared
5. Verify redirected to landing page

**Expected Result:**
- Clean logout process
- All sensitive data cleared
- No errors in console

**Status:** [ ] PASS [ ] FAIL

---

### 1.2 Database & Infrastructure Tests (FR-068 to FR-073)

#### TEST-DB-001: PostgreSQL Health Check
**Command:** `curl http://localhost:3000/health`
**Expected Response:**
```json
{
  "status": "healthy",
  "uptime": 12345,
  "database": "connected",
  "redis": "connected"
}
```
**Status:** [ ] PASS [ ] FAIL

---

#### TEST-DB-002: Data Encryption
**Objective:** Verify sensitive data encrypted
**Steps:**
1. Upload genomic data
2. Query database: `SELECT * FROM genome_commitments LIMIT 1;`
3. Verify `commitment_hash` is SHA-256 (64 chars)
4. Verify no plaintext genomic data stored

**Expected Result:**
- Only encrypted hashes in database
- No PII visible in raw queries

**Status:** [ ] PASS [ ] FAIL

---

### 1.3 UI Foundation Tests (FR-044 to FR-051)

#### TEST-UI-001: Glass Morphism Design
**Objective:** Verify premium UI elements
**Steps:**
1. Load each portal (/patient, /doctor, /researcher)
2. Verify glass effect on cards (backdrop-filter: blur)
3. Check dark theme (#1a1a2e background)
4. Verify gradient animations running

**Expected Result:**
- Glass cards have 10px blur
- Smooth animations at 60fps
- Purple/cyan gradients visible

**Status:** [ ] PASS [ ] FAIL

---

## Phase 2: Core Features Tests (Hours 8-16)

### 2.1 Genomic Data Management Tests (FR-007 to FR-014)

#### TEST-GENOME-001: File Upload and Validation
**Objective:** Test genome JSON upload
**Steps:**
1. Navigate to Patient Portal
2. Drag and drop `/demo/data/sarah-genome.json`
3. Verify file preview displays
4. Check validation passes (BRCA1, BRCA2, CYP2D6 present)
5. Click "Upload and Encrypt"

**Expected Result:**
- File validates successfully
- Progress bar shows upload
- IPFS CID displayed (Qm... format)
- Success toast notification

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-GENOME-002: IPFS Pinning
**Objective:** Verify IPFS integration
**Steps:**
1. After upload, note IPFS CID
2. Check Pinata dashboard or use: `curl https://gateway.pinata.cloud/ipfs/{CID}`
3. Verify encrypted content returned
4. Confirm CID stored in database

**Expected Result:**
- File successfully pinned to IPFS
- CID retrievable from gateway
- Content is encrypted (not readable)

**Status:** [ ] PASS [ ] FAIL

---

### 2.2 Proof Generation Tests (FR-015 to FR-023)

#### TEST-PROOF-001: BRCA1 Proof Generation
**Objective:** Test ZK proof generation
**Steps:**
1. In Patient Portal, select BRCA1 trait
2. Click "Generate Proof"
3. Monitor progress bar (updates every 500ms)
4. Wait for completion (should be <30s)
5. Verify proof hash displayed

**Expected Result:**
- Progress bar animates smoothly
- Proof generates in 5-30 seconds
- Proof hash format: 0x... (66 chars)
- "Verify on Blockchain" link works

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-PROOF-002: Concurrent Proof Generation
**Objective:** Test queue handling multiple proofs
**Steps:**
1. Generate BRCA1 proof
2. Immediately generate BRCA2 proof
3. Then generate CYP2D6 proof
4. Monitor all three progress bars
5. Verify all complete successfully

**Expected Result:**
- All 3 proofs process concurrently
- No queue blocking
- Each completes independently
- Redis cache prevents duplicates

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-PROOF-003: Proof Caching
**Objective:** Verify Redis caching works
**Steps:**
1. Generate BRCA1 proof, note generation time
2. Generate same BRCA1 proof again
3. Compare generation times
4. Check Redis: `redis-cli GET proof:*`

**Expected Result:**
- Second generation instant (<100ms)
- Proof retrieved from cache
- TTL set to 1 hour

**Status:** [ ] PASS [ ] FAIL

---

### 2.3 Patient Portal Tests (FR-024 to FR-030)

#### TEST-PATIENT-001: Consent Management
**Objective:** Test verification request handling
**Steps:**
1. Log in as Dr. Johnson in separate browser
2. Request BRCA1 verification from Sarah
3. Switch to Sarah's Patient Portal
4. Verify notification appears
5. Approve request with 24h expiry

**Expected Result:**
- Real-time notification via WebSocket
- Request shows doctor name and traits
- Approve/Deny buttons functional
- Status updates to "approved"

**Status:** [ ] PASS [ ] FAIL

---

### 2.4 Healthcare Provider Portal Tests (FR-031 to FR-043)

#### TEST-DOCTOR-001: Patient Verification Request
**Objective:** Test doctor requesting verification
**Steps:**
1. Log in as Dr. Johnson (/doctor)
2. Enter Sarah's wallet address
3. Select BRCA1 and BRCA2 traits
4. Click "Request Verification"
5. Monitor request status

**Expected Result:**
- Request sent successfully
- Status shows "pending"
- Updates to "approved" when patient approves
- Proof link appears after approval

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-RESEARCHER-001: Aggregate Data Display
**Objective:** Test researcher portal aggregation
**Steps:**
1. Navigate to /researcher
2. Verify minimum cohort warning if <5 patients
3. With 127 records, check mutation frequencies chart
4. Verify CYP2D6 metabolizer distribution
5. Test CSV export functionality

**Expected Result:**
- Charts display with 127 patients
- BRCA1 ~12% positive rate
- BRCA2 ~8% positive rate
- CSV downloads successfully
- No PII in exported data

**Status:** [ ] PASS [ ] FAIL

---

## Phase 3: Integration & Real-time Tests (Hours 16-24)

### 3.1 Frontend-Backend Integration Tests

#### TEST-INTEGRATION-001: End-to-End Patient Flow
**Objective:** Complete patient journey
**Steps:**
1. Connect wallet as new patient
2. Upload genomic JSON file
3. Generate BRCA1 proof
4. Receive doctor verification request
5. Approve request
6. Verify proof accessible to doctor

**Expected Result:**
- All steps complete without errors
- Data flows correctly through system
- Proofs verifiable on blockchain

**Status:** [ ] PASS [ ] FAIL

---

### 3.2 WebSocket Real-time Tests

#### TEST-WEBSOCKET-001: Real-time Notifications
**Objective:** Test WebSocket connectivity
**Steps:**
1. Open Patient Portal in Chrome
2. Open Doctor Portal in Firefox
3. Doctor requests verification
4. Verify instant notification in patient browser
5. Patient approves, verify doctor sees update

**Expected Result:**
- <1 second notification delivery
- Connection status shows "connected"
- No WebSocket disconnections
- Updates without page refresh

**Status:** [ ] PASS [ ] FAIL

---

#### TEST-WEBSOCKET-002: Proof Progress Updates
**Objective:** Test real-time progress
**Steps:**
1. Generate proof in patient portal
2. Open Network tab, filter for WebSocket
3. Verify progress messages every 500ms
4. Check messages contain percentage
5. Confirm completion event

**Expected Result:**
- Progress updates: 0%, 25%, 50%, 75%, 100%
- Smooth UI updates
- No missed messages
- Clean completion

**Status:** [ ] PASS [ ] FAIL

---

### 3.3 Data Aggregation Tests

#### TEST-AGGREGATE-001: Privacy Preservation
**Objective:** Verify no PII exposed
**Steps:**
1. Access researcher portal
2. Inspect all API calls in Network tab
3. Check responses for any wallet addresses
4. Verify only aggregate statistics returned
5. Test with <5 patients (should block)

**Expected Result:**
- No individual patient data exposed
- Only percentages and counts
- Minimum cohort enforced
- API returns 403 if cohort too small

**Status:** [ ] PASS [ ] FAIL

---

## Performance & Load Tests

### TEST-PERF-001: Concurrent Users
**Objective:** Test system under load
**Steps:**
1. Use Apache JMeter or similar
2. Simulate 10 concurrent users
3. Each user: login, upload, generate proof
4. Monitor response times
5. Check for errors

**Expected Result:**
- All operations complete
- API response <2 seconds
- No 500 errors
- Database connections stable

**Status:** [ ] PASS [ ] FAIL

---

### TEST-PERF-002: Animation Performance
**Objective:** Verify 60fps animations
**Steps:**
1. Open Chrome DevTools > Performance
2. Start recording
3. Navigate through all portals
4. Trigger animations (modals, transitions)
5. Stop recording and analyze

**Expected Result:**
- Consistent 60fps
- No frame drops
- Paint time <16ms
- No layout thrashing

**Status:** [ ] PASS [ ] FAIL

---

## Security Tests

### TEST-SEC-001: JWT Validation
**Objective:** Test authentication security
**Steps:**
1. Get valid JWT from localStorage
2. Modify payload (change userId)
3. Try API call with modified token
4. Test expired token
5. Test missing token

**Expected Result:**
- Modified token rejected (401)
- Expired token rejected
- Missing token rejected
- Only valid tokens accepted

**Status:** [ ] PASS [ ] FAIL

---

### TEST-SEC-002: Rate Limiting
**Objective:** Verify rate limits enforced
**Steps:**
1. Generate 10 proofs rapidly
2. Observe rate limit kicks in after 5
3. Wait 60 seconds
4. Verify can generate again
5. Test general API (100 req/min)

**Expected Result:**
- Proof generation: max 5/minute
- General API: max 100/minute
- Clear error message
- Automatic reset after window

**Status:** [ ] PASS [ ] FAIL

---

## Error Handling Tests

### TEST-ERROR-001: IPFS Failure Recovery
**Objective:** Test IPFS fallback
**Steps:**
1. Disable Pinata API (wrong key)
2. Attempt genome upload
3. Verify fallback to local storage
4. Check retry mechanism (3 attempts)
5. Confirm user sees clear error

**Expected Result:**
- 3 retry attempts with backoff
- Falls back gracefully
- User-friendly error message
- Upload can be retried

**Status:** [ ] PASS [ ] FAIL

---

### TEST-ERROR-002: Wallet Disconnection
**Objective:** Test wallet disconnect handling
**Steps:**
1. While generating proof, disconnect wallet
2. Verify operation continues
3. Reconnect wallet
4. Check state preserved
5. Verify can complete operation

**Expected Result:**
- No data loss
- Clear disconnection notice
- Can resume after reconnect
- Session maintained

**Status:** [ ] PASS [ ] FAIL

---

## Demo Flow Test

### TEST-DEMO-001: Complete Demo Scenario
**Objective:** Validate hackathon demo path
**Time Limit:** 5 minutes

**Sarah's Insurance Scenario:**
1. [ ] Sarah connects wallet (10s)
2. [ ] Uploads genome data (20s)
3. [ ] Generates BRCA1 negative proof (30s)
4. [ ] Shows proof to insurance portal (10s)
5. [ ] Verifies on blockchain (10s)

**Dr. Johnson's Treatment Scenario:**
1. [ ] Doctor requests CYP2D6 status (15s)
2. [ ] Sarah receives notification (instant)
3. [ ] Sarah approves request (10s)
4. [ ] Doctor sees metabolizer status (5s)
5. [ ] Prescribes appropriate medication (N/A)

**Researcher's Analysis:**
1. [ ] Researcher views aggregate data (5s)
2. [ ] Sees 127 patient statistics (instant)
3. [ ] Exports CSV report (5s)
4. [ ] No PII in export (verify)

**Total Time:** <3 minutes
**Status:** [ ] PASS [ ] FAIL

---

## Test Summary

### Coverage Report
- **Phase 1 Tests:** ___/8 Passed
- **Phase 2 Tests:** ___/9 Passed
- **Phase 3 Tests:** ___/6 Passed
- **Performance Tests:** ___/2 Passed
- **Security Tests:** ___/2 Passed
- **Error Tests:** ___/2 Passed
- **Demo Test:** ___/1 Passed

### Critical Issues Found
1.
2.
3.

### Non-Critical Issues
1.
2.
3.

### Overall Status
[ ] All tests passing - READY FOR DEMO
[ ] Critical issues - NEEDS FIXES
[ ] Blocked - MAJOR PROBLEMS

**Test Date:** ___________
**Tester:** ___________
**Environment:** Development / Staging / Production

---

## Appendix: Test Commands

### Backend Testing
```bash
# Run backend tests
cd backend
npm test

# Check Redis
redis-cli ping
redis-cli KEYS "*"

# Check PostgreSQL
psql -U postgres -d genomic_privacy -c "SELECT COUNT(*) FROM users;"

# Monitor WebSocket
wscat -c ws://localhost:3000
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test

# Check bundle size
npm run build
ls -lh dist/assets/*.js

# Lighthouse audit
lighthouse http://localhost:5173 --view
```

### Load Testing
```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/health

# Using curl loop
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/proof/generate \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"traitType":"BRCA1"}' &
done
```