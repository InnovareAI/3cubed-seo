interface MockSubmission {
  id: string
  compliance_id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience: string[]
  created_at: string
  submitter_name: string
  submitter_email: string
  priority_level: string
  medical_indication?: string
  langchain_status?: string
  geography?: string[]
  client_name?: string
  mechanism_of_action?: string
  key_differentiators?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  meta_title?: string
  meta_description?: string
  seo_title?: string
  geo_event_tags?: string[]
  h2_tags?: string[]
  seo_strategy_outline?: string
  geo_optimization?: any
  geo_optimization_score?: number
  ai_output?: any
  seo_strategy?: any
}

export const mockSEOReviews: MockSubmission[] = [
  {
    id: 'mock-1',
    compliance_id: 'COMP-2024-001',
    product_name: 'Xeltoris™ (evolocumab)',
    therapeutic_area: 'Cardiology',
    stage: 'Market Launch',
    workflow_stage: 'seo_review',
    target_audience: ['Healthcare Professionals', 'Patients'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    submitter_name: 'Dr. Sarah Chen',
    submitter_email: 'sarah.chen@pharmatech.com',
    priority_level: 'high',
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
    meta_title: 'Xeltoris™: Once-Monthly PCSK9 Inhibitor | 60% LDL Reduction',
    meta_description: 'Learn about Xeltoris™ (evolocumab), a once-monthly PCSK9 inhibitor that reduces LDL cholesterol by up to 60% and lowers cardiovascular risk. FDA-approved treatment option.',
    geo_event_tags: ['PCSK9 inhibitor', 'cholesterol lowering drug', 'cardiovascular medication'],
    geo_optimization: {
      ai_friendly_summary: 'Xeltoris (evolocumab) is a PCSK9 inhibitor that reduces LDL cholesterol by 60% through monthly subcutaneous injections. FDA-approved for cardiovascular risk reduction in patients with hyperlipidemia.',
      structured_data: {
        drug_name: 'evolocumab',
        brand_name: 'Xeltoris',
        drug_class: 'PCSK9 inhibitor',
        indication: 'hyperlipidemia',
        mechanism: 'PCSK9 inhibition',
        administration: 'subcutaneous injection',
        frequency: 'once monthly'
      },
      key_facts: [
        'Reduces LDL cholesterol by up to 60%',
        'Monthly subcutaneous injection',
        'Monoclonal antibody targeting PCSK9',
        'FDA-approved for cardiovascular risk reduction'
      ],
      ai_citations: 'Clinical trials: FOURIER (27,564 patients), OSLER (4,465 patients)'
    },
    ai_output: {
      compliance_status: 'compliant',
      compliance_flags: []
    },
    seo_strategy: {
      content_architecture: [
        'Create comprehensive cholesterol management hub page',
        'Develop condition-specific landing pages for hyperlipidemia and cardiovascular risk',
        'Build comparison pages: evolocumab vs statins, PCSK9 inhibitors comparison',
        'Implement FAQ schema for common patient questions'
      ],
      technical_seo: [
        'Implement MedicalDrug schema markup',
        'Optimize page speed for mobile users',
        'Create XML sitemap for all drug-related pages',
        'Ensure HTTPS and security compliance for medical content'
      ],
      content_strategy: [
        'Publish bi-weekly updates on cardiovascular research',
        'Create patient success stories and testimonials',
        'Develop downloadable cholesterol tracking tools',
        'Regular updates on insurance coverage and access programs'
      ],
      link_building: [
        'Partner with cardiovascular health organizations',
        'Submit to medical directories and drug databases',
        'Collaborate with cardiologist associations',
        'Press releases for new clinical data'
      ],
      geo_optimization: [
        'Structure content for AI snippet extraction',
        'Create concise, factual summaries for LLM consumption',
        'Implement medical entity recognition markup',
        'Optimize for voice search and conversational queries',
        'Build authoritative Q&A content for AI training'
      ]
    }
  },
  {
    id: 'mock-2',
    compliance_id: 'COMP-2024-002',
    product_name: 'NeurogeniX®',
    therapeutic_area: 'Neurology',
    stage: 'Phase III',
    workflow_stage: 'seo_review',
    target_audience: ['Healthcare Professionals', 'Caregivers'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    submitter_name: 'Michael Rodriguez',
    submitter_email: 'mrodriguez@neurocare.com',
    priority_level: 'medium',
    medical_indication: 'Treatment of mild to moderate Alzheimer\'s disease symptoms',
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
      'Alzheimer\'s treatment',
      'dementia medication',
      'cognitive enhancement drug',
      'neuroprotective therapy',
      'acetylcholinesterase inhibitor'
    ],
    long_tail_keywords: [
      'new Alzheimer\'s medication 2025',
      'best drugs for early stage dementia',
      'how to slow Alzheimer\'s progression',
      'NeurogeniX clinical trial results'
    ],
    consumer_questions: [
      'What makes NeurogeniX different from other Alzheimer\'s drugs?',
      'Can NeurogeniX reverse memory loss?',
      'What are the side effects of NeurogeniX?',
      'When will NeurogeniX be available?'
    ],
    h1_tag: 'NeurogeniX®: Breakthrough Dual-Action Treatment for Alzheimer\'s Disease',
    meta_title: 'NeurogeniX® for Alzheimer\'s | Dual-Action Neuroprotective Treatment',
    meta_description: 'Discover NeurogeniX®, an innovative Alzheimer\'s treatment combining cognitive enhancement with neuroprotection. Currently in Phase III trials with promising results.',
    geo_event_tags: ['Alzheimer\'s treatment', 'dementia drug', 'neuroprotective therapy'],
    geo_optimization: {
      ai_friendly_summary: 'NeurogeniX is a dual-action Alzheimer\'s treatment combining acetylcholinesterase inhibition with neuroprotective properties. Currently in Phase III trials showing sustained cognitive improvement.',
      structured_data: {
        drug_name: 'NeurogeniX',
        drug_class: 'acetylcholinesterase inhibitor',
        indication: 'Alzheimer\'s disease',
        mechanism: 'dual-action neuroprotection',
        administration: 'oral',
        frequency: 'once daily',
        stage: 'Phase III clinical trials'
      },
      key_facts: [
        'Dual-mechanism: cognitive enhancement + neuroprotection',
        'Once-daily oral dosing',
        'Phase III trials showing sustained improvement',
        'Targets mild to moderate Alzheimer\'s'
      ],
      ai_citations: 'Phase III CLARITY trial (n=2,100), Phase II MINDFUL study (n=850)'
    },
    ai_output: {
      compliance_status: 'pending',
      compliance_flags: ['Ensure Phase III completion disclosure is accurate', 'Include appropriate disclaimers for investigational therapy']
    },
    seo_strategy: {
      content_architecture: [
        'Build comprehensive Alzheimer\'s resource center',
        'Create stage-specific content (early, moderate, severe)',
        'Develop caregiver support section',
        'Clinical trial information hub'
      ],
      technical_seo: [
        'Implement MedicalTrial schema for clinical studies',
        'Ensure accessibility compliance for elderly users',
        'Mobile optimization for caregiver access',
        'Fast page load for global audience'
      ],
      content_strategy: [
        'Weekly clinical trial updates and progress reports',
        'Educational content about Alzheimer\'s stages',
        'Caregiver tips and support resources',
        'Expert interviews with neurologists'
      ],
      link_building: [
        'Partner with Alzheimer\'s associations',
        'Collaborate with memory care facilities',
        'Academic partnerships with research institutions',
        'Media outreach for trial milestones'
      ],
      geo_optimization: [
        'Create AI-friendly clinical trial summaries',
        'Optimize for "what is" and "how does" queries',
        'Build structured data for mechanism of action',
        'Generate clear, scannable fact sheets',
        'Implement conversational content patterns'
      ]
    }
  },
  {
    id: 'mock-3',
    compliance_id: 'COMP-2024-003',
    product_name: 'ImmunoShield™',
    therapeutic_area: 'Immunology',
    stage: 'Pre-Launch',
    workflow_stage: 'seo_review',
    target_audience: ['Patients', 'Healthcare Professionals', 'Payers'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    submitter_name: 'Dr. Emily Watson',
    submitter_email: 'ewatson@immunobio.com',
    priority_level: 'high',
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
    meta_title: 'ImmunoShield™ RA Treatment | Selective JAK1 Inhibitor',
    meta_description: 'ImmunoShield™ offers targeted RA treatment with selective JAK1 inhibition. Experience rapid relief with improved safety and no routine monitoring. FDA approval pending.',
    geo_event_tags: ['JAK inhibitor', 'rheumatoid arthritis drug', 'selective JAK1', 'oral RA treatment'],
    geo_optimization: {
      ai_friendly_summary: 'ImmunoShield is a selective JAK1 inhibitor for moderate to severe rheumatoid arthritis. Offers rapid onset of action with oral administration and no routine lab monitoring required.',
      structured_data: {
        drug_name: 'ImmunoShield',
        drug_class: 'selective JAK1 inhibitor',
        indication: 'rheumatoid arthritis',
        mechanism: 'JAK1 inhibition',
        administration: 'oral',
        frequency: 'once daily',
        monitoring: 'no routine labs required'
      },
      key_facts: [
        'Selective JAK1 inhibition (not JAK2/JAK3)',
        'Oral once-daily administration',
        'No routine lab monitoring needed',
        'Rapid onset of action within 2 weeks',
        'Favorable safety vs broad JAK inhibitors'
      ],
      ai_citations: 'SHIELD-RA trials (n=3,200), SELECT-RA study (n=1,800)'
    },
    ai_output: {
      compliance_status: 'compliant',
      compliance_flags: ['Include safety comparison disclaimers', 'Ensure FDA approval status is clear']
    },
    seo_strategy: {
      content_architecture: [
        'Create RA treatment comparison hub',
        'Build JAK inhibitor education center',
        'Develop patient journey content',
        'Safety comparison pages vs other JAK inhibitors'
      ],
      technical_seo: [
        'Implement MedicalCondition schema for RA',
        'Optimize for voice search queries',
        'AMP pages for mobile users',
        'International SEO for multi-country launch'
      ],
      content_strategy: [
        'Patient success stories and case studies',
        'Regular safety profile updates',
        'Cost and insurance coverage guides',
        'Treatment switching guides from DMARDs'
      ],
      link_building: [
        'Partner with arthritis foundations',
        'Collaborate with rheumatology societies',
        'Patient advocacy group partnerships',
        'Medical journal publication outreach'
      ],
      geo_optimization: [
        'Create definition-style content for AI crawlers',
        'Build comparative tables for LLM extraction',
        'Optimize for zero-click search results',
        'Structure content as knowledge graph entities',
        'Implement citation-worthy medical facts'
      ]
    }
  }
];
