# Genomic Privacy DApp Test Suite

Comprehensive testing framework for validating Phase 1-3 implementation of the Genomic Privacy DApp.

## 📋 Test Coverage

This test suite validates all 73 functional requirements (FR-001 to FR-073) across:
- **Phase 1**: Foundation (Authentication, Database, UI)
- **Phase 2**: Core Features (Genome Management, Proof Generation, Portals)
- **Phase 3**: Integration & Real-time (WebSocket, Frontend-Backend, Aggregation)

## 🚀 Quick Start

### 1. Quick Validation (Basic Health Check)
```bash
# Run quick validation to check if everything is running
./quick-validation.sh
```

This will check:
- Service availability (Frontend, Backend, DB, Redis)
- Critical files existence
- API endpoint health
- Database connectivity
- Phase 3 specific features

### 2. Automated Tests (API & Integration)
```bash
# Install test dependencies
npm install

# Run automated test suite
npm test
```

This runs comprehensive tests for:
- Authentication flow
- Genome upload and encryption
- Proof generation
- WebSocket real-time features
- Data aggregation
- Performance benchmarks

### 3. Manual Testing (UI & User Flows)
Follow the detailed test cases in `comprehensive-test-suite.md`:
- Open the file and work through each test case
- Mark tests as PASS/FAIL
- Document any issues found

## 🧪 Test Types

### Unit Tests
Located in respective component directories:
```bash
# Frontend unit tests
cd ../frontend && npm test

# Backend unit tests
cd ../backend && npm test
```

### Integration Tests
```bash
# Run integration tests
node automated-tests.js
```

### Load Testing
```bash
# Test authentication endpoint under load
npm run test:load:auth

# Test proof generation under load
npm run test:load:proof
```

### Security Tests
```bash
# Test JWT validation
npm run test:security:jwt

# Test rate limiting
npm run test:security:rate
```

## 📁 Test Data

Sample test data is provided in `test-data/`:
- `sarah-genome.json` - BRCA negative patient
- `mike-genome.json` - CYP2D6 poor metabolizer
- `auth.json` - Authentication payload
- `proof.json` - Proof generation request

## 🎯 Test Scenarios

### Demo Flow Test (Critical Path)
The most important test validates the complete demo flow:

1. **Sarah's Insurance Scenario**
   - Connect wallet → Upload genome → Generate BRCA1 proof → Verify on blockchain

2. **Dr. Johnson's Treatment Scenario**
   - Request verification → Patient approves → View metabolizer status

3. **Researcher's Analysis**
   - View aggregate data → Export CSV → Verify privacy preservation

## 📊 Success Criteria

For hackathon readiness:
- ✅ All services running (Frontend, Backend, PostgreSQL, Redis)
- ✅ Authentication working with JWT tokens
- ✅ Genome upload to IPFS functional
- ✅ Proof generation completing in <30 seconds
- ✅ WebSocket real-time updates working
- ✅ All three portals accessible
- ✅ 127 BRCA records in database
- ✅ Data aggregation respecting privacy
- ✅ Demo flow completing in <5 minutes

## 🐛 Troubleshooting

### Backend not running
```bash
cd ../backend
npm install
npm run dev
```

### Frontend not running
```bash
cd ../frontend
npm install
npm run dev
```

### Database issues
```bash
docker-compose up -d
cd ../backend
npm run db:migrate
npm run db:seed
```

### Redis not running
```bash
docker run -d -p 6379:6379 redis:7.2
```

## 📈 Test Results

After running tests, check:
- Console output for pass/fail counts
- `test-results.json` for detailed results (if generated)
- Browser console for frontend errors
- Backend logs for API errors

## 🎪 Demo Preparation

Before the demo:
1. Run `./quick-validation.sh` - all checks should pass
2. Run `npm test` - automated tests should pass
3. Practice demo flow 5 times
4. Have backup video ready
5. Ensure all test data is loaded

## 📝 Test Checklist

- [ ] Quick validation passes (>90%)
- [ ] Automated tests pass (100%)
- [ ] Manual UI tests complete
- [ ] Demo flow under 5 minutes
- [ ] Load test successful (10 concurrent users)
- [ ] Security tests pass
- [ ] WebSocket stable
- [ ] No console errors
- [ ] All portals responsive
- [ ] Data privacy maintained

## 🆘 Support

If tests are failing:
1. Check service logs
2. Verify environment variables
3. Ensure correct Node.js version (20+)
4. Confirm Docker is running
5. Review error messages in test output

## 🏆 Ready for Demo

When all tests pass:
- System handles complete user journeys
- Real-time features work smoothly
- Privacy is preserved throughout
- Performance meets requirements
- **You're ready to present!**

---

**Remember**: The demo flow is the most critical path. Even if some edge cases fail, ensure the main demo scenarios work perfectly.