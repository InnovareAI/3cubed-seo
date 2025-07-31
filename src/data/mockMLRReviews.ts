export const mockMLRReviews = [
  {
    id: 'mlr-001',
    product_name: 'Cardiolex',
    generic_name: 'cardioleximab',
    therapeutic_area: 'Cardiology',
    stage: 'Market Launch',
    workflow_stage: 'mlr_review',
    target_audience: ['HCPs', 'Cardiologists'],
    created_at: new Date().toISOString(),
    submitter_name: 'Dr. Emily Carter',
    submitter_email: 'emily.carter@pharma.com',
    submitter_company: 'CardioTech Solutions',
    priority_level: 'high',
    medical_indication: 'Heart Failure with Reduced Ejection Fraction',
    geography: ['USA', 'EU'],
    client_name: 'CardioTech Solutions',
    mechanism_of_action: 'Selective cardiac sodium channel blocker',
    key_differentiators: ['Improved ejection fraction', 'Reduced hospitalizations'],
    dosage_form: 'Oral tablet',
    ai_output: {
      seo_title: 'Cardiolex - Advanced Heart Failure Treatment',
      meta_description: 'Cardiolex offers breakthrough treatment for heart failure patients with improved outcomes.',
      h1_tag: 'Cardiolex: Revolutionary Heart Failure Treatment',
      h2_tags: ['Clinical Efficacy', 'Safety Profile', 'Patient Outcomes'],
      content_summary: 'Comprehensive treatment guide for heart failure management'
    },
    mlr_requirements: {
      prescribing_information_approved: true,
      pi_approval_date: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
      peer_reviewed_articles: [
        { title: 'Cardiolex Efficacy in HFrEF', journal: 'NEJM', status: 'verified' },
        { title: 'Safety Analysis of Cardiolex', journal: 'Circulation', status: 'verified' }
      ],
      regulatory_submissions: ['FDA 505(b)(2)', 'EMA MAA']
    },
    compliance_items: {
      claims_verification: 'verified',
      fair_balance: 'compliant',
      adverse_events_disclosure: 'complete',
      contraindications_listed: true,
      dosage_administration_clear: true,
      off_label_disclaimers: 'present'
    },
    client_review_responses: {
      roiConfidence: 'High'
    }
  },
  {
    id: 'mlr-002',
    product_name: 'Neurofix',
    generic_name: 'neurofixantib',
    therapeutic_area: 'Neurology',
    stage: 'Phase III',
    workflow_stage: 'mlr_review',
    target_audience: ['Neurologists', 'MS Specialists'],
    created_at: new Date(Date.now() - 2*60*60*1000).toISOString(),
    submitter_name: 'Dr. Michael Thompson',
    submitter_email: 'michael.thompson@neuroco.com',
    submitter_company: 'NeuroCorp',
    priority_level: 'high',
    medical_indication: 'Relapsing-Remitting Multiple Sclerosis',
    geography: ['USA'],
    client_name: 'NeuroCorp',
    mechanism_of_action: 'Monoclonal antibody targeting CD20+ B cells',
    key_differentiators: ['Reduced relapse rate', 'Improved disability progression'],
    dosage_form: 'IV infusion',
    ai_output: {
      seo_title: 'Neurofix - Multiple Sclerosis Treatment Breakthrough',
      meta_description: 'Neurofix provides targeted therapy for RRMS patients with proven efficacy.',
      h1_tag: 'Neurofix: Advanced Multiple Sclerosis Treatment',
      h2_tags: ['Mechanism of Action', 'Clinical Studies', 'Administration'],
      content_summary: 'Comprehensive MS treatment information and guidelines'
    },
    mlr_requirements: {
      prescribing_information_approved: false,
      pi_approval_date: null,
      peer_reviewed_articles: [
        { title: 'Neurofix Phase III Results', journal: 'Lancet Neurology', status: 'pending' }
      ],
      regulatory_submissions: ['FDA BLA pending']
    },
    compliance_items: {
      claims_verification: 'pending',
      fair_balance: 'under_review',
      adverse_events_disclosure: 'incomplete',
      contraindications_listed: true,
      dosage_administration_clear: false,
      off_label_disclaimers: 'missing'
    }
  },
  {
    id: 'mlr-003',
    product_name: 'Oncomax',
    generic_name: 'oncomaxicillin',
    therapeutic_area: 'Oncology',
    stage: 'Market Launch',
    workflow_stage: 'mlr_review',
    target_audience: ['Oncologists', 'Patients'],
    created_at: new Date(Date.now() - 4*60*60*1000).toISOString(),
    submitter_name: 'Dr. Sarah Williams',
    submitter_email: 'sarah.williams@oncomed.com',
    submitter_company: 'OncoMed Inc',
    priority_level: 'medium',
    medical_indication: 'Non-Small Cell Lung Cancer',
    geography: ['USA', 'Canada'],
    client_name: 'OncoMed Inc',
    mechanism_of_action: 'PD-L1 checkpoint inhibitor',
    key_differentiators: ['Improved overall survival', 'Better tolerability'],
    dosage_form: 'IV infusion',
    ai_output: {
      seo_title: 'Oncomax - NSCLC Immunotherapy Treatment',
      meta_description: 'Oncomax immunotherapy offers hope for NSCLC patients with advanced disease.',
      h1_tag: 'Oncomax: Advanced NSCLC Immunotherapy',
      h2_tags: ['Patient Selection', 'Dosing Guidelines', 'Monitoring'],
      content_summary: 'Complete guide to NSCLC immunotherapy with Oncomax'
    },
    mlr_requirements: {
      prescribing_information_approved: true,
      pi_approval_date: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
      peer_reviewed_articles: [
        { title: 'Oncomax in Advanced NSCLC', journal: 'JCO', status: 'verified' },
        { title: 'Safety Profile of Oncomax', journal: 'Cancer', status: 'verified' }
      ],
      regulatory_submissions: ['FDA BLA approved']
    },
    compliance_items: {
      claims_verification: 'verified',
      fair_balance: 'compliant',
      adverse_events_disclosure: 'complete',
      contraindications_listed: true,
      dosage_administration_clear: true,
      off_label_disclaimers: 'present'
    },
    client_review_responses: {
      roiConfidence: 'Medium'
    }
  }
]