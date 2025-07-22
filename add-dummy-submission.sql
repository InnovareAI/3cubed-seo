-- Add a dummy submission for testing SEO Review with GEO fields
INSERT INTO submissions (
  id,
  compliance_id,
  submitter_name,
  submitter_email,
  product_name,
  therapeutic_area,
  stage,
  priority_level,
  workflow_stage,
  langchain_status,
  langchain_retry_count,
  raw_input_content,
  -- SEO Fields
  seo_keywords,
  long_tail_keywords,
  consumer_questions,
  h1_tag,
  meta_title,
  meta_description,
  -- Additional fields
  target_audience,
  geography,
  client_name,
  mechanism_of_action,
  key_differentiators,
  medical_indication,
  -- GEO Optimization fields
  geo_event_tags,
  geo_optimization,
  -- Timestamps
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'COMP-TEST-001',
  'Dr. Sarah Chen',
  'sarah.chen@pharmatech.com',
  'Xeltoris™ (evolocumab)',
  'Cardiology',
  'Market Launch',
  'High',
  'seo_review', -- This ensures it shows up in SEO Review
  'complete',
  0,
  '{"submitter_name":"Dr. Sarah Chen","product_name":"Xeltoris™ (evolocumab)","therapeutic_area":"Cardiology"}',
  -- SEO Keywords
  ARRAY['PCSK9 inhibitor', 'evolocumab', 'cholesterol medication', 'LDL reduction', 'cardiovascular risk reduction'],
  -- Long-tail keywords
  ARRAY['how does evolocumab lower cholesterol', 'PCSK9 inhibitor side effects', 'evolocumab vs statins comparison', 'monthly cholesterol injection treatment'],
  -- Consumer questions
  ARRAY['What is the difference between evolocumab and statins?', 'How effective is evolocumab at lowering cholesterol?', 'What are the common side effects of PCSK9 inhibitors?', 'Is evolocumab covered by insurance?'],
  -- SEO tags
  'Xeltoris™ (evolocumab): Advanced PCSK9 Inhibitor for Cholesterol Management',
  'Learn about Xeltoris™: Once-Monthly PCSK9 Inhibitor | 60% LDL Reduction',
  'Discover Xeltoris™ (evolocumab), a once-monthly PCSK9 inhibitor that reduces LDL cholesterol by up to 60% and lowers cardiovascular risk. FDA-approved treatment.',
  -- Additional fields
  ARRAY['Healthcare Professionals', 'Patients'],
  ARRAY['United States', 'Canada'],
  'PharmaTech Solutions',
  'Monoclonal antibody that inhibits PCSK9, increasing LDL receptor expression',
  ARRAY['Once-monthly subcutaneous injection', 'Proven 60% LDL reduction', 'Superior cardiovascular outcomes', 'Well-tolerated safety profile'],
  'Primary hyperlipidemia and mixed dyslipidemia for reducing cardiovascular risk',
  -- GEO Event Tags
  ARRAY['PCSK9 inhibitor', 'cholesterol lowering drug', 'cardiovascular medication', 'evolocumab', 'monoclonal antibody'],
  -- GEO Optimization JSON
  jsonb_build_object(
    'ai_friendly_summary', 'Xeltoris (evolocumab) is a PCSK9 inhibitor that reduces LDL cholesterol by 60% through monthly subcutaneous injections. FDA-approved for cardiovascular risk reduction in patients with hyperlipidemia.',
    'structured_data', jsonb_build_object(
      'drug_name', 'evolocumab',
      'brand_name', 'Xeltoris',
      'drug_class', 'PCSK9 inhibitor',
      'indication', 'hyperlipidemia',
      'mechanism', 'PCSK9 inhibition',
      'administration', 'subcutaneous injection',
      'frequency', 'once monthly',
      'fda_status', 'approved',
      'reduction_rate', '60% LDL reduction'
    ),
    'key_facts', ARRAY[
      'Reduces LDL cholesterol by up to 60%',
      'Monthly subcutaneous injection',
      'Monoclonal antibody targeting PCSK9',
      'FDA-approved for cardiovascular risk reduction',
      'Well-tolerated with minimal side effects'
    ],
    'ai_citations', 'Clinical trials: FOURIER (27,564 patients), OSLER (4,465 patients), GLAGOV (968 patients)'
  ),
  NOW(),
  NOW()
);

