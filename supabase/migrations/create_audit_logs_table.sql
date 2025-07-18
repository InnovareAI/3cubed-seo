-- Create audit_logs table for 21 CFR Part 11 compliance
-- This table is immutable - records can only be inserted, never updated or deleted

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Entity tracking
  entity_type TEXT NOT NULL, -- e.g., 'submission', 'user', 'client', 'project'
  entity_id TEXT NOT NULL,   -- ID of the entity being audited
  
  -- Action details
  action TEXT NOT NULL,      -- e.g., 'created', 'updated', 'approved', 'rejected'
  changes JSONB,             -- JSON object containing before/after values
  
  -- User tracking
  user_id TEXT,              -- ID of the user who performed the action
  user_email TEXT,           -- Email of the user (denormalized for compliance)
  
  -- Request metadata
  ip_address TEXT,           -- Client IP address
  user_agent TEXT,           -- Browser/client information
  
  -- Compliance fields
  status TEXT DEFAULT 'success', -- 'success', 'error', 'warning'
  error_message TEXT,        -- Error details if status is 'error'
  
  -- Timestamp (immutable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can insert audit logs
CREATE POLICY "Enable insert for authenticated users" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policy: Only allow reading audit logs (no updates or deletes for compliance)
CREATE POLICY "Enable read access for authenticated users" ON audit_logs
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Prevent ALL updates (21 CFR Part 11 compliance)
CREATE POLICY "Prevent updates" ON audit_logs
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy: Prevent ALL deletes (21 CFR Part 11 compliance)
CREATE POLICY "Prevent deletes" ON audit_logs
  FOR DELETE TO authenticated
  USING (false);

-- Create a function to ensure created_at cannot be overridden
CREATE OR REPLACE FUNCTION enforce_audit_log_immutability()
RETURNS TRIGGER AS $$
BEGIN
  -- Always use the current timestamp, ignore any provided value
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce immutability
CREATE TRIGGER enforce_audit_log_immutability_trigger
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION enforce_audit_log_immutability();

-- Create a view for common audit queries
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT 
  DATE(created_at) as audit_date,
  entity_type,
  action,
  COUNT(*) as count,
  COUNT(DISTINCT user_email) as unique_users
FROM audit_logs
GROUP BY DATE(created_at), entity_type, action
ORDER BY audit_date DESC, entity_type, action;

-- Add comment for compliance documentation
COMMENT ON TABLE audit_logs IS '21 CFR Part 11 compliant audit log table. Records are immutable and cannot be modified or deleted after creation. All changes to regulated data must be logged here.';

-- Sample audit log entries for different actions
/*
-- Example: Submission created
INSERT INTO audit_logs (entity_type, entity_id, action, changes, user_email, ip_address)
VALUES (
  'submission',
  '123e4567-e89b-12d3-a456-426614174000',
  'submission_created',
  '{"product_name": "KEYTRUDA", "therapeutic_area": "Oncology"}',
  'user@example.com',
  '192.168.1.100'
);

-- Example: Content approved
INSERT INTO audit_logs (entity_type, entity_id, action, changes, user_email, ip_address)
VALUES (
  'submission',
  '123e4567-e89b-12d3-a456-426614174000',
  'content_approved',
  '{"workflow_stage": {"from": "Review", "to": "Approved"}, "approver_notes": "All claims verified"}',
  'reviewer@example.com',
  '192.168.1.101'
);

-- Example: SEO keywords updated
INSERT INTO audit_logs (entity_type, entity_id, action, changes, user_email, ip_address)
VALUES (
  'submission',
  '123e4567-e89b-12d3-a456-426614174000',
  'seo_keywords_updated',
  '{"keywords": {"added": ["immunotherapy", "PD-1 inhibitor"], "removed": ["cancer treatment"]}}',
  'seo@example.com',
  '192.168.1.102'
);
*/