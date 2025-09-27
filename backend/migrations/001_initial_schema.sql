-- UP Migration
-- Initial schema for Genomic Privacy DApp

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY, -- Deterministic hash from wallet address
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    nonce VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Genome commitments table
CREATE TABLE IF NOT EXISTS genome_commitments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    commitment_hash VARCHAR(66) UNIQUE NOT NULL,
    ipfs_cid VARCHAR(100) NOT NULL,
    encrypted_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_user_commitments (user_id),
    INDEX idx_commitment_hash (commitment_hash)
);

-- Proofs table
CREATE TABLE IF NOT EXISTS proofs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    trait_type VARCHAR(20) NOT NULL,
    proof_hash VARCHAR(66) UNIQUE NOT NULL,
    proof_data TEXT NOT NULL,
    public_inputs JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_user_proofs (user_id),
    INDEX idx_proof_hash (proof_hash),
    INDEX idx_status (status)
);

-- Access grants table
CREATE TABLE IF NOT EXISTS access_grants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grantor_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    grantee_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    genome_commitment_id UUID REFERENCES genome_commitments(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_grantor (grantor_id),
    INDEX idx_grantee (grantee_id)
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_user_tokens (user_id),
    INDEX idx_token_hash (token_hash)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    metadata JSON,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_logs (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN Migration
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS access_grants CASCADE;
DROP TABLE IF EXISTS proofs CASCADE;
DROP TABLE IF EXISTS genome_commitments CASCADE;
DROP TABLE IF EXISTS users CASCADE;