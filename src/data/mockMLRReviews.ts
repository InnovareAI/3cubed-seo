export const mockMLRReviews = [
  {
    id: 'mlr-1',
    compliance_id: 'COMP-2024-004',
    submitter_name: 'David Kim',
    submitter_email: 'dkim@globalpharma.com',
    submitter_company: 'Global Pharma Corp',
    product_name: 'Arthroflex Pro',
    therapeutic_area: 'Rheumatology',
    stage: 'Launch',
    priority_level: 'high' as const,
    raw_input_content: 'Arthroflex Pro is a targeted therapy for rheumatoid arthritis...',
    ai_output: {
      strategy: 'Target rheumatologists and pain specialists with content focusing on efficacy data, safety profile, and patient quality of life improvements.',
      keywords: ['arthroflex rheumatoid arthritis', 'targeted RA therapy', 'joint pain relief'],
      contentPlan: 'Develop comprehensive content hub with clinical trial data, mechanism of action videos, and patient testimonials.'
    },
    langchain_status: 'client_approved',
    workflow_stage: 'mlr_review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date().toISOString(),
    client_reviewed_at: new Date('2024-01-22').toISOString(),
    client_reviewed_by: 'Jennifer Smith',
    ready_for_mlr: true,
    client_review_responses: {
      brandAlignment: {
        voice: 'perfectly-aligned',
        messaging: 'All key messages included',
        guidelines: true
      },
      commercialAlignment: {
        targetAudience: 'perfectly-targeted',
        marketPosition: 'Clear differentiation',
        roi: '5'
      },
      kpiAlignment: ['Brand awareness lift', 'HCP engagement rate', 'Lead generation volume'],
      roiConfidence: '5'
    },
    seo_keywords: ['arthroflex rheumatoid arthritis', 'targeted RA therapy', 'joint pain relief'],
    target_audience: ['Rheumatologists', 'Pain Specialists', 'Primary Care'],
    medical_indication: 'Moderate to severe rheumatoid arthritis',
    dosage_form: 'Subcutaneous injection, 40mg every 2 weeks',
    key_differentiators: ['Targeted mechanism', 'Rapid onset', 'Convenient dosing']
  },
  {
    id: 'mlr-2',
    compliance_id: 'COMP-2024-005',
    submitter_name: 'Lisa Thompson',
    submitter_email: 'lthompson@biomedcorp.com',
    submitter_company: 'BioMed Corporation',
    product_name: 'GlucoBalance XR',
    therapeutic_area: 'Endocrinology',
    stage: 'Pre-Launch',
    priority_level: 'high' as const,
    raw_input_content: 'GlucoBalance XR offers extended-release glucose control...',
    ai_output: {
      strategy: 'Focus on endocrinologists and primary care physicians. Emphasize 24-hour glucose control and reduced hypoglycemia risk.',
      keywords: ['glucobalance diabetes', 'extended release metformin', 'type 2 diabetes management'],
      contentPlan: 'Create educational content on continuous glucose control, dosing convenience, and patient adherence benefits.'
    },
    langchain_status: 'client_approved',
    workflow_stage: 'mlr_review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-12').toISOString(),
    updated_at: new Date().toISOString(),
    client_reviewed_at: new Date('2024-01-23').toISOString(),
    client_reviewed_by: 'Mark Johnson',
    ready_for_mlr: true,
    client_review_responses: {
      brandAlignment: {
        voice: 'mostly-aligned',
        messaging: 'Core messages present',
        guidelines: true
      },
      commercialAlignment: {
        targetAudience: 'well-suited',
        marketPosition: 'Strong positioning',
        roi: '4'
      },
      kpiAlignment: ['Brand awareness lift', 'Patient education metrics', 'Website traffic growth'],
      roiConfidence: '4'
    },
    seo_keywords: ['glucobalance diabetes', 'extended release metformin', 'type 2 diabetes management'],
    target_audience: ['Endocrinologists', 'Primary Care Physicians', 'Diabetes Educators'],
    medical_indication: 'Type 2 diabetes mellitus',
    dosage_form: 'Extended-release tablet, 500mg/1000mg once daily',
    key_differentiators: ['24-hour glucose control', 'Reduced GI side effects', 'Once-daily dosing']
  },
  {
    id: 'mlr-3',
    compliance_id: 'COMP-2024-006',
    submitter_name: 'Robert Chen',
    submitter_email: 'rchen@innovativebio.com',
    submitter_company: 'Innovative Bio Solutions',
    product_name: 'DermaClear',
    therapeutic_area: 'Dermatology',
    stage: 'Phase III',
    priority_level: 'medium' as const,
    raw_input_content: 'DermaClear is a breakthrough topical treatment for psoriasis...',
    ai_output: {
      strategy: 'Target dermatologists with clinical efficacy data. Secondary audience includes patients seeking alternative treatments.',
      keywords: ['dermaclear psoriasis', 'topical psoriasis treatment', 'skin clearance therapy'],
      contentPlan: 'Develop visual before/after content, patient journey stories, and dermatologist endorsements.'
    },
    langchain_status: 'client_approved',
    workflow_stage: 'mlr_review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-14').toISOString(),
    updated_at: new Date().toISOString(),
    client_reviewed_at: new Date('2024-01-24').toISOString(),
    client_reviewed_by: 'Amanda Wilson',
    ready_for_mlr: true,
    client_review_responses: {
      brandAlignment: {
        voice: 'perfectly-aligned',
        messaging: 'All messages clear',
        guidelines: true
      },
      commercialAlignment: {
        targetAudience: 'perfectly-targeted',
        marketPosition: 'Well differentiated',
        roi: '4'
      },
      kpiAlignment: ['HCP engagement rate', 'Patient education metrics', 'Share of voice'],
      roiConfidence: '4'
    },
    seo_keywords: ['dermaclear psoriasis', 'topical psoriasis treatment', 'skin clearance therapy'],
    target_audience: ['Dermatologists', 'Psoriasis Patients', 'Primary Care'],
    medical_indication: 'Mild to moderate plaque psoriasis',
    dosage_form: 'Topical cream, 0.5% twice daily',
    key_differentiators: ['Novel mechanism', 'Rapid clearance', 'Minimal systemic absorption']
  }
]
