export const mockSEOReviews = [
  {
    id: 'mock-1',
    product_name: 'Xeltoris™ (evolocumab)',
    therapeutic_area: 'Cardiology',
    stage: 'Market Launch',
    workflow_stage: 'SEO_Review',
    target_audience: ['Healthcare Professionals', 'Patients'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    submitter_name: 'Dr. Sarah Chen',
    submitter_email: 'sarah.chen@pharmatech.com',
    priority_level: 'High',
    medical_indication: 'Primary hyperlipidemia and mixed dyslipidemia for reducing cardiovascular risk',
    langchain_status: 'complete',
    geography: ['United States', 'Canada'],
    client_name: 'PharmaTech Solutions',
    mechanism_of_action: 'Monoclonal antibody that inhibits PCSK9, increasing LDL receptor expression',
    key_differentiators: [
      'Once-monthly subcutaneous injection',
      'Proven 60% LDL reduction',
      'Superior cardiovascular outcomes',
      'Well-tolerated safety profile'
    ],
    seo_keywords: [
      'PCSK9 inhibitor',
      'evolocumab',
      'cholesterol medication',
      'LDL reduction',
      'cardiovascular risk reduction'
    ],
    long_tail_keywords: [
      'how does evolocumab lower cholesterol',
      'PCSK9 inhibitor side effects',
      'evolocumab vs statins comparison',
      'monthly cholesterol injection treatment'
    ],
    consumer_questions: [
      'What is the difference between evolocumab and statins?',
      'How effective is evolocumab at lowering cholesterol?',
      'What are the common side effects of PCSK9 inhibitors?',
      'Is evolocumab covered by insurance?'
    ],
    h1_tag: 'Xeltoris™ (evolocumab): Advanced PCSK9 Inhibitor for Cholesterol Management',
    meta_description: 'Learn about Xeltoris™ (evolocumab), a once-monthly PCSK9 inhibitor that reduces LDL cholesterol by up to 60% and lowers cardiovascular risk. FDA-approved treatment option.'
  },
  {
    id: 'mock-2',
    product_name: 'NeurogeniX®',
    therapeutic_area: 'Neurology',
    stage: 'Phase III',
    workflow_stage: 'SEO_Review',
    target_audience: ['Healthcare Professionals', 'Caregivers'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    submitter_name: 'Michael Rodriguez',
    submitter_email: 'mrodriguez@neurocare.com',
    priority_level: 'Medium',
    medical_indication: 'Treatment of mild to moderate Alzheimer's disease symptoms',
    langchain_status: 'complete',
    geography: ['United States', 'European Union'],
    client_name: 'NeuroCare Pharmaceuticals',
    mechanism_of_action: 'Dual-action acetylcholinesterase inhibitor with neuroprotective properties',
    key_differentiators: [
      'Novel dual-mechanism approach',
      'Sustained cognitive improvement',
      'Neuroprotective benefits',
      'Once-daily oral dosing'
    ],
    seo_keywords: [
      'Alzheimer's treatment',
      'dementia medication',
      'cognitive enhancement drug',
      'neuroprotective therapy',
      'acetylcholinesterase inhibitor'
    ],
    long_tail_keywords: [
      'new Alzheimer's medication 2025',
      'best drugs for early stage dementia',
      'how to slow Alzheimer's progression',
      'NeurogeniX clinical trial results'
    ],
    consumer_questions: [
      'What makes NeurogeniX different from other Alzheimer's drugs?',
      'Can NeurogeniX reverse memory loss?',
      'What are the side effects of NeurogeniX?',
      'When will NeurogeniX be available?'
    ],
    h1_tag: 'NeurogeniX®: Breakthrough Dual-Action Treatment for Alzheimer's Disease',
    meta_description: 'Discover NeurogeniX®, an innovative Alzheimer's treatment combining cognitive enhancement with neuroprotection. Currently in Phase III trials with promising results.'
  },
  {
    id: 'mock-3',
    product_name: 'ImmunoShield™',
    therapeutic_area: 'Immunology',
    stage: 'Pre-Launch',
    workflow_stage: 'SEO_Review',
    target_audience: ['Patients', 'Healthcare Professionals', 'Payers'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    submitter_name: 'Dr. Emily Watson',
    submitter_email: 'ewatson@immunobio.com',
    priority_level: 'High',
    medical_indication: 'Moderate to severe rheumatoid arthritis in adults with inadequate response to conventional DMARDs',
    langchain_status: 'complete',
    geography: ['United States', 'Japan', 'Germany'],
    client_name: 'ImmunoBio Therapeutics',
    mechanism_of_action: 'Selective JAK1 inhibitor that modulates immune response without broad immunosuppression',
    key_differentiators: [
      'Selective JAK1 inhibition',
      'Rapid onset of action',
      'Favorable safety profile',
      'Oral administration',
      'No routine lab monitoring required'
    ],
    seo_keywords: [
      'JAK inhibitor rheumatoid arthritis',
      'ImmunoShield RA treatment',
      'selective JAK1 inhibitor',
      'oral RA medication',
      'DMARD alternative'
    ],
    long_tail_keywords: [
      'best JAK inhibitor for rheumatoid arthritis 2025',
      'ImmunoShield vs methotrexate comparison',
      'new oral treatments for RA pain',
      'selective JAK1 inhibitor side effects',
      'how long does ImmunoShield take to work'
    ],
    consumer_questions: [
      'Is ImmunoShield safer than other JAK inhibitors?',
      'How quickly will I see results with ImmunoShield?',
      'Can I take ImmunoShield with methotrexate?',
      'What is the cost of ImmunoShield treatment?',
      'Do I need regular blood tests while taking ImmunoShield?'
    ],
    h1_tag: 'ImmunoShield™: Next-Generation Selective JAK1 Inhibitor for Rheumatoid Arthritis',
    meta_description: 'ImmunoShield™ offers targeted RA treatment with selective JAK1 inhibition. Experience rapid relief with improved safety and no routine monitoring. FDA approval pending.'
  }
];
