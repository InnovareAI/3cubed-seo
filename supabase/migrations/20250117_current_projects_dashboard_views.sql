-- Migration: Create Current Projects Dashboard Views
-- Description: Creates views for the current projects dashboard that aggregates status from all workflow stages
-- Date: 2025-01-17

-- Create a comprehensive current projects view that aggregates from all workflow stages
CREATE OR REPLACE VIEW current_projects_dashboard AS
WITH submission_status_summary AS (
  -- Get real-time status counts for each project
  SELECT 
    p.id as project_id,
    p.client_id,
    
    -- Count submissions in each workflow stage
    COUNT(DISTINCT s.id) as total_submissions,
    
    -- Form Submitted stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'Form_Submitted' THEN s.id END) as form_submitted,
    
    -- AI Processing stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'AI_Processing' THEN s.id END) as ai_processing,
    
    -- SEO Review stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'SEO_Review' THEN s.id END) as seo_review,
    
    -- Client Review stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'Client_Review' THEN s.id END) as client_review,
    
    -- Revision Requested stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'Revision_Requested' THEN s.id END) as revision_requested,
    
    -- MLR Review stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'MLR_Review' THEN s.id END) as mlr_review,
    
    -- Published stage
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'Published' THEN s.id END) as published,
    
    -- Total pending reviews (anything not published or in revision)
    COUNT(DISTINCT CASE 
      WHEN s.workflow_stage IN ('SEO_Review', 'Client_Review', 'MLR_Review') 
      THEN s.id 
    END) as pending_reviews,
    
    -- Total approved (published)
    COUNT(DISTINCT CASE WHEN s.workflow_stage = 'Published' THEN s.id END) as approved_count,
    
    -- Last activity
    MAX(s.updated_at) as last_submission_update
    
  FROM projects p
  LEFT JOIN submissions s ON p.id = s.project_id
  GROUP BY p.id, p.client_id
)
SELECT 
  c.id as client_id,
  c.name as client_name,
  c.company_domain,
  c.status as client_status,
  
  -- Product count (distinct products across all projects)
  COUNT(DISTINCT p.product_name) as products_count,
  
  -- Active campaigns (active projects)
  COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_campaigns,
  
  -- Aggregate pending reviews from all active projects
  COALESCE(SUM(ss.pending_reviews), 0) as pending_reviews,
  
  -- Calculate approval rate based on completed vs total
  CASE 
    WHEN COALESCE(SUM(ss.total_submissions), 0) > 0 
    THEN ROUND(
      (COALESCE(SUM(ss.approved_count), 0)::NUMERIC / SUM(ss.total_submissions)) * 100
    )
    ELSE 0 
  END as approval_rate,
  
  -- Format approval rate for display
  CASE 
    WHEN COALESCE(SUM(ss.total_submissions), 0) > 0 
    THEN ROUND(
      (COALESCE(SUM(ss.approved_count), 0)::NUMERIC / SUM(ss.total_submissions)) * 100
    ) || '%'
    ELSE 'N/A' 
  END as approval_rate_display,
  
  -- Last activity across all tables
  TO_CHAR(
    GREATEST(
      MAX(c.updated_at),
      MAX(p.updated_at),
      MAX(ss.last_submission_update)
    ), 
    'MM/DD/YYYY'
  ) as last_activity,
  
  -- Raw date for sorting
  GREATEST(
    MAX(c.updated_at),
    MAX(p.updated_at),
    MAX(ss.last_submission_update)
  ) as last_activity_date
  
FROM clients c
LEFT JOIN projects p ON c.id = p.client_id
LEFT JOIN submission_status_summary ss ON p.id = ss.project_id
GROUP BY c.id, c.name, c.company_domain, c.status;

-- Create view for summary statistics (top cards)
CREATE OR REPLACE VIEW dashboard_summary_stats AS
SELECT 
  -- Total Clients
  COUNT(DISTINCT c.id) as total_clients,
  
  -- Active Projects (not paused or completed)
  COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
  
  -- Pending Reviews (aggregated from all workflow stages)
  COUNT(DISTINCT CASE 
    WHEN s.workflow_stage IN ('SEO_Review', 'Client_Review', 'MLR_Review') 
    THEN s.id 
  END) as pending_reviews,
  
  -- Average Approval Rate
  CASE 
    WHEN COUNT(DISTINCT s.id) > 0 
    THEN ROUND(
      (COUNT(DISTINCT CASE WHEN s.workflow_stage = 'Published' THEN s.id END)::NUMERIC 
      / COUNT(DISTINCT s.id)) * 100
    )
    ELSE 0 
  END as avg_approval_rate
  
FROM clients c
LEFT JOIN projects p ON c.id = p.client_id
LEFT JOIN submissions s ON p.id = s.project_id;

-- Create a real-time status feed view for monitoring changes
CREATE OR REPLACE VIEW workflow_status_feed AS
SELECT 
  s.id as submission_id,
  s.content_title,
  s.workflow_stage,
  s.langchain_status,
  c.name as client_name,
  p.name as project_name,
  s.updated_at,
  
  -- Calculate time in current stage
  EXTRACT(EPOCH FROM (NOW() - s.updated_at)) / 3600 as hours_in_stage,
  
  -- Flag items that might be stuck
  CASE 
    WHEN s.workflow_stage IN ('SEO_Review', 'Client_Review', 'MLR_Review') 
      AND EXTRACT(EPOCH FROM (NOW() - s.updated_at)) / 3600 > 48 
    THEN true 
    ELSE false 
  END as needs_attention
  
FROM submissions s
JOIN projects p ON s.project_id = p.id
JOIN clients c ON p.client_id = c.id
WHERE s.workflow_stage != 'Published'
ORDER BY 
  CASE 
    WHEN s.workflow_stage = 'Revision_Requested' THEN 1
    WHEN s.workflow_stage IN ('SEO_Review', 'Client_Review', 'MLR_Review') THEN 2
    ELSE 3
  END,
  s.updated_at ASC;

-- Add comments for documentation
COMMENT ON VIEW current_projects_dashboard IS 'Main dashboard view showing real-time project status aggregated from all workflow stages';
COMMENT ON VIEW dashboard_summary_stats IS 'Summary statistics for dashboard cards showing totals and averages';
COMMENT ON VIEW workflow_status_feed IS 'Real-time feed of items in progress with attention flags for stuck items';
