export const mockClientReviews = [
  {
    id: 'client-001',
    product_name: 'Immunomax',
    generic_name: 'immunomaxicillin',
    therapeutic_area: 'Immunology',
    stage: 'Market Launch',
    workflow_stage: 'client_review',
    target_audience: ['Rheumatologists', 'Patients'],
    created_at: new Date().toISOString(),
    submitter_name: 'Jennifer Martinez',
    submitter_email: 'jennifer.martinez@immunocorp.com',
    submitter_company: 'ImmunoCorp',
    priority_level: 'high',
    medical_indication: 'Rheumatoid Arthritis',
    geography: ['USA', 'EU'],
    client_name: 'ImmunoCorp',
    mechanism_of_action: 'JAK inhibitor targeting inflammatory pathways',
    key_differentiators: ['Oral administration', 'Rapid onset of action'],
    client_review_status: 'pending',
    client_approval_date: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
    seo_reviewed_at: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    brand_guidelines: {
      tone_compliance: 'approved',
      visual_identity_check: 'approved', 
      key_message_alignment: 'approved',
      competitive_positioning: 'under_review'
    },
    brand_elements: {
      primary_color_usage: true,
      logo_placement_correct: true,
      typography_consistent: true,
      imagery_brand_aligned: false
    },
    client_requirements: {
      target_kpis: ['Brand awareness +15%', 'HCP engagement +25%'],
      messaging_priorities: ['Efficacy', 'Safety', 'Convenience'],
      competitive_claims: 'Avoid direct comparisons',
      compliance_level: 'pharmaceutical_grade'
    }
  },
  {
    id: 'client-002',
    product_name: 'Diabetrol',
    generic_name: 'diabetrolide',
    therapeutic_area: 'Endocrinology',
    stage: 'Pre-Launch',
    workflow_stage: 'client_review',
    target_audience: ['Endocrinologists', 'Primary Care', 'Patients'],
    created_at: new Date(Date.now() - 3*60*60*1000).toISOString(),
    submitter_name: 'Dr. Robert Kim',
    submitter_email: 'robert.kim@diabetech.com',
    submitter_company: 'DiabeTech',
    priority_level: 'high',
    medical_indication: 'Type 2 Diabetes Mellitus',
    geography: ['USA'],
    client_name: 'DiabeTech',
    mechanism_of_action: 'Dual GLP-1/GIP receptor agonist',
    key_differentiators: ['Weight loss benefit', 'Once-weekly dosing'],
    client_review_status: 'revision_requested',
    client_feedback: 'Please emphasize weight management benefits more prominently in H2 tags and meta description',
    client_approval_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
    seo_reviewed_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
    brand_guidelines: {
      tone_compliance: 'revision_needed',
      visual_identity_check: 'approved', 
      key_message_alignment: 'revision_needed',
      competitive_positioning: 'approved'
    },
    brand_elements: {
      primary_color_usage: true,
      logo_placement_correct: true,
      typography_consistent: false,
      imagery_brand_aligned: true
    },
    client_requirements: {
      target_kpis: ['Patient acquisition +20%', 'Digital engagement +30%'],
      messaging_priorities: ['Weight management', 'Glycemic control', 'Convenience'],
      competitive_claims: 'Highlight unique dual mechanism',
      compliance_level: 'pharmaceutical_grade'
    }
  },
  {
    id: 'client-003',
    product_name: 'Respirex',
    generic_name: 'respirexolol',
    therapeutic_area: 'Pulmonology',
    stage: 'Market Launch',
    workflow_stage: 'client_review',
    target_audience: ['Pulmonologists', 'COPD Patients'],
    created_at: new Date(Date.now() - 6*60*60*1000).toISOString(),
    submitter_name: 'Lisa Chen',
    submitter_email: 'lisa.chen@respirocorp.com',
    submitter_company: 'RespiroCorp',
    priority_level: 'medium',
    medical_indication: 'Chronic Obstructive Pulmonary Disease',
    geography: ['USA', 'Canada'],
    client_name: 'RespiroCorp',
    mechanism_of_action: 'Long-acting beta2-agonist with anti-inflammatory properties',
    key_differentiators: ['12-hour duration', 'Improved lung function'],
    client_review_status: 'approved',
    client_approval_date: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
    seo_reviewed_at: new Date(Date.now() - 4*24*60*60*1000).toISOString(),
    brand_guidelines: {
      tone_compliance: 'approved',
      visual_identity_check: 'approved', 
      key_message_alignment: 'approved',
      competitive_positioning: 'approved'
    },
    brand_elements: {
      primary_color_usage: true,
      logo_placement_correct: true,
      typography_consistent: true,
      imagery_brand_aligned: true
    },
    client_requirements: {
      target_kpis: ['Patient adherence +18%', 'HCP preference +22%'],
      messaging_priorities: ['Lung function improvement', 'Long-lasting relief', 'Quality of life'],
      competitive_claims: 'Focus on duration of action',
      compliance_level: 'pharmaceutical_grade'
    }
  }
]