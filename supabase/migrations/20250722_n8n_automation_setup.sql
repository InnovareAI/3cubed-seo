-- Fix for n8n automation compatibility
-- This ensures the automation can work with the existing submissions table

-- Add any missing columns for the automation
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS development_stage VARCHAR,
ADD COLUMN IF NOT EXISTS indication VARCHAR,
ADD COLUMN IF NOT EXISTS geography VARCHAR,
ADD COLUMN IF NOT EXISTS target_regions JSONB,
ADD COLUMN IF NOT EXISTS competitive_products JSONB,
ADD COLUMN IF NOT EXISTS ai_generated_content JSONB,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB;

-- Create view for backward compatibility with n8n workflow
CREATE OR REPLACE VIEW pharma_seo_submissions AS
SELECT 
  s.*,
  s.stage as development_stage,
  s.medical_indication as indication,
  ARRAY[s.geography] as target_regions,
  c.name as client_name_display,
  p.name as project_name_display
FROM submissions s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN projects p ON s.project_id = p.id;

-- Grant permissions
GRANT ALL ON pharma_seo_submissions TO authenticated;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_submissions_ai_processing_status ON submissions(ai_processing_status);

-- Function to trigger n8n webhook when new submission is created
CREATE OR REPLACE FUNCTION trigger_n8n_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  response TEXT;
BEGIN
  -- Only trigger for new submissions in the correct stage
  IF NEW.workflow_stage = 'form_submitted' THEN
    -- Update to trigger automation
    UPDATE submissions 
    SET workflow_stage = 'ai_processing',
        ai_processing_status = 'pending'
    WHERE id = NEW.id;
    
    -- Log the trigger (you can enable actual webhook call here)
    INSERT INTO seo_automation_logs (
      submission_id,
      automation_type,
      status,
      details
    ) VALUES (
      NEW.id,
      'n8n_webhook_trigger',
      'triggered',
      jsonb_build_object(
        'product_name', NEW.product_name,
        'therapeutic_area', NEW.therapeutic_area,
        'triggered_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new submissions
DROP TRIGGER IF EXISTS trigger_seo_automation ON submissions;
CREATE TRIGGER trigger_seo_automation
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION trigger_n8n_webhook();

-- Update function for the updated_at column
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_updated
CREATE TRIGGER update_submissions_last_updated BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_last_updated_column();