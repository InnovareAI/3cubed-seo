import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSubmission() {
  const submissionId = '367789ee-9e5d-4a16-9c27-30d475736dab'
  console.log(`Checking submission ${submissionId}...\n`)

  try {
    // Get the submission details
    const { data: submission, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (error) {
      console.error('Error querying submission:', error)
      return
    }

    if (!submission) {
      console.log('❌ Submission not found in database')
      return
    }

    console.log('✓ Found submission!')
    console.log('\n=== SUBMISSION DETAILS ===')
    console.log('- ID:', submission.id)
    console.log('- Compliance ID:', submission.compliance_id)
    console.log('- Product Name:', submission.product_name)
    console.log('- Generic Name:', submission.generic_name)
    console.log('- Indication:', submission.indication)
    console.log('- Therapeutic Area:', submission.therapeutic_area)
    console.log('- Workflow Stage:', submission.workflow_stage)
    console.log('- Priority Level:', submission.priority_level)
    console.log('- Created:', new Date(submission.created_at).toLocaleString())
    console.log('- Updated:', new Date(submission.updated_at).toLocaleString())
    
    console.log('\n=== AI PROCESSING STATUS ===')
    console.log('- AI Processing Status:', submission.ai_processing_status || 'Not set')
    console.log('- Error Message:', submission.error_message || 'None')
    console.log('- AI Generated Content:', submission.ai_generated_content ? 'Yes (populated)' : 'No (null)')
    if (submission.ai_generated_content) {
      console.log('  Content Keys:', Object.keys(submission.ai_generated_content))
    }
    
    console.log('\n=== QA FIELDS ===')
    console.log('- QA Status:', submission.qa_status || 'Not set')
    console.log('- QA Score:', submission.qa_score || 'Not set')
    console.log('- QA Feedback:', submission.qa_feedback || 'None')
    
    console.log('\n=== SEO FIELDS ===')
    console.log('- SEO Keywords:', submission.seo_keywords || 'Not populated')
    console.log('- Meta Title:', submission.meta_title || 'Not populated')
    console.log('- Meta Description:', submission.meta_description || 'Not populated')
    console.log('- H2 Tags:', submission.h2_tags || 'Not populated')
    console.log('- Long Tail Keywords:', submission.long_tail_keywords || 'Not populated')
    
    console.log('\n=== RAW INPUT CONTENT ===')
    if (submission.raw_input_content) {
      console.log(submission.raw_input_content.substring(0, 200) + '...')
    } else {
      console.log('No raw input content')
    }

    // Check webhook executions
    console.log('\n=== WEBHOOK EXECUTIONS ===')
    const { data: webhookLogs, error: webhookError } = await supabase
      .from('n8n_webhook_executions')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false })

    if (webhookError) {
      console.log('Error querying webhook executions:', webhookError.message)
    } else if (webhookLogs && webhookLogs.length > 0) {
      console.log(`Found ${webhookLogs.length} webhook execution(s):`)
      webhookLogs.forEach((log, index) => {
        console.log(`\nExecution ${index + 1}:`)
        console.log('- Status:', log.status)
        console.log('- Webhook URL:', log.webhook_url)
        console.log('- Created:', new Date(log.created_at).toLocaleString())
        if (log.response_data) {
          console.log('- Response:', JSON.stringify(log.response_data).substring(0, 100) + '...')
        }
      })
      
      // Check if the correct webhook URL was used
      const correctWebhookUrl = 'hP9yZxUjmBKJmrZt'
      const hasCorrectWebhook = webhookLogs.some(log => 
        log.webhook_url && log.webhook_url.includes(correctWebhookUrl)
      )
      console.log(`\n✓ Correct webhook URL (${correctWebhookUrl}):`, hasCorrectWebhook ? 'Yes' : 'No')
    } else {
      console.log('⚠️  No webhook executions found for this submission')
    }

    // Check SEO automation logs
    console.log('\n=== SEO AUTOMATION LOGS ===')
    const { data: seoLogs, error: seoError } = await supabase
      .from('seo_automation_logs')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false })

    if (seoError) {
      console.log('Error querying SEO automation logs:', seoError.message)
    } else if (seoLogs && seoLogs.length > 0) {
      console.log(`Found ${seoLogs.length} SEO automation log(s):`)
      seoLogs.forEach((log, index) => {
        console.log(`\nLog ${index + 1}:`)
        console.log('- Type:', log.automation_type)
        console.log('- Status:', log.status)
        console.log('- Created:', new Date(log.created_at).toLocaleString())
      })
    } else {
      console.log('No SEO automation logs found')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkSubmission()