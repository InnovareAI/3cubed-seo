-- Comprehensive audit logging system for pharmaceutical data compliance
-- Tracks all changes to submissions for regulatory compliance

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_role text,
  ip_address inet,
  user_agent text,
  session_id text,
  compliance_impact text,
  created_at timestamptz DEFAULT now(),
  INDEX ON (table_name, record_id),
  INDEX ON (user_id),
  INDEX ON (created_at),
  INDEX ON (action)
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see audit logs for their own submissions
CREATE POLICY "Users see own submission audits" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = audit_logs.record_id
      AND (s.submitter_email = (auth.jwt() ->> 'email') OR
           s.seo_reviewer_email = (auth.jwt() ->> 'email') OR
           s.client_reviewer_email = (auth.jwt() ->> 'email') OR
           s.mlr_reviewer_email = (auth.jwt() ->> 'email'))
    )
  );

-- Policy: Admin users can see all audit logs
CREATE POLICY "Admins see all audits" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to capture audit information
CREATE OR REPLACE FUNCTION capture_audit_info()
RETURNS jsonb AS $$
DECLARE
  audit_info jsonb;
BEGIN
  audit_info := jsonb_build_object(
    'user_id', auth.uid(),
    'user_email', auth.jwt() ->> 'email',
    'user_role', COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'unknown'),
    'session_id', auth.jwt() ->> 'session_id'
  );
  
  RETURN audit_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  audit_info jsonb;
  changed_fields text[];
  old_values jsonb;
  new_values jsonb;
  compliance_impact text := 'low';
BEGIN
  audit_info := capture_audit_info();
  
  -- Determine compliance impact based on changed fields
  IF TG_OP = 'UPDATE' THEN
    -- Get changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(to_jsonb(NEW))
    WHERE key NOT IN ('updated_at', 'last_updated')
    AND to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key;
    
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
    
    -- Determine compliance impact
    IF changed_fields && ARRAY['qa_status', 'qa_score', 'medical_accuracy_score', 'legal_risk_assessment', 'mlr_compliance_checklist'] THEN
      compliance_impact := 'critical';
    ELSIF changed_fields && ARRAY['ai_generated_content', 'regulatory_disclaimers', 'black_box_warnings', 'fda_ema_approval_status'] THEN
      compliance_impact := 'high';
    ELSIF changed_fields && ARRAY['product_name', 'indication', 'mechanism_of_action', 'clinical_benefits'] THEN
      compliance_impact := 'medium';
    END IF;
    
  ELSIF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
    compliance_impact := 'medium';
    
  ELSIF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
    compliance_impact := 'critical';
  END IF;

  -- Insert audit record
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_fields,
    user_id,
    user_email,
    user_role,
    compliance_impact
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_values,
    new_values,
    changed_fields,
    (audit_info ->> 'user_id')::uuid,
    audit_info ->> 'user_email',
    audit_info ->> 'user_role',
    compliance_impact
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger for submissions table
DROP TRIGGER IF EXISTS submissions_audit_trigger ON submissions;
CREATE TRIGGER submissions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger();

-- Create audit trigger for user_profiles table
DROP TRIGGER IF EXISTS user_profiles_audit_trigger ON user_profiles;
CREATE TRIGGER user_profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger();

-- Function to get audit trail for a submission
CREATE OR REPLACE FUNCTION get_submission_audit_trail(submission_id uuid)
RETURNS TABLE (
  id uuid,
  action text,
  changed_fields text[],
  user_email text,
  user_role text,
  compliance_impact text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.action,
    a.changed_fields,
    a.user_email,
    a.user_role,
    a.compliance_impact,
    a.created_at
  FROM audit_logs a
  WHERE a.table_name = 'submissions' 
    AND a.record_id = submission_id
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance-critical audit events
CREATE OR REPLACE FUNCTION get_critical_audit_events(
  start_date timestamptz DEFAULT now() - interval '30 days',
  end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  id uuid,
  table_name text,
  record_id uuid,
  action text,
  user_email text,
  compliance_impact text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.table_name,
    a.record_id,
    a.action,
    a.user_email,
    a.compliance_impact,
    a.created_at
  FROM audit_logs a
  WHERE a.compliance_impact IN ('critical', 'high')
    AND a.created_at BETWEEN start_date AND end_date
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create view for audit summary
CREATE OR REPLACE VIEW audit_summary AS
SELECT 
  table_name,
  action,
  compliance_impact,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_email) as unique_users,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM audit_logs
WHERE created_at >= now() - interval '30 days'
GROUP BY table_name, action, compliance_impact
ORDER BY event_count DESC;