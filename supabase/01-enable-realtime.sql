-- Enable real-time subscriptions for submissions table
-- This allows live dashboard updates as N8N processes submissions

-- Enable real-time for the submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

-- Create a function to notify when submission stage changes
CREATE OR REPLACE FUNCTION notify_workflow_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification when workflow stage changes
  IF OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage THEN
    PERFORM pg_notify('submission_stage_change', 
      json_build_object(
        'id', NEW.id,
        'product_name', NEW.product_name,
        'old_stage', OLD.workflow_stage,
        'new_stage', NEW.workflow_stage,
        'timestamp', NOW()
      )::text
    );
  END IF;
  
  -- Send notification when AI processing status changes
  IF OLD.ai_processing_status IS DISTINCT FROM NEW.ai_processing_status THEN
    PERFORM pg_notify('ai_processing_update',
      json_build_object(
        'id', NEW.id,
        'product_name', NEW.product_name,
        'status', NEW.ai_processing_status,
        'timestamp', NOW()
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workflow stage changes
DROP TRIGGER IF EXISTS trigger_workflow_stage_change ON submissions;
CREATE TRIGGER trigger_workflow_stage_change
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_workflow_stage_change();

-- Create indexes for real-time performance
CREATE INDEX IF NOT EXISTS idx_submissions_workflow_stage ON submissions(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_submissions_ai_processing_status ON submissions(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_submissions_updated_at ON submissions(updated_at);

-- Grant permissions for real-time
GRANT SELECT ON submissions TO anon;
GRANT SELECT ON submissions TO authenticated;