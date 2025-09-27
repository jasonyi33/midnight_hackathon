-- Add soft delete columns to all tables
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE genome_commitments
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE verification_requests
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE audit_log
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE proof_cache
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- Add indexes for soft delete queries (optimized for WHERE deleted_at IS NULL)
CREATE INDEX idx_users_active ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_genome_commitments_active ON genome_commitments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_verification_requests_active ON verification_requests(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_audit_log_active ON audit_log(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_proof_cache_active ON proof_cache(deleted_at) WHERE deleted_at IS NULL;

-- Update unique constraints to exclude soft deleted records
DROP INDEX IF EXISTS genome_commitments_user_id_commitment_hash_key;
CREATE UNIQUE INDEX genome_commitments_user_id_commitment_hash_key
ON genome_commitments(user_id, commitment_hash)
WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS proof_cache_user_id_trait_type_key;
CREATE UNIQUE INDEX proof_cache_user_id_trait_type_key
ON proof_cache(user_id, trait_type)
WHERE deleted_at IS NULL;

-- Create function for soft delete cascade
CREATE OR REPLACE FUNCTION cascade_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user is soft deleted, soft delete their related records
    IF TG_TABLE_NAME = 'users' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        UPDATE genome_commitments
        SET deleted_at = NEW.deleted_at
        WHERE user_id = NEW.id AND deleted_at IS NULL;

        UPDATE verification_requests
        SET deleted_at = NEW.deleted_at
        WHERE (patient_id = NEW.id OR doctor_id = NEW.id) AND deleted_at IS NULL;

        UPDATE proof_cache
        SET deleted_at = NEW.deleted_at
        WHERE user_id = NEW.id AND deleted_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for cascade soft deletes
CREATE TRIGGER trigger_cascade_soft_delete
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION cascade_soft_delete();