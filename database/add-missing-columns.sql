-- Add missing columns to submissions table
-- Generated: 2025-07-26

-- Section 1: Product Information
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS generic_name TEXT;

-- Section 2: Clinical Context  
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS nct_number TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS sponsor TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS development_stage TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS line_of_therapy TEXT;

-- Section 3: Advanced Optimization
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS route_of_administration TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS geographic_markets TEXT[];
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS key_biomarkers TEXT[];
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_age_groups TEXT[];

-- Section 4: Team & Review Assignment
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seo_reviewer_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seo_reviewer_email TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS client_reviewer_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS client_reviewer_email TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mlr_reviewer_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mlr_reviewer_email TEXT;
