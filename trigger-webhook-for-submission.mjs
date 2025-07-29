import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function triggerWebhookForSubmission() {
  const submissionId = '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb';
  const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';
  
  console.log('=== MANUALLY TRIGGERING WEBHOOK ===\n');
  console.log('Submission ID:', submissionId);
  console.log('Webhook URL:', webhookUrl);
  console.log('=====================================\n');

  // 1. Get the submission
  console.log('1. Fetching submission from database...');
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('❌ Error fetching submission:', error);
    return;
  }

  console.log('✅ Found submission:', submission.product_name);
  console.log('   - Compliance ID:', submission.compliance_id);
  console.log('   - Current workflow stage:', submission.workflow_stage);
  
  // 2. Prepare webhook payload
  const payload = {
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
    created_at: submission.created_at
  };
  
  // 3. Trigger webhook
  console.log('\n2. Triggering n8n webhook...');
  console.log('   Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('\n3. Webhook Response:');
    console.log('   - Status:', response.status);
    const responseText = await response.text();
    console.log('   - Response:', responseText);
    
    if (response.ok) {
      console.log('\n✅ Webhook triggered successfully!');
      console.log('   The n8n workflow should now process this submission.');
      
      // 4. Monitor for updates
      console.log('\n4. Monitoring for AI content generation...');
      console.log('   (Checking every 2 seconds for up to 60 seconds)');
      
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds
      
      const checkInterval = setInterval(async () => {
        attempts++;
        process.stdout.write('.');
        
        const { data: updated } = await supabase
          .from('submissions')
          .select('workflow_stage, ai_processing_status, ai_generated_content, seo_keywords, meta_title, meta_description, updated_at')
          .eq('id', submissionId)
          .single();
          
        if (updated && updated.updated_at !== submission.updated_at) {
          console.log('\n\n✅ SUBMISSION UPDATED!');
          console.log('   - Workflow Stage:', updated.workflow_stage);
          console.log('   - AI Processing Status:', updated.ai_processing_status);
          
          if (updated.ai_generated_content) {
            console.log('   - AI Content Generated: Yes');
            console.log('   - Content Preview:', updated.ai_generated_content.substring(0, 200) + '...');
          }
          
          if (updated.seo_keywords) {
            console.log('   - SEO Keywords:', updated.seo_keywords);
          }
          
          if (updated.meta_title) {
            console.log('   - Meta Title:', updated.meta_title);
          }
          
          if (updated.meta_description) {
            console.log('   - Meta Description:', updated.meta_description);
          }
          
          clearInterval(checkInterval);
          
          console.log('\n🎉 SUCCESS! The n8n workflow processed the submission!');
        } else if (attempts >= maxAttempts) {
          console.log('\n\n⏰ Timeout waiting for updates');
          console.log('   The webhook was triggered but the submission wasn\'t updated.');
          console.log('\n   Possible issues:');
          console.log('   1. n8n workflow might have errors');
          console.log('   2. AI generation might be taking longer than expected');
          console.log('   3. Database update node might not be configured correctly');
          console.log('\n   Check the n8n execution logs for workflow ID: hP9yZxUjmBKJmrZt');
          clearInterval(checkInterval);
        }
      }, 2000);
      
    } else {
      console.log('\n❌ Webhook trigger failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('\n❌ Error triggering webhook:', error.message);
    console.log('   This might indicate:');
    console.log('   1. Network connectivity issues');
    console.log('   2. n8n server is down');
    console.log('   3. Webhook URL is incorrect');
  }
}

triggerWebhookForSubmission().catch(console.error);