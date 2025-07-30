#!/usr/bin/env node

// Debug the workflow issue by checking database state and testing submission flow
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MzU2NDIsImV4cCI6MjA0NTExMTY0Mn0.lBCTlkcrxHxFqR2BCnjutXH3WNhT8lKFGBt7LKJV7_E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkRecentSubmissions() {
  console.log('📊 Checking recent submissions (last 30 minutes)...\n');
  
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  
  try {
    const { data: recentSubmissions, error } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, workflow_stage, langchain_status, ai_output, created_at')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching recent submissions:', error);
      return;
    }

    console.log(`Found ${recentSubmissions.length} submissions in the last 30 minutes:`);
    
    if (recentSubmissions.length === 0) {
      console.log('   No recent submissions found.');
      console.log('   This suggests the form submission to Supabase is not working.');
    } else {
      recentSubmissions.forEach((submission, index) => {
        console.log(`\n${index + 1}. ID: ${submission.id}`);
        console.log(`   Product: ${submission.product_name}`);
        console.log(`   Submitter: ${submission.submitter_name}`);
        console.log(`   Workflow Stage: ${submission.workflow_stage}`);
        console.log(`   Langchain Status: ${submission.langchain_status}`);
        console.log(`   Has AI Output: ${submission.ai_output ? 'Yes' : 'No'}`);
        console.log(`   Created: ${new Date(submission.created_at).toLocaleString()}`);
      });
    }
    
  } catch (error) {
    console.error('🔥 Unexpected error:', error);
  }
}

async function createTestSubmissionForWorkflow() {
  console.log('\n🧪 Creating a test submission that mimics the form...\n');
  
  // Create a submission that matches what the form would create
  const testSubmission = {
    product_name: 'Workflow Debug Test Product',
    generic_name: 'debug-test-generic',
    indication: 'Test indication for workflow debugging',
    therapeutic_area: 'Oncology',
    submitter_name: 'Workflow Debug Tester',
    submitter_email: 'workflow.debug@example.com',
    priority_level: 'medium',
    workflow_stage: 'draft',
    development_stage: 'Phase III',
    langchain_status: 'needs_processing',  // This is what triggers the workflow
    langchain_retry_count: 0
  };

  try {
    const { data: insertedData, error: supabaseError } = await supabase
      .from('submissions')
      .insert([testSubmission])
      .select();

    if (supabaseError) {
      console.error('❌ Failed to create test submission:', supabaseError);
      return null;
    }

    console.log('✅ Test submission created successfully!');
    const submission = insertedData[0];
    console.log(`   ID: ${submission.id}`);
    console.log(`   Product: ${submission.product_name}`);
    console.log('   This submission should trigger the n8n workflow...');
    
    return submission;

  } catch (error) {
    console.error('🔥 Unexpected error creating test submission:', error);
    return null;
  }
}

async function callWorkflowWebhook(submissionId) {
  console.log('\n🎯 Calling n8n workflow webhook with submission ID...\n');
  
  const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';
  const webhookPayload = {
    submission_id: submissionId,
    product_name: 'Workflow Debug Test Product',
    generic_name: 'debug-test-generic', 
    indication: 'Test indication for workflow debugging',
    therapeutic_area: 'Oncology',
    submitter_name: 'Workflow Debug Tester',
    submitter_email: 'workflow.debug@example.com',
    priority_level: 'medium',
    workflow_stage: 'draft',
    development_stage: 'Phase III'
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    const responseText = await response.text();
    
    console.log(`📊 Webhook Response: ${response.status} ${response.statusText}`);
    console.log('📝 Response Body:', responseText || '(empty)');

    return response.ok;

  } catch (error) {
    console.error('🔥 Webhook call failed:', error);
    return false;
  }
}

async function monitorSubmissionUpdates(submissionId) {
  console.log(`\n👀 Monitoring submission ${submissionId} for updates...\n`);
  
  let attempts = 0;
  const maxAttempts = 12; // Monitor for 2 minutes (12 * 10 seconds)
  
  while (attempts < maxAttempts) {
    try {
      const { data: submission, error } = await supabase
        .from('submissions')
        .select('id, workflow_stage, langchain_status, ai_output, seo_title, updated_at')
        .eq('id', submissionId)
        .single();

      if (error) {
        console.error('❌ Error checking submission:', error);
        break;
      }

      console.log(`Attempt ${attempts + 1}/${maxAttempts}:`);
      console.log(`   Workflow Stage: ${submission.workflow_stage}`);
      console.log(`   Langchain Status: ${submission.langchain_status}`);
      console.log(`   Has AI Output: ${submission.ai_output ? 'Yes' : 'No'}`);
      console.log(`   SEO Title: ${submission.seo_title || 'None'}`);
      console.log(`   Updated: ${new Date(submission.updated_at).toLocaleString()}`);

      // Check if the workflow completed
      if (submission.langchain_status === 'completed' || submission.ai_output) {
        console.log('\n🎉 SUCCESS! The workflow completed and updated the database.');
        console.log('   The n8n workflow is working correctly.');
        break;
      }

      if (submission.langchain_status === 'failed') {
        console.log('\n❌ FAILED! The workflow failed.');
        console.log('   Check the n8n workflow logs for error details.');
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log('   Waiting 10 seconds for next check...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

    } catch (error) {
      console.error('🔥 Error monitoring submission:', error);
      break;
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⏰ Monitoring timeout reached.');
    console.log('   The workflow may be taking longer than expected or failed silently.');
  }
}

async function runDebugSequence() {
  console.log('🔍 Starting n8n workflow debugging sequence...\n');
  console.log('=' .repeat(60));
  
  // Step 1: Check recent submissions
  await checkRecentSubmissions();
  
  console.log('\n' + '=' .repeat(60));
  
  // Step 2: Create test submission
  const testSubmission = await createTestSubmissionForWorkflow();
  
  if (!testSubmission) {
    console.log('❌ Cannot continue without a test submission.');
    return;
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Step 3: Call the webhook
  const webhookSuccess = await callWorkflowWebhook(testSubmission.id);
  
  if (!webhookSuccess) {
    console.log('❌ Webhook call failed. Cannot proceed with monitoring.');
    return;
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Step 4: Monitor for updates
  await monitorSubmissionUpdates(testSubmission.id);
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Debug sequence completed!');
  console.log('\nNext steps:');
  console.log('1. If the workflow succeeded, your n8n setup is working');
  console.log('2. If it failed, check the n8n workflow execution logs');
  console.log('3. Common issues: API keys, field mappings, network connectivity');
}

runDebugSequence();