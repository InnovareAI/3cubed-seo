-- Seed data for SEO Review system
-- This creates sample data for testing the live data functionality

-- Insert sample clients
INSERT INTO clients (id, name, company_domain, contact_name, contact_email, status) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pharma Corp Inc', 'pharmacorp.com', 'John Smith', 'john.smith@pharmacorp.com', 'active'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'BioTech Solutions', 'biotechsolutions.com', 'Jane Doe', 'jane.doe@biotechsolutions.com', 'active'),
  ('c3d4e5f6-a7b8-9012-cdef-34567890abcd', 'MedTech Innovations', 'medtechinnovations.com', 'Bob Johnson', 'bob.johnson@medtechinnovations.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, client_id, name, product_name, therapeutic_area, status) VALUES
  ('d4e5f6a7-b8c9-0123-defa-4567890abcde', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cardio Launch 2025', 'CardioMax', 'Cardiovascular', 'active'),
  ('e5f6a7b8-c9d0-1234-efab-567890abcdef', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Diabetes Campaign', 'GlucoControl', 'Diabetes', 'active'),
  ('f6a7b8c9-d0e1-2345-fabc-67890abcdef1', 'c3d4e5f6-a7b8-9012-cdef-34567890abcd', 'Oncology Content', 'OncoTherapy', 'Oncology', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample submissions with SEO data
INSERT INTO submissions (
  id, 
  client_id, 
  project_id,
  compliance_id,
  submitter_name,
  submitter_email,
  product_name,
  therapeutic_area,
  stage,
  priority_level,
  raw_input_content,
  langchain_status,
  workflow_stage,
  target_audience,
  medical_indication,
  key_differentiators,
  mechanism_of_action,
  geography,
  client_name,
  sponsor_name,
  created_at
) VALUES
  (
    'a7b8c9d0-e1f2-3456-abcd-7890abcdef12',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'd4e5f6a7-b8c9-0123-defa-4567890abcde',
    'CMP-2025-001',
    'Dr. Sarah Wilson',
    'sarah.wilson@pharmacorp.com',
    'CardioMax',
    'Cardiovascular',
    'Launch',
    'High',
    'CardioMax is a revolutionary cardiovascular treatment...',
    'completed',
    'ai_processing',
    ARRAY['Healthcare Professionals', 'Cardiologists'],
    'Treatment of chronic heart failure in adult patients',
    ARRAY['First-in-class mechanism', 'Once-daily dosing', 'Proven efficacy'],
    'Selective cardiac myosin activator',
    ARRAY['United States', 'Europe'],
    'Pharma Corp Inc',
    'Pharma Corp Inc',
    NOW() - INTERVAL '2 days'
  ),
  (
    'b8c9d0e1-f2a3-4567-bcde-890abcdef123',
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'e5f6a7b8-c9d0-1234-efab-567890abcdef',
    'CMP-2025-002',
    'Dr. Michael Chen',
    'michael.chen@biotechsolutions.com',
    'GlucoControl',
    'Diabetes',
    'Pre-Launch',
    'Medium',
    'GlucoControl represents a breakthrough in diabetes management...',
    'completed',
    'ai_processing',
    ARRAY['Endocrinologists', 'Primary Care Physicians'],
    'Type 2 diabetes mellitus in adults',
    ARRAY['Superior A1C reduction', 'Weight loss benefit', 'CV protection'],
    'GLP-1 receptor agonist with dual action',
    ARRAY['United States', 'Canada'],
    'BioTech Solutions',
    'BioTech Solutions',
    NOW() - INTERVAL '3 days'
  ),
  (
    'c9d0e1f2-a3b4-5678-cdef-90abcdef1234',
    'c3d4e5f6-a7b8-9012-cdef-34567890abcd',
    'f6a7b8c9-d0e1-2345-fabc-67890abcdef1',
    'CMP-2025-003',
    'Dr. Emily Rodriguez',
    'emily.rodriguez@medtechinnovations.com',
    'OncoTherapy',
    'Oncology',
    'Phase III',
    'High',
    'OncoTherapy is a targeted therapy for specific cancer mutations...',
    'seo_review',
    'seo_review',
    ARRAY['Oncologists', 'Healthcare Professionals'],
    'Advanced non-small cell lung cancer with EGFR mutations',
    ARRAY['Targeted therapy', 'Improved progression-free survival', 'Oral administration'],
    'EGFR tyrosine kinase inhibitor',
    ARRAY['United States', 'Europe', 'Asia'],
    'MedTech Innovations',
    'MedTech Innovations',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Run SEO automation for the AI processing submissions
SELECT run_seo_automation('a7b8c9d0-e1f2-3456-abcd-7890abcdef12');
SELECT run_seo_automation('b8c9d0e1-f2a3-4567-bcde-890abcdef123');

-- Add some SEO data to the third submission manually (it's already in seo_review)
UPDATE submissions
SET 
  seo_keywords = ARRAY['onco therapy', 'egfr inhibitor', 'lung cancer treatment', 'targeted therapy'],
  long_tail_keywords = ARRAY['what is oncotherapy for lung cancer', 'egfr mutation treatment options', 'oncotherapy side effects'],
  seo_title = 'OncoTherapy - Targeted EGFR Lung Cancer Treatment',
  meta_title = 'OncoTherapy - Targeted EGFR Lung Cancer Treatment',
  meta_description = 'Learn about OncoTherapy, a targeted therapy for advanced non-small cell lung cancer with EGFR mutations. Improved survival with oral treatment.',
  h2_tags = ARRAY['What is OncoTherapy?', 'How Does OncoTherapy Work?', 'Who Can Benefit from OncoTherapy?', 'Clinical Trial Results'],
  geo_event_tags = ARRAY['World Cancer Day', 'Lung Cancer Awareness Month', 'ASCO Annual Meeting 2025'],
  geo_optimization_score = 88,
  geo_readability_score = 92,
  geo_featured_snippet_potential = true
WHERE id = 'c9d0e1f2-a3b4-5678-cdef-90abcdef1234';

-- Insert some SEO metrics for tracking
INSERT INTO seo_metrics (submission_id, organic_traffic, keyword_rankings, backlinks_count, page_speed_score) VALUES
  ('c9d0e1f2-a3b4-5678-cdef-90abcdef1234', 1250, '{"oncotherapy": 3, "egfr inhibitor": 5, "lung cancer treatment": 8}'::jsonb, 45, 92);

-- Output confirmation
SELECT COUNT(*) as total_submissions FROM submissions WHERE workflow_stage IN ('ai_processing', 'seo_review');
