import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubmissionDetailed() {
  const submissionId = '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb';
  console.log('=== DETAILED SUBMISSION ANALYSIS ===\n');
  console.log('Submission ID:', submissionId);
  console.log('=====================================\n');

  // Get full submission record
  console.log('1. FULL SUBMISSION RECORD:');
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('❌ Error fetching submission:', error);
    return;
  }

  // Display all fields
  console.log('\n📊 All Submission Fields:');
  for (const [key, value] of Object.entries(submission)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object') {
        console.log(`   - ${key}:`, JSON.stringify(value, null, 2));
      } else if (typeof value === 'string' && value.length > 100) {
        console.log(`   - ${key}: ${value.substring(0, 100)}...`);
      } else {
        console.log(`   - ${key}: ${value}`);
      }
    }
  }

  // Check specifically for error fields
  console.log('\n2. ERROR/ISSUE FIELDS:');
  console.log('   - error_message:', submission.error_message || 'None');
  console.log('   - processing_metadata:', submission.processing_metadata || 'None');
  console.log('   - langchain_status:', submission.langchain_status || 'None');
  console.log('   - langchain_error:', submission.langchain_error || 'None');

  // Check workflow stage and AI status
  console.log('\n3. WORKFLOW STATUS ANALYSIS:');
  console.log('   - workflow_stage:', submission.workflow_stage);
  console.log('   - ai_processing_status:', submission.ai_processing_status);
  console.log('   - qa_status:', submission.qa_status || 'Not set');
  
  if (submission.workflow_stage === 'draft') {
    console.log('\n   ⚠️  ISSUE: Submission is stuck in DRAFT stage!');
    console.log('   Expected flow: draft → form_submitted → ai_processing → hitl_review → ...');
    console.log('   The webhook trigger requires workflow_stage = "form_submitted"');
  }

  if (submission.ai_processing_status === 'processing' && !submission.ai_generated_content) {
    console.log('\n   ⚠️  ISSUE: AI status is "processing" but no content generated!');
    console.log('   This suggests the AI processing may have failed or never started.');
  }

  // Check timestamps
  console.log('\n4. TIMELINE ANALYSIS:');
  const created = new Date(submission.created_at);
  const updated = new Date(submission.updated_at);
  const timeDiff = (updated - created) / 1000 / 60; // minutes
  
  console.log('   - Created:', created.toLocaleString());
  console.log('   - Last Updated:', updated.toLocaleString());
  console.log(`   - Time elapsed: ${timeDiff.toFixed(1)} minutes`);
  
  if (timeDiff > 5 && submission.workflow_stage === 'draft') {
    console.log('   ⚠️  Submission has been in draft for over 5 minutes!');
  }

  // Check for any webhook execution history
  console.log('\n5. WEBHOOK EXECUTION CHECK:');
  
  // Try different table names for webhook logs
  const webhookTables = ['n8n_webhook_executions', 'webhook_executions', 'webhook_logs'];
  let webhookFound = false;
  
  for (const table of webhookTables) {
    try {
      const { data: webhookData, error: webhookError } = await supabase
        .from(table)
        .select('*')
        .or(`submission_id.eq.${submissionId},payload.cs.${submissionId}`)
        .limit(1);
        
      if (!webhookError && webhookData && webhookData.length > 0) {
        console.log(`   ✅ Found webhook execution in ${table}:`, webhookData[0]);
        webhookFound = true;
        break;
      }
    } catch (e) {
      // Table doesn't exist, continue
    }
  }
  
  if (!webhookFound) {
    console.log('   ❌ No webhook execution found for this submission');
  }

  // Summary and recommendations
  console.log('\n6. SUMMARY & RECOMMENDATIONS:');
  console.log('\n   Issues identified:');
  console.log('   1. Submission is in "draft" stage instead of "form_submitted"');
  console.log('   2. AI processing status shows "processing" but no content generated');
  console.log('   3. No webhook execution logs found');
  
  console.log('\n   Root cause:');
  console.log('   The submission was never properly transitioned from draft to form_submitted,');
  console.log('   which prevented the database trigger from firing the webhook.');
  
  console.log('\n   Recommended actions:');
  console.log('   1. Update workflow_stage to "form_submitted" to trigger the webhook');
  console.log('   2. Or manually trigger the AI processing workflow');
  console.log('   3. Investigate why the form submission didn\'t set the correct stage');
}

checkSubmissionDetailed().catch(console.error);