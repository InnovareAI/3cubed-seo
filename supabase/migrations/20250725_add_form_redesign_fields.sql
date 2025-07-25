-- Add missing fields for 4-section form redesign
-- Date: 2025-07-25

-- Section 1 additions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS generic_name TEXT;

-- Section 2 additions (team assignment)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seo_reviewer_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seo_reviewer_email TEXT;

-- Section 3 additions (clinical context)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS nct_number TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS sponsor TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS line_of_therapy TEXT;
-- patient_population already exists as object type

-- Section 4 additions (advanced optimization)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS route_of_administration TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS combination_partners TEXT[];
-- primary_endpoints already exists as object type - will use as array
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS geographic_markets TEXT[];
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS key_biomarkers TEXT[];
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_age_groups TEXT[];

-- Update development_stage to TEXT type if needed
ALTER TABLE submissions ALTER COLUMN development_stage TYPE TEXT USING development_stage::TEXT;

-- Update patient_population to TEXT[] type if needed
ALTER TABLE submissions ALTER COLUMN patient_population TYPE TEXT[] USING 
  CASE 
    WHEN patient_population IS NULL THEN NULL
    WHEN jsonb_typeof(patient_population::jsonb) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(patient_population::jsonb))
    ELSE ARRAY[patient_population::TEXT]
  END;

-- Update primary_endpoints to TEXT[] type if needed
ALTER TABLE submissions ALTER COLUMN primary_endpoints TYPE TEXT[] USING 
  CASE 
    WHEN primary_endpoints IS NULL THEN NULL
    WHEN jsonb_typeof(primary_endpoints::jsonb) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(primary_endpoints::jsonb))
    ELSE ARRAY[primary_endpoints::TEXT]
  END;

-- Update client_reviewer_name and client_reviewer_email to TEXT type
ALTER TABLE submissions ALTER COLUMN client_reviewer_name TYPE TEXT USING client_reviewer_name::TEXT;
ALTER TABLE submissions ALTER COLUMN client_reviewer_email TYPE TEXT USING client_reviewer_email::TEXT;
ALTER TABLE submissions ALTER COLUMN mlr_reviewer_name TYPE TEXT USING mlr_reviewer_name::TEXT;
ALTER TABLE submissions ALTER COLUMN mlr_reviewer_email TYPE TEXT USING mlr_reviewer_email::TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_generic_name ON submissions(generic_name);
CREATE INDEX IF NOT EXISTS idx_submissions_nct_number ON submissions(nct_number);
CREATE INDEX IF NOT EXISTS idx_submissions_sponsor ON submissions(sponsor);
CREATE INDEX IF NOT EXISTS idx_submissions_development_stage ON submissions(development_stage);

-- Add comment to track schema version
COMMENT ON TABLE submissions IS 'Version 4.0 - Added fields for 4-section form redesign with progress bar';
