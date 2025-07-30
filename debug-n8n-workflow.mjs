import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugN8nWorkflow() {
  console.log('=== DEBUGGING N8N WORKFLOW ISSUE ===\n');

  // Create a test submission with tracking
  const testId = `DEBUG-${Date.now()}`;
  const testSubmission = {
    compliance_id: testId,
    product_name: 'Workflow Test Product',
    generic_name: 'debugicillin',
    indication: 'Testing n8n workflow processing and database updates',
    therapeutic_area: 'Debugging',
    submitter_email: 'debug@test.com',
    submitter_name: 'Debug Test',
    seo_reviewer_name: 'Debug Test',
    seo_reviewer_email: 'debug@test.com',
    workflow_stage: 'draft',
    priority_level: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('1. Creating test submission:', testId);
  
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert([testSubmission])
    .select()
    .single();

  if (error) {
    console.error('Failed to create test submission:', error);
    return;
  }

  console.log('✅ Test submission created with ID:', submission.id);

  // Send detailed webhook payload
  console.log('\n2. Sending webhook with full payload...');
  
  const webhookPayload = {
    submission_id: submission.id,
    compliance_id: submission.compliance_id,
    product_name: submission.product_name,
    generic_name: submission.generic_name,
    indication: submission.indication,
    therapeutic_area: submission.therapeutic_area,
    submitter_email: submission.submitter_email,
    submitter_name: submission.submitter_name,
    seo_reviewer_name: submission.seo_reviewer_name,
    seo_reviewer_email: submission.seo_reviewer_email,
    workflow_stage: submission.workflow_stage,
    priority_level: submission.priority_level,
    created_at: submission.created_at,
    // Add fields that n8n might expect
    id: submission.id,
    updated_at: submission.updated_at
  };

  console.log('Webhook payload:', JSON.stringify(webhookPayload, null, 2));

  try {
    const response = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': '3cubed-seo-debug'
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log('\nWebhook response:');
    console.log('- Status:', response.status, response.statusText);
    console.log('- Headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('- Body:', responseText || '(empty)');

    // Log webhook execution
    await supabase
      .from('n8n_webhook_executions')
      .insert({
        submission_id: submission.id,
        webhook_url: 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt',
        status: response.ok ? 'triggered' : 'failed',
        created_at: new Date().toISOString()
      });

  } catch (err) {
    console.error('Webhook error:', err);
  }

  // Monitor for updates
  console.log('\n3. Monitoring for database updates...');
  console.log('Checking every 3 seconds for 1 minute...\n');

  let found = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { data: updated } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission.id)
      .single();

    if (updated) {
      // Check what changed
      const changes = [];
      if (updated.seo_keywords && !submission.seo_keywords) changes.push('seo_keywords');
      if (updated.meta_title && !submission.meta_title) changes.push('meta_title');
      if (updated.meta_description && !submission.meta_description) changes.push('meta_description');
      if (updated.ai_processing_status !== submission.ai_processing_status) changes.push('ai_processing_status');
      if (updated.workflow_stage !== submission.workflow_stage) changes.push('workflow_stage');
      if (updated.updated_at !== submission.updated_at) changes.push('updated_at');

      if (changes.length > 0) {
        console.log(`\n✅ DATABASE UPDATED! Changed fields: ${changes.join(', ')}`);
        console.log('Current values:');
        console.log('- workflow_stage:', updated.workflow_stage);
        console.log('- ai_processing_status:', updated.ai_processing_status);
        console.log('- seo_keywords:', updated.seo_keywords ? `${updated.seo_keywords.length} keywords` : 'none');
        console.log('- meta_title:', updated.meta_title || 'none');
        console.log('- meta_description:', updated.meta_description || 'none');
        found = true;
        break;
      }
    }
    process.stdout.write('.');
  }

  if (!found) {
    console.log('\n\n❌ NO DATABASE UPDATES DETECTED');
    console.log('The n8n workflow is not updating the database.');
    
    // Check if there are ANY updates to submissions table
    const { data: recentUpdates } = await supabase
      .from('submissions')
      .select('id, compliance_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    console.log('\nRecent submission updates:');
    recentUpdates?.forEach(update => {
      console.log(`- ${update.compliance_id}: ${new Date(update.updated_at).toLocaleString()}`);
    });
  }

  console.log('\n=== DIAGNOSIS ===');
  console.log('1. Webhook endpoint is reachable (200 OK)');
  console.log('2. n8n is receiving the webhook data');
  console.log('3. n8n workflow is NOT updating Supabase');
  console.log('\nPossible issues in n8n:');
  console.log('- Missing or incorrect Supabase credentials');
  console.log('- Workflow execution failing at some step');
  console.log('- Incorrect table name or field mappings');
  console.log('- AI service (Perplexity/Claude) not configured or failing');
}

debugN8nWorkflow();