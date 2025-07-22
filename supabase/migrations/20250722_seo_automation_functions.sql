-- SEO Automation Functions
-- These functions handle automated SEO tasks for the 3Cubed SEO system

-- Function to automatically generate SEO metadata
CREATE OR REPLACE FUNCTION generate_seo_metadata(submission_id UUID)
RETURNS VOID AS $$
DECLARE
  submission_record RECORD;
  seo_title TEXT;
  meta_desc TEXT;
  h2_list TEXT[];
BEGIN
  -- Get submission details
  SELECT * INTO submission_record FROM submissions WHERE id = submission_id;
  
  -- Generate SEO title (50-60 chars)
  seo_title := SUBSTRING(
    submission_record.product_name || ' - ' || 
    submission_record.therapeutic_area || ' Treatment',
    1, 60
  );
  
  -- Generate meta description (150-160 chars)
  meta_desc := SUBSTRING(
    'Learn about ' || submission_record.product_name || 
    ' for ' || submission_record.therapeutic_area || 
    '. ' || COALESCE(submission_record.medical_indication, 'Innovative treatment solution.'),
    1, 160
  );
  
  -- Generate H2 tags based on content
  h2_list := ARRAY[
    'What is ' || submission_record.product_name || '?',
    'How Does ' || submission_record.product_name || ' Work?',
    'Benefits of ' || submission_record.product_name,
    'Who Can Use ' || submission_record.product_name || '?',
    'Clinical Evidence for ' || submission_record.product_name
  ];
  
  -- Update submission with generated content
  UPDATE submissions 
  SET 
    seo_title = seo_title,
    meta_title = seo_title,
    meta_description = meta_desc,
    h2_tags = h2_list,
    geo_optimization_score = 75 + (RANDOM() * 25)::INTEGER, -- Mock score 75-100
    geo_readability_score = 70 + (RANDOM() * 30)::INTEGER, -- Mock score 70-100
    geo_featured_snippet_potential = RANDOM() > 0.3,
    updated_at = NOW()
  WHERE id = submission_id;
  
  -- Log the automation
  INSERT INTO seo_automation_logs (
    submission_id,
    automation_type,
    status,
    details,
    completed_at
  ) VALUES (
    submission_id,
    'seo_metadata_generation',
    'completed',
    jsonb_build_object(
      'seo_title', seo_title,
      'meta_description', meta_desc,
      'h2_tags', h2_list
    ),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to analyze keywords and suggest improvements
CREATE OR REPLACE FUNCTION analyze_keywords(submission_id UUID)
RETURNS JSONB AS $$
DECLARE
  submission_record RECORD;
  keyword_analysis JSONB;
  primary_keywords TEXT[];
  long_tail_keywords TEXT[];
BEGIN
  -- Get submission details
  SELECT * INTO submission_record FROM submissions WHERE id = submission_id;
  
  -- Generate primary keywords based on product and therapeutic area
  primary_keywords := ARRAY[
    LOWER(submission_record.product_name),
    LOWER(submission_record.therapeutic_area),
    LOWER(submission_record.product_name || ' ' || submission_record.therapeutic_area),
    LOWER(submission_record.therapeutic_area || ' treatment'),
    LOWER(submission_record.therapeutic_area || ' medication')
  ];
  
  -- Generate long-tail keywords
  long_tail_keywords := ARRAY[
    'what is ' || LOWER(submission_record.product_name),
    'how does ' || LOWER(submission_record.product_name) || ' work',
    LOWER(submission_record.product_name) || ' side effects',
    LOWER(submission_record.product_name) || ' dosage',
    LOWER(submission_record.product_name) || ' clinical trials',
    'benefits of ' || LOWER(submission_record.product_name),
    LOWER(submission_record.product_name) || ' vs competitors'
  ];
  
  -- Build analysis object
  keyword_analysis := jsonb_build_object(
    'primary_keywords', primary_keywords,
    'long_tail_keywords', long_tail_keywords,
    'keyword_density_score', 85 + (RANDOM() * 15)::INTEGER,
    'recommendations', ARRAY[
      'Include primary keyword in first paragraph',
      'Use variations of keywords throughout content',
      'Add keyword-rich subheadings',
      'Include keywords in image alt text'
    ]
  );
  
  -- Update submission with keywords
  UPDATE submissions 
  SET 
    seo_keywords = primary_keywords,
    long_tail_keywords = long_tail_keywords,
    updated_at = NOW()
  WHERE id = submission_id;
  
  -- Log the automation
  INSERT INTO seo_automation_logs (
    submission_id,
    automation_type,
    status,
    details,
    completed_at
  ) VALUES (
    submission_id,
    'keyword_analysis',
    'completed',
    keyword_analysis,
    NOW()
  );
  
  RETURN keyword_analysis;
END;
$$ LANGUAGE plpgsql;

-- Function to generate GEO event tags
CREATE OR REPLACE FUNCTION generate_geo_event_tags(submission_id UUID)
RETURNS VOID AS $$
DECLARE
  submission_record RECORD;
  event_tags TEXT[];
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  -- Get submission details
  SELECT * INTO submission_record FROM submissions WHERE id = submission_id;
  
  -- Get current date parts
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Generate event tags based on therapeutic area and time of year
  event_tags := CASE
    WHEN submission_record.therapeutic_area ILIKE '%cancer%' OR submission_record.therapeutic_area ILIKE '%oncology%' THEN
      ARRAY['World Cancer Day', 'Cancer Awareness Month', 'Oncology Congress ' || current_year]
    WHEN submission_record.therapeutic_area ILIKE '%diabetes%' THEN
      ARRAY['World Diabetes Day', 'Diabetes Awareness Month', 'ADA Scientific Sessions ' || current_year]
    WHEN submission_record.therapeutic_area ILIKE '%heart%' OR submission_record.therapeutic_area ILIKE '%cardio%' THEN
      ARRAY['World Heart Day', 'American Heart Month', 'ACC Conference ' || current_year]
    WHEN submission_record.therapeutic_area ILIKE '%mental%' OR submission_record.therapeutic_area ILIKE '%psych%' THEN
      ARRAY['World Mental Health Day', 'Mental Health Awareness Month', 'APA Annual Meeting ' || current_year]
    ELSE
      ARRAY['Health Awareness Month', 'Medical Innovation Summit ' || current_year, 'Healthcare Excellence Awards']
  END;
  
  -- Add seasonal events
  CASE
    WHEN current_month IN (1, 2) THEN
      event_tags := event_tags || ARRAY['New Year Health Resolutions', 'Winter Wellness'];
    WHEN current_month IN (3, 4, 5) THEN
      event_tags := event_tags || ARRAY['Spring Health Check', 'National Public Health Week'];
    WHEN current_month IN (6, 7, 8) THEN
      event_tags := event_tags || ARRAY['Summer Safety Month', 'UV Safety Awareness'];
    WHEN current_month IN (9, 10, 11, 12) THEN
      event_tags := event_tags || ARRAY['Flu Season Preparation', 'Holiday Health Tips'];
  END;
  
  -- Update submission
  UPDATE submissions 
  SET 
    geo_event_tags = event_tags,
    updated_at = NOW()
  WHERE id = submission_id;
  
  -- Log the automation
  INSERT INTO seo_automation_logs (
    submission_id,
    automation_type,
    status,
    details,
    completed_at
  ) VALUES (
    submission_id,
    'geo_event_tag_generation',
    'completed',
    jsonb_build_object('event_tags', event_tags),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Master automation function that runs all SEO tasks
CREATE OR REPLACE FUNCTION run_seo_automation(submission_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Generate SEO metadata
  PERFORM generate_seo_metadata(submission_id);
  
  -- Analyze keywords
  PERFORM analyze_keywords(submission_id);
  
  -- Generate GEO event tags
  PERFORM generate_geo_event_tags(submission_id);
  
  -- Update workflow stage if in ai_processing
  UPDATE submissions 
  SET 
    workflow_stage = 'seo_review',
    langchain_status = 'seo_review',
    updated_at = NOW()
  WHERE id = submission_id 
    AND workflow_stage = 'ai_processing';
  
  -- Log completion
  INSERT INTO seo_automation_logs (
    submission_id,
    automation_type,
    status,
    details,
    completed_at
  ) VALUES (
    submission_id,
    'full_seo_automation',
    'completed',
    jsonb_build_object('message', 'All SEO automation tasks completed successfully'),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically run SEO automation when AI processing completes
CREATE OR REPLACE FUNCTION trigger_seo_automation()
RETURNS TRIGGER AS $$
BEGIN
  -- Run automation when langchain_status changes to 'completed' 
  -- and workflow_stage is 'ai_processing'
  IF NEW.langchain_status = 'completed' 
     AND NEW.workflow_stage = 'ai_processing' 
     AND (OLD.langchain_status IS NULL OR OLD.langchain_status != 'completed') THEN
    PERFORM run_seo_automation(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS seo_automation_trigger ON submissions;
CREATE TRIGGER seo_automation_trigger
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seo_automation();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_seo_metadata(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_keywords(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_geo_event_tags(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION run_seo_automation(UUID) TO authenticated;
