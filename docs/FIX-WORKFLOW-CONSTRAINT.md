# 🚨 Fix Workflow Stage Constraint Error

## The Problem
The database has a check constraint that only allows certain values for `workflow_stage`, and our code is trying to use values that aren't in the allowed list.

## Quick Fix

### Option 1: Update the Constraint (Recommended)

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/ktchrfgkbpaixbiwbieg/editor

2. **Run this SQL to fix the constraint**:

```sql
-- Drop the old constraint
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS valid_workflow_stage;

-- Add updated constraint with all needed values
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
```

### Option 2: Remove the Constraint (Temporary)

If you need to test immediately, remove the constraint:

```sql
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS valid_workflow_stage;
```

You can add it back later with the correct values.

## After Running the Fix

1. Go back to the form
2. Submit a test entry
3. It should work now!

## Why This Happened

The database was set up with a strict list of allowed `workflow_stage` values, but our new code uses stages like `ai_processing` and `fda_enrichment` that weren't in the original list.