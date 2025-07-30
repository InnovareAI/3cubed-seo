# 🚨 URGENT: Add Missing Database Columns

The form submission is failing because your Supabase database is missing required columns.

## Quick Fix Instructions

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/ktchrfgkbpaixbiwbieg/editor

### 2. Copy and Run This SQL

```sql
-- Add missing columns to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ai_output JSONB,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[],
ADD COLUMN IF NOT EXISTS fda_data JSONB,
ADD COLUMN IF NOT EXISTS fda_data_sources TEXT[],
ADD COLUMN IF NOT EXISTS fda_enrichment_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS qa_score INTEGER,
ADD COLUMN IF NOT EXISTS compliance_score INTEGER,
ADD COLUMN IF NOT EXISTS medical_accuracy INTEGER,
ADD COLUMN IF NOT EXISTS seo_effectiveness INTEGER,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS dashboard_data JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_stage ON submissions(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_ai_processing_status ON submissions(ai_processing_status);
```

### 3. Verify Columns Were Added

Run this query to confirm:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions'
ORDER BY ordinal_position;
```

### Expected Result
You should see all these columns:
- ai_output (jsonb)
- seo_title (text)
- meta_description (text)
- seo_keywords (text[])
- h2_tags (text[])
- And more...

## After Running SQL

1. Go back to the form: https://3cubedai-seo.netlify.app/seo-requests
2. Try submitting again
3. It should work now!

## Why This Happened

The Netlify function expects these columns to store:
- AI-generated content (`ai_output`)
- SEO metadata (`seo_title`, `meta_description`, etc.)
- FDA enrichment data (`fda_data`)
- Quality scores (`qa_score`, `compliance_score`)

Without these columns, the function can't save the results.