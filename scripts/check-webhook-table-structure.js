import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableStructure() {
  console.log('=== Checking n8n_webhook_executions table structure ===\n')
  
  try {
    // Get a sample record to see the structure
    const { data: sampleRecord, error: sampleError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('Error fetching sample record:', sampleError)
    } else if (sampleRecord) {
      console.log('Table columns found:')
      Object.keys(sampleRecord).forEach(key => {
        const value = sampleRecord[key]
        const type = value === null ? 'null' : typeof value
        console.log(`  - ${key}: ${type}`)
      })
      
      console.log('\n\nSample record:')
      console.log(JSON.stringify(sampleRecord, null, 2))
    }
    
    // Now let's search for the submission ID in the payload
    const targetSubmissionId = '367789ee-9e5d-4a16-9c27-30d475736dab'
    console.log(`\n\nSearching for submission ID ${targetSubmissionId} in recent records...`)
    
    const { data: allRecords, error: allError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (allError) {
      console.error('Error fetching records:', allError)
    } else {
      let foundCount = 0
      allRecords?.forEach((record, index) => {
        // Check if submission ID appears anywhere in the record
        const recordStr = JSON.stringify(record)
        if (recordStr.includes(targetSubmissionId)) {
          foundCount++
          console.log(`\nFound in record ${index + 1}:`)
          console.log(`  - ID: ${record.id}`)
          console.log(`  - Created: ${record.created_at}`)
          console.log(`  - Webhook Name: ${record.webhook_name}`)
          console.log(`  - Status: ${record.status}`)
          if (record.payload) {
            console.log(`  - Payload: ${JSON.stringify(record.payload).substring(0, 500)}...`)
          }
        }
      })
      
      if (foundCount === 0) {
        console.log('Submission ID not found in any of the last 50 records')
      } else {
        console.log(`\nTotal records containing submission ID: ${foundCount}`)
      }
    }
    
    // Check for webhook name pattern
    console.log('\n\nChecking for webhook URLs or names with "hP9yZxUjmBKJmrZt"...')
    const { data: webhookRecords, error: webhookError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (!webhookError) {
      let foundWebhook = false
      webhookRecords?.forEach((record) => {
        const recordStr = JSON.stringify(record)
        if (recordStr.includes('hP9yZxUjmBKJmrZt')) {
          foundWebhook = true
          console.log(`\nFound "hP9yZxUjmBKJmrZt" in record:`)
          console.log(`  - ID: ${record.id}`)
          console.log(`  - Created: ${record.created_at}`)
          console.log(`  - Full record: ${recordStr.substring(0, 500)}...`)
        }
      })
      
      if (!foundWebhook) {
        console.log('Pattern "hP9yZxUjmBKJmrZt" not found in any recent records')
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the check
checkTableStructure()