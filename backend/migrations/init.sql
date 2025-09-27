-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'researcher')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genome commitments table
CREATE TABLE genome_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commitment_hash VARCHAR(66) NOT NULL,
  ipfs_cid VARCHAR(46),
  encrypted_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, commitment_hash)
);

-- Verification requests table
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trait_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  requirements JSONB DEFAULT '{}',
  proof_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address INET,
  request_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proof cache table (for faster lookups)
CREATE TABLE proof_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trait_type VARCHAR(20) NOT NULL,
  proof_data TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_id, trait_type)
);

-- Indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_genome_commitments_user_id ON genome_commitments(user_id);
CREATE INDEX idx_verification_patient ON verification_requests(patient_id);
CREATE INDEX idx_verification_doctor ON verification_requests(doctor_id);
CREATE INDEX idx_verification_status ON verification_requests(status);
CREATE INDEX idx_audit_user_time ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_proof_cache_user_trait ON proof_cache(user_id, trait_type);
CREATE INDEX idx_proof_cache_expires ON proof_cache(expires_at);

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some demo data for testing
INSERT INTO users (wallet_address, role) VALUES
  ('addr_test1_patient_sarah', 'patient'),
  ('addr_test1_doctor_johnson', 'doctor'),
  ('addr_test1_researcher_alice', 'researcher')
ON CONFLICT (wallet_address) DO NOTHING;