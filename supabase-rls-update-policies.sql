-- Row Level Security (RLS) Policies for Editable Dashboard
-- These policies control who can update submissions in the dashboard

-- Enable RLS on submissions table if not already enabled
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing update policies if they exist
DROP POLICY IF EXISTS "Enable updates for authenticated users" ON submissions;
DROP POLICY IF EXISTS "Enable updates for SEO reviewers" ON submissions;
DROP POLICY IF EXISTS "Enable updates for all users (temporary)" ON submissions;

-- Policy 1: Allow all authenticated users to update SEO fields
-- Use this for development/demo purposes
CREATE POLICY "Enable updates for all users (temporary)"
  ON submissions
  FOR UPDATE
  USING (true)  -- Allow access to all rows
  WITH CHECK (true);  -- Allow all updates

-- Policy 2: Production - Only allow updates to specific SEO fields
-- Uncomment this for production use
/*
CREATE POLICY "Enable updates for SEO reviewers"
  ON submissions
  FOR UPDATE
  USING (
    -- Check if user is authenticated
    auth.uid() IS NOT NULL
    -- Additional checks can be added here:
    -- AND auth.jwt()->>'email' IN (SELECT email FROM seo_reviewers)
    -- AND workflow_stage IN ('ai_completed', 'seo_review', 'seo_reviewed')
  )
  WITH CHECK (
    -- Only allow updates to SEO-related fields
    -- This prevents users from modifying critical fields
    (
      -- List of allowed fields for update
      COALESCE(seo_title = OLD.seo_title, true) AND
      COALESCE(meta_title = OLD.meta_title, true) AND
      COALESCE(meta_description = OLD.meta_description, true) AND
      COALESCE(seo_strategy_outline = OLD.seo_strategy_outline, true) AND
      COALESCE(h1_tag = OLD.h1_tag, true) AND
      COALESCE(seo_internal_notes = OLD.seo_internal_notes, true) AND
      COALESCE(seo_reviewed_at = OLD.seo_reviewed_at, true) AND
      COALESCE(seo_reviewed_by = OLD.seo_reviewed_by, true) AND
      COALESCE(last_edited_by = OLD.last_edited_by, true) AND
      COALESCE(last_edited_at = OLD.last_edited_at, true) AND
      COALESCE(workflow_stage = OLD.workflow_stage, true)
    )
  );
*/

-- Policy 3: Role-based access control (advanced)
-- This requires setting up custom roles in Supabase Auth
/*
CREATE POLICY "Enable updates based on user role"
  ON submissions
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    (
      -- Admin can update anything
      auth.jwt()->>'role' = 'admin' OR
      -- SEO specialist can update SEO fields
      (auth.jwt()->>'role' = 'seo_specialist' AND workflow_stage IN ('ai_completed', 'seo_review')) OR
      -- Client can only update their own submissions
      (auth.jwt()->>'role' = 'client' AND client_id = auth.jwt()->>'client_id')
    )
  )
  WITH CHECK (
    -- Different field restrictions based on role
    CASE auth.jwt()->>'role'
      WHEN 'admin' THEN true  -- Admin can update any field
      WHEN 'seo_specialist' THEN
        -- SEO specialist can only update SEO fields
        product_name = OLD.product_name AND
        therapeutic_area = OLD.therapeutic_area AND
        submitter_email = OLD.submitter_email
      WHEN 'client' THEN
        -- Client can only add feedback
        seo_client_feedback != OLD.seo_client_feedback
      ELSE false
    END
  );
*/

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_workflow_stage ON submissions(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_submissions_seo_reviewed_by ON submissions(seo_reviewed_by);
CREATE INDEX IF NOT EXISTS idx_submissions_last_edited_by ON submissions(last_edited_by);

-- Create audit table for tracking changes (optional)
CREATE TABLE IF NOT EXISTS submission_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT DEFAULT 'update'
);

-- Function to track field changes
CREATE OR REPLACE FUNCTION track_submission_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Track SEO title changes
  IF OLD.seo_title IS DISTINCT FROM NEW.seo_title THEN
    INSERT INTO submission_audit_log (submission_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, NEW.last_edited_by, 'seo_title', OLD.seo_title, NEW.seo_title);
  END IF;
  
  -- Track meta description changes
  IF OLD.meta_description IS DISTINCT FROM NEW.meta_description THEN
    INSERT INTO submission_audit_log (submission_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, NEW.last_edited_by, 'meta_description', OLD.meta_description, NEW.meta_description);
  END IF;
  
  -- Track strategy outline changes
  IF OLD.seo_strategy_outline IS DISTINCT FROM NEW.seo_strategy_outline THEN
    INSERT INTO submission_audit_log (submission_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, NEW.last_edited_by, 'seo_strategy_outline', 
            LEFT(OLD.seo_strategy_outline, 255), LEFT(NEW.seo_strategy_outline, 255));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS track_submission_updates ON submissions;
CREATE TRIGGER track_submission_updates
  AFTER UPDATE ON submissions
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION track_submission_changes();

-- Grant permissions for anonymous users (development only)
-- Remove this in production and use authenticated users instead
GRANT SELECT, UPDATE ON submissions TO anon;
GRANT SELECT, INSERT ON submission_audit_log TO anon;

-- View to get latest changes
CREATE OR REPLACE VIEW recent_submission_changes AS
SELECT 
  s.product_name,
  s.therapeutic_area,
  al.field_name,
  al.old_value,
  al.new_value,
  al.changed_by,
  al.changed_at
FROM submission_audit_log al
JOIN submissions s ON al.submission_id = s.id
ORDER BY al.changed_at DESC
LIMIT 100;

-- Grant read access to the view
GRANT SELECT ON recent_submission_changes TO anon;

-- Test the policies
-- You can test these policies with:
/*
-- Test 1: Try to update as anonymous user
UPDATE submissions 
SET seo_title = 'New SEO Title'
WHERE id = 'some-uuid';

-- Test 2: Check audit log
SELECT * FROM submission_audit_log 
WHERE submission_id = 'some-uuid'
ORDER BY changed_at DESC;

-- Test 3: View recent changes
SELECT * FROM recent_submission_changes;
*/