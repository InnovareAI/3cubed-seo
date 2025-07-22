-- Fix SEO Review Tables and Data Structure
-- This migration ensures all tables are properly set up for the SEO review system

-- First, ensure the submissions table has all necessary columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[],
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS geo_optimization_score NUMERIC,
ADD COLUMN IF NOT EXISTS geo_readability_score NUMERIC,
ADD COLUMN IF NOT EXISTS geo_featured_snippet_potential BOOLEAN,
ADD COLUMN IF NOT EXISTS geo_optimization JSONB,
ADD COLUMN IF NOT EXISTS client_review_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS client_approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_feedback TEXT,
ADD COLUMN IF NOT EXISTS sponsor_name VARCHAR;

-- Update workflow_stage constraint to include all stages
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS submissions_workflow_stage_check;

ALTER TABLE submissions 
ADD CONSTRAINT submissions_workflow_stage_check 
CHECK (workflow_stage IN (
  'form_submitted',
  'ai_processing', 
  'seo_review',
  'client_review',
  'revision_requested',
  'mlr_review',
  'published'
));

-- Create pharma_seo_submissions view for Client Review page
CREATE OR REPLACE VIEW pharma_seo_submissions AS
SELECT 
  s.*,
  s.ai_output as ai_generated_content,
  c.name as client_display_name,
  p.name as project_display_name
FROM submissions s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN projects p ON s.project_id = p.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_workflow_stage ON submissions(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_submissions_langchain_status ON submissions(langchain_status);
CREATE INDEX IF NOT EXISTS idx_submissions_client_review_status ON submissions(client_review_status);

-- Create SEO metrics table for tracking performance
CREATE TABLE IF NOT EXISTS seo_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  organic_traffic INTEGER DEFAULT 0,
  keyword_rankings JSONB,
  backlinks_count INTEGER DEFAULT 0,
  page_speed_score INTEGER,
  mobile_friendly BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SEO automation logs table
CREATE TABLE IF NOT EXISTS seo_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id),
  automation_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  details JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_seo_metrics_submission_id ON seo_metrics(submission_id);
CREATE INDEX IF NOT EXISTS idx_seo_automation_logs_submission_id ON seo_automation_logs(submission_id);

-- Update the update_updated_at_column trigger for new tables
CREATE TRIGGER update_seo_metrics_updated_at BEFORE UPDATE ON seo_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON seo_metrics TO authenticated;
GRANT ALL ON seo_automation_logs TO authenticated;
GRANT ALL ON pharma_seo_submissions TO authenticated;
