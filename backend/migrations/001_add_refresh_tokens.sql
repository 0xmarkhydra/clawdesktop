-- Migration: Add refresh tokens table
-- Created: 2026-03-16
-- Description: Add refresh_tokens table for JWT refresh token management

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_refresh_tokens_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Indexes for performance
    CONSTRAINT idx_refresh_tokens_token_hash 
        UNIQUE (token_hash),
    
    -- Index on user_id for faster lookups
    INDEX idx_refresh_tokens_user_id (user_id),
    
    -- Index on expires_at for cleanup queries
    INDEX idx_refresh_tokens_expires_at (expires_at),
    
    -- Composite index for active tokens
    INDEX idx_refresh_tokens_active (user_id, is_active, expires_at)
);

-- Add comment to table
COMMENT ON TABLE refresh_tokens IS 'Stores JWT refresh tokens for user session management';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA256 hash of the refresh token';
COMMENT ON COLUMN refresh_tokens.device_info IS 'JSON object containing device information (userAgent, IP, deviceId)';
COMMENT ON COLUMN refresh_tokens.is_active IS 'Whether the token is still valid and not revoked';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_refresh_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_refresh_tokens_updated_at
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_refresh_tokens_updated_at();

-- Insert sample data for testing (optional)
-- INSERT INTO refresh_tokens (token_hash, user_id, expires_at, device_info, is_active)
-- VALUES (
--     'sample_token_hash_for_testing',
--     (SELECT id FROM users LIMIT 1),
--     CURRENT_TIMESTAMP + INTERVAL '7 days',
--     '{"userAgent": "Mozilla/5.0", "ip": "127.0.0.1", "deviceId": "test_device"}',
--     true
-- );

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'refresh_tokens' 
ORDER BY ordinal_position;