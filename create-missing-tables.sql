-- =====================================================
-- MISSING TABLES FOR 3CUBED-SEO
-- Run this script to create the missing tables
-- =====================================================

-- Create review tracking tables for better audit trail
CREATE TABLE IF NOT EXISTS seo_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID,
  reviewer_name VARCHAR NOT NULL,
  reviewer_email VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('approved', 'revision_requested', 'rejected')),
  keyword_approvals JSONB,
  internal_notes TEXT,
  revision_notes TEXT,
  seo_title_approved BOOLEAN DEFAULT false,
  meta_description_approved BOOLEAN DEFAULT false,
  content_approved BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID,
  reviewer_name VARCHAR NOT NULL,
  reviewer_email VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('approved', 'revision_requested', 'rejected')),
  review_responses JSONB,
  comments TEXT,
  accuracy_confirmed BOOLEAN DEFAULT false,
  messaging_approved BOOLEAN DEFAULT false,
  competitive_positioning_approved BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mlr_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID,
  reviewer_name VARCHAR NOT NULL,
  reviewer_email VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('approved', 'revision_requested', 'rejected')),
  compliance_checklist JSONB,
  regulatory_flags TEXT[],
  medical_accuracy_confirmed BOOLEAN DEFAULT false,
  claims_substantiated BOOLEAN DEFAULT false,
  adverse_events_disclosed BOOLEAN DEFAULT false,
  fair_balance_achieved BOOLEAN DEFAULT false,
  revision_requirements TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content versions table for tracking changes
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  seo_title VARCHAR(60),
  meta_description VARCHAR(155),
  main_content TEXT,
  seo_keywords TEXT[],
  long_tail_keywords TEXT[],
  consumer_questions TEXT[],
  h1_tag VARCHAR,
  created_by VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_summary TEXT,
  UNIQUE(submission_id, version_number)
);

-- Create a comprehensive view for tracking review status
CREATE OR REPLACE VIEW submission_review_status AS
SELECT 
  s.id,
  s.compliance_id,
  s.product_name,
  s.stage,
  s.workflow_stage,
  s.langchain_status,
  -- SEO Review Status
  sr.reviewer_name as seo_reviewer,
  sr.status as seo_status,
  sr.reviewed_at as seo_reviewed_at,
  -- Client Review Status
  cr.reviewer_name as client_reviewer,
  cr.status as client_status,
  cr.reviewed_at as client_reviewed_at,
  -- MLR Review Status
  mr.reviewer_name as mlr_reviewer,
  mr.status as mlr_status,
  mr.reviewed_at as mlr_reviewed_at,
  -- Latest version
  cv.version_number as latest_version,
  s.created_at,
  s.updated_at
FROM submissions s
LEFT JOIN LATERAL (
  SELECT * FROM seo_reviews 
  WHERE submission_id = s.id 
  ORDER BY created_at DESC 
  LIMIT 1
) sr ON true
LEFT JOIN LATERAL (
  SELECT * FROM client_reviews 
  WHERE submission_id = s.id 
  ORDER BY created_at DESC 
  LIMIT 1
) cr ON true
LEFT JOIN LATERAL (
  SELECT * FROM mlr_reviews 
  WHERE submission_id = s.id 
  ORDER BY created_at DESC 
  LIMIT 1
) mr ON true
LEFT JOIN LATERAL (
  SELECT version_number FROM content_versions 
  WHERE submission_id = s.id 
  ORDER BY version_number DESC 
  LIMIT 1
) cv ON true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_reviews_submission_id ON seo_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_submission_id ON client_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_mlr_reviews_submission_id ON mlr_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_submission_id ON content_versions(submission_id);

-- Function to create a new content version
CREATE OR REPLACE FUNCTION create_content_version(
  p_submission_id UUID,
  p_seo_title VARCHAR(60),
  p_meta_description VARCHAR(155),
  p_main_content TEXT,
  p_seo_keywords TEXT[],
  p_long_tail_keywords TEXT[],
  p_consumer_questions TEXT[],
  p_h1_tag VARCHAR,
  p_created_by VARCHAR,
  p_change_summary TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_new_version INTEGER;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO v_new_version
  FROM content_versions
  WHERE submission_id = p_submission_id;
  
  -- Insert the new version
  INSERT INTO content_versions (
    submission_id,
    version_number,
    seo_title,
    meta_description,
    main_content,
    seo_keywords,
    long_tail_keywords,
    consumer_questions,
    h1_tag,
    created_by,
    change_summary
  ) VALUES (
    p_submission_id,
    v_new_version,
    p_seo_title,
    p_meta_description,
    p_main_content,
    p_seo_keywords,
    p_long_tail_keywords,
    p_consumer_questions,
    p_h1_tag,
    p_created_by,
    p_change_summary
  );
  
  -- Update the main submission record with latest content
  UPDATE submissions SET
    h1_tag = p_h1_tag,
    meta_title = p_seo_title,
    meta_description = p_meta_description,
    seo_keywords = p_seo_keywords,
    long_tail_keywords = p_long_tail_keywords,
    consumer_questions = p_consumer_questions,
    updated_at = NOW()
  WHERE id = p_submission_id;
  
  RETURN v_new_version;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE seo_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlr_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth structure)
CREATE POLICY "Enable all access for authenticated users" ON seo_reviews
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON client_reviews
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON mlr_reviews
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON content_versions
  FOR ALL USING (true);