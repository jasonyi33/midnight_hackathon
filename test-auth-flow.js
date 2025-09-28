const API_BASE = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
}

async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...\n');

  try {
    // Test wallet connection/authentication
    console.log('1. Testing wallet authentication...');
    const authResponse = await makeRequest(`${API_BASE}/api/auth/connect`, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: '0x742d35Cc6634C0532925a3b8Db4414fc7c2EcEE7',
        message: 'GenomicPrivacy::Auth::2024-09-28T12:00:00Z::test-nonce',
        signature: 'mock-signature-for-testing',
        role: 'patient'
      })
    });

    console.log('   ✅ Authentication successful');
    console.log('   📄 Response structure:', {
      success: authResponse.success,
      hasAccessToken: !!authResponse.data?.accessToken,
      hasUser: !!authResponse.data?.user,
      userRole: authResponse.data?.user?.role
    });

    const accessToken = authResponse.data.accessToken;
    console.log('   🔑 Access token received:', accessToken.substring(0, 20) + '...\n');

    // Test authenticated genome upload
    console.log('2. Testing authenticated genome upload...');
    const genomicData = {
      patientId: 'test-patient-001',
      sequenceDate: new Date().toISOString(),
      genome: {
        BRCA1: {
          status: 'wild_type',
          variants: [],
          riskScore: 0.1,
          confidence: 0.95
        },
        BRCA2: {
          status: 'wild_type',
          variants: [],
          riskScore: 0.1,
          confidence: 0.98
        },
        CYP2D6: {
          status: 'mutation_detected',
          variants: ['*1/*4'],
          riskScore: 0.8,
          confidence: 0.92,
          phenotype: 'poor_metabolizer',
          diplotype: '*1/*4',
          activityScore: 0.5
        }
      },
      metadata: {
        version: '1.0.0',
        laboratory: 'Demo Lab',
        qualityScore: 95
      }
    };

    const uploadPayload = {
      genomicData,
      encrypt: true
    };
    
    console.log('   📦 Sending payload:', JSON.stringify(uploadPayload, null, 2));
    
    const uploadResponse = await makeRequest(`${API_BASE}/api/genome/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(uploadPayload)
    });

    console.log('   ✅ Genome upload successful');
    console.log('   📊 Upload response:', {
      success: uploadResponse.success,
      hasCommitment: !!uploadResponse.commitment,
      hasCid: !!uploadResponse.cid
    });

    // Test profile endpoint
    console.log('\n3. Testing profile endpoint...');
    const profileResponse = await makeRequest(`${API_BASE}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('   ✅ Profile retrieval successful');
    console.log('   👤 User profile:', {
      walletAddress: profileResponse.data.user.walletAddress?.substring(0, 10) + '...',
      role: profileResponse.data.user.role,
      permissions: profileResponse.data.permissions
    });

    console.log('\n🎉 All tests passed! Authentication and upload workflow is complete.');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testAuthenticationFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
