-- Genomic Privacy DApp Database Schema
-- PostgreSQL 15+

-- Create database if not exists
-- CREATE DATABASE genomic_privacy;

-- Use the database
-- \c genomic_privacy;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS proof_records CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS genome_commitments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================
-- Core User Table
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(66) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'researcher', 'admin')),
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_users_wallet (wallet_address),
    INDEX idx_users_role (role),
    INDEX idx_users_deleted (deleted_at)
);

-- ================================
-- Genome Commitments Table
-- ================================
CREATE TABLE genome_commitments (
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
    deleted_at TIMESTAMP NULL,
    INDEX idx_genome_patient (patient_id),
    INDEX idx_genome_commitment (commitment_hash),
    INDEX idx_genome_cid (ipfs_cid),
    INDEX idx_genome_deleted (deleted_at)
);

-- ================================
-- Verification Requests Table
-- ================================
CREATE TABLE verification_requests (
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
    deleted_at TIMESTAMP NULL,
    INDEX idx_verification_patient (patient_id),
    INDEX idx_verification_doctor (doctor_id),
    INDEX idx_verification_status (status),
    INDEX idx_verification_expires (expires_at),
    INDEX idx_verification_deleted (deleted_at)
);

-- ================================
-- Proof Records Table
-- ================================
CREATE TABLE proof_records (
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
    deleted_at TIMESTAMP NULL,
    INDEX idx_proof_patient (patient_id),
    INDEX idx_proof_doctor (doctor_id),
    INDEX idx_proof_request (verification_request_id),
    INDEX idx_proof_trait (trait_type),
    INDEX idx_proof_status (status),
    INDEX idx_proof_deleted (deleted_at)
);

-- ================================
-- Audit Log Table
-- ================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    correlation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_resource (resource_type, resource_id),
    INDEX idx_audit_correlation (correlation_id),
    INDEX idx_audit_created (created_at DESC)
);

-- ================================
-- Aggregated Statistics Table (for researchers)
-- ================================
CREATE TABLE aggregated_stats (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stats_type (stat_type),
    INDEX idx_stats_trait (trait_type),
    INDEX idx_stats_period (period_start, period_end)
);

-- ================================
-- Session Management Table
-- ================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token_hash VARCHAR(66) NOT NULL,
    refresh_token_hash VARCHAR(66) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    INDEX idx_session_user (user_id),
    INDEX idx_session_access (access_token_hash),
    INDEX idx_session_refresh (refresh_token_hash),
    INDEX idx_session_expires (expires_at)
);

-- ================================
-- Jobs Queue Status Table (for Bull queue tracking)
-- ================================
CREATE TABLE job_status (
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
    completed_at TIMESTAMP,
    INDEX idx_job_id (job_id),
    INDEX idx_job_user (user_id),
    INDEX idx_job_status (status),
    INDEX idx_job_type (job_type)
);

-- ================================
-- Functions and Triggers
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genome_commitments_updated_at BEFORE UPDATE ON genome_commitments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aggregated_stats_updated_at BEFORE UPDATE ON aggregated_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Views for Common Queries
-- ================================

-- View for active verification requests
CREATE OR REPLACE VIEW active_verifications AS
SELECT
    vr.*,
    p.wallet_address as patient_wallet,
    p.name as patient_name,
    d.wallet_address as doctor_wallet,
    d.name as doctor_name
FROM verification_requests vr
JOIN users p ON vr.patient_id = p.id
JOIN users d ON vr.doctor_id = d.id
WHERE vr.status = 'pending'
    AND vr.expires_at > CURRENT_TIMESTAMP
    AND vr.deleted_at IS NULL;

-- View for proof statistics
CREATE OR REPLACE VIEW proof_statistics AS
SELECT
    trait_type,
    COUNT(*) as total_proofs,
    COUNT(DISTINCT patient_id) as unique_patients,
    AVG(generation_time_ms) as avg_generation_time,
    COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count
FROM proof_records
WHERE deleted_at IS NULL
GROUP BY trait_type;

-- ================================
-- Initial Indexes for Performance
-- ================================

-- Composite indexes for common queries
CREATE INDEX idx_verification_pending ON verification_requests(patient_id, status)
    WHERE status = 'pending' AND deleted_at IS NULL;

CREATE INDEX idx_proof_recent ON proof_records(patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_genome_latest ON genome_commitments(patient_id, upload_date DESC)
    WHERE deleted_at IS NULL;

-- ================================
-- Row Level Security (optional, for production)
-- ================================

-- Enable RLS on sensitive tables (uncomment for production)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE genome_commitments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proof_records ENABLE ROW LEVEL SECURITY;

-- ================================
-- Initial Data / Permissions
-- ================================

-- Grant permissions to application user (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO genomic_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO genomic_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO genomic_app;

-- ================================
-- Comments for Documentation
-- ================================

COMMENT ON TABLE users IS 'Core user accounts with wallet-based authentication';
COMMENT ON TABLE genome_commitments IS 'Encrypted genome data commitments stored on IPFS';
COMMENT ON TABLE verification_requests IS 'Doctor requests for patient genetic verification';
COMMENT ON TABLE proof_records IS 'Zero-knowledge proof generation records';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for compliance';
COMMENT ON TABLE aggregated_stats IS 'Pre-computed statistics for researcher portal';
COMMENT ON TABLE sessions IS 'JWT session management and tracking';
COMMENT ON TABLE job_status IS 'Background job queue status tracking';

-- End of schema