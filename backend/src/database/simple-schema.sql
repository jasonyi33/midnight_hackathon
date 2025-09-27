-- Genomic Privacy DApp Database Schema (Simplified)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(66) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'researcher', 'admin')),
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Genome commitments table
CREATE TABLE IF NOT EXISTS genome_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commitment_hash VARCHAR(66) NOT NULL UNIQUE,
    ipfs_cid VARCHAR(255) NOT NULL,
    encryption_key_hash VARCHAR(66),
    encryption_metadata JSONB DEFAULT '{}',
    traits_available TEXT[] DEFAULT '{}',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_traits TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    message TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    response_message TEXT,
    proof_ids UUID[] DEFAULT '{}',
    deleted_at TIMESTAMP NULL
);

-- Proof records table
CREATE TABLE IF NOT EXISTS proof_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verification_request_id UUID REFERENCES verification_requests(id) ON DELETE SET NULL,
    trait_type VARCHAR(50) NOT NULL,
    proof_hash VARCHAR(66) NOT NULL,
    proof_data JSONB NOT NULL,
    verification_key VARCHAR(255),
    blockchain_tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'verified')),
    generation_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    correlation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token_hash VARCHAR(66) NOT NULL,
    refresh_token_hash VARCHAR(66) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Job status table
CREATE TABLE IF NOT EXISTS job_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    result JSONB,
    error TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Aggregated stats table
CREATE TABLE IF NOT EXISTS aggregated_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type VARCHAR(100) NOT NULL,
    trait_type VARCHAR(50),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_count INTEGER DEFAULT 0,
    positive_count INTEGER DEFAULT 0,
    frequency DECIMAL(5, 4),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_genome_patient ON genome_commitments(patient_id);
CREATE INDEX IF NOT EXISTS idx_verification_patient ON verification_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_verification_doctor ON verification_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_proof_patient ON proof_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_session_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_user ON job_status(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_type ON aggregated_stats(stat_type);