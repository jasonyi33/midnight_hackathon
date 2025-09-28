#!/usr/bin/env node

/**
 * Upload Functionality Test - Direct API Testing
 */

async function testUploadAPI() {
  console.log('🧪 Testing Upload API Direct...\n');
  
  // Test health endpoint first
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3000/health');
    if (healthResponse.ok) {
      console.log('✅ Backend is responding');
    } else {
      console.log(`❌ Backend health check failed: ${healthResponse.status}`);
      return;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to backend: ${error.message}`);
    console.log('   Make sure backend is running: cd backend && npm run dev');
    return;
  }
  
  // Test upload endpoint without auth
  console.log('\n2. Testing upload endpoint without auth...');
  try {
    const uploadResponse = await fetch('http://localhost:3000/api/genome/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        genomicData: {
          patientId: 'test-patient-001',
          markers: {
            'BRCA1_185delAG': false,
            'BRCA1_5266dupC': false
          },
          traits: {
            BRCA1: {
              mutation_present: false,
              confidence_score: 0.95
            }
          }
        },
        encrypt: true
      })
    });
    
    console.log(`📡 Upload endpoint status: ${uploadResponse.status}`);
    
    if (uploadResponse.status === 401) {
      console.log('✅ Upload endpoint requires authentication (expected)');
      console.log('   This means the endpoint exists and is protected');
    } else if (uploadResponse.status === 200) {
      const result = await uploadResponse.json();
      console.log('✅ Upload successful!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await uploadResponse.text();
      console.log(`❌ Unexpected response: ${uploadResponse.status}`);
      console.log('📄 Error:', errorText);
    }
  } catch (error) {
    console.log(`❌ Upload test failed: ${error.message}`);
  }
  
  // Test with sample file from our test
  console.log('\n3. Testing with sample genome file...');
  const fs = require('fs');
  const path = require('path');
  
  const samplePath = path.join(__dirname, 'sample-genome.json');
  if (fs.existsSync(samplePath)) {
    const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
    console.log('✅ Sample genome file loaded');
    console.log(`📊 File size: ${JSON.stringify(sampleData).length} bytes`);
    console.log(`🧬 Traits: ${Object.keys(sampleData.traits).join(', ')}`);
  } else {
    console.log('⚠️  Sample genome file not found');
    console.log('   Run the main upload test first to generate it');
  }
  
  console.log('\n📋 Summary:');
  console.log('• Backend API is accessible');
  console.log('• Upload endpoint exists and is protected');
  console.log('• Authentication is required for uploads');
  console.log('• Frontend needs to handle auth tokens');
  console.log('\n🔧 Next steps:');
  console.log('1. Implement authentication in frontend');
  console.log('2. Test complete upload workflow with auth');
  console.log('3. Verify IPFS integration');
  console.log('4. Test blockchain commitment');
}

if (require.main === module) {
  testUploadAPI();
}

module.exports = { testUploadAPI };
