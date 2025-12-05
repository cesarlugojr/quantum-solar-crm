-- QuickBooks Tokens Table Migration
-- Stores OAuth tokens for QuickBooks Online integration

-- ============================================
-- QUICKBOOKS TOKENS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS quickbooks_tokens (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  realm_id VARCHAR(100) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token_expires_at TIMESTAMPTZ NOT NULL,
  refresh_token_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE quickbooks_tokens ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (API)
CREATE POLICY "Allow all for service role" ON quickbooks_tokens FOR ALL USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE quickbooks_tokens IS 'Stores OAuth tokens for QuickBooks Online integration';
COMMENT ON COLUMN quickbooks_tokens.id IS 'Unique identifier (default for single connection)';
COMMENT ON COLUMN quickbooks_tokens.realm_id IS 'QuickBooks Company ID';
COMMENT ON COLUMN quickbooks_tokens.access_token IS 'OAuth access token';
COMMENT ON COLUMN quickbooks_tokens.refresh_token IS 'OAuth refresh token';
