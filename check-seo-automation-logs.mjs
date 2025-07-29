import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSeoAutomationLogs() {
  console.log('=== CHECKING SEO AUTOMATION LOGS ===\n');
  console.log('Submission ID: 63ebebb8-fe90-447e-8f4c-14d79fbf2fdb');
  console.log('=====================================\n');

  // Check seo_automation_logs table
  console.log('1. Checking seo_automation_logs for this submission...');
  const { data: logs, error: logsError } = await supabase
    .from('seo_automation_logs')
    .select('*')
    .eq('submission_id', '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb')
    .order('created_at', { ascending: false });

  if (logsError) {
    console.error('❌ Error fetching logs:', logsError);
    
    // Try to check what tables exist
    console.log('\n2. Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables', {});
      
    if (tablesError) {
      console.log('Could not fetch table list. Trying alternative approach...');
      
      // Check specific tables we know about
      const tablesToCheck = ['submissions', 'webhook_logs', 'automation_logs', 'n8n_logs'];
      
      for (const table of tablesToCheck) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
            
          if (!error) {
            console.log(`✅ Table '${table}' exists`);
          } else {
            console.log(`❌ Table '${table}' not found or accessible`);
          }
        } catch (e) {
          console.log(`❌ Error checking table '${table}'`);
        }
      }
    }
  } else if (logs && logs.length > 0) {
    console.log(`✅ Found ${logs.length} automation log(s):`);
    
    logs.forEach((log, index) => {
      console.log(`\n   Log ${index + 1}:`);
      console.log(`   - ID: ${log.id}`);
      console.log(`   - Type: ${log.automation_type}`);
      console.log(`   - Status: ${log.status}`);
      console.log(`   - Created: ${new Date(log.created_at).toLocaleString()}`);
      
      if (log.details) {
        console.log(`   - Details: ${JSON.stringify(log.details, null, 2)}`);
      }
      
      if (log.error_message) {
        console.log(`   - Error: ${log.error_message}`);
      }
    });
  } else {
    console.log('❌ No automation logs found for this submission');
  }

  // Check all recent logs
  console.log('\n3. Checking recent automation logs (last 10)...');
  const { data: recentLogs, error: recentError } = await supabase
    .from('seo_automation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentError && recentLogs && recentLogs.length > 0) {
    console.log(`✅ Found ${recentLogs.length} recent logs:`);
    
    recentLogs.forEach((log, index) => {
      console.log(`\n   ${index + 1}. ${log.automation_type} - ${log.status}`);
      console.log(`      Submission: ${log.submission_id}`);
      console.log(`      Created: ${new Date(log.created_at).toLocaleString()}`);
    });
  }

  // Check submission workflow stage
  console.log('\n4. Checking submission workflow stage...');
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('workflow_stage, ai_processing_status, created_at, updated_at')
    .eq('id', '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb')
    .single();

  if (!submissionError && submission) {
    console.log('✅ Submission workflow info:');
    console.log(`   - Workflow Stage: ${submission.workflow_stage}`);
    console.log(`   - AI Processing Status: ${submission.ai_processing_status}`);
    console.log(`   - Created: ${new Date(submission.created_at).toLocaleString()}`);
    console.log(`   - Updated: ${new Date(submission.updated_at).toLocaleString()}`);
    
    if (submission.workflow_stage !== 'ai_processing' && submission.workflow_stage !== 'form_submitted') {
      console.log('\n⚠️  WARNING: Submission is not in expected workflow stage for automation!');
      console.log('   Expected: form_submitted or ai_processing');
      console.log(`   Actual: ${submission.workflow_stage}`);
    }
  }
}

checkSeoAutomationLogs().catch(console.error);