-- Optional: Add a second submission for variety
INSERT INTO submissions (
  id,
  compliance_id,
  submitter_name,
  submitter_email,
  product_name,
  therapeutic_area,
  stage,
  priority_level,
  workflow_stage,
  langchain_status,
  langchain_retry_count,
  raw_input_content,
  seo_keywords,
  long_tail_keywords,
  consumer_questions,
  h1_tag,
  meta_title,
  meta_description,
  target_audience,
  geography,
  client_name,
  mechanism_of_action,
  key_differentiators,
  medical_indication,
  geo_event_tags,
  geo_optimization,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'COMP-TEST-002',
  'Michael Rodriguez',
  'mrodriguez@neurocare.com',
  'NeurogeniX®',
  'Neurology',
  'Phase III',
  'Medium',
  'seo_review',
  'complete',
  0,
  '{"submitter_name":"Michael Rodriguez","product_name":"NeurogeniX®","therapeutic_area":"Neurology"}',
  ARRAY['Alzheimer''s treatment', 'dementia medication', 'cognitive enhancement drug', 'neuroprotective therapy', 'acetylcholinesterase inhibitor'],
  ARRAY['new Alzheimer''s medication 2025', 'best drugs for early stage dementia', 'how to slow Alzheimer''s progression', 'NeurogeniX clinical trial results'],
  ARRAY['What makes NeurogeniX different from other Alzheimer''s drugs?', 'Can NeurogeniX reverse memory loss?', 'What are the side effects of NeurogeniX?', 'When will NeurogeniX be available?'],
  'NeurogeniX®: Breakthrough Dual-Action Treatment for Alzheimer''s Disease',
  'NeurogeniX® for Alzheimer''s | Dual-Action Neuroprotective Treatment',
  'Discover NeurogeniX®, an innovative Alzheimer''s treatment combining cognitive enhancement with neuroprotection. Currently in Phase III trials with promising results.',
  ARRAY['Healthcare Professionals', 'Caregivers'],
  ARRAY['United States', 'European Union'],
  'NeuroCare Pharmaceuticals',
  'Dual-action acetylcholinesterase inhibitor with neuroprotective properties',
  ARRAY['Novel dual-mechanism approach', 'Sustained cognitive improvement', 'Neuroprotective benefits', 'Once-daily oral dosing'],
  'Treatment of mild to moderate Alzheimer''s disease symptoms',
  ARRAY['Alzheimer''s treatment', 'dementia drug', 'neuroprotective therapy', 'cognitive enhancer'],
  jsonb_build_object(
    'ai_friendly_summary', 'NeurogeniX is a dual-action Alzheimer''s treatment combining acetylcholinesterase inhibition with neuroprotective properties. Currently in Phase III trials showing sustained cognitive improvement.',
    'structured_data', jsonb_build_object(
      'drug_name', 'NeurogeniX',
      'drug_class', 'acetylcholinesterase inhibitor',
      'indication', 'Alzheimer''s disease',
      'mechanism', 'dual-action neuroprotection',
      'administration', 'oral',
      'frequency', 'once daily',
      'stage', 'Phase III clinical trials',
      'target_population', 'mild to moderate Alzheimer''s'
    ),
    'key_facts', ARRAY[
      'Dual-mechanism: cognitive enhancement + neuroprotection',
      'Once-daily oral dosing',
      'Phase III trials showing sustained improvement',
      'Targets mild to moderate Alzheimer''s',
      'Novel approach to disease modification'
    ],
    'ai_citations', 'Phase III CLARITY trial (n=2,100), Phase II MINDFUL study (n=850)'
  ),
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Verify the insertions
SELECT 
  id,
  compliance_id,
  product_name,
  therapeutic_area,
  workflow_stage,
  priority_level,
  array_length(seo_keywords, 1) as keyword_count,
  array_length(geo_event_tags, 1) as geo_tag_count,
  geo_optimization->>'ai_friendly_summary' as ai_summary_preview
FROM submissions 
WHERE workflow_stage = 'seo_review'
ORDER BY created_at DESC;