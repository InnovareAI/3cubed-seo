// Test script to debug form submission to Supabase
import { createClient } from '@supabase/supabase-js'

// Use the same credentials from .env.local
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MzU2NDIsImV4cCI6MjA0NTExMTY0Mn0.lBCTlkcrxHxFqR2BCnjutXH3WNhT8lKFGBt7LKJV7_E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test data matching what the form would send
const testSubmission = {
  submitter_name: 'DevOps Test',
  submitter_email: 'devops@test.com',
  product_name: 'Test Product Form Debug',
  therapeutic_area: 'Oncology',
  stage: 'Phase III',
  indication: 'Test Condition',
  mechanism_of_action: 'Test MOA',
  competitive_landscape: 'Test Competitors',
  key_differentiators: 'Test Advantages',
  target_audience: 'Primary Care Physicians, Specialist Physicians',
  target_markets: 'United States, European Union',
  raw_input_content: JSON.stringify({
    seo_reviewer_name: 'DevOps Test',
    seo_reviewer_email: 'devops@test.com',
    product_name: 'Test Product Form Debug',
    // ... other form fields
  }),
  priority_level: 'Medium',
  langchain_status: 'needs_processing',
  workflow_stage: 'Form_Submitted',
  langchain_retry_count: 0,
  compliance_id: `COMP-${Date.now()}`
}

async function testFormSubmission() {
  console.log('Testing form submission to Supabase...')
  console.log('Submission data:', testSubmission)
  
  try {
    // First, let's check if we can connect and query
    const { data: testQuery, error: queryError } = await supabase
      .from('submissions')
      .select('id')
      .limit(1)
    
    if (queryError) {
      console.error('Error connecting to submissions table:', queryError)
      return
    }
    
    console.log('Successfully connected to Supabase!')
    
    // Now try the actual insert
    const { data, error } = await supabase
      .from('submissions')
      .insert([testSubmission])
      .select()
    
    if (error) {
      console.error('Error inserting submission:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else {
      console.log('Success! Submission created:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

// Run the test
testFormSubmission()
