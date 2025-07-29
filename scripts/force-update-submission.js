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

async function forceUpdateAndTrigger() {
  console.log('Starting forced update process...')
  
  try {
    // Step 1: Get current submission
    console.log('\n1. Getting current submission...')
    const { data: current, error: getError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (getError) {
      console.error('Error getting submission:', getError)
      return
    }
    
    console.log(`Current workflow_stage: "${current.workflow_stage}"`)
    
    // Step 2: Try different workflow_stage values
    console.log('\n2. Attempting to update workflow_stage...')
    
    // Try different values that might work
    const stagesToTry = [
      'Form_Submitted',  // PascalCase with underscore
      'AI_Processing',   // PascalCase
      'SEO_Review'       // Another valid stage
    ]
    
    let updateSuccess = false
    let successfulStage = null
    
    for (const stage of stagesToTry) {
      console.log(`\nTrying to set workflow_stage to: "${stage}"`)
      
      const { data: updateData, error: updateError } = await supabase
        .from('submissions')
        .update({ 
          workflow_stage: stage,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
      
      if (!updateError) {
        console.log(`✅ Successfully updated to "${stage}"`)
        updateSuccess = true
        successfulStage = stage
        break
      } else {
        console.log(`❌ Failed with: ${updateError.message}`)
      }
    }
    
    if (!updateSuccess) {
      console.log('\n❌ Could not update workflow_stage with any valid value')
      console.log('The constraint might be different than expected')
      return
    }
    
    // Step 3: Trigger webhook with updated data
    console.log(`\n3. Triggering webhook with workflow_stage = "${successfulStage}"...`)
    
    const webhookPayload = {
      id: submissionId,
      compliance_id: current.compliance_id,
      product_name: current.product_name,
      generic_name: current.generic_name,
      indication: current.indication || current.medical_indication,
      therapeutic_area: current.therapeutic_area,
      submitter_email: current.submitter_email,
      submitter_name: current.submitter_name,
      workflow_stage: successfulStage,
      raw_input_content: current.raw_input_content,
      created_at: current.created_at,
      sponsor_name: current.sponsor_name,
      stage: current.stage,
      priority_level: current.priority_level
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
    
    // Step 4: Wait and check results
    console.log('\n4. Waiting 15 seconds for processing...')
    await new Promise(resolve => setTimeout(resolve, 15000))
    
    // Step 5: Check final status
    console.log('\n5. Checking final submission status...')
    
    const { data: final, error: finalError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (finalError) {
      console.error('Error checking final status:', finalError)
      return
    }
    
    console.log('\n📊 Results:')
    console.log(`  - workflow_stage: ${final.workflow_stage} (was: ${current.workflow_stage})`)
    console.log(`  - ai_processing_status: ${final.ai_processing_status} (was: ${current.ai_processing_status})`)
    console.log(`  - ai_phase: ${final.ai_phase}`)
    console.log(`  - updated_at: ${final.updated_at}`)
    
    // Check for AI content
    if (final.ai_output && !current.ai_output) {
      console.log('\n✅ AI content has been generated!')
    }
    
    // Check for SEO fields
    const seoFields = ['seo_keywords', 'meta_title', 'meta_description', 'h1_tag', 'seo_title']
    console.log('\n📝 SEO Fields Status:')
    for (const field of seoFields) {
      if (final[field]) {
        console.log(`  ✅ ${field}: ${typeof final[field] === 'string' ? final[field].substring(0, 50) + '...' : 'Present'}`)
      } else {
        console.log(`  ❌ ${field}: Not generated`)
      }
    }
    
    if (final.error_message) {
      console.log('\n⚠️  Error message:', final.error_message)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the forced update
forceUpdateAndTrigger()