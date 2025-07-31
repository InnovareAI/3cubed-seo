-- Dashboard Views for SEO Review Page
-- These views optimize data fetching and provide aggregated statistics

-- 1. Main SEO Review Dashboard View
-- This view includes calculated fields and joins commonly used data
CREATE OR REPLACE VIEW seo_review_dashboard AS
SELECT 
    s.id,
    s.product_name,
    s.generic_name,
    s.therapeutic_area,
    s.priority_level,
    s.workflow_stage,
    s.ai_processing_status,
    s.created_at,
    s.updated_at,
    
    -- Submitter info
    s.submitter_name,
    s.submitter_email,
    
    -- SEO Fields
    s.seo_keywords,
    s.meta_title,
    s.meta_description,
    COALESCE(array_length(s.seo_keywords, 1), 0) as keyword_count,
    
    -- AI Generated Content
    s.ai_generated_content,
    s.qa_score,
    s.qa_status,
    
    -- Calculated fields
    CASE 
        WHEN s.seo_keywords IS NOT NULL AND array_length(s.seo_keywords, 1) > 0 THEN true
        ELSE false
    END as has_keywords,
    
    CASE 
        WHEN s.ai_generated_content IS NOT NULL THEN true
        ELSE false
    END as has_ai_content,
    
    -- Date calculations
    DATE(s.created_at) = CURRENT_DATE as is_today,
    
    -- Extract AI content fields if they exist
    s.ai_generated_content->>'seo_title' as ai_seo_title,
    s.ai_generated_content->>'geo_event_tags' as ai_geo_tags,
    s.ai_generated_content->>'h2_tags' as ai_h2_tags,
    s.ai_generated_content->>'seo_strategy_outline' as ai_strategy,
    
    -- Geography info
    s.geography,
    
    -- Additional metadata
    s.development_stage,
    s.indication,
    s.mechanism_of_action
FROM submissions s
WHERE s.workflow_stage NOT IN ('draft', 'deleted') -- Exclude drafts
ORDER BY s.created_at DESC;

-- Grant permissions
GRANT SELECT ON seo_review_dashboard TO anon;

-- 2. SEO Review Statistics View
-- Aggregated stats for the dashboard cards
CREATE OR REPLACE VIEW seo_review_stats AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE priority_level = 'high') as high_priority_count,
    COUNT(*) FILTER (WHERE priority_level = 'medium') as medium_priority_count,
    COUNT(*) FILTER (WHERE priority_level = 'low') as low_priority_count,
    COUNT(*) FILTER (WHERE seo_keywords IS NOT NULL AND array_length(seo_keywords, 1) > 0) as has_keywords_count,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_submissions,
    COUNT(*) FILTER (WHERE ai_processing_status = 'completed') as ai_completed_count,
    COUNT(*) FILTER (WHERE ai_processing_status = 'failed') as ai_failed_count,
    COUNT(*) FILTER (WHERE ai_processing_status = 'pending') as ai_pending_count,
    COUNT(*) FILTER (WHERE qa_score >= 80) as high_quality_count,
    COUNT(*) FILTER (WHERE qa_score < 60) as needs_improvement_count
FROM submissions
WHERE workflow_stage NOT IN ('draft', 'deleted');

-- Grant permissions
GRANT SELECT ON seo_review_stats TO anon;

-- 3. Therapeutic Area Summary View
-- Shows distribution and stats by therapeutic area
CREATE OR REPLACE VIEW therapeutic_area_summary AS
SELECT 
    therapeutic_area,
    COUNT(*) as submission_count,
    COUNT(*) FILTER (WHERE priority_level = 'high') as high_priority_count,
    COUNT(*) FILTER (WHERE ai_processing_status = 'completed') as ai_completed_count,
    AVG(qa_score)::INTEGER as avg_qa_score,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE seo_keywords IS NOT NULL AND array_length(seo_keywords, 1) > 0) as with_keywords_count
FROM submissions
WHERE workflow_stage NOT IN ('draft', 'deleted')
GROUP BY therapeutic_area
ORDER BY submission_count DESC;

-- Grant permissions
GRANT SELECT ON therapeutic_area_summary TO anon;

-- 4. Daily Activity View
-- Shows submissions and activity by day
CREATE OR REPLACE VIEW daily_activity AS
SELECT 
    DATE(created_at) as submission_date,
    COUNT(*) as submission_count,
    COUNT(*) FILTER (WHERE ai_processing_status = 'completed') as ai_completed_count,
    COUNT(*) FILTER (WHERE priority_level = 'high') as high_priority_count,
    AVG(qa_score)::INTEGER as avg_qa_score,
    array_agg(DISTINCT therapeutic_area) as therapeutic_areas
