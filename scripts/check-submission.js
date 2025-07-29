import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Submission ID to check
const submissionId = '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb'

async function checkSubmission() {
  console.log('Checking submission details...')
  
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (error) {
      console.error('Error fetching submission:', error)
      return
    }
    
    console.log('\nSubmission details:')
    console.log(`ID: ${data.id}`)
    console.log(`Compliance ID: ${data.compliance_id}`)
    console.log(`Product Name: ${data.product_name}`)
    console.log(`Current workflow_stage: "${data.workflow_stage}"`)
    console.log(`AI Processing Status: ${data.ai_processing_status}`)
    console.log(`AI Phase: ${data.ai_phase}`)
    console.log(`Created: ${data.created_at}`)
    console.log(`Updated: ${data.updated_at}`)
    
    // Check if there's AI output
    if (data.ai_output) {
      console.log('\nAI Output exists: Yes')
    } else {
      console.log('\nAI Output exists: No')
    }
    
    // Check SEO fields
    console.log('\nSEO Fields:')
    console.log(`- SEO Keywords: ${data.seo_keywords ? 'Yes' : 'No'}`)
    console.log(`- Meta Title: ${data.meta_title ? 'Yes' : 'No'}`)
    console.log(`- Meta Description: ${data.meta_description ? 'Yes' : 'No'}`)
    console.log(`- H1 Tag: ${data.h1_tag ? 'Yes' : 'No'}`)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the check
checkSubmission()