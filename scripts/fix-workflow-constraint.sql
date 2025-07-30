-- Fix workflow_stage constraint issue

-- First, let's see what the current constraint is
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'submissions'::regclass 
AND contype = 'c';

-- Drop the existing constraint (if it exists)
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS valid_workflow_stage;

-- Add a new constraint with all the workflow stages we need
ALTER TABLE submissions 
ADD CONSTRAINT valid_workflow_stage 
CHECK (workflow_stage IN (
    'draft',
    'form_submitted',
    'ai_processing',
    'fda_enrichment',
    'content_generation',
    'qa_review',
    'seo_review',
    'client_review',
    'mlr_review',
    'approved',
    'published',
    'completed',
    'failed',
    'revision_requested',
    'rejected'
));

-- If the constraint is still causing issues, you can temporarily remove it
-- ALTER TABLE submissions DROP CONSTRAINT IF EXISTS valid_workflow_stage;

-- Update any existing records that might have invalid values
UPDATE submissions 
SET workflow_stage = 'draft' 
WHERE workflow_stage IS NULL OR workflow_stage = '';

-- Verify the fix
SELECT DISTINCT workflow_stage 
FROM submissions 
ORDER BY workflow_stage;