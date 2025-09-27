/**
 * Demo Data Generation Script
 * Tasks 3.8-3.9: Create demo mode and seed database
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface PatientData {
  name: string;
  walletAddress: string;
  brca1: boolean;
  brca2: boolean;
  cyp2d6: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
  confidence?: number;
}

interface GenomeData {
  patientId: string;
  markers: {
    BRCA1_185delAG: boolean;
    BRCA1_5266dupC?: boolean;
    BRCA2_5266dupC: boolean;
    CYP2D6: {
      activityScore: number;
      metabolizer: string;
    };
  };
  traits: {
    BRCA1: {
      mutation_present: boolean;
      confidence: number;
    };
    BRCA2: {
      mutation_present: boolean;
      confidence: number;
    };
  };
}

// Demo patient profiles
const DEMO_PATIENTS: PatientData[] = [
  {
    name: 'Sarah Johnson',
    walletAddress: '0xSarah' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: false,
    cyp2d6: 'normal',
    confidence: 0.98
  },
  {
    name: 'Mike Chen',
    walletAddress: '0xMike' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: false,
    cyp2d6: 'poor',
    confidence: 0.97
  },
  {
    name: 'Alice Williams',
    walletAddress: '0xAlice' + crypto.randomBytes(16).toString('hex'),
    brca1: true,
    brca2: false,
    cyp2d6: 'rapid',
    confidence: 0.96
  },
  {
    name: 'David Brown',
    walletAddress: '0xDavid' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: true,
    cyp2d6: 'normal',
    confidence: 0.99
  },
  {
    name: 'Emma Davis',
    walletAddress: '0xEmma' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: false,
    cyp2d6: 'intermediate',
    confidence: 0.95
  },
  {
    name: 'James Wilson',
    walletAddress: '0xJames' + crypto.randomBytes(16).toString('hex'),
    brca1: true,
    brca2: true,
    cyp2d6: 'ultrarapid',
    confidence: 0.94
  },
  {
    name: 'Sophia Martinez',
    walletAddress: '0xSophia' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: false,
    cyp2d6: 'normal',
    confidence: 0.97
  },
  {
    name: 'Oliver Taylor',
    walletAddress: '0xOliver' + crypto.randomBytes(16).toString('hex'),
    brca1: true,
    brca2: false,
    cyp2d6: 'poor',
    confidence: 0.96
  },
  {
    name: 'Isabella Anderson',
    walletAddress: '0xIsabella' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: false,
    cyp2d6: 'rapid',
    confidence: 0.98
  },
  {
    name: 'Liam Thomas',
    walletAddress: '0xLiam' + crypto.randomBytes(16).toString('hex'),
    brca1: false,
    brca2: true,
    cyp2d6: 'normal',
    confidence: 0.95
  }
];

// Activity score mapping for CYP2D6
function getActivityScore(metabolizer: string): number {
  const scores: Record<string, number> = {
    'poor': 0.5,
    'intermediate': 1.0,
    'normal': 1.5,
    'rapid': 2.0,
    'ultrarapid': 2.5
  };
  return scores[metabolizer] || 1.5;
}

// Generate genome JSON file for a patient
function generateGenomeFile(patient: PatientData, index: number): GenomeData {
  const patientId = uuidv4();

  const genome: GenomeData = {
    patientId,
    markers: {
      BRCA1_185delAG: patient.brca1,
      BRCA1_5266dupC: Math.random() < 0.1, // 10% chance of secondary mutation
      BRCA2_5266dupC: patient.brca2,
      CYP2D6: {
        activityScore: getActivityScore(patient.cyp2d6),
        metabolizer: patient.cyp2d6
      }
    },
    traits: {
      BRCA1: {
        mutation_present: patient.brca1,
        confidence: patient.confidence || (0.94 + Math.random() * 0.05)
      },
      BRCA2: {
        mutation_present: patient.brca2,
        confidence: patient.confidence || (0.94 + Math.random() * 0.05)
      }
    }
  };

  return genome;
}

// Generate additional random patients for research portal
function generateRandomPatients(count: number): GenomeData[] {
  const patients: GenomeData[] = [];
  const metabolizerTypes = ['poor', 'intermediate', 'normal', 'rapid', 'ultrarapid'];

  for (let i = 0; i < count; i++) {
    const hasBRCA1 = Math.random() < 0.15; // 15% prevalence
    const hasBRCA2 = Math.random() < 0.12; // 12% prevalence
    const metabolizer = metabolizerTypes[Math.floor(Math.random() * metabolizerTypes.length)];

    const genome: GenomeData = {
      patientId: uuidv4(),
      markers: {
        BRCA1_185delAG: hasBRCA1,
        BRCA2_5266dupC: hasBRCA2,
        CYP2D6: {
          activityScore: getActivityScore(metabolizer),
          metabolizer
        }
      },
      traits: {
        BRCA1: {
          mutation_present: hasBRCA1,
          confidence: 0.90 + Math.random() * 0.09
        },
        BRCA2: {
          mutation_present: hasBRCA2,
          confidence: 0.90 + Math.random() * 0.09
        }
      }
    };

    patients.push(genome);
  }

  return patients;
}

// Generate SQL seed file
function generateSQLSeed(): string {
  let sql = '-- Demo Data Seed for Phase 3\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';

  // Create demo users
  sql += '-- Demo Users\n';
  sql += 'INSERT INTO users (id, wallet_address, role, name, created_at) VALUES\n';

  const userInserts: string[] = [];

  // Add patients
  DEMO_PATIENTS.forEach((patient, index) => {
    const userId = `patient-${index + 1}`;
    userInserts.push(`  ('${userId}', '${patient.walletAddress}', 'patient', '${patient.name}', NOW())`);
  });

  // Add doctor accounts
  userInserts.push(`  ('doctor-1', '0xDrJohnson${crypto.randomBytes(8).toString('hex')}', 'doctor', 'Dr. John Smith', NOW())`);
  userInserts.push(`  ('doctor-2', '0xDrWilson${crypto.randomBytes(8).toString('hex')}', 'doctor', 'Dr. Emily Wilson', NOW())`);

  // Add researcher account
  userInserts.push(`  ('researcher-1', '0xResearch${crypto.randomBytes(8).toString('hex')}', 'researcher', 'Research Team Alpha', NOW())`);

  sql += userInserts.join(',\n') + '\nON CONFLICT (wallet_address) DO NOTHING;\n\n';

  // Generate genome traits for research aggregation
  sql += '-- Genome Traits (127 records for research portal)\n';
  sql += 'INSERT INTO genome_traits (id, patient_id, trait_type, mutation_present, confidence_score, created_at) VALUES\n';

  const traitInserts: string[] = [];
  let traitCount = 0;

  // Add traits for demo patients
  DEMO_PATIENTS.forEach((patient, index) => {
    const patientId = `patient-${index + 1}`;

    traitInserts.push(`  ('${uuidv4()}', '${patientId}', 'BRCA1', ${patient.brca1}, ${patient.confidence || 0.95}, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`);
    traitInserts.push(`  ('${uuidv4()}', '${patientId}', 'BRCA2', ${patient.brca2}, ${patient.confidence || 0.95}, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`);
    traitCount += 2;
  });

  // Generate additional records to reach 127
  while (traitCount < 127) {
    const hasMutation = Math.random() < 0.15;
    const confidence = 0.90 + Math.random() * 0.09;
    const traitType = Math.random() < 0.5 ? 'BRCA1' : 'BRCA2';
    const daysAgo = Math.floor(Math.random() * 30);

    traitInserts.push(`  ('${uuidv4()}', 'patient-${Math.floor(Math.random() * 10) + 1}', '${traitType}', ${hasMutation}, ${confidence.toFixed(2)}, NOW() - INTERVAL '${daysAgo} days')`);
    traitCount++;
  }

  sql += traitInserts.join(',\n') + ';\n\n';

  // Generate CYP2D6 data
  sql += '-- CYP2D6 Metabolizer Data\n';
  sql += 'INSERT INTO cyp2d6_data (id, patient_id, metabolizer_status, activity_score, created_at) VALUES\n';

  const cyp2d6Inserts: string[] = [];

  DEMO_PATIENTS.forEach((patient, index) => {
    const patientId = `patient-${index + 1}`;
    const activityScore = getActivityScore(patient.cyp2d6);

    cyp2d6Inserts.push(`  ('${uuidv4()}', '${patientId}', '${patient.cyp2d6}', ${activityScore}, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`);
  });

  sql += cyp2d6Inserts.join(',\n') + ';\n\n';

  // Generate historical verification requests
  sql += '-- Historical Verification Requests\n';
  sql += 'INSERT INTO verification_requests (id, patient_id, doctor_id, requested_traits, status, created_at, responded_at) VALUES\n';

  const verificationInserts: string[] = [];

  for (let i = 0; i < 50; i++) {
    const patientId = `patient-${Math.floor(Math.random() * 10) + 1}`;
    const doctorId = Math.random() < 0.7 ? 'doctor-1' : 'doctor-2';
    const traits = "'{\"BRCA1\",\"BRCA2\"}'";
    const status = Math.random() < 0.7 ? 'approved' : (Math.random() < 0.9 ? 'denied' : 'pending');
    const daysAgo = Math.floor(Math.random() * 30);
    const responded = status !== 'pending' ? `, NOW() - INTERVAL '${daysAgo - 1} days'` : ', NULL';

    verificationInserts.push(`  ('${uuidv4()}', '${patientId}', '${doctorId}', ${traits}, '${status}', NOW() - INTERVAL '${daysAgo} days'${responded})`);
  }

  sql += verificationInserts.join(',\n') + ';\n';

  return sql;
}

// Main execution
async function main() {
  const outputDir = path.join(__dirname, '..', 'demo-data');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎭 Generating Demo Data for Phase 3...\n');

  // Generate genome JSON files for demo patients
  console.log('📁 Creating genome JSON files...');
  DEMO_PATIENTS.forEach((patient, index) => {
    const genome = generateGenomeFile(patient, index);
    const filename = path.join(outputDir, `patient_${patient.name.replace(' ', '_').toLowerCase()}.json`);

    fs.writeFileSync(filename, JSON.stringify(genome, null, 2));
    console.log(`  ✅ ${filename}`);
  });

  // Generate additional random patients
  console.log('\n📊 Generating random patient data for research...');
  const randomPatients = generateRandomPatients(117); // 127 total minus 10 demo patients
  fs.writeFileSync(
    path.join(outputDir, 'random_patients.json'),
    JSON.stringify(randomPatients, null, 2)
  );
  console.log('  ✅ Generated 117 additional patient records');

  // Generate SQL seed file
  console.log('\n💾 Creating SQL seed file...');
  const sqlSeed = generateSQLSeed();
  fs.writeFileSync(path.join(outputDir, 'seed.sql'), sqlSeed);
  console.log('  ✅ seed.sql created');

  // Create demo credentials file
  console.log('\n🔑 Creating demo credentials...');
  const credentials = {
    patients: DEMO_PATIENTS.map(p => ({
      name: p.name,
      walletAddress: p.walletAddress,
      traits: {
        brca1: p.brca1,
        brca2: p.brca2,
        cyp2d6: p.cyp2d6
      }
    })),
    doctors: [
      { name: 'Dr. John Smith', role: 'doctor', userId: 'doctor-1' },
      { name: 'Dr. Emily Wilson', role: 'doctor', userId: 'doctor-2' }
    ],
    researcher: {
      name: 'Research Team Alpha',
      role: 'researcher',
      userId: 'researcher-1'
    }
  };

  fs.writeFileSync(
    path.join(outputDir, 'demo-credentials.json'),
    JSON.stringify(credentials, null, 2)
  );
  console.log('  ✅ demo-credentials.json created');

  // Create README for demo data
  const readme = `# Demo Data for Genomic Privacy DApp

## Generated Files

- **patient_*.json**: Individual patient genome files for demo accounts
- **random_patients.json**: 117 additional patient records for research aggregation
- **seed.sql**: SQL script to populate database with demo data
- **demo-credentials.json**: Demo account credentials for testing

## Usage

1. **Seed the database:**
   \`\`\`bash
   psql -U genomic -d genomic_privacy < demo-data/seed.sql
   \`\`\`

2. **Upload patient genomes:**
   - Use the patient_*.json files in the upload interface
   - Each file corresponds to a demo patient account

3. **Demo Accounts:**
   - **Sarah Johnson**: BRCA-negative, normal metabolizer (insurance scenario)
   - **Mike Chen**: BRCA-negative, poor metabolizer (medication scenario)
   - **Alice Williams**: BRCA1-positive, rapid metabolizer
   - **Dr. John Smith**: Doctor account for verification requests
   - **Research Team Alpha**: Researcher account for aggregated data

## Statistics

- Total Patients: 127
- BRCA1 Positive: ~15%
- BRCA2 Positive: ~12%
- Verification Requests: 50
- Date Range: Last 30 days

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  console.log('  ✅ README.md created');

  console.log('\n✨ Demo data generation complete!');
  console.log(`📂 Output directory: ${outputDir}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { generateGenomeFile, generateRandomPatients, DEMO_PATIENTS };