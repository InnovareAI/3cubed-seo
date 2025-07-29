import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkWebhookLogsDetailed() {
  console.log('=== WEBHOOK LOGS ANALYSIS ===\n');
  console.log('Submission ID: 63ebebb8-fe90-447e-8f4c-14d79fbf2fdb');
  console.log('Workflow ID: hP9yZxUjmBKJmrZt');
  console.log('=====================================\n');

  // 1. Check webhook_logs table structure
  console.log('1. Checking webhook_logs table...');
  const { data: webhookLogs, error: webhookError } = await supabase
    .from('webhook_logs')
    .select('*')
    .limit(5)
    .order('id', { ascending: false });

  if (webhookError) {
    console.error('❌ Error fetching webhook logs:', webhookError);
  } else if (webhookLogs && webhookLogs.length > 0) {
    console.log(`✅ Found ${webhookLogs.length} recent webhook logs`);
    console.log('   Table columns:', Object.keys(webhookLogs[0]));
    
    // Check if any logs are for our submission
    const ourLogs = webhookLogs.filter(log => {
      // Check in payload or any field that might contain submission_id
      const logStr = JSON.stringify(log);
      return logStr.includes('63ebebb8-fe90-447e-8f4c-14d79fbf2fdb');
    });
    
    if (ourLogs.length > 0) {
      console.log(`\n   ✅ Found ${ourLogs.length} log(s) for our submission:`);
      ourLogs.forEach((log, i) => {
        console.log(`\n   Log ${i + 1}:`, JSON.stringify(log, null, 2));
      });
    } else {
      console.log('\n   ❌ No logs found for submission ID 63ebebb8-fe90-447e-8f4c-14d79fbf2fdb');
    }
  } else {
    console.log('❌ No webhook logs found');
  }

  // 2. Check automation_logs table
  console.log('\n2. Checking automation_logs table...');
  const { data: automationLogs, error: automationError } = await supabase
    .from('automation_logs')
    .select('*')
    .limit(5)
    .order('id', { ascending: false });

  if (automationError) {
    console.error('❌ Error fetching automation logs:', automationError);
  } else if (automationLogs && automationLogs.length > 0) {
    console.log(`✅ Found ${automationLogs.length} recent automation logs`);
    console.log('   Table columns:', Object.keys(automationLogs[0]));
    
    // Check for our submission
    const ourAutomationLogs = automationLogs.filter(log => {
      const logStr = JSON.stringify(log);
      return logStr.includes('63ebebb8-fe90-447e-8f4c-14d79fbf2fdb');
    });
    
    if (ourAutomationLogs.length > 0) {
      console.log(`\n   ✅ Found ${ourAutomationLogs.length} automation log(s) for our submission:`);
      ourAutomationLogs.forEach((log, i) => {
        console.log(`\n   Log ${i + 1}:`, JSON.stringify(log, null, 2));
      });
    }
  }

  // 3. Check n8n_logs table
  console.log('\n3. Checking n8n_logs table...');
  const { data: n8nLogs, error: n8nError } = await supabase
    .from('n8n_logs')
    .select('*')
    .limit(5)
    .order('id', { ascending: false });

  if (n8nError) {
    console.error('❌ Error fetching n8n logs:', n8nError);
  } else if (n8nLogs && n8nLogs.length > 0) {
    console.log(`✅ Found ${n8nLogs.length} recent n8n logs`);
    console.log('   Table columns:', Object.keys(n8nLogs[0]));
  }

  // 4. Check submission details and why trigger didn't fire
  console.log('\n4. Analyzing why webhook wasn\'t triggered...');
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb')
    .single();

  if (!submissionError && submission) {
    console.log('\n✅ Submission Analysis:');
    console.log(`   - Current workflow_stage: ${submission.workflow_stage}`);
    console.log(`   - Expected for trigger: form_submitted`);
    console.log(`   - Created at: ${new Date(submission.created_at).toLocaleString()}`);
    
    if (submission.workflow_stage === 'draft') {
      console.log('\n❌ PROBLEM IDENTIFIED: Submission is in "draft" stage!');
      console.log('\n   The database trigger only fires when workflow_stage = "form_submitted"');
      console.log('   But this submission has workflow_stage = "draft"');
      console.log('\n   This is why the webhook was never triggered!');
      
      console.log('\n📋 SOLUTION:');
      console.log('   1. Update the submission workflow_stage to "form_submitted"');
      console.log('   2. Or manually trigger the webhook');
      console.log('   3. Or check why the form submission didn\'t set the correct stage');
    }
  }

  // 5. Check for any webhooks with our workflow ID
  console.log('\n5. Searching for webhooks with workflow ID hP9yZxUjmBKJmrZt...');
  const allTables = ['webhook_logs', 'automation_logs', 'n8n_logs'];
  
  for (const table of allTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(100);
      
    if (!error && data) {
      const workflowLogs = data.filter(log => {
        const logStr = JSON.stringify(log);
        return logStr.includes('hP9yZxUjmBKJmrZt');
      });
      
      if (workflowLogs.length > 0) {
        console.log(`\n   ✅ Found ${workflowLogs.length} log(s) with workflow ID in ${table}`);
      }
    }
  }
}

checkWebhookLogsDetailed().catch(console.error);