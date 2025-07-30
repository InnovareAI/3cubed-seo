import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function triggerAITest() {
  console.log('🚀 CREATING NEW TEST SUBMISSION\n');
  
  const testProduct = {
    compliance_id: 'TRIGGER-' + Date.now(),
    product_name: 'Keytruda',
    generic_name: 'pembrolizumab',
    indication: 'Treatment of patients with unresectable or metastatic melanoma',
    therapeutic_area: 'Oncology',
    submitter_email: 'test@3cubed.com',
    submitter_name: 'Trigger Test',
    seo_reviewer_name: 'Trigger Test', 
    seo_reviewer_email: 'test@3cubed.com',
    workflow_stage: 'draft',
    priority_level: 'high'
  };
  
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert([testProduct])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating submission:', error);
    return;
  }
  
  console.log('✅ Created:', submission.compliance_id);
  console.log('   Product:', submission.product_name);
  console.log('   ID:', submission.id);
  
  console.log('\n📤 Triggering webhook...');
  
  const webhookPayload = {
    submission_id: submission.id,
    compliance_id: submission.compliance_id,
    product_name: submission.product_name,
    generic_name: submission.generic_name,
    indication: submission.indication,
    therapeutic_area: submission.therapeutic_area
  };
  
  const response = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload)
  });
  
  console.log('   Response:', response.status, response.statusText);
  
  console.log('\n✅ Submission created and webhook triggered!');
  console.log('\nNOW IN N8N:');
  console.log('1. Check execution history');
  console.log('2. Look for this submission:', submission.compliance_id);
  console.log('3. See which node fails (if any)');
  
  console.log('\nThe monitor script will detect when AI content arrives.');
}

triggerAITest();