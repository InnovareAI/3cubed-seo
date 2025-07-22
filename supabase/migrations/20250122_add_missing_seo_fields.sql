-- Add missing SEO and review tracking fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(60),
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS reviewer_emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS competitive_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo_enhancements JSONB DEFAULT '{}'::jsonb;

-- Add constraints for SEO title
ALTER TABLE submissions 
ADD CONSTRAINT seo_title_length CHECK (LENGTH(seo_title) <= 60);

-- Create review tracking tables
CREATE TABLE IF NOT EXISTS review_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    review_type VARCHAR(50) NOT NULL, -- 'seo', 'client', 'mlr'
    reviewer_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'revision_requested'
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_review_tracking_submission_id ON review_tracking(submission_id);
CREATE INDEX IF NOT EXISTS idx_review_tracking_status ON review_tracking(status);
CREATE INDEX IF NOT EXISTS idx_submissions_seo_title ON submissions(seo_title);

-- Add RLS policies
ALTER TABLE review_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view review tracking" ON review_tracking
    FOR SELECT USING (true);

CREATE POLICY "Users can insert review tracking" ON review_tracking
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update review tracking" ON review_tracking
    FOR UPDATE USING (true);
