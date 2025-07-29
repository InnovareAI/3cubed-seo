import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function generateDetailedReport() {
  console.log('=== WEBHOOK EXECUTION DETAILED REPORT ===')
  console.log(`Generated at: ${new Date().toISOString()}\n`)
  
  const targetSubmissionId = '367789ee-9e5d-4a16-9c27-30d475736dab'
  
  try {
    // 1. Check for webhook_name containing "hP9yZxUjmBKJmrZt"
    console.log('1. WEBHOOK NAME SEARCH: "hP9yZxUjmBKJmrZt"')
    console.log('=' * 50)
    
    const { data: allRecords, error: allError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (!allError) {
      let foundWebhookPattern = false
      allRecords?.forEach((record) => {
        const recordStr = JSON.stringify(record)
        if (recordStr.toLowerCase().includes('hp9yzxujmbkjmrzt')) {
          foundWebhookPattern = true
          console.log(`\nFound pattern in record ID ${record.id}:`)
          console.log(`- Created: ${record.created_at}`)
          console.log(`- Webhook Name: ${record.webhook_name}`)
          console.log(`- Status: ${record.status}`)
          console.log(`- Full record: ${JSON.stringify(record, null, 2)}`)
        }
      })
      
      if (!foundWebhookPattern) {
        console.log('\n❌ No records found with webhook_name or any field containing "hP9yZxUjmBKJmrZt"')
      }
    }
    
    // 2. Most recent webhook executions
    console.log('\n\n2. MOST RECENT WEBHOOK EXECUTIONS')
    console.log('=' * 50)
    
    const { data: recentExecs, error: recentError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!recentError) {
      recentExecs?.forEach((record, index) => {
        console.log(`\n[${index + 1}] ${record.created_at}`)
        console.log(`    ID: ${record.id}`)
        console.log(`    Webhook Name: ${record.webhook_name}`)
        console.log(`    Status: ${record.status}`)
        console.log(`    Payload: ${JSON.stringify(record.payload)}`)
        if (record.response_data) {
          console.log(`    Response: ${JSON.stringify(record.response_data)}`)
        }
      })
    }
    
    // 3. Error analysis
    console.log('\n\n3. ERROR ANALYSIS')
    console.log('=' * 50)
    
    const { data: errorRecords, error: errorCheckError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .or('status.eq.error,status.eq.failed')
      .order('created_at', { ascending: false })
    
    if (!errorCheckError) {
      console.log(`\nTotal error/failed records: ${errorRecords?.length || 0}`)
      
      if (errorRecords && errorRecords.length > 0) {
        console.log('\nError Details:')
        errorRecords.slice(0, 5).forEach((record, index) => {
          console.log(`\n[Error ${index + 1}]`)
          console.log(`  ID: ${record.id}`)
          console.log(`  Created: ${record.created_at}`)
          console.log(`  Webhook Name: ${record.webhook_name}`)
          console.log(`  Response Data: ${JSON.stringify(record.response_data)}`)
        })
      }
    }
    
    // 4. Submission ID search
    console.log('\n\n4. SUBMISSION ID SEARCH: ' + targetSubmissionId)
    console.log('=' * 50)
    
    let foundSubmission = false
    allRecords?.forEach((record) => {
      if (record.payload && JSON.stringify(record.payload).includes(targetSubmissionId)) {
        foundSubmission = true
        console.log(`\n✅ FOUND in record ID ${record.id}:`)
        console.log(`   Created: ${record.created_at}`)
        console.log(`   Webhook Name: ${record.webhook_name}`)
        console.log(`   Status: ${record.status}`)
        console.log(`   Payload: ${JSON.stringify(record.payload, null, 2)}`)
        if (record.response_data) {
          console.log(`   Response: ${JSON.stringify(record.response_data, null, 2)}`)
        }
      }
    })
    
    if (!foundSubmission) {
      console.log('\n❌ Submission ID not found in any webhook execution records')
    }
    
    // 5. Status summary
    console.log('\n\n5. STATUS SUMMARY')
    console.log('=' * 50)
    
    const statusCounts = {}
    allRecords?.forEach(record => {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1
    })
    
    console.log('\nStatus distribution:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // 6. Webhook name summary
    console.log('\n\n6. WEBHOOK NAME SUMMARY')
    console.log('=' * 50)
    
    const webhookCounts = {}
    allRecords?.forEach(record => {
      if (record.webhook_name) {
        webhookCounts[record.webhook_name] = (webhookCounts[record.webhook_name] || 0) + 1
      }
    })
    
    console.log('\nWebhook name distribution:')
    Object.entries(webhookCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count}`)
      })
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the report
generateDetailedReport()