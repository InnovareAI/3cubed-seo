import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseN8nIssue() {
  console.log('=== N8N WORKFLOW DIAGNOSTIC ===\n');
  console.log('Webhook URL: https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt\n');

  // 1. Check trigger function exists
  console.log('1. Checking if trigger function exists...');
  const { data: funcCheck, error: funcError } = await supabase.rpc('check_function_exists', {
    function_name: 'trigger_n8n_webhook'
  }).single();
  
  if (funcError) {
    console.log('   ❌ Cannot check function existence:', funcError.message);
    // Try alternative check
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'trigger_n8n_webhook');
    console.log('   Alternative check:', functions?.length > 0 ? '✅ Function exists' : '❌ Function not found');
  } else {
    console.log('   Result:', funcCheck);
  }

  // 2. Check trigger exists
  console.log('\n2. Checking if database trigger exists...');
  const { data: triggerCheck, error: triggerError } = await supabase.rpc('check_trigger_exists', {
    trigger_name: 'on_submission_insert',
    table_name: 'submissions'
  }).single();
  
  if (triggerError) {
    console.log('   ❌ Cannot check trigger:', triggerError.message);
  } else {
    console.log('   Result:', triggerCheck);
  }

  // 3. Test webhook directly with detailed response
  console.log('\n3. Testing webhook endpoint directly...');
  const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';
  
  const testPayload = {
    submission_id: 'diagnostic-test-' + Date.now(),
    compliance_id: 'DIAG-2025-' + Math.floor(Math.random() * 1000),
    product_name: 'DiagnosticTest',
    generic_name: 'test-generic',
    indication: 'Testing n8n workflow response',
    therapeutic_area: 'Diagnostics',
    submitter_email: 'diagnostic@test.com',
    workflow_stage: 'draft'
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('   Response body:', responseText || '(empty)');
    
    // Check if it's a valid n8n response
    if (response.status === 200) {
      console.log('   ✅ Webhook is reachable and responding');
      
      // Try to parse response
      try {
        const responseData = JSON.parse(responseText);
        console.log('   Response data:', responseData);
      } catch {
        console.log('   Response is not JSON');
      }
    }
  } catch (error) {
    console.log('   ❌ Webhook error:', error.message);
  }

  // 4. Check recent webhook executions
  console.log('\n4. Checking recent webhook execution logs...');
  const { data: recentLogs, error: logsError } = await supabase
    .from('n8n_webhook_executions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (logsError) {
    console.log('   ❌ Cannot read logs:', logsError.message);
  } else if (recentLogs?.length === 0) {
    console.log('   ❌ No webhook executions found');
  } else {
    console.log('   Recent executions:');
    recentLogs?.forEach(log => {
      console.log(`   - ${log.created_at}: ${log.status} (submission: ${log.submission_id})`);
    });
  }

  // 5. Check if pg_net is working
  console.log('\n5. Testing pg_net HTTP functionality...');
  try {
    // Test with a simple endpoint first
    const { data: netTest, error: netError } = await supabase.rpc('test_pg_net', {
      test_url: 'https://httpbin.org/post'
    });
    
    if (netError) {
      console.log('   ❌ pg_net test failed:', netError.message);
    } else {
      console.log('   ✅ pg_net HTTP calls working');
    }
  } catch (error) {
    console.log('   ❌ pg_net not available or misconfigured');
  }

  // 6. Create a test submission and monitor
  console.log('\n6. Creating test submission and monitoring...');
  const { data: testSubmission, error: submitError } = await supabase
    .from('submissions')
    .insert({
      compliance_id: 'N8N-TEST-' + Date.now(),
      product_name: 'N8N Diagnostic Test',
      generic_name: 'diagnostic-test',
      indication: 'Testing n8n workflow integration',
      therapeutic_area: 'Testing',
      submitter_email: 'n8n-test@example.com',
      submitter_name: 'N8N Tester',
      seo_reviewer_name: 'SEO Tester',
      seo_reviewer_email: 'seo@test.com',
      workflow_stage: 'draft',
      priority_level: 'high'
    })
    .select()
    .single();

  if (submitError) {
    console.log('   ❌ Failed to create test submission:', submitError);
    return;
  }

  console.log('   ✅ Created test submission:', testSubmission.compliance_id);
  
  // Wait and check for webhook execution
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const { data: webhookLog } = await supabase
    .from('n8n_webhook_executions')
    .select('*')
    .eq('submission_id', testSubmission.id)
    .single();

  if (webhookLog) {
    console.log('   ✅ Webhook was triggered by database');
  } else {
    console.log('   ❌ Database trigger did not fire webhook');
  }

  // 7. Summary and recommendations
  console.log('\n=== DIAGNOSTIC SUMMARY ===');
  console.log('\nISSUES FOUND:');
  
  if (!webhookLog) {
    console.log('1. Database trigger is not firing when new submissions are created');
    console.log('   - The trigger function may not exist or has errors');
    console.log('   - pg_net extension may not be properly configured');
  }
  
  console.log('\n2. N8N webhook responds (200 OK) but is not updating the database');
  console.log('   - The n8n workflow may be missing Supabase credentials');
  console.log('   - The Supabase update node may be misconfigured');
  console.log('   - The workflow may be failing after the webhook receives data');
  
  console.log('\nRECOMMENDATIONS:');
  console.log('1. Check n8n workflow execution history for errors');
  console.log('2. Verify Supabase credentials in n8n (API URL and service key)');
  console.log('3. Check that the "Update DB with AI Content" node has correct field mappings');
  console.log('4. Ensure the workflow is active and all nodes are connected properly');
  console.log('5. Check n8n logs for any error messages');
  
  console.log('\nTO ACCESS N8N:');
  console.log('- URL: https://innovareai.app.n8n.cloud');
  console.log('- Workflow ID: hP9yZxUjmBKJmrZt');
  console.log('- Look for failed executions in the workflow history');
}

diagnoseN8nIssue();