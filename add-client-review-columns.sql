-- Add missing columns for Client Review functionality
ALTER TABLE pharma_seo_submissions
ADD COLUMN IF NOT EXISTS priority_level text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS client_review_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS client_feedback text,
ADD COLUMN IF NOT EXISTS client_approval_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS compliance_id text,
ADD COLUMN IF NOT EXISTS submitter_name text,
ADD COLUMN IF NOT EXISTS submitter_email text,
ADD COLUMN IF NOT EXISTS submitter_company text,
ADD COLUMN IF NOT EXISTS ai_output text,
ADD COLUMN IF NOT EXISTS raw_input_content text,
ADD COLUMN IF NOT EXISTS seo_reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS seo_reviewed_by text,
ADD COLUMN IF NOT EXISTS dosage_form text,
ADD COLUMN IF NOT EXISTS medical_indication text,
ADD COLUMN IF NOT EXISTS positioning text,
ADD COLUMN IF NOT EXISTS stage text;

-- Add check constraints for enums
ALTER TABLE pharma_seo_submissions
ADD CONSTRAINT priority_level_check CHECK (priority_level IN ('high', 'medium', 'low')),
ADD CONSTRAINT client_review_status_check CHECK (client_review_status IN ('pending', 'approved', 'revision_requested'));

-- Update workflow_stage values to support client review
UPDATE pharma_seo_submissions
SET workflow_stage = 'client_review'
WHERE workflow_stage = 'seo_review'
AND langchain_status = 'completed'
AND ai_generated_content IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_review_status ON pharma_seo_submissions(client_review_status);
CREATE INDEX IF NOT EXISTS idx_priority_level ON pharma_seo_submissions(priority_level);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_status ON pharma_seo_submissions(workflow_stage, langchain_status);
