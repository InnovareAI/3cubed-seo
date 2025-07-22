-- Create clinical trials and competitive landscape tables
CREATE TABLE IF NOT EXISTS clinical_trials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    trial_id VARCHAR(255) NOT NULL,
    trial_name TEXT,
    trial_phase VARCHAR(50),
    trial_status VARCHAR(50),
    enrollment_count INTEGER,
    primary_endpoints TEXT[],
    secondary_endpoints TEXT[],
    inclusion_criteria TEXT[],
    exclusion_criteria TEXT[],
    study_design TEXT,
    comparator_arms TEXT[],
    trial_locations JSONB DEFAULT '[]'::jsonb,
    start_date DATE,
    completion_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitive landscape table
CREATE TABLE IF NOT EXISTS competitive_landscape (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255),
    competitor_drug VARCHAR(255),
    market_share DECIMAL(5,2),
    strengths TEXT[],
    weaknesses TEXT[],
    differentiators TEXT[],
    pricing_strategy TEXT,
    marketing_channels TEXT[],
    target_demographics JSONB DEFAULT '{}'::jsonb,
    regulatory_status VARCHAR(100),
    launch_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views for easier data access
CREATE OR REPLACE VIEW trial_data_summary AS
SELECT 
    s.id as submission_id,
    s.product_name,
    s.indication,
    ct.trial_id,
    ct.trial_phase,
    ct.trial_status,
    ct.enrollment_count,
    ct.primary_endpoints,
    ct.completion_date
FROM submissions s
LEFT JOIN clinical_trials ct ON s.id = ct.submission_id;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinical_trials_submission_id ON clinical_trials(submission_id);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_trial_id ON clinical_trials(trial_id);
CREATE INDEX IF NOT EXISTS idx_competitive_landscape_submission_id ON competitive_landscape(submission_id);

-- Add RLS policies
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_landscape ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clinical trials" ON clinical_trials
    FOR SELECT USING (true);

CREATE POLICY "Users can insert clinical trials" ON clinical_trials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update clinical trials" ON clinical_trials
    FOR UPDATE USING (true);

CREATE POLICY "Users can view competitive landscape" ON competitive_landscape
    FOR SELECT USING (true);

CREATE POLICY "Users can insert competitive landscape" ON competitive_landscape
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update competitive landscape" ON competitive_landscape
    FOR UPDATE USING (true);
