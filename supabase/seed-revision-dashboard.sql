-- Test data for Revision Dashboard
-- This script creates test submissions in the Revision_Requested workflow stage
-- with various rejection reasons from SEO, Client, and MLR reviewers

-- Clear existing test revision data (optional - uncomment if needed)
-- DELETE FROM submissions WHERE workflow_stage = 'Revision_Requested' AND product_name LIKE 'Test%';

-- Insert test revision requests from different reviewers
INSERT INTO submissions (
  product_name,
  therapeutic_area,
  stage,
  workflow_stage,
  priority_level,
  submitter_name,
  submitter_email,
  indication,
  target_audience,
  langchain_status,
  rejection_stage,
  rejection_reason,
  rejected_by,
  rejected_at,
  ai_output,
  created_at,
  updated_at
) VALUES 
-- SEO Review Rejections
(
  'Test Drug Alpha',
  'Oncology',
  'Phase III',
  'Revision_Requested',
  'high',
  'Dr. Sarah Johnson',
  'sarah.johnson@pharma.com',
  'Non-small cell lung cancer',
  'Healthcare Professionals',
  'revision_requested',
  'SEO_Review',
  'Content lacks proper keyword optimization for "NSCLC treatment options" and "targeted therapy". Meta descriptions need improvement. Header structure (H1, H2, H3) is not properly organized for search engines.',
  'John Smith (SEO Team)',
  NOW() - INTERVAL '2 days',
  '{"content": "Sample content about Test Drug Alpha for NSCLC treatment..."}',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '2 days'
),
(
  'Test Therapy Beta',
  'Cardiology',
  'Phase II',
  'Revision_Requested',
  'medium',
  'Dr. Michael Chen',
  'michael.chen@pharma.com',
  'Atrial fibrillation',
  'Patients',
  'revision_requested',
  'SEO_Review',
  'Missing alt text for images. URL structure needs to be more SEO-friendly. Internal linking strategy is weak - need to link to related cardiovascular content.',
  'Emily Davis (SEO Team)',
  NOW() - INTERVAL '5 days',
  '{"content": "Test Therapy Beta information for patients with AFib..."}',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '5 days'
),
(
  'Test Vaccine Gamma',
  'Immunology',
  'Pre-Clinical',
  'Revision_Requested',
  'low',
  'Dr. Lisa Anderson',
  'lisa.anderson@pharma.com',
  'Seasonal influenza prevention',
  'General Public',
  'revision_requested',
  'SEO_Review',
  'Page load speed is too slow due to unoptimized images. Content needs to target long-tail keywords like "new flu vaccine 2024" and "innovative influenza prevention".',
  'John Smith (SEO Team)',
  NOW() - INTERVAL '8 days',
  '{"content": "Revolutionary approach to flu prevention using Test Vaccine Gamma..."}',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '8 days'
),

-- Client Review Rejections
(
  'Test Treatment Delta',
  'Neurology',
  'Phase III',
  'Revision_Requested',
  'high',
  'Dr. Robert Taylor',
  'robert.taylor@pharma.com',
  'Alzheimer\'s disease',
  'Healthcare Professionals',
  'revision_requested',
  'Client_Review',
  'The messaging doesn\'t align with our brand voice. Need to emphasize patient quality of life improvements more prominently. Remove competitive comparisons as per legal guidance.',
  'Patricia Wilson (Client Team)',
  NOW() - INTERVAL '1 day',
  '{"content": "Test Treatment Delta offers new hope for Alzheimer\'s patients..."}',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '1 day'
),
(
  'Test Solution Epsilon',
  'Dermatology',
  'Market Launch',
  'Revision_Requested',
  'high',
  'Dr. Jennifer Martinez',
  'jennifer.martinez@pharma.com',
  'Psoriasis',
  'Patients',
  'revision_requested',
  'Client_Review',
  'Patient testimonials need to be updated with more recent cases. The pricing information section should be removed. Add more emphasis on the convenience of administration.',
  'Mark Thompson (Client Team)',
  NOW() - INTERVAL '3 days',
  '{"content": "Living with psoriasis? Test Solution Epsilon can help..."}',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '3 days'
),
(
  'Test Medication Zeta',
  'Psychiatry',
  'Phase II',
  'Revision_Requested',
  'medium',
  'Dr. David Brown',
  'david.brown@pharma.com',
  'Major depressive disorder',
  'Healthcare Professionals',
  'revision_requested',
  'Client_Review',
  'The clinical trial data presentation is too technical. Simplify the efficacy section. Add more information about the patient support program.',
  'Patricia Wilson (Client Team)',
  NOW() - INTERVAL '7 days',
  '{"content": "Breakthrough in depression treatment with Test Medication Zeta..."}',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '7 days'
),

