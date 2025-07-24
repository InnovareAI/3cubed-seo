-- SQL to fix Supabase permissions for form submission
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on pharma_seo_submissions table
ALTER TABLE pharma_seo_submissions ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON pharma_seo_submissions
FOR INSERT 
TO anon
WITH CHECK (true);

-- 3. Create policy to allow authenticated users to read their own submissions
CREATE POLICY "Users can read own submissions" ON pharma_seo_submissions
FOR SELECT
TO authenticated
USING (submitter_email = auth.email());

-- 4. Create policy to allow all reads for now (temporary for debugging)
CREATE POLICY "Allow all reads temporarily" ON pharma_seo_submissions
FOR SELECT
TO anon
USING (true);

-- 5. Grant necessary permissions
GRANT INSERT ON pharma_seo_submissions TO anon;
GRANT SELECT ON pharma_seo_submissions TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- 6. Ensure the table has proper constraints
ALTER TABLE pharma_seo_submissions 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now(),
ALTER COLUMN ai_processing_status SET DEFAULT 'pending',
ALTER COLUMN workflow_stage SET DEFAULT 'Form_Submitted',
ALTER COLUMN priority_level SET DEFAULT 'Medium';
