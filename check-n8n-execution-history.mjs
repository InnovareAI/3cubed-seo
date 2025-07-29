import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkN8nExecutionHistory() {
  console.log('=== N8N WORKFLOW EXECUTION HISTORY ===\n');
  console.log('Workflow ID: hP9yZxUjmBKJmrZt');
  console.log('Submission ID: 63ebebb8-fe90-447e-8f4c-14d79fbf2fdb');
  console.log('=====================================\n');

  // 1. Check if the submission exists
  console.log('1. Checking submission details...');
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb')
    .single();

  if (submissionError) {
    console.error('❌ Error fetching submission:', submissionError);
    return;
  }

  console.log('✅ Submission found:');
  console.log('   - Compliance ID:', submission.compliance_id);
  console.log('   - Product:', submission.product_name);
  console.log('   - Created:', new Date(submission.created_at).toLocaleString());
  console.log('   - Workflow Stage:', submission.workflow_stage);
  console.log('   - AI Processing Status:', submission.ai_processing_status || 'Not set');
  console.log('   - AI Content Generated:', submission.ai_generated_content ? 'Yes' : 'No');

  // 2. Check webhook execution logs
  console.log('\n2. Checking webhook execution logs...');
  const { data: webhookLogs, error: logError } = await supabase
    .from('n8n_webhook_executions')
    .select('*')
    .eq('submission_id', '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb')
    .order('created_at', { ascending: false });

  if (logError) {
    console.error('❌ Error fetching webhook logs:', logError);
  } else if (webhookLogs && webhookLogs.length > 0) {
    console.log(`✅ Found ${webhookLogs.length} webhook execution(s):`);
    
    webhookLogs.forEach((log, index) => {
      console.log(`\n   Execution ${index + 1}:`);
      console.log(`   - ID: ${log.id}`);
      console.log(`   - Status: ${log.status}`);
      console.log(`   - Webhook URL: ${log.webhook_url}`);
      console.log(`   - Created: ${new Date(log.created_at).toLocaleString()}`);
      
      if (log.payload) {
        console.log(`   - Payload: ${JSON.stringify(log.payload).substring(0, 200)}...`);
      }
      
      if (log.response_data) {
        console.log(`   - Response: ${JSON.stringify(log.response_data).substring(0, 200)}...`);
      }
      
      if (log.error_message) {
        console.log(`   - Error: ${log.error_message}`);
      }
    });
  } else {
    console.log('❌ No webhook execution logs found for this submission');
  }

  // 3. Check all recent webhook executions to see if any are working
  console.log('\n3. Checking recent webhook executions (last 10)...');
  const { data: recentLogs, error: recentError } = await supabase
    .from('n8n_webhook_executions')
    .select(`
      *,
      submission:submissions!submission_id (
        product_name,
        compliance_id,
        ai_processing_status
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentError) {
    console.error('❌ Error fetching recent logs:', recentError);
  } else if (recentLogs && recentLogs.length > 0) {
    console.log(`✅ Found ${recentLogs.length} recent executions:`);
    
    recentLogs.forEach((log, index) => {
      console.log(`\n   ${index + 1}. ${log.submission?.product_name || 'Unknown'}`);
      console.log(`      - Submission ID: ${log.submission_id}`);
      console.log(`      - Status: ${log.status}`);
      console.log(`      - Created: ${new Date(log.created_at).toLocaleString()}`);
      console.log(`      - AI Status: ${log.submission?.ai_processing_status || 'Not set'}`);
    });
  }

  // 4. Check if webhook URL is correct
  console.log('\n4. Checking webhook configuration...');
  const expectedWebhookUrl = 'https://tb.3cubed.cloud/webhook/hP9yZxUjmBKJmrZt';
  
  if (webhookLogs && webhookLogs.length > 0) {
    const webhookUrl = webhookLogs[0].webhook_url;
    if (webhookUrl === expectedWebhookUrl) {
      console.log('✅ Webhook URL is correct:', webhookUrl);
    } else {
      console.log('❌ Webhook URL mismatch!');
      console.log('   Expected:', expectedWebhookUrl);
      console.log('   Actual:', webhookUrl);
    }
  }

  // 5. Check for any error patterns
  console.log('\n5. Analyzing error patterns...');
  const { data: errorLogs, error: errorLogError } = await supabase
    .from('n8n_webhook_executions')
    .select('error_message, created_at')
    .eq('status', 'failed')
    .not('error_message', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);

  if (errorLogError) {
    console.error('❌ Error fetching error logs:', errorLogError);
  } else if (errorLogs && errorLogs.length > 0) {
    console.log(`⚠️  Found ${errorLogs.length} recent errors:`);
    errorLogs.forEach((log, index) => {
      console.log(`\n   ${index + 1}. ${new Date(log.created_at).toLocaleString()}`);
      console.log(`      ${log.error_message}`);
    });
  } else {
    console.log('✅ No recent webhook errors found');
  }

  // 6. Summary and recommendations
  console.log('\n=== SUMMARY ===');
  
  if (!webhookLogs || webhookLogs.length === 0) {
    console.log('\n❌ PROBLEM: No webhook was triggered for this submission!');
    console.log('\nPossible causes:');
    console.log('1. Database trigger not firing');
    console.log('2. Webhook URL misconfigured');
    console.log('3. Network issues preventing webhook delivery');
    console.log('4. n8n workflow not active or accessible');
    
    console.log('\nRecommended actions:');
    console.log('1. Check if database trigger exists and is enabled');
    console.log('2. Verify n8n workflow is active at:', expectedWebhookUrl);
    console.log('3. Test webhook manually with trigger-stelara-webhook.mjs');
    console.log('4. Check Supabase webhook logs in the dashboard');
  } else {
    const lastExecution = webhookLogs[0];
    if (lastExecution.status === 'failed') {
      console.log('\n❌ PROBLEM: Webhook was triggered but failed!');
      console.log('Error:', lastExecution.error_message);
      
      console.log('\nRecommended actions:');
      console.log('1. Check n8n workflow logs for errors');
      console.log('2. Verify all n8n nodes are configured correctly');
      console.log('3. Check API keys and credentials in n8n');
    } else if (!submission.ai_generated_content) {
      console.log('\n⚠️  PROBLEM: Webhook triggered but AI content not generated!');
      
      console.log('\nPossible causes:');
      console.log('1. n8n workflow stopped at AI generation node');
      console.log('2. OpenAI API error or timeout');
      console.log('3. Database update node not executed');
      
      console.log('\nRecommended actions:');
      console.log('1. Check n8n execution logs for this workflow');
      console.log('2. Verify OpenAI credentials in n8n');
      console.log('3. Check if AI generation node has error handling');
    }
  }
}

checkN8nExecutionHistory().catch(console.error);