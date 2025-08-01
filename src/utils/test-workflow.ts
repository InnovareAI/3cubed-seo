import { supabase } from '../lib/database-types'

// Utility function to move a submission to Client Review for testing
export async function moveSubmissionToClientReview(submissionId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      workflow_stage: 'Client_Review',
      langchain_status: 'seo_approved',
      // Add some test data for the client review fields
      seo_keywords: ['pharmaceutical SEO', 'drug marketing', 'healthcare content'],
      target_audience: ['Healthcare Professionals', 'Patients', 'Payers'],
      medical_indication: 'Type 2 Diabetes',
      dosage_form: 'Oral tablet, 10mg once daily',
      competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
      positioning: 'Premium innovation in diabetes care'
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating submission:', error)
    return null
  }

  console.log('Submission moved to Client Review:', data)
  return data
}

// Utility function to move a submission to MLR Review for testing
export async function moveSubmissionToMLRReview(submissionId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      workflow_stage: 'MLR_Review',
      langchain_status: 'client_approved',
      client_reviewed_at: new Date().toISOString(),
      client_reviewed_by: 'Test Client User',
      ready_for_mlr: true,
      client_review_responses: {
        'brand-voice': 'Perfectly aligned',
        'key-messages': ['Innovation highlighted', 'Patient focus clear', 'Efficacy emphasized'],
        'differentiation': 'Very clear',
        'hcp-appropriate': 'Perfectly targeted',
        'patient-appropriate': 'Excellent fit',
        'launch-timeline': 'Perfectly timed',
        'sales-enablement': 'Excellent support',
        'market-positioning': '5',
        'conversion-path': 'Very clear',
        'kpi-alignment': ['Brand awareness lift', 'HCP engagement rate', 'Website traffic growth'],
        'roi-confidence': '4'
      }
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating submission:', error)
    return null
  }

  console.log('Submission moved to MLR Review:', data)
  return data
}

// Get a list of all submissions for testing
export async function getAllSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, product_name, workflow_stage, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching submissions:', error)
    return []
  }

  console.log('All submissions:', data)
  return data
}
