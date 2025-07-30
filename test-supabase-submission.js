#!/usr/bin/env node

// Test script to simulate form submission to Supabase
// This will help identify the exact field mapping issues

const SUPABASE_URL = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MzU2NDIsImV4cCI6MjA0NTExMTY0Mn0.lBCTlkcrxHxFqR2BCnjutXH3WNhT8lKFGBt7LKJV7_E'

// Simulate what the React form would send
const formData = {
  seo_reviewer_name: 'DevOps Test',
  seo_reviewer_email: 'devops@test.com',
  client_name: 'Test Client',
  client_reviewer_name: 'Client Test',
  client_reviewer_email: 'client@test.com',
  mlr_reviewer_name: 'MLR Test',
  mlr_reviewer_email: 'mlr@test.com',
  stage: 'Phase III',
  product_name: 'Test Product Debug',
  product_code: 'TEST-123',
  condition_treated: 'Test Condition for Debugging',
  therapeutic_area: 'Oncology',
  target_audience: ['Primary Care Physicians', 'Specialist Physicians'],
  geography: ['United States', 'European Union'],
  key_advantages: 'Test advantages for debugging',
  competitor_names: 'Test Competitor 1, Test Competitor 2',
  competitor_urls: 'https://example.com',
  problem_solved: 'Test problem solved',
  treatment_settings: ['Hospital/Inpatient', 'Outpatient Clinic'],
  mechanism_of_action: 'Test MOA',
  clinical_trials: 'Test trials',
  key_results: 'Test results',
  safety_info: 'Test safety',
  dosing_info: 'Test dosing',
  patient_population: 'Test population',
  regulatory_status: 'Test regulatory',
  patient_numbers: 'Test numbers',
  industry_keywords: 'test, keywords',
  avoid_keywords: 'avoid, these',
  website_url: 'https://test.com',
  unique_value_prop: 'Test UVP',
  conference_data: 'Test conference',
  kol_names: 'Test KOL',
  special_considerations: 'Test considerations'
}

// Convert to submission data as the form does
const submissionData = {
  submitter_name: formData.seo_reviewer_name,
  submitter_email: formData.seo_reviewer_email,
  product_name: formData.product_name,
  therapeutic_area: formData.therapeutic_area,
  stage: formData.stage,
  indication: formData.condition_treated,
  mechanism_of_action: formData.mechanism_of_action,
  competitive_landscape: formData.competitor_names,
  key_differentiators: formData.key_advantages,
  target_audience: formData.target_audience.join(', '),
  target_markets: formData.geography.join(', '),
  raw_input_content: JSON.stringify(formData),
  priority_level: 'Medium',
  langchain_status: 'needs_processing',
  workflow_stage: 'Form_Submitted',
  langchain_retry_count: 0,
  compliance_id: `COMP-${Date.now()}`
}

async function testSubmission() {
  console.log('🔍 Testing Supabase form submission...\n')
  console.log('📋 Submission data being sent:')
  console.log(JSON.stringify(submissionData, null, 2))
  console.log('\n')

  try {
    // Make direct HTTP request to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(submissionData)
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('❌ Submission failed!')
      console.error(`Status: ${response.status} ${response.statusText}`)
      console.error('Response:', responseText)
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText)
        console.error('\n🔴 Error details:')
        console.error('Message:', errorData.message)
        console.error('Details:', errorData.details)
        console.error('Hint:', errorData.hint)
        
        // Check for column-specific errors
        if (errorData.message && errorData.message.includes('column')) {
          console.error('\n⚠️  This looks like a column name mismatch!')
          console.error('The database might be expecting different field names.')
        }
      } catch (e) {
        // Not JSON error response
      }
    } else {
      console.log('✅ Submission successful!')
      const data = JSON.parse(responseText)
      console.log('Created record:', data)
    }

  } catch (error) {
    console.error('🔥 Network or unexpected error:', error)
  }
}

// Also test just fetching the table schema
async function checkTableSchema() {
  console.log('\n📊 Checking submissions table schema...\n')
  
  try {
    // Try to fetch one row to see the columns
    const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.length > 0) {
        console.log('📋 Table columns found:')
        console.log(Object.keys(data[0]).sort().join('\n'))
      } else {
        console.log('⚠️  Table is empty, cannot determine columns from data')
      }
    } else {
      console.error('❌ Could not fetch table data:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('🔥 Error checking schema:', error)
  }
}

// Run both tests
async function runTests() {
  await checkTableSchema()
  console.log('\n' + '='.repeat(50) + '\n')
  await testSubmission()
}

runTests()
