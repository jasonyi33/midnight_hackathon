-- Create table for user encryption keys
CREATE TABLE IF NOT EXISTS user_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  salt VARCHAR(64) NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  UNIQUE(user_id)
);

-- Create table for key rotation history
CREATE TABLE IF NOT EXISTS user_key_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  salt VARCHAR(64) NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  rotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_user_keys_user_id ON user_keys(user_id);
CREATE INDEX idx_user_keys_active ON user_keys(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_key_history_user_id ON user_key_history(user_id);
CREATE INDEX idx_user_key_history_rotated_at ON user_key_history(rotated_at);

-- Add trigger for updated_at
CREATE TRIGGER update_user_keys_updated_at BEFORE UPDATE ON user_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();