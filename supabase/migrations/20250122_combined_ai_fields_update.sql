-- =====================================================
-- COMBINED MIGRATION FOR 3CUBED-SEO AI-GENERATED FIELDS
-- Run this in Supabase SQL Editor
-- Project: ktchrfgkbpaixbiwbieg
-- =====================================================

-- 1. Add AI-generated SEO fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(60),
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS reviewer_emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS competitive_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo_enhancements JSONB DEFAULT '{}'::jsonb;

-- Add constraint for SEO title length
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_title_length') THEN
        ALTER TABLE submissions ADD CONSTRAINT seo_title_length CHECK (LENGTH(seo_title) <= 60);
    END IF;
END $$;

-- 2. Create review tracking table
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_review_tracking_submission_id ON review_tracking(submission_id);
CREATE INDEX IF NOT EXISTS idx_review_tracking_status ON review_tracking(status);
CREATE INDEX IF NOT EXISTS idx_submissions_seo_title ON submissions(seo_title);

-- Enable RLS
ALTER TABLE review_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Users can view review tracking" ON review_tracking;
CREATE POLICY "Users can view review tracking" ON review_tracking
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert review tracking" ON review_tracking;
CREATE POLICY "Users can insert review tracking" ON review_tracking
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update review tracking" ON review_tracking;
CREATE POLICY "Users can update review tracking" ON review_tracking
    FOR UPDATE USING (true);

-- 3. Create GEO optimizations table
CREATE TABLE IF NOT EXISTS geo_optimizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    region VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    target_keywords TEXT[],
    local_competitors TEXT[],
    cultural_considerations TEXT,
    regulatory_requirements TEXT,
    local_market_size DECIMAL(15,2),
    market_penetration_strategy TEXT,
    localized_messaging TEXT,
    event_associations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add geo-specific fields to submissions if not exists
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS geo_targets JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS primary_geo_market VARCHAR(100),
ADD COLUMN IF NOT EXISTS secondary_geo_markets TEXT[];

-- Create geo event tags lookup table
CREATE TABLE IF NOT EXISTS geo_event_tags_lookup (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_name VARCHAR(255) UNIQUE NOT NULL,
    tag_category VARCHAR(100), -- 'conference', 'congress', 'symposium', etc.
    typical_locations TEXT[],
    typical_months VARCHAR(20)[],
    relevance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common medical event tags (if not exists)
INSERT INTO geo_event_tags_lookup (tag_name, tag_category, typical_locations, typical_months, relevance_score) VALUES
    ('ASCO', 'congress', ARRAY['Chicago', 'Virtual'], ARRAY['June'], 100),
    ('ASH', 'congress', ARRAY['San Diego', 'Orlando', 'Atlanta'], ARRAY['December'], 100),
    ('ACC', 'conference', ARRAY['Washington DC', 'Chicago', 'Atlanta'], ARRAY['March', 'April'], 95),
    ('ESMO', 'congress', ARRAY['Madrid', 'Paris', 'Barcelona'], ARRAY['September', 'October'], 95),
    ('AAN', 'conference', ARRAY['Seattle', 'Philadelphia', 'Boston'], ARRAY['April', 'May'], 90),
    ('EASL', 'congress', ARRAY['Vienna', 'London', 'Paris'], ARRAY['April', 'June'], 90),
    ('DDW', 'conference', ARRAY['Chicago', 'Washington DC', 'San Diego'], ARRAY['May'], 85),
    ('EHA', 'congress', ARRAY['Frankfurt', 'Vienna', 'Virtual'], ARRAY['June'], 85)
ON CONFLICT (tag_name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_geo_optimizations_submission_id ON geo_optimizations(submission_id);
CREATE INDEX IF NOT EXISTS idx_geo_optimizations_region ON geo_optimizations(region);
CREATE INDEX IF NOT EXISTS idx_geo_event_tags_lookup_category ON geo_event_tags_lookup(tag_category);

-- Enable RLS
ALTER TABLE geo_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_event_tags_lookup ENABLE ROW LEVEL SECURITY;

-- RLS policies for geo tables
DROP POLICY IF EXISTS "Users can view geo optimizations" ON geo_optimizations;
CREATE POLICY "Users can view geo optimizations" ON geo_optimizations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert geo optimizations" ON geo_optimizations;
CREATE POLICY "Users can insert geo optimizations" ON geo_optimizations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update geo optimizations" ON geo_optimizations;
CREATE POLICY "Users can update geo optimizations" ON geo_optimizations
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view geo event tags" ON geo_event_tags_lookup;
CREATE POLICY "Users can view geo event tags" ON geo_event_tags_lookup
    FOR SELECT USING (true);

-- 4. Verify the updates
SELECT 
    'Submissions table columns added' as status,
    COUNT(*) as new_columns
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name IN ('seo_title', 'geo_event_tags', 'seo_strategy_outline', 'h2_tags', 'reviewer_emails', 'competitive_analysis', 'seo_enhancements');
