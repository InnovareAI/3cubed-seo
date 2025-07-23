-- Add missing meta fields to pharma_seo_submissions table
-- These fields are required by the n8n workflow for SEO content generation

ALTER TABLE pharma_seo_submissions 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add constraints for meta fields
ALTER TABLE pharma_seo_submissions 
ADD CONSTRAINT meta_title_length CHECK (LENGTH(meta_title) <= 60),
ADD CONSTRAINT meta_description_length CHECK (LENGTH(meta_description) <= 160);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharma_seo_submissions_meta_title ON pharma_seo_submissions(meta_title);
CREATE INDEX IF NOT EXISTS idx_pharma_seo_submissions_meta_description ON pharma_seo_submissions(meta_description);

-- Update the view if it exists
CREATE OR REPLACE VIEW pharma_seo_submissions_view AS
SELECT 
    id,
    created_at,
    updated_at,
    product_name,
    therapeutic_area,
    stage,
    development_stage,
    indication,
    medical_indication,
    target_regions,
    geography,
    workflow_stage,
    ai_processing_status,
    qa_status,
    qa_score,
    qa_feedback,
    qa_reviewed_at,
    error_message,
    last_updated,
    ai_generated_content,
    processing_metadata,
    seo_content_sections,
    clinical_trials_data,
    competitive_analysis,
    compliance_notes,
    target_messaging,
    mechanism_of_action,
    target_audience,
    priority_level,
    submitter_name,
    submitter_email,
    langchain_status,
    seo_keywords,
    client_id,
    project_id,
    client_name_display,
    project_name_display,
    ready_for_seo_review,
    has_keywords,
    meta_title,
    meta_description
FROM pharma_seo_submissions;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON pharma_seo_submissions TO authenticated;
GRANT SELECT ON pharma_seo_submissions_view TO authenticated;

-- Add RLS policies if needed
ALTER TABLE pharma_seo_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pharma_seo_submissions' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON pharma_seo_submissions
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pharma_seo_submissions' 
        AND policyname = 'Enable write access for all users'
    ) THEN
        CREATE POLICY "Enable write access for all users" ON pharma_seo_submissions
            FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Enable update for all users" ON pharma_seo_submissions
            FOR UPDATE USING (true);
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN pharma_seo_submissions.meta_title IS 'SEO meta title (max 60 characters)';
COMMENT ON COLUMN pharma_seo_submissions.meta_description IS 'SEO meta description (max 160 characters)';
