-- Remove all langchain columns from pharma_seo_submissions table
ALTER TABLE pharma_seo_submissions 
DROP COLUMN IF EXISTS langchain_phase,
DROP COLUMN IF EXISTS langchain_status,
DROP COLUMN IF EXISTS langchain_retry_count,
DROP COLUMN IF EXISTS langchain_error,
DROP COLUMN IF EXISTS langchain_last_retry;

-- Add comment to document the removal
COMMENT ON TABLE pharma_seo_submissions IS 'Main submissions table for pharma SEO content requests - langchain columns removed 2025-07-25';
