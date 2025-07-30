-- Add missing columns to submissions table
-- Run this in Supabase SQL Editor

-- AI Processing Fields
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ai_output JSONB,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[];

-- FDA Data Fields
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS fda_data JSONB,
ADD COLUMN IF NOT EXISTS fda_data_sources TEXT[],
ADD COLUMN IF NOT EXISTS fda_enrichment_timestamp TIMESTAMP;

-- QA Score Fields
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS qa_score INTEGER,
ADD COLUMN IF NOT EXISTS compliance_score INTEGER,
ADD COLUMN IF NOT EXISTS medical_accuracy INTEGER,
ADD COLUMN IF NOT EXISTS seo_effectiveness INTEGER;

-- Status Fields
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS ai_processing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Dashboard Data
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS dashboard_data JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_stage ON submissions(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_ai_processing_status ON submissions(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at);

-- Update any existing records with default values
UPDATE submissions 
SET 
  workflow_stage = COALESCE(workflow_stage, 'draft'),
  ai_processing_status = COALESCE(ai_processing_status, 'pending')
WHERE workflow_stage IS NULL OR ai_processing_status IS NULL;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions'
ORDER BY ordinal_position;