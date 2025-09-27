#!/usr/bin/env ts-node

/**
 * Seed Demo Database Script
 * Phase 3: Pre-load database with demo data
 *
 * This script:
 * 1. Creates demo user accounts (patients, doctors, researcher)
 * 2. Seeds genome commitments for patients
 * 3. Creates historical verification requests
 * 4. Generates aggregation data
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.production') });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://genomic:password@localhost:5432/genomic_privacy'
});

// Demo user data
const DEMO_USERS = [
  // Patients
  {
    id: uuidv4(),
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    role: 'patient',
    name: 'Sarah Johnson',
    email: 'sarah@demo.com',
    demo_username: 'sarah'
  },
  {
    id: uuidv4(),
    wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    role: 'patient',
    name: 'Mike Chen',
    email: 'mike@demo.com',
    demo_username: 'mike'
  },
  {
    id: uuidv4(),
    wallet_address: '0x9876543210fedcba9876543210fedcba98765432',
    role: 'patient',
    name: 'Alice Brown',
    email: 'alice@demo.com',
    demo_username: 'alice'
  },
  {
    id: uuidv4(),
    wallet_address: '0xfedcba9876543210fedcba9876543210fedcba98',
    role: 'patient',
    name: 'Robert Davis',
    email: 'robert@demo.com',
    demo_username: 'robert'
  },
  {
    id: uuidv4(),
    wallet_address: '0x1111222233334444555566667777888899990000',
    role: 'patient',
    name: 'Emma Wilson',
    email: 'emma@demo.com',
    demo_username: 'emma'
  },
  {
    id: uuidv4(),
    wallet_address: '0xaaaabbbbccccddddeeeeffffaaaabbbbccccdddd',
    role: 'patient',
    name: 'James Miller',
    email: 'james@demo.com',
    demo_username: 'james'
  },
  {
    id: uuidv4(),
    wallet_address: '0x2222333344445555666677778888999900001111',
    role: 'patient',
    name: 'Sophia Martinez',
    email: 'sophia@demo.com',
    demo_username: 'sophia'
  },
  {
    id: uuidv4(),
    wallet_address: '0xbbbbccccddddeeeeffffaaaabbbbccccddddeeee',
    role: 'patient',
    name: 'William Anderson',
    email: 'william@demo.com',
    demo_username: 'william'
  },
  {
    id: uuidv4(),
    wallet_address: '0x3333444455556666777788889999000011112222',
    role: 'patient',
    name: 'Olivia Taylor',
    email: 'olivia@demo.com',
    demo_username: 'olivia'
  },
  {
    id: uuidv4(),
    wallet_address: '0xccccddddeeeeffffaaaabbbbccccddddeeeefffff',
    role: 'patient',
    name: 'Noah Thomas',
    email: 'noah@demo.com',
    demo_username: 'noah'
  },
  // Doctors
  {
    id: uuidv4(),
    wallet_address: '0xdoctor11111111111111111111111111111111111',
    role: 'doctor',
    name: 'Dr. Emily Johnson',
    email: 'drjohnson@demo.com',
    demo_username: 'drjohnson'
  },
  {
    id: uuidv4(),
    wallet_address: '0xdoctor22222222222222222222222222222222222',
    role: 'doctor',
    name: 'Dr. Michael Smith',
    email: 'drsmith@demo.com',
    demo_username: 'drsmith'
  },
  // Researcher
  {
    id: uuidv4(),
    wallet_address: '0xresearch1111111111111111111111111111111111',
    role: 'researcher',
    name: 'Research Team Alpha',
    email: 'research@demo.com',
    demo_username: 'research-team'
  }
];

// Genetic traits for demo patients
const GENETIC_TRAITS = [
  { userId: 0, brca1: false, brca2: false, cyp2d6: 'normal' },      // Sarah - healthy
  { userId: 1, brca1: false, brca2: false, cyp2d6: 'poor' },        // Mike - poor metabolizer
  { userId: 2, brca1: true, brca2: false, cyp2d6: 'normal' },       // Alice - BRCA1 positive
  { userId: 3, brca1: false, brca2: true, cyp2d6: 'intermediate' }, // Robert - BRCA2 positive
  { userId: 4, brca1: false, brca2: false, cyp2d6: 'rapid' },       // Emma - rapid metabolizer
  { userId: 5, brca1: true, brca2: true, cyp2d6: 'normal' },        // James - both BRCA
  { userId: 6, brca1: false, brca2: false, cyp2d6: 'ultrarapid' },  // Sophia - ultrarapid
  { userId: 7, brca1: true, brca2: false, cyp2d6: 'poor' },         // William - BRCA1 + poor
  { userId: 8, brca1: false, brca2: true, cyp2d6: 'intermediate' }, // Olivia - BRCA2 + intermediate
  { userId: 9, brca1: false, brca2: false, cyp2d6: 'normal' }       // Noah - healthy
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address VARCHAR(66) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'patient',
        name VARCHAR(255),
        email VARCHAR(255),
        demo_username VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create genome_commitments table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS genome_commitments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES users(id),
        commitment_hash VARCHAR(66) NOT NULL,
        ipfs_cid VARCHAR(255) NOT NULL,
        encrypted BOOLEAN DEFAULT true,
        traits JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create verification_requests table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES users(id),
        doctor_id UUID REFERENCES users(id),
        requested_traits TEXT[] NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        message TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP
      )
    `);

    // 4. Create proofs table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proofs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES users(id),
        trait_type VARCHAR(50) NOT NULL,
        proof_hash VARCHAR(66) NOT NULL,
        public_inputs TEXT[],
        verification_key TEXT,
        status VARCHAR(20) DEFAULT 'valid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Clear existing demo data
    console.log('🗑️  Clearing existing demo data...');
    await pool.query(`DELETE FROM verification_requests WHERE patient_id IN (SELECT id FROM users WHERE demo_username IS NOT NULL)`);
    await pool.query(`DELETE FROM proofs WHERE patient_id IN (SELECT id FROM users WHERE demo_username IS NOT NULL)`);
    await pool.query(`DELETE FROM genome_commitments WHERE patient_id IN (SELECT id FROM users WHERE demo_username IS NOT NULL)`);
    await pool.query(`DELETE FROM users WHERE demo_username IS NOT NULL`);

    // 6. Insert demo users
    console.log('👥 Creating demo users...');
    for (const user of DEMO_USERS) {
      await pool.query(`
        INSERT INTO users (id, wallet_address, role, name, email, demo_username)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [user.id, user.wallet_address, user.role, user.name, user.email, user.demo_username]);
      console.log(`  ✅ Created ${user.role}: ${user.name} (${user.demo_username})`);
    }

    // 7. Create genome commitments for patients
    console.log('\n🧬 Creating genome commitments...');
    const patients = DEMO_USERS.filter(u => u.role === 'patient');
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const traits = GENETIC_TRAITS[i];

      // Generate mock IPFS CID
      const mockCid = `Qm${Buffer.from(`${patient.id}${Date.now()}`).toString('hex').substring(0, 44)}`;

      // Generate commitment hash
      const crypto = require('crypto');
      const commitmentData = JSON.stringify({ ...traits, userId: patient.id });
      const commitmentHash = `0x${crypto.createHash('sha256').update(commitmentData).digest('hex')}`;

      await pool.query(`
        INSERT INTO genome_commitments (patient_id, commitment_hash, ipfs_cid, encrypted, traits)
        VALUES ($1, $2, $3, $4, $5)
      `, [patient.id, commitmentHash, mockCid, true, JSON.stringify(traits)]);

      console.log(`  ✅ Genome for ${patient.name}: BRCA1=${traits.brca1}, BRCA2=${traits.brca2}, CYP2D6=${traits.cyp2d6}`);
    }

    // 7a. Create additional 117 anonymous BRCA records for researcher aggregation
    console.log('\n📊 Creating 117 additional anonymous BRCA records for aggregation...');
    for (let i = 0; i < 117; i++) {
      const anonymousPatientId = uuidv4();

      // Create anonymous patient
      await pool.query(`
        INSERT INTO users (id, wallet_address, role, name, email)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        anonymousPatientId,
        `0x${Buffer.from(`anon${i}`).toString('hex').padEnd(40, '0')}`,
        'patient',
        `Anonymous Patient ${i + 11}`,
        `anon${i + 11}@genomic.privacy`
      ]);

      // Generate random genetic profile with realistic distribution
      const brca1 = Math.random() < 0.12; // ~12% BRCA1 positive (matches real prevalence)
      const brca2 = Math.random() < 0.08; // ~8% BRCA2 positive
      const cyp2d6Dist = Math.random();
      let cyp2d6: string;
      if (cyp2d6Dist < 0.07) cyp2d6 = 'poor';           // 7% poor metabolizers
      else if (cyp2d6Dist < 0.35) cyp2d6 = 'intermediate'; // 28% intermediate
      else if (cyp2d6Dist < 0.85) cyp2d6 = 'normal';      // 50% normal
      else if (cyp2d6Dist < 0.97) cyp2d6 = 'rapid';       // 12% rapid
      else cyp2d6 = 'ultrarapid';                          // 3% ultrarapid

      const commitmentHash = `0x${Buffer.from(`anon-genome-${i}`).toString('hex').padEnd(64, '0')}`;
      const mockCid = `Qm${Buffer.from(`anon-ipfs-${i}`).toString('hex').substring(0, 44)}`;

      await pool.query(`
        INSERT INTO genome_commitments (patient_id, commitment_hash, ipfs_cid, encrypted, traits)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        anonymousPatientId,
        commitmentHash,
        mockCid,
        true,
        JSON.stringify({ brca1, brca2, cyp2d6 })
      ]);

      if (i % 20 === 0) {
        console.log(`  ⏳ Created ${i + 1}/117 anonymous records...`);
      }
    }
    console.log('  ✅ Created 117 additional BRCA records for aggregation');

    // 8. Create historical verification requests
    console.log('\n📋 Creating verification requests...');
    const doctors = DEMO_USERS.filter(u => u.role === 'doctor');
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const traits = ['BRCA1', 'BRCA2', 'CYP2D6'].filter(() => Math.random() > 0.5);

      if (traits.length === 0) traits.push('BRCA1'); // Ensure at least one trait

      const statuses = ['pending', 'approved', 'denied'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Random date in last 30 days
      const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const respondedAt = status !== 'pending' ? new Date(createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000) : null;

      await pool.query(`
        INSERT INTO verification_requests (patient_id, doctor_id, requested_traits, status, message, expires_at, created_at, responded_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        patient.id,
        doctor.id,
        traits,
        status,
        `Verification request for ${traits.join(', ')}`,
        expiresAt,
        createdAt,
        respondedAt
      ]);
    }
    console.log(`  ✅ Created 50 verification requests`);

    // 9. Create some proof records
    console.log('\n🔐 Creating proof records...');
    for (const patient of patients.slice(0, 5)) {
      const traits = ['BRCA1', 'BRCA2', 'CYP2D6'];
      for (const trait of traits) {
        if (Math.random() > 0.5) {
          const proofHash = `0x${Buffer.from(`proof_${patient.id}_${trait}`).toString('hex').padEnd(64, '0')}`;

          await pool.query(`
            INSERT INTO proofs (patient_id, trait_type, proof_hash, public_inputs, verification_key, status)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            patient.id,
            trait,
            proofHash,
            [trait, 'true'],
            `vk_${trait}_${Date.now()}`,
            'valid'
          ]);
        }
      }
    }
    console.log(`  ✅ Created sample proof records`);

    // 10. Display summary
    console.log('\n📊 Seeding Summary:');
    console.log('  • 10 patients with genetic data');
    console.log('  • 2 doctors');
    console.log('  • 1 researcher');
    console.log('  • 127 BRCA records for aggregation');
    console.log('  • 50 verification requests');
    console.log('  • Sample proof records');

    // Display summary
    console.log('\n📈 Seeding Summary:');
    console.log('  • 127 total patient accounts (10 demo + 117 anonymous)');
    console.log('  • 127 genome records with BRCA1/BRCA2/CYP2D6 data');
    console.log('  • 2 doctor accounts');
    console.log('  • 1 researcher account');
    console.log('  • 50 verification requests');
    console.log('  • Sample proof records');

    console.log('\n🎉 Database seeding completed successfully!');

    // Display demo credentials
    console.log('\n🔑 Demo Credentials:');
    console.log('  Patients:');
    console.log('    - sarah (BRCA negative, healthy)');
    console.log('    - mike (CYP2D6 poor metabolizer)');
    console.log('    - alice (BRCA1 positive)');
    console.log('  Doctors:');
    console.log('    - drjohnson');
    console.log('    - drsmith');
    console.log('  Researcher:');
    console.log('    - research-team');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding script
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });