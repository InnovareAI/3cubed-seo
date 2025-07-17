-- Data migration to populate clients and projects from existing submissions
-- This should be run after the schema migration

-- Step 1: Create clients from unique email domains
INSERT INTO clients (name, company_domain, contact_email, status)
SELECT DISTINCT
  CASE 
    WHEN SPLIT_PART(submitter_email, '@', 2) = 'pharmaco.com' THEN 'PharmaCo'
    WHEN SPLIT_PART(submitter_email, '@', 2) = 'biotech.com' THEN 'BioTech Inc'
    WHEN SPLIT_PART(submitter_email, '@', 2) = 'medtech.com' THEN 'MedTech Solutions'
    WHEN SPLIT_PART(submitter_email, '@', 2) = 'test.com' THEN 'Test Company'
    WHEN SPLIT_PART(submitter_email, '@', 2) = 'example.com' THEN 'Example Corp'
    ELSE INITCAP(REPLACE(SPLIT_PART(SPLIT_PART(submitter_email, '@', 2), '.', 1), '-', ' '))
  END as name,
  SPLIT_PART(submitter_email, '@', 2) as company_domain,
  submitter_email as contact_email,
  'active' as status
FROM submissions
WHERE submitter_email IS NOT NULL
  AND submitter_email LIKE '%@%'
ON CONFLICT (company_domain) DO NOTHING;

-- Step 2: Create projects from unique product/client combinations
INSERT INTO projects (client_id, name, product_name, therapeutic_area, status)
SELECT DISTINCT
  c.id as client_id,
  s.product_name || ' - ' || s.therapeutic_area as name,
  s.product_name,
  s.therapeutic_area,
  'active' as status
FROM submissions s
JOIN clients c ON SPLIT_PART(s.submitter_email, '@', 2) = c.company_domain
WHERE s.product_name IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 3: Update submissions with client_id and project_id
UPDATE submissions s
SET 
  client_id = c.id,
  project_id = p.id
FROM clients c, projects p
WHERE SPLIT_PART(s.submitter_email, '@', 2) = c.company_domain
  AND p.client_id = c.id
  AND p.product_name = s.product_name
  AND (p.therapeutic_area = s.therapeutic_area OR (p.therapeutic_area IS NULL AND s.therapeutic_area IS NULL));

-- Step 4: Update workflow stages based on langchain_status
UPDATE submissions
SET workflow_stage = CASE
  WHEN langchain_status = 'needs_processing' THEN 'Form_Submitted'
  WHEN langchain_status = 'processing' THEN 'AI_Processing'
  WHEN langchain_status = 'needs_review' THEN 'SEO_Review'
  WHEN langchain_status IN ('seo_approved', 'client_review') THEN 'Client_Review'
  WHEN langchain_status IN ('rejected', 'revision_requested') THEN 'Revision_Requested'
  WHEN langchain_status = 'mlr_review' THEN 'MLR_Review'
  WHEN langchain_status IN ('approved', 'published') THEN 'Published'
  ELSE workflow_stage
END
WHERE workflow_stage = 'Form_Submitted' OR workflow_stage IS NULL;

-- Verify the migration
SELECT 
  'Clients created:' as metric, COUNT(*) as count 
FROM clients
UNION ALL
SELECT 
  'Projects created:' as metric, COUNT(*) as count 
FROM projects
UNION ALL
SELECT 
  'Submissions updated:' as metric, COUNT(*) as count 
FROM submissions 
WHERE client_id IS NOT NULL AND project_id IS NOT NULL;
