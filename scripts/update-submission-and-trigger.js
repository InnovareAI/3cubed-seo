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

async function updateSubmissionAndTriggerWebhook() {
  console.log('Starting update process...')
  
  try {
    // Step 1: Update the submission
    console.log(`\n1. Updating submission ${submissionId}...`)
    
    const updateData = {
      workflow_stage: 'form_submitted',
      updated_at: new Date().toISOString()
    }
    
    const { data: updateResult, error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
    
    if (updateError) {
      console.error('Error updating submission:', updateError)
      return
    }
    
    console.log('✅ Submission updated successfully:')
    console.log(`  - workflow_stage: ${updateResult[0]?.workflow_stage}`)
    console.log(`  - updated_at: ${updateResult[0]?.updated_at}`)
    
    // Step 2: Trigger the webhook
    console.log(`\n2. Triggering webhook at ${webhookUrl}...`)
    
    const webhookPayload = {
      submission_id: submissionId,
      timestamp: new Date().toISOString(),
      trigger_type: 'manual',
      purpose: 'reprocess_submission'
    }
    
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
    console.log('\n3. Waiting 10 seconds for processing...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Step 4: Check the submission status
    console.log('\n4. Checking submission status after webhook trigger...')
    
    const { data: finalCheck, error: checkError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (checkError) {
      console.error('Error checking submission:', checkError)
      return
    }
    
    console.log('\n📊 Final submission status:')
    console.log(`  - workflow_stage: ${finalCheck.workflow_stage}`)
    console.log(`  - ai_processing_status: ${finalCheck.ai_processing_status}`)
    console.log(`  - ai_phase: ${finalCheck.ai_phase}`)
    console.log(`  - updated_at: ${finalCheck.updated_at}`)
    
    // Check for AI generated content
    if (finalCheck.ai_output) {
      console.log('\n✅ AI content generated!')
      console.log('AI output preview:', JSON.stringify(finalCheck.ai_output).substring(0, 200) + '...')
    } else {
      console.log('\n⚠️  No AI content generated yet')
    }
    
    // Check for SEO content
    if (finalCheck.seo_keywords || finalCheck.meta_title || finalCheck.meta_description) {
      console.log('\n✅ SEO content available:')
      console.log(`  - SEO Keywords: ${finalCheck.seo_keywords ? 'Yes' : 'No'}`)
      console.log(`  - Meta Title: ${finalCheck.meta_title ? 'Yes' : 'No'}`)
      console.log(`  - Meta Description: ${finalCheck.meta_description ? 'Yes' : 'No'}`)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the update
updateSubmissionAndTriggerWebhook()