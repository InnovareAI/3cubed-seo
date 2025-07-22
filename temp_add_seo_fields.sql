-- Add missing AI-generated SEO fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(60),
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS reviewer_emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS competitive_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo_enhancements JSONB DEFAULT '{}'::jsonb;

-- Add character limit constraint for SEO title
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS seo_title_length;

ALTER TABLE submissions 
ADD CONSTRAINT seo_title_length CHECK (LENGTH(seo_title) <= 60);
