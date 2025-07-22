-- Create geo optimization tables and fields
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

-- Insert common medical event tags
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

-- Add RLS policies
ALTER TABLE geo_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_event_tags_lookup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view geo optimizations" ON geo_optimizations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert geo optimizations" ON geo_optimizations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update geo optimizations" ON geo_optimizations
    FOR UPDATE USING (true);

CREATE POLICY "Users can view geo event tags" ON geo_event_tags_lookup
    FOR SELECT USING (true);
