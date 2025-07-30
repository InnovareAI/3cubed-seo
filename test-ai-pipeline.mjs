import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAIPipeline() {
  console.log('=== TESTING AI PIPELINE ===');
  console.log('Expected flow: Form → Webhook → Perplexity → Claude → Database\n');

  // Create test submission
  const testProduct = {
    compliance_id: `AI-TEST-${Date.now()}`,
    product_name: 'Ozempic',
    generic_name: 'semaglutide',
    indication: 'Type 2 diabetes mellitus and weight management',
    therapeutic_area: 'Endocrinology',
    submitter_email: 'test@example.com',
    submitter_name: 'AI Pipeline Test',
    seo_reviewer_name: 'AI Pipeline Test',
    seo_reviewer_email: 'test@example.com',
    workflow_stage: 'draft',
    priority_level: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('1. Creating test submission for:', testProduct.product_name);
  
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert([testProduct])
    .select()
    .single();

  if (error) {
    console.error('Failed to create submission:', error);
    return;
  }

  console.log('✅ Submission created:', submission.compliance_id);
  console.log('   ID:', submission.id);

  // Trigger webhook
  console.log('\n2. Triggering n8n webhook...');
  
  const webhookPayload = {
    submission_id: submission.id,
    compliance_id: submission.compliance_id,
    product_name: submission.product_name,
    generic_name: submission.generic_name,
    indication: submission.indication,
    therapeutic_area: submission.therapeutic_area,
    submitter_email: submission.submitter_email,
    submitter_name: submission.submitter_name,
    workflow_stage: submission.workflow_stage,
    priority_level: submission.priority_level
  };

  try {
    const response = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    console.log('   Webhook response:', response.status, response.statusText);
  } catch (err) {
    console.error('   Webhook error:', err.message);
  }

  // Monitor for AI processing
  console.log('\n3. Monitoring AI pipeline stages...');
  console.log('   Expected: Perplexity → Claude → Database Update\n');

  let lastStatus = {};
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { data: updated } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission.id)
      .single();

    if (updated) {
      // Check what's happening
      const status = {
        stage: updated.workflow_stage,
        ai_status: updated.ai_processing_status,
        has_keywords: !!updated.seo_keywords,
        has_title: !!updated.meta_title,
        has_qa: !!updated.qa_status,
        qa_score: updated.qa_score
      };

      // Only log if something changed
      if (JSON.stringify(status) !== JSON.stringify(lastStatus)) {
        console.log(`\n   [${new Date().toLocaleTimeString()}] Status Update:`);
        console.log(`   - Workflow Stage: ${status.stage}`);
        console.log(`   - AI Status: ${status.ai_status || 'not set'}`);
        console.log(`   - Perplexity Output: ${status.has_keywords ? '✅ Keywords generated' : '❌ No keywords'}`);
        console.log(`   - Claude QA: ${status.has_qa ? `✅ QA complete (score: ${status.qa_score})` : '❌ No QA review'}`);
        
        lastStatus = status;

        // If we have both AI content and QA, we're done
        if (status.has_keywords && status.has_qa) {
          console.log('\n✅ AI PIPELINE COMPLETE!');
          console.log('\nGenerated content:');
          console.log('- SEO Keywords:', updated.seo_keywords?.slice(0, 3).join(', '), '...');
          console.log('- Meta Title:', updated.meta_title);
          console.log('- QA Status:', updated.qa_status);
          console.log('- QA Score:', updated.qa_score);
          return;
        }
      }
    }
    process.stdout.write('.');
  }

  console.log('\n\n❌ AI PIPELINE FAILED');
  console.log('\nDiagnosis:');
  if (!lastStatus.has_keywords) {
    console.log('- ❌ Perplexity did not generate content');
  }
  if (!lastStatus.has_qa) {
    console.log('- ❌ Claude did not perform QA review');
  }
  console.log('- ❌ Database was not updated with AI results');

  console.log('\nCheck n8n workflow for:');
  console.log('1. Perplexity API key configuration');
  console.log('2. Claude/Anthropic API key configuration');
  console.log('3. Proper node connections (Webhook → Perplexity → Claude → Supabase)');
  console.log('4. Error logs in execution history');
}

testAIPipeline();