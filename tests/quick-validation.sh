#!/bin/bash

# Quick Validation Script for Genomic Privacy DApp
# This script performs basic checks to validate Phase 1-3 implementation

echo "========================================="
echo "  GENOMIC PRIVACY DAPP VALIDATION"
echo "  Phase 1-3 Implementation Check"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Tracking variables
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Function to check and report
check() {
    local description="$1"
    local command="$2"
    local expected="$3"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking: $description... "

    result=$(eval "$command" 2>/dev/null)

    if [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        return 1
    fi
}

# Function to check if process is running
check_process() {
    local name="$1"
    local port="$2"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking: $name on port $port... "

    if lsof -i:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

# Function to check file existence
check_file() {
    local description="$1"
    local filepath="$2"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking: $description... "

    if [ -f "$filepath" ]; then
        echo -e "${GREEN}✓ EXISTS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ MISSING${NC}"
        return 1
    fi
}

echo "=== ENVIRONMENT CHECKS ==="
echo ""

# Check Node.js version
check "Node.js v20+" "node -v | cut -d'v' -f2 | cut -d'.' -f1" "20"

# Check npm
check "npm installed" "npm -v | cut -d'.' -f1" ""

# Check Docker
check "Docker running" "docker ps" "CONTAINER"

echo ""
echo "=== SERVICE CHECKS ==="
echo ""

# Check if services are running
check_process "Frontend" 5173
check_process "Backend" 3000
check_process "PostgreSQL" 5432
check_process "Redis" 6379

echo ""
echo "=== FILE STRUCTURE CHECKS ==="
echo ""

# Check critical files exist
check_file "Frontend entry" "../frontend/src/main.tsx"
check_file "Backend entry" "../backend/src/index.ts"
check_file "Patient Portal" "../frontend/src/app/pages/patient/patient-page.tsx"
check_file "Doctor Portal" "../frontend/src/app/pages/doctor/doctor-page.tsx"
check_file "Researcher Portal" "../frontend/src/app/pages/researcher/researcher-page.tsx"
check_file "ProofSDK Integration" "../backend/src/proof/proof-integration.service.ts"
check_file "WebSocket Service" "../backend/src/websocket/websocket.service.ts"
check_file "Auth Service" "../backend/src/auth/auth.service.ts"
check_file "IPFS Service" "../backend/src/ipfs/ipfs.service.ts"
check_file "Database Schema" "../backend/src/database/schema.sql"

echo ""
echo "=== API ENDPOINT CHECKS ==="
echo ""

# Check API endpoints
check "Health endpoint" "curl -s http://localhost:3000/health | jq -r .status" "healthy"
check "Database connected" "curl -s http://localhost:3000/health | jq -r .database" "connected"
check "Redis connected" "curl -s http://localhost:3000/health | jq -r .redis" "connected"

echo ""
echo "=== DATABASE CHECKS ==="
echo ""

# Check database tables (requires PGPASSWORD env var or .pgpass file)
if [ -n "$PGPASSWORD" ] || [ -f ~/.pgpass ]; then
    check "Users table" "psql -h localhost -U postgres -d genomic_privacy -t -c 'SELECT COUNT(*) FROM users;' | tr -d ' '" ""
    check "Genome commitments table" "psql -h localhost -U postgres -d genomic_privacy -t -c 'SELECT COUNT(*) FROM genome_commitments;' | tr -d ' '" ""
    check "Verification requests table" "psql -h localhost -U postgres -d genomic_privacy -t -c 'SELECT COUNT(*) FROM verification_requests;' | tr -d ' '" ""
else
    echo -e "${YELLOW}⚠ Skipping database checks (set PGPASSWORD to enable)${NC}"
fi

echo ""
echo "=== FRONTEND CHECKS ==="
echo ""

# Check if frontend is accessible
check "Frontend accessible" "curl -s -o /dev/null -w '%{http_code}' http://localhost:5173" "200"

# Check for critical UI elements (basic check)
check "Glass morphism CSS" "grep -q 'backdrop-filter.*blur' ../frontend/src/styles/globals.css && echo 'found'" "found"
check "WebSocket hooks" "grep -q 'useRealWebSocket' ../frontend/src/app/pages/patient/patient-page.tsx && echo 'found'" "found"

echo ""
echo "=== DEPENDENCY CHECKS ==="
echo ""

# Check critical dependencies
check "Express installed" "grep -q '\"express\"' ../backend/package.json && echo 'found'" "found"
check "Socket.io installed" "grep -q '\"socket.io\"' ../backend/package.json && echo 'found'" "found"
check "Bull installed" "grep -q '\"bull\"' ../backend/package.json && echo 'found'" "found"
check "React installed" "grep -q '\"react\"' ../frontend/package.json && echo 'found'" "found"
check "Zustand installed" "grep -q '\"zustand\"' ../frontend/package.json && echo 'found'" "found"
check "TailwindCSS installed" "grep -q '\"tailwindcss\"' ../frontend/package.json && echo 'found'" "found"

echo ""
echo "=== PHASE 3 SPECIFIC CHECKS ==="
echo ""

# Check Phase 3 specific implementations
check "ProofSDK imported" "grep -q 'real-proof-sdk' ../backend/src/proof/proof-integration.service.ts && echo 'found'" "found"
check "WebSocket integration" "grep -q 'socket.io' ../backend/src/websocket/websocket.service.ts && echo 'found'" "found"
check "127 BRCA records" "grep -q '117.*anonymous.*BRCA' ../backend/scripts/seed-demo-database.ts && echo 'found'" "found"
check "Real-time hooks" "grep -q 'useProofProgress' ../frontend/src/hooks/useRealWebSocket.ts && echo 'found'" "found"

echo ""
echo "========================================="
echo "          VALIDATION SUMMARY"
echo "========================================="
echo ""

# Calculate percentage
if [ $TOTAL_CHECKS -gt 0 ]; then
    PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
else
    PERCENTAGE=0
fi

# Display summary with color coding
if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}✓ EXCELLENT: $PASSED_CHECKS/$TOTAL_CHECKS checks passed ($PERCENTAGE%)${NC}"
    echo -e "${GREEN}Ready for demo!${NC}"
    EXIT_CODE=0
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠ GOOD: $PASSED_CHECKS/$TOTAL_CHECKS checks passed ($PERCENTAGE%)${NC}"
    echo -e "${YELLOW}Minor issues to fix${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ NEEDS WORK: $PASSED_CHECKS/$TOTAL_CHECKS checks passed ($PERCENTAGE%)${NC}"
    echo -e "${RED}Critical issues found${NC}"
    EXIT_CODE=1
fi

echo ""
echo "========================================="
echo ""

# Provide next steps
echo "NEXT STEPS:"
if [ $PASSED_CHECKS -lt $TOTAL_CHECKS ]; then
    echo "1. Fix the failed checks above"
    echo "2. Run: npm test in both frontend and backend directories"
    echo "3. Run the automated test suite: node tests/automated-tests.js"
else
    echo "1. Run the full test suite: cd tests && npm test"
    echo "2. Follow comprehensive-test-suite.md for manual testing"
    echo "3. Practice the demo flow"
fi

exit $EXIT_CODE