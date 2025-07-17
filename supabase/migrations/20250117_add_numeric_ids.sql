-- Add numeric IDs to clients and projects tables
-- These will be auto-incrementing integers that are more user-friendly

-- Add client_number to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_number SERIAL UNIQUE;

-- Add project_number to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_number SERIAL UNIQUE;

-- Create a sequence for submission numbers if we want those too
CREATE SEQUENCE IF NOT EXISTS submission_number_seq START 1000;

-- Add submission_number to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS submission_number INTEGER UNIQUE;

-- Set default for new submissions to use the sequence
ALTER TABLE submissions 
ALTER COLUMN submission_number 
SET DEFAULT nextval('submission_number_seq');

-- Populate existing records with sequential numbers
UPDATE clients 
SET client_number = sub.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM clients 
  WHERE client_number IS NULL
) sub 
WHERE clients.id = sub.id;

UPDATE projects 
SET project_number = sub.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM projects 
  WHERE project_number IS NULL
) sub 
WHERE projects.id = sub.id;

UPDATE submissions 
SET submission_number = 1000 + sub.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM submissions 
  WHERE submission_number IS NULL
) sub 
WHERE submissions.id = sub.id;

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_clients_client_number ON clients(client_number);
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_submissions_submission_number ON submissions(submission_number);

-- Update the project_overview view to include numeric IDs
CREATE OR REPLACE VIEW project_overview AS
SELECT 
  c.id as client_id,
  c.client_number,
  c.name as client_name,
  c.status as client_status,
  p.id as project_id,
  p.project_number,
  p.name as project_name,
  p.product_name,
  p.therapeutic_area,
  COUNT(DISTINCT s.id) as total_submissions,
  COUNT(DISTINCT CASE WHEN s.langchain_status = 'needs_processing' THEN s.id END) as pending_ai,
  COUNT(DISTINCT CASE WHEN s.langchain_status = 'needs_review' THEN s.id END) as pending_seo_review,
  COUNT(DISTINCT CASE WHEN s.langchain_status = 'client_review' THEN s.id END) as pending_client_review,
  COUNT(DISTINCT CASE WHEN s.langchain_status = 'mlr_review' THEN s.id END) as pending_mlr_review,
  COUNT(DISTINCT CASE WHEN s.langchain_status = 'rejected' OR s.langchain_status = 'revision_requested' THEN s.id END) as pending_revisions,
  COUNT(DISTINCT CASE WHEN s.langchain_status = 'published' THEN s.id END) as published,
  MAX(s.updated_at) as last_activity
FROM clients c
LEFT JOIN projects p ON c.id = p.client_id
LEFT JOIN submissions s ON p.id = s.project_id
GROUP BY c.id, c.client_number, c.name, c.status, p.id, p.project_number, p.name, p.product_name, p.therapeutic_area;

-- Create a formatted ID view for easy reference
CREATE OR REPLACE VIEW submission_summary AS
SELECT 
  s.id,
  s.submission_number,
  CONCAT('SUB-', LPAD(s.submission_number::text, 5, '0')) as submission_ref,
  c.client_number,
  CONCAT('CLIENT-', LPAD(c.client_number::text, 3, '0')) as client_ref,
  c.name as client_name,
  p.project_number,
  CONCAT('PROJ-', LPAD(p.project_number::text, 4, '0')) as project_ref,
  p.name as project_name,
  s.product_name,
  s.therapeutic_area,
  s.langchain_status,
  s.workflow_stage,
  s.priority_level,
  s.created_at,
  s.updated_at
FROM submissions s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN projects p ON s.project_id = p.id;

-- Example of how the IDs will look:
-- Client: CLIENT-001, CLIENT-002, etc.
-- Project: PROJ-0001, PROJ-0002, etc.
-- Submission: SUB-01000, SUB-01001, etc.
