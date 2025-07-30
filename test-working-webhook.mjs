import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWorkingWebhook() {
  console.log('🚀 TESTING THE ACTIVE N8N WEBHOOK 🚀\n');

  // First test if webhook is reachable
  console.log('1. Testing webhook endpoint directly...');
  
  const testResponse = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ test: true })
  });

  console.log('   Status:', testResponse.status, testResponse.statusText);
  const testBody = await testResponse.text();
  console.log('   Response:', testBody || '(empty)');

  // Create a real submission
  console.log('\n2. Creating real submission...');
  
  const submission = {
    compliance_id: `SUCCESS-${Date.now()}`,
    product_name: 'Mounjaro',
    generic_name: 'tirzepatide',
    indication: 'Type 2 diabetes mellitus as an adjunct to diet and exercise',
    therapeutic_area: 'Endocrinology',
    submitter_email: 'success@test.com',
    submitter_name: 'Success Test',
    seo_reviewer_name: 'Success Test',
    seo_reviewer_email: 'success@test.com',
    workflow_stage: 'draft',
    priority_level: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('submissions')
    .insert([submission])
    .select()
    .single();

  if (error) {
    console.error('Failed to create submission:', error);
    return;
  }

  console.log('✅ Created submission:', data.compliance_id);

  // Send full webhook payload
  console.log('\n3. Sending webhook with complete payload...');
  
  const webhookPayload = {
    submission_id: data.id,
    compliance_id: data.compliance_id,
    product_name: data.product_name,
    generic_name: data.generic_name,
    indication: data.indication,
    therapeutic_area: data.therapeutic_area,
    submitter_email: data.submitter_email,
    submitter_name: data.submitter_name,
    seo_reviewer_name: data.seo_reviewer_name,
    seo_reviewer_email: data.seo_reviewer_email,
    workflow_stage: data.workflow_stage,
    priority_level: data.priority_level,
    created_at: data.created_at
  };

  console.log('   Payload:', JSON.stringify(webhookPayload, null, 2));

  const webhookResponse = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(webhookPayload)
  });

  console.log('\n   Webhook Response:', webhookResponse.status, webhookResponse.statusText);
  const responseBody = await webhookResponse.text();
  console.log('   Body:', responseBody || '(empty)');

  if (webhookResponse.status === 200) {
    console.log('\n✅ WEBHOOK ACCEPTED!');
    console.log('Now monitoring for AI processing...\n');

    // Monitor for results
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { data: updated } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', data.id)
        .single();

      if (updated && (updated.seo_keywords || updated.meta_title)) {
        console.log('\n🎉 AI CONTENT GENERATED! 🎉');
        console.log('- Keywords:', updated.seo_keywords?.length, 'keywords');
        console.log('- Title:', updated.meta_title);
        console.log('- Stage:', updated.workflow_stage);
        console.log('\n✅ N8N WORKFLOW IS FULLY OPERATIONAL!');
        return;
      }
      process.stdout.write('.');
    }
  } else {
    console.log('\n❌ Webhook not accepting our payload');
    console.log('Check n8n webhook node configuration');
  }
}

testWorkingWebhook();