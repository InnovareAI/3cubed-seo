-- Analytics dashboard views for pharmaceutical SEO metrics
-- Provides comprehensive business intelligence for the demo

-- Submission metrics overview
CREATE OR REPLACE VIEW submission_metrics AS
SELECT
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN workflow_stage = 'completed' THEN 1 END) as completed_submissions,
  COUNT(CASE WHEN ai_processing_status = 'completed' THEN 1 END) as ai_processed,
  COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as qa_approved,
  AVG(qa_score) as avg_qa_score,
  AVG(medical_accuracy_score) as avg_medical_accuracy,
  COUNT(DISTINCT therapeutic_area) as therapeutic_areas_covered,
  COUNT(DISTINCT geographic_markets) as markets_covered
FROM submissions;

-- Therapeutic area performance
CREATE OR REPLACE VIEW therapeutic_area_performance AS
SELECT
  therapeutic_area,
  COUNT(*) as submission_count,
  AVG(qa_score) as avg_qa_score,
  AVG(medical_accuracy_score) as avg_medical_accuracy,
  COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN workflow_stage = 'completed' THEN 1 END) as completed_count,
  AVG(fda_data_quality_score) as avg_fda_data_quality
FROM submissions
WHERE therapeutic_area IS NOT NULL
GROUP BY therapeutic_area
ORDER BY submission_count DESC;

-- Geographic performance metrics
CREATE OR REPLACE VIEW geographic_performance AS
SELECT
  unnest(string_to_array(geographic_markets, ', ')) as market,
  COUNT(*) as submission_count,
  AVG(qa_score) as avg_qa_score,
  COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approved_count,
  AVG(CASE WHEN geo_performance_metrics IS NOT NULL 
    THEN (geo_performance_metrics::jsonb ->> 'engagement_rate')::float 
    END) as avg_engagement_rate
FROM submissions
WHERE geographic_markets IS NOT NULL
GROUP BY market
ORDER BY submission_count DESC;

-- AI processing efficiency
CREATE OR REPLACE VIEW ai_processing_metrics AS
SELECT
  ai_processing_status,
  COUNT(*) as count,
  AVG(ai_readiness_score) as avg_readiness_score,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_processing_hours
FROM submissions
GROUP BY ai_processing_status;

-- Content quality metrics
CREATE OR REPLACE VIEW content_quality_metrics AS
SELECT
  CASE 
    WHEN qa_score >= 90 THEN 'Excellent (90-100)'
    WHEN qa_score >= 80 THEN 'Good (80-89)'
    WHEN qa_score >= 70 THEN 'Fair (70-79)'
    WHEN qa_score >= 60 THEN 'Poor (60-69)'
    ELSE 'Needs Work (<60)'
  END as quality_tier,
  COUNT(*) as submission_count,
  AVG(qa_score) as avg_score,
  AVG(medical_accuracy_score) as avg_medical_accuracy,
  COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approved_count
FROM submissions
WHERE qa_score IS NOT NULL
GROUP BY quality_tier
ORDER BY AVG(qa_score) DESC;

-- Workflow stage distribution
CREATE OR REPLACE VIEW workflow_distribution AS
SELECT
  workflow_stage,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_time_in_stage_hours
FROM submissions
GROUP BY workflow_stage
ORDER BY count DESC;

-- User activity metrics
CREATE OR REPLACE VIEW user_activity_metrics AS
SELECT
  COALESCE(seo_reviewer_email, submitter_email) as user_email,
  COUNT(*) as submissions_handled,
  AVG(qa_score) as avg_qa_score_achieved,
  COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approvals_achieved,
  MIN(created_at) as first_submission,
  MAX(updated_at) as last_activity
FROM submissions
WHERE COALESCE(seo_reviewer_email, submitter_email) IS NOT NULL
GROUP BY COALESCE(seo_reviewer_email, submitter_email)
ORDER BY submissions_handled DESC;

-- Compliance risk assessment
CREATE OR REPLACE VIEW compliance_risk_dashboard AS
SELECT
  'Critical Risk' as risk_level,
  COUNT(*) as submission_count
FROM submissions
WHERE legal_risk_assessment > 70 OR qa_score < 60
UNION ALL
SELECT
  'High Risk' as risk_level,
  COUNT(*) as submission_count
FROM submissions
WHERE (legal_risk_assessment BETWEEN 50 AND 70) OR (qa_score BETWEEN 60 AND 69)
UNION ALL
SELECT
  'Medium Risk' as risk_level,
  COUNT(*) as submission_count
FROM submissions
WHERE (legal_risk_assessment BETWEEN 30 AND 49) OR (qa_score BETWEEN 70 AND 79)
UNION ALL
SELECT
  'Low Risk' as risk_level,
  COUNT(*) as submission_count
FROM submissions
WHERE legal_risk_assessment < 30 AND qa_score >= 80;

-- Recent activity feed
CREATE OR REPLACE VIEW recent_activity_feed AS
SELECT
  id,
  product_name,
  workflow_stage,
  ai_processing_status,
  qa_status,
  therapeutic_area,
  submitter_name,
  updated_at,
  'submission_update' as activity_type
FROM submissions
WHERE updated_at >= now() - interval '7 days'
UNION ALL
SELECT
  record_id as id,
  'Audit Event' as product_name,
  action as workflow_stage,
  compliance_impact as ai_processing_status,
  'audit' as qa_status,
  table_name as therapeutic_area,
  user_email as submitter_name,
  created_at as updated_at,
  'audit_event' as activity_type
FROM audit_logs
WHERE created_at >= now() - interval '7 days'
  AND compliance_impact IN ('critical', 'high')
ORDER BY updated_at DESC
LIMIT 50;

-- Performance trends (daily aggregates for charts)
CREATE OR REPLACE VIEW daily_performance_trends AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as submissions_created,
  COUNT(CASE WHEN workflow_stage = 'completed' THEN 1 END) as submissions_completed,
  AVG(qa_score) as avg_qa_score,
  COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approvals_count
FROM submissions
WHERE created_at >= now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- FDA data integration success rates
CREATE OR REPLACE VIEW fda_integration_metrics AS
SELECT
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN fda_comprehensive_data IS NOT NULL THEN 1 END) as fda_data_available,
  AVG(fda_data_quality_score) as avg_fda_quality_score,
  COUNT(CASE WHEN fda_data_quality_score >= 80 THEN 1 END) as high_quality_fda_data,
  ROUND(
    (COUNT(CASE WHEN fda_comprehensive_data IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
  ) as fda_integration_rate
FROM submissions;

-- Function to get dashboard data for a specific date range
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  start_date timestamptz DEFAULT now() - interval '30 days',
  end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  metric_name text,
  metric_value numeric,
  metric_change_percent numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT
      COUNT(*) as total_submissions,
      AVG(qa_score) as avg_qa_score,
      COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approved_count
    FROM submissions
    WHERE created_at BETWEEN start_date AND end_date
  ),
  previous_period AS (
    SELECT
      COUNT(*) as total_submissions,
      AVG(qa_score) as avg_qa_score,
      COUNT(CASE WHEN qa_status = 'approved' THEN 1 END) as approved_count
    FROM submissions
    WHERE created_at BETWEEN (start_date - (end_date - start_date)) AND start_date
  )
  SELECT 'Total Submissions' as metric_name, 
         c.total_submissions::numeric as metric_value,
         CASE WHEN p.total_submissions > 0 
              THEN ((c.total_submissions - p.total_submissions)::numeric / p.total_submissions * 100)
              ELSE 0 
         END as metric_change_percent
  FROM current_period c, previous_period p
  UNION ALL
  SELECT 'Average QA Score' as metric_name,
         ROUND(c.avg_qa_score, 2) as metric_value,
         CASE WHEN p.avg_qa_score > 0 
              THEN ROUND(((c.avg_qa_score - p.avg_qa_score) / p.avg_qa_score * 100), 2)
              ELSE 0 
         END as metric_change_percent
  FROM current_period c, previous_period p
  UNION ALL
  SELECT 'Approved Submissions' as metric_name,
         c.approved_count::numeric as metric_value,
         CASE WHEN p.approved_count > 0 
              THEN ((c.approved_count - p.approved_count)::numeric / p.approved_count * 100)
              ELSE 0 
         END as metric_change_percent
  FROM current_period c, previous_period p;
END;
$$ LANGUAGE plpgsql;