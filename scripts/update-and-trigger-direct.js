import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Submission ID to update
const submissionId = '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb'

// n8n webhook URL
const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt'

async function updateAndTrigger() {
  console.log('Starting process...')
  
  try {
    // Step 1: Check current state
    console.log('\n1. Checking current submission state...')
    const { data: current, error: checkError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (checkError) {
      console.error('Error checking submission:', checkError)
      return
    }
    
    console.log(`Current workflow_stage: "${current.workflow_stage}"`)
    console.log(`Current ai_processing_status: "${current.ai_processing_status}"`)
    
    // Step 2: Since direct update might be blocked by constraint, let's just trigger the webhook
    console.log(`\n2. Triggering webhook directly at ${webhookUrl}...`)
    
    // Prepare the payload with the current submission data
    const webhookPayload = {
      id: submissionId,
      compliance_id: current.compliance_id,
      product_name: current.product_name,
      generic_name: current.generic_name,
      indication: current.indication || current.medical_indication,
      therapeutic_area: current.therapeutic_area,
      submitter_email: current.submitter_email,
      submitter_name: current.submitter_name,
      workflow_stage: current.workflow_stage,
      raw_input_content: current.raw_input_content,
      created_at: current.created_at,
      // Additional fields that might be needed
      sponsor_name: current.sponsor_name,
      stage: current.stage,
      priority_level: current.priority_level
    }
    
    console.log('Sending webhook payload...')
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    })
    
    const webhookStatus = webhookResponse.status
    const webhookText = await webhookResponse.text()
    
    console.log(`✅ Webhook triggered with status: ${webhookStatus}`)
    console.log(`Webhook response: ${webhookText}`)
    
    // Step 3: Wait and check for updates
    console.log('\n3. Waiting 15 seconds for processing...')
    await new Promise(resolve => setTimeout(resolve, 15000))
    
    // Step 4: Check the submission status after webhook
    console.log('\n4. Checking submission status after webhook trigger...')
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (finalError) {
      console.error('Error checking final submission:', finalError)
      return
    }
    
    console.log('\n📊 Final submission status:')
    console.log(`  - workflow_stage: ${finalCheck.workflow_stage} (was: ${current.workflow_stage})`)
    console.log(`  - ai_processing_status: ${finalCheck.ai_processing_status} (was: ${current.ai_processing_status})`)
    console.log(`  - ai_phase: ${finalCheck.ai_phase}`)
    console.log(`  - updated_at: ${finalCheck.updated_at}`)
    
    // Check for changes
    if (finalCheck.workflow_stage !== current.workflow_stage) {
      console.log('\n✅ Workflow stage has progressed!')
    }
    
    if (finalCheck.ai_processing_status !== current.ai_processing_status) {
      console.log('✅ AI processing status has changed!')
    }
    
    // Check for AI generated content
    if (finalCheck.ai_output && !current.ai_output) {
      console.log('\n✅ New AI content generated!')
      console.log('AI output preview:', JSON.stringify(finalCheck.ai_output).substring(0, 200) + '...')
    }
    
    // Check for SEO content
    if (finalCheck.seo_keywords || finalCheck.meta_title || finalCheck.meta_description) {
      console.log('\n✅ SEO content available:')
      console.log(`  - SEO Keywords: ${finalCheck.seo_keywords ? 'Yes' : 'No'}`)
      console.log(`  - Meta Title: ${finalCheck.meta_title ? 'Yes' : 'No'}`)
      console.log(`  - Meta Description: ${finalCheck.meta_description ? 'Yes' : 'No'}`)
    }
    
    // Additional processing info
    if (finalCheck.error_message) {
      console.log('\n⚠️  Error message found:', finalCheck.error_message)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the update
updateAndTrigger()