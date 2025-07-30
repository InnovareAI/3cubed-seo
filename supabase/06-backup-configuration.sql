-- Automated backup and point-in-time recovery configuration
-- Note: Most backup features are configured at the Supabase project level

-- Create backup status monitoring table
CREATE TABLE IF NOT EXISTS backup_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type text NOT NULL, -- 'daily', 'weekly', 'on-demand'
  status text NOT NULL, -- 'running', 'completed', 'failed'
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  size_bytes bigint,
  backup_location text,
  retention_days integer DEFAULT 30,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb
);

-- Function to check backup health
CREATE OR REPLACE FUNCTION check_backup_health()
RETURNS TABLE (
  backup_type text,
  last_backup timestamptz,
  status text,
  days_since_last_backup integer,
  health_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.backup_type,
    MAX(bs.completed_at) as last_backup,
    bs.status,
    EXTRACT(days FROM now() - MAX(bs.completed_at))::integer as days_since_last_backup,
    CASE 
      WHEN MAX(bs.completed_at) IS NULL THEN 'NO_BACKUPS'
      WHEN EXTRACT(days FROM now() - MAX(bs.completed_at)) > 7 THEN 'CRITICAL'
      WHEN EXTRACT(days FROM now() - MAX(bs.completed_at)) > 3 THEN 'WARNING'
      ELSE 'HEALTHY'
    END as health_status
  FROM backup_status bs
  WHERE bs.status = 'completed'
  GROUP BY bs.backup_type, bs.status
  ORDER BY last_backup DESC;
END;
$$ LANGUAGE plpgsql;

-- Create data export function for critical submissions
CREATE OR REPLACE FUNCTION export_critical_submissions()
RETURNS jsonb AS $$
DECLARE
  export_data jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'product_name', s.product_name,
      'indication', s.indication,
      'therapeutic_area', s.therapeutic_area,
      'workflow_stage', s.workflow_stage,
      'qa_status', s.qa_status,
      'qa_score', s.qa_score,
      'medical_accuracy_score', s.medical_accuracy_score,
      'ai_generated_content', s.ai_generated_content,
      'fda_comprehensive_data', s.fda_comprehensive_data,
      'regulatory_disclaimers', s.regulatory_disclaimers,
      'created_at', s.created_at,
      'updated_at', s.updated_at
    )
  ) INTO export_data
  FROM submissions s
  WHERE s.qa_status = 'approved' 
     OR s.workflow_stage = 'completed'
     OR s.medical_accuracy_score >= 90;
  
  -- Log the export
  INSERT INTO backup_status (
    backup_type,
    status,
    completed_at,
    size_bytes,
    backup_location,
    metadata
  ) VALUES (
    'critical_export',
    'completed',
    now(),
    octet_length(export_data::text),
    'local_export',
    jsonb_build_object('record_count', jsonb_array_length(export_data))
  );
  
  RETURN export_data;
END;
$$ LANGUAGE plpgsql;

-- Recovery point tracking
CREATE TABLE IF NOT EXISTS recovery_points (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  point_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  submission_count integer,
  data_snapshot jsonb,
  can_restore_to boolean DEFAULT true
);

-- Function to create recovery point
CREATE OR REPLACE FUNCTION create_recovery_point(point_name text, description text DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
  recovery_id uuid;
  submission_count integer;
BEGIN
  SELECT COUNT(*) INTO submission_count FROM submissions;
  
  INSERT INTO recovery_points (
    point_name,
    description,
    submission_count,
    data_snapshot
  ) VALUES (
    point_name,
    COALESCE(description, 'Automated recovery point'),
    submission_count,
    jsonb_build_object(
      'timestamp', now(),
      'submission_count', submission_count,
      'database_size', pg_database_size(current_database())
    )
  ) RETURNING id INTO recovery_id;
  
  RETURN recovery_id;
END;
$$ LANGUAGE plpgsql;

-- Automated recovery point creation (called via cron or webhook)
CREATE OR REPLACE FUNCTION auto_create_recovery_points()
RETURNS void AS $$
BEGIN
  -- Daily recovery point
  IF NOT EXISTS (
    SELECT 1 FROM recovery_points 
    WHERE point_name LIKE 'daily_%' 
    AND created_at >= date_trunc('day', now())
  ) THEN
    PERFORM create_recovery_point(
      'daily_' || to_char(now(), 'YYYY_MM_DD'),
      'Automated daily recovery point'
    );
  END IF;
  
  -- Weekly recovery point (Sundays)
  IF EXTRACT(dow FROM now()) = 0 AND NOT EXISTS (
    SELECT 1 FROM recovery_points 
    WHERE point_name LIKE 'weekly_%' 
    AND created_at >= date_trunc('week', now())
  ) THEN
    PERFORM create_recovery_point(
      'weekly_' || to_char(now(), 'YYYY_WW'),
      'Automated weekly recovery point'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;