-- UP Migration
-- Add missing tables required by the application code and PRD

-- Table for encryption metadata (referenced in genomicEncryption.service.ts)
CREATE TABLE IF NOT EXISTS encryption_metadata (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL, -- Using VARCHAR(64) for consistency with users table
  salt VARCHAR(64) NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  algorithm VARCHAR(20) NOT NULL DEFAULT 'aes-256-gcm',
  iterations INTEGER NOT NULL DEFAULT 100000,
  encrypted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  re_encrypted_at TIMESTAMP DEFAULT NULL,
  access_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

-- Table for IPFS CID to commitment hash mappings (referenced in ipfs.service.ts)
CREATE TABLE IF NOT EXISTS ipfs_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL, -- Using VARCHAR(64) for consistency
  cid VARCHAR(100) NOT NULL,
  commitment_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  UNIQUE(user_id),
  CONSTRAINT fk_ipfs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification requests table (required by PRD FR-031 to FR-037)
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  doctor_id VARCHAR(64) NOT NULL,
  trait_type VARCHAR(20) NOT NULL CHECK (trait_type IN ('BRCA1', 'BRCA2', 'CYP2D6', 'HER2', 'APOE')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  requirements JSONB DEFAULT NULL, -- Store complex requirements as JSON
  proof_hash VARCHAR(66) DEFAULT NULL,
  proof_id UUID DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP DEFAULT NULL,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  deleted_at TIMESTAMP DEFAULT NULL,
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_proof FOREIGN KEY (proof_id) REFERENCES proofs(id) ON DELETE SET NULL
);

-- Add role column to users table if not exists (required by PRD)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'patient'
      CHECK (role IN ('patient', 'doctor', 'researcher', 'admin'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_encryption_metadata_patient ON encryption_metadata(patient_id);
CREATE INDEX IF NOT EXISTS idx_encryption_metadata_active ON encryption_metadata(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ipfs_mappings_user ON ipfs_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_ipfs_mappings_cid ON ipfs_mappings(cid);
CREATE INDEX IF NOT EXISTS idx_verification_requests_patient ON verification_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_doctor ON verification_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created ON verification_requests(created_at DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_encryption_metadata_updated_at
  BEFORE UPDATE ON encryption_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipfs_mappings_updated_at
  BEFORE UPDATE ON ipfs_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN Migration
DROP TRIGGER IF EXISTS update_encryption_metadata_updated_at ON encryption_metadata;
DROP TRIGGER IF EXISTS update_ipfs_mappings_updated_at ON ipfs_mappings;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS ipfs_mappings CASCADE;
DROP TABLE IF EXISTS encryption_metadata CASCADE;
-- Note: Not dropping role column from users as it may contain data