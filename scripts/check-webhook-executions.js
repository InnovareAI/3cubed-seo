import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkWebhookExecutions() {
  console.log('=== Checking n8n_webhook_executions table ===\n')
  
  try {
    // 1. Check for records with webhook_name containing "hP9yZxUjmBKJmrZt"
    console.log('1. Checking for webhook_name containing "hP9yZxUjmBKJmrZt"...')
    const { data: webhookNameResults, error: webhookNameError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .ilike('webhook_name', '%hP9yZxUjmBKJmrZt%')
      .order('created_at', { ascending: false })
    
    if (webhookNameError) {
      console.error('Error checking webhook_name:', webhookNameError)
    } else {
      console.log(`Found ${webhookNameResults?.length || 0} records with webhook_name containing "hP9yZxUjmBKJmrZt"`)
      if (webhookNameResults && webhookNameResults.length > 0) {
        webhookNameResults.forEach((record, index) => {
          console.log(`\n  Record ${index + 1}:`)
          console.log(`  - ID: ${record.id}`)
          console.log(`  - Webhook Name: ${record.webhook_name}`)
          console.log(`  - Status: ${record.status}`)
          console.log(`  - Created: ${record.created_at}`)
          console.log(`  - Submission ID: ${record.submission_id}`)
        })
      }
    }
    
    // 2. Get most recent webhook executions
    console.log('\n\n2. Most recent webhook executions (last 10):')
    const { data: recentExecutions, error: recentError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (recentError) {
      console.error('Error fetching recent executions:', recentError)
    } else {
      recentExecutions?.forEach((record, index) => {
        console.log(`\n  ${index + 1}. ${record.created_at}`)
        console.log(`     - ID: ${record.id}`)
        console.log(`     - Webhook Name: ${record.webhook_name || 'N/A'}`)
        console.log(`     - Status: ${record.status}`)
        console.log(`     - Submission ID: ${record.submission_id}`)
        console.log(`     - Webhook URL: ${record.webhook_url || 'N/A'}`)
      })
    }
    
    // 3. Check for errors in webhook execution logs
    console.log('\n\n3. Checking for errors in webhook executions:')
    const { data: errorExecutions, error: errorCheckError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .or('status.eq.failed,status.eq.error')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (errorCheckError) {
      console.error('Error checking for errors:', errorCheckError)
    } else {
      console.log(`Found ${errorExecutions?.length || 0} failed/error executions`)
      if (errorExecutions && errorExecutions.length > 0) {
        errorExecutions.forEach((record, index) => {
          console.log(`\n  Error ${index + 1}:`)
          console.log(`  - ID: ${record.id}`)
          console.log(`  - Status: ${record.status}`)
          console.log(`  - Created: ${record.created_at}`)
          console.log(`  - Submission ID: ${record.submission_id}`)
          if (record.error_message) {
            console.log(`  - Error Message: ${record.error_message}`)
          }
          if (record.response_data) {
            console.log(`  - Response Data: ${JSON.stringify(record.response_data).substring(0, 200)}...`)
          }
        })
      }
    }
    
    // 4. Look for submission_id 367789ee-9e5d-4a16-9c27-30d475736dab
    console.log('\n\n4. Checking for submission_id 367789ee-9e5d-4a16-9c27-30d475736dab:')
    const targetSubmissionId = '367789ee-9e5d-4a16-9c27-30d475736dab'
    
    // First check in submission_id column
    const { data: submissionIdResults, error: submissionIdError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .eq('submission_id', targetSubmissionId)
      .order('created_at', { ascending: false })
    
    if (submissionIdError) {
      console.error('Error checking submission_id:', submissionIdError)
    } else {
      console.log(`Found ${submissionIdResults?.length || 0} records with submission_id = ${targetSubmissionId}`)
      if (submissionIdResults && submissionIdResults.length > 0) {
        submissionIdResults.forEach((record, index) => {
          console.log(`\n  Record ${index + 1}:`)
          console.log(`  - ID: ${record.id}`)
          console.log(`  - Status: ${record.status}`)
          console.log(`  - Created: ${record.created_at}`)
          console.log(`  - Webhook Name: ${record.webhook_name || 'N/A'}`)
        })
      }
    }
    
    // Also check in payload column
    console.log('\n  Checking payload column for submission_id...')
    const { data: payloadResults, error: payloadError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .ilike('payload', `%${targetSubmissionId}%`)
      .order('created_at', { ascending: false })
    
    if (payloadError) {
      console.error('Error checking payload:', payloadError)
    } else {
      console.log(`Found ${payloadResults?.length || 0} records with submission_id in payload`)
      if (payloadResults && payloadResults.length > 0) {
        payloadResults.forEach((record, index) => {
          console.log(`\n  Payload Record ${index + 1}:`)
          console.log(`  - ID: ${record.id}`)
          console.log(`  - Status: ${record.status}`)
          console.log(`  - Created: ${record.created_at}`)
          console.log(`  - Submission ID (column): ${record.submission_id}`)
          if (record.payload) {
            console.log(`  - Payload snippet: ${JSON.stringify(record.payload).substring(0, 200)}...`)
          }
        })
      }
    }
    
    // Get table stats
    console.log('\n\n5. Table statistics:')
    const { count: totalCount, error: countError } = await supabase
      .from('n8n_webhook_executions')
      .select('*', { count: 'exact', head: true })
    
    if (!countError) {
      console.log(`Total records in table: ${totalCount}`)
    }
    
    // Check distinct webhook names
    const { data: distinctWebhooks, error: distinctError } = await supabase
      .from('n8n_webhook_executions')
      .select('webhook_name')
      .not('webhook_name', 'is', null)
    
    if (!distinctError && distinctWebhooks) {
      const uniqueWebhooks = [...new Set(distinctWebhooks.map(w => w.webhook_name))]
      console.log(`\nDistinct webhook names (${uniqueWebhooks.length}):`)
      uniqueWebhooks.forEach(name => console.log(`  - ${name}`))
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the check
checkWebhookExecutions()