import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Submission ID to process
const submissionId = '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb'

// n8n webhook URL
const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt'

async function processSubmission() {
  console.log('=== COMPREHENSIVE SUBMISSION PROCESSING ===\n')
  
  try {
    // Step 1: Get current submission state
    console.log('1. Fetching current submission...')
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching submission:', fetchError)
      return
    }
    
    console.log('✅ Found submission:')
    console.log(`   - Product: ${submission.product_name}`)
    console.log(`   - Compliance ID: ${submission.compliance_id}`)
    console.log(`   - Current workflow_stage: "${submission.workflow_stage}"`)
    console.log(`   - AI Processing Status: ${submission.ai_processing_status}`)
    
    // Step 2: Attempt to update workflow stage to various valid values
    console.log('\n2. Attempting workflow stage updates...')
    
    // First, try to update ai_processing_status directly
    const { error: statusError } = await supabase
      .from('submissions')
      .update({ 
        ai_processing_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
    
    if (!statusError) {
      console.log('✅ Updated ai_processing_status to "processing"')
    } else {
      console.log('❌ Could not update ai_processing_status:', statusError.message)
    }
    
    // Step 3: Trigger webhook with comprehensive payload
    console.log('\n3. Triggering webhook with full payload...')
    
    // Build a comprehensive payload that includes all possible fields the n8n workflow might need
    const webhookPayload = {
      // Essential IDs
      id: submission.id,
      submission_id: submission.id,
      compliance_id: submission.compliance_id,
      
      // Product information
      product_name: submission.product_name,
      generic_name: submission.generic_name || submission.product_name.toLowerCase(),
      indication: submission.indication || submission.medical_indication || 'Advanced or unresectable melanoma',
      therapeutic_area: submission.therapeutic_area || 'Oncology',
      
      // Submitter information
      submitter_email: submission.submitter_email,
      submitter_name: submission.submitter_name,
      submitter_company: submission.submitter_company,
      
      // Reviewer information
      seo_reviewer_name: submission.seo_reviewer_name || submission.submitter_name,
      seo_reviewer_email: submission.seo_reviewer_email || submission.submitter_email,
      
      // Status fields
      workflow_stage: 'form_submitted', // Send the expected value
      ai_processing_status: 'pending',
      priority_level: submission.priority_level || 'medium',
      stage: submission.stage || 'Phase III',
      
      // Content
      raw_input_content: submission.raw_input_content || JSON.stringify({
        product_overview: `${submission.product_name} for ${submission.indication || 'Advanced or unresectable melanoma'}`,
        mechanism_of_action: 'Programmed death receptor-1 (PD-1) blocking antibody',
        target_audience: 'Healthcare Professionals',
        key_differentiators: ['First-in-class PD-1 inhibitor', 'Proven efficacy in melanoma'],
        competitive_landscape: 'Leading immunotherapy option'
      }),
      
      // Additional fields
      sponsor_name: submission.sponsor_name || 'Pharma Company',
      created_at: submission.created_at,
      updated_at: new Date().toISOString(),
      
      // Trigger metadata
      trigger_source: 'manual',
      trigger_timestamp: new Date().toISOString()
    }
    
    console.log('Sending comprehensive webhook payload...')
    console.log('Key fields:')
    console.log(`   - workflow_stage: ${webhookPayload.workflow_stage}`)
    console.log(`   - product_name: ${webhookPayload.product_name}`)
    console.log(`   - indication: ${webhookPayload.indication}`)
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PharmaSeoDashboard/1.0'
      },
      body: JSON.stringify(webhookPayload)
    })
    
    const responseStatus = webhookResponse.status
    const responseText = await webhookResponse.text()
    
    console.log(`\n✅ Webhook response: ${responseStatus}`)
    if (responseText) {
      console.log(`Response body: ${responseText}`)
    }
    
    // Step 4: Monitor for changes
    console.log('\n4. Monitoring for updates (30 seconds)...')
    
    let lastCheck = submission
    let updateDetected = false
    
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      process.stdout.write('.')
      
      const { data: current, error: checkError } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single()
      
      if (!checkError && current) {
        // Check for any changes
        if (current.updated_at !== lastCheck.updated_at ||
            current.workflow_stage !== lastCheck.workflow_stage ||
            current.ai_processing_status !== lastCheck.ai_processing_status ||
            current.ai_output !== lastCheck.ai_output) {
          
          updateDetected = true
          console.log('\n\n✅ SUBMISSION UPDATED!')
          console.log('\nChanges detected:')
          
          if (current.workflow_stage !== lastCheck.workflow_stage) {
            console.log(`   - workflow_stage: ${lastCheck.workflow_stage} → ${current.workflow_stage}`)
          }
          
          if (current.ai_processing_status !== lastCheck.ai_processing_status) {
            console.log(`   - ai_processing_status: ${lastCheck.ai_processing_status} → ${current.ai_processing_status}`)
          }
          
          if (current.ai_output && !lastCheck.ai_output) {
            console.log('   - AI Output: Generated ✅')
          }
          
          // Check SEO fields
          const seoFields = ['seo_keywords', 'meta_title', 'meta_description', 'h1_tag', 'seo_title', 'h2_tags']
          console.log('\nSEO Content:')
          for (const field of seoFields) {
            if (current[field]) {
              const value = Array.isArray(current[field]) 
                ? current[field].join(', ').substring(0, 60) + '...'
                : String(current[field]).substring(0, 60) + '...'
              console.log(`   - ${field}: ${value}`)
            }
          }
          
          if (current.error_message) {
            console.log(`\n⚠️  Error message: ${current.error_message}`)
          }
          
          lastCheck = current
        }
      }
    }
    
    if (!updateDetected) {
      console.log('\n\n⚠️  No updates detected after 30 seconds')
      console.log('\nPossible reasons:')
      console.log('1. The n8n workflow might be configured to expect different field names')
      console.log('2. The workflow might be paused or have errors')
      console.log('3. The AI processing might be queued or taking longer')
      console.log('\nRecommended actions:')
      console.log('1. Check n8n execution history at: https://innovareai.app.n8n.cloud')
      console.log('2. Look for workflow ID: hP9yZxUjmBKJmrZt')
      console.log('3. Check if the webhook was received and what happened during execution')
    }
    
    // Step 5: Final summary
    console.log('\n\n=== FINAL SUMMARY ===')
    const { data: finalState } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (finalState) {
      console.log(`Submission ID: ${finalState.id}`)
      console.log(`Product: ${finalState.product_name}`)
      console.log(`Workflow Stage: ${finalState.workflow_stage}`)
      console.log(`AI Processing Status: ${finalState.ai_processing_status}`)
      console.log(`Last Updated: ${finalState.updated_at}`)
      
      const hasAiContent = !!(finalState.ai_output || finalState.seo_keywords || finalState.meta_title)
      console.log(`\nAI Content Generated: ${hasAiContent ? '✅ Yes' : '❌ No'}`)
    }
    
  } catch (error) {
    console.error('\nUnexpected error:', error)
  }
}

// Run the comprehensive processing
processSubmission()