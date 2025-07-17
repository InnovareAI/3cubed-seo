-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  company_domain VARCHAR UNIQUE,
  contact_name VARCHAR,
  contact_email VARCHAR,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  product_name VARCHAR,
  therapeutic_area VARCHAR,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE DEFAULT CURRENT_DATE,
  target_completion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Add foreign keys to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Create indexes on submissions for the new columns
CREATE INDEX idx_submissions_client_id ON submissions(client_id);
CREATE INDEX idx_submissions_project_id ON submissions(project_id);

-- Update workflow_stage check constraint to include all stages
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS submissions_workflow_stage_check;

ALTER TABLE submissions 
ADD CONSTRAINT submissions_workflow_stage_check 
CHECK (workflow_stage IN (
  'Form_Submitted',
  'AI_Processing', 
  'SEO_Review',
  'Client_Review',
  'Revision_Requested',
  'MLR_Review',
  'Published'
));

-- Update langchain_status check constraint
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS submissions_langchain_status_check;

ALTER TABLE submissions 
ADD CONSTRAINT submissions_langchain_status_check 
CHECK (langchain_status IN (
  'needs_processing',
  'processing',
  'needs_review',
  'seo_approved',
  'client_review',
  'client_approved',
  'rejected',
  'revision_requested',
  'mlr_review',
  'mlr_approved',
  'approved',
  'published'
));

-- Add revision tracking columns
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rejection_stage VARCHAR,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejected_by VARCHAR,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Create a view for easy project overview
CREATE OR REPLACE VIEW project_overview AS
SELECT 
  c.id as client_id,
  c.name as client_name,
  c.status as client_status,
  p.id as project_id,
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
GROUP BY c.id, c.name, c.status, p.id, p.name, p.product_name, p.therapeutic_area;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