FROM submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND workflow_stage NOT IN ('draft', 'deleted')
GROUP BY DATE(created_at)
ORDER BY submission_date DESC;

-- Grant permissions
GRANT SELECT ON daily_activity TO anon;

-- 5. Priority Queue View
-- Shows high priority items that need attention
CREATE OR REPLACE VIEW priority_queue AS
SELECT 
    id,
    product_name,
    therapeutic_area,
    priority_level,
    workflow_stage,
    ai_processing_status,
    created_at,
    updated_at,
    submitter_name,
    qa_score,
    CASE 
        WHEN ai_processing_status = 'failed' THEN 'AI Processing Failed'
        WHEN ai_processing_status = 'pending' AND created_at < NOW() - INTERVAL '24 hours' THEN 'Stuck in Processing'
        WHEN qa_score < 60 THEN 'Low Quality Score'
        WHEN seo_keywords IS NULL OR array_length(seo_keywords, 1) = 0 THEN 'Missing Keywords'
        ELSE 'Ready for Review'
    END as attention_reason,
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as hours_since_submission
FROM submissions
WHERE workflow_stage NOT IN ('draft', 'deleted', 'completed')
  AND (
    priority_level = 'high' 
    OR ai_processing_status = 'failed'
    OR (ai_processing_status = 'pending' AND created_at < NOW() - INTERVAL '24 hours')
    OR qa_score < 60
  )
ORDER BY 
    CASE priority_level 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        ELSE 3 
    END,
    created_at ASC;

-- Grant permissions
GRANT SELECT ON priority_queue TO anon;

-- 6. SEO Performance View
-- Shows SEO metrics and keyword performance
CREATE OR REPLACE VIEW seo_performance AS
SELECT 
    id,
    product_name,
    therapeutic_area,
    array_length(seo_keywords, 1) as keyword_count,
    array_length(voice_search_queries, 1) as voice_query_count,
    array_length(long_tail_variations, 1) as long_tail_count,
    character_length(meta_title) as meta_title_length,
    character_length(meta_description) as meta_description_length,
    qa_score,
    CASE 
        WHEN character_length(meta_title) BETWEEN 50 AND 60 THEN 'Optimal'
        WHEN character_length(meta_title) < 50 THEN 'Too Short'
        WHEN character_length(meta_title) > 60 THEN 'Too Long'
        ELSE 'Missing'
    END as meta_title_status,
    CASE 
        WHEN character_length(meta_description) BETWEEN 150 AND 160 THEN 'Optimal'
        WHEN character_length(meta_description) < 150 THEN 'Too Short'
        WHEN character_length(meta_description) > 160 THEN 'Too Long'
        ELSE 'Missing'
    END as meta_description_status
FROM submissions
WHERE workflow_stage NOT IN ('draft', 'deleted');

-- Grant permissions
GRANT SELECT ON seo_performance TO anon;

-- 7. Client Activity View
-- Shows activity grouped by submitter/client
CREATE OR REPLACE VIEW client_activity AS
SELECT 
    submitter_email,
    submitter_name,
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
    COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') as last_30_days,
    COUNT(*) FILTER (WHERE ai_processing_status = 'completed') as completed_count,
    AVG(qa_score)::INTEGER as avg_qa_score,
    array_agg(DISTINCT therapeutic_area) as therapeutic_areas,
    MAX(created_at) as last_submission_date
FROM submissions
WHERE workflow_stage NOT IN ('draft', 'deleted')
GROUP BY submitter_email, submitter_name
ORDER BY total_submissions DESC;

-- Grant permissions
GRANT SELECT ON client_activity TO anon;

-- Create indexes to optimize view performance
CREATE INDEX IF NOT EXISTS idx_submissions_created_date ON submissions(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_submissions_priority_workflow ON submissions(priority_level, workflow_stage);
CREATE INDEX IF NOT EXISTS idx_submissions_ai_status ON submissions(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_submissions_therapeutic_area ON submissions(therapeutic_area);

-- Verify views were created
SELECT 
    schemaname,
    viewname,
    definition IS NOT NULL as has_definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN (
    'seo_review_dashboard',
    'seo_review_stats',
    'therapeutic_area_summary',
    'daily_activity',
    'priority_queue',
    'seo_performance',
    'client_activity'
)
ORDER BY viewname;