-- Add missing columns to audit_logs table if they don't exist

-- Add status column
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success';

-- Add error_message column
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add comment on status column
COMMENT ON COLUMN audit_logs.status IS 'Status of the action: success, warning, or error';
COMMENT ON COLUMN audit_logs.error_message IS 'Error details if status is error';