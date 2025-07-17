// Example of how to create a new submission with automatic client/project assignment

import { supabase } from '../lib/supabase'
import { processSubmissionAssignment } from '../lib/clientProjectHelpers'

export async function createSubmission(formData: {
  submitter_email: string
  submitter_name: string
  product_name: string
  therapeutic_area: string
  stage: string
  priority_level: 'High' | 'Medium' | 'Low'
  raw_input_content: string
  // ... other fields
}) {
  try {
    // Step 1: Get client and project IDs
    const { client_id, project_id } = await processSubmissionAssignment({
      submitter_email: formData.submitter_email,
      product_name: formData.product_name,
      therapeutic_area: formData.therapeutic_area
    })

    // Step 2: Create the submission with proper IDs and initial status
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        ...formData,
        client_id,
        project_id,
        compliance_id: `COMP-${Date.now()}`, // Generate unique ID
        langchain_status: 'needs_processing',
        workflow_stage: 'Form_Submitted',
        langchain_phase: 'initial',
        langchain_retry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating submission:', error)
    return { success: false, error }
  }
}

// Example usage in a form handler:
/*
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const result = await createSubmission({
    submitter_email: 'john.doe@pharmaco.com',
    submitter_name: 'John Doe',
    product_name: 'Keytruda',
    therapeutic_area: 'Oncology',
    stage: 'Phase III',
    priority_level: 'High',
    raw_input_content: 'Full submission content here...'
  })

  if (result.success) {
    console.log('Submission created:', result.data)
    // Redirect or show success message
  } else {
    console.error('Failed to create submission:', result.error)
    // Show error message
  }
}
*/