-- MLR Review Rejections
(
  'Test Compound Eta',
  'Endocrinology',
  'Phase III',
  'Revision_Requested',
  'high',
  'Dr. Michelle Lee',
  'michelle.lee@pharma.com',
  'Type 2 diabetes',
  'Healthcare Professionals',
  'revision_requested',
  'MLR_Review',
  'Claims about "superior efficacy" must be supported by head-to-head trial data. The safety profile section needs to include all adverse events from the clinical trials. Add proper disclaimers for off-label use.',
  'Dr. Richard Stone (MLR Committee)',
  NOW() - INTERVAL '4 days',
  '{"content": "Test Compound Eta: A new approach to glycemic control..."}',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '4 days'
),
(
  'Test Biologic Theta',
  'Rheumatology',
  'Market Launch',
  'Revision_Requested',
  'high',
  'Dr. James Wilson',
  'james.wilson@pharma.com',
  'Rheumatoid arthritis',
  'Patients',
  'revision_requested',
  'MLR_Review',
  'Patient-facing content cannot make superiority claims without substantiation. The mechanism of action diagram needs medical accuracy review. Include full prescribing information link.',
  'Dr. Susan Miller (MLR Committee)',
  NOW() - INTERVAL '6 days',
  '{"content": "Take control of your RA with Test Biologic Theta..."}',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '6 days'
),
(
  'Test Innovation Iota',
  'Ophthalmology',
  'Phase II',
  'Revision_Requested',
  'medium',
  'Dr. Karen Davis',
  'karen.davis@pharma.com',
  'Age-related macular degeneration',
  'Healthcare Professionals',
  'revision_requested',
  'MLR_Review',
  'The clinical endpoints section needs clarification. Remove any implied claims about reversing vision loss. Add appropriate risk information for intravitreal administration.',
  'Dr. Richard Stone (MLR Committee)',
  NOW() - INTERVAL '10 days',
  '{"content": "Test Innovation Iota for AMD: Preserving vision for the future..."}',
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '10 days'
),

-- Mixed priority old revisions
(
  'Test Formula Kappa',
  'Gastroenterology',
  'Phase I',
  'Revision_Requested',
  'low',
  'Dr. Thomas Anderson',
  'thomas.anderson@pharma.com',
  'Inflammatory bowel disease',
  'Healthcare Professionals',
  'revision_requested',
  'SEO_Review',
  'Content is too short for SEO effectiveness. Need at least 1500 words. Add FAQ section with schema markup. Include more internal links to IBD resources.',
  'Emily Davis (SEO Team)',
  NOW() - INTERVAL '12 days',
  '{"content": "Early-stage research on Test Formula Kappa for IBD..."}',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '12 days'
),
(
  'Test Protocol Lambda',
  'Pulmonology',
  'Pre-Clinical',
  'Revision_Requested',
  'medium',
  'Dr. Nancy White',
  'nancy.white@pharma.com',
  'Chronic obstructive pulmonary disease',
  'Researchers',
  'revision_requested',
  'Client_Review',
  'The research collaboration section needs to highlight our university partnerships. Remove preliminary efficacy projections. Add contact information for research inquiries.',
  'Mark Thompson (Client Team)',
  NOW() - INTERVAL '15 days',
  '{"content": "Test Protocol Lambda: Next-generation COPD research..."}',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '15 days'
);

-- Update the counts to create a realistic distribution
-- This query will show the distribution of revisions by type
SELECT 
  rejection_stage,
  COUNT(*) as count,
  ROUND(AVG(EXTRACT(DAY FROM (NOW() - rejected_at))), 1) as avg_days_pending
FROM submissions 
WHERE workflow_stage = 'Revision_Requested'
GROUP BY rejection_stage
ORDER BY count DESC;

-- Show high priority items
SELECT 
  product_name,
  rejection_stage,
  priority_level,
  EXTRACT(DAY FROM (NOW() - rejected_at)) as days_pending
FROM submissions 
WHERE workflow_stage = 'Revision_Requested'
  AND (priority_level = 'high' OR EXTRACT(DAY FROM (NOW() - rejected_at)) >= 7)
ORDER BY days_pending DESC;
