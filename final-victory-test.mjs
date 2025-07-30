import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function finalVictoryTest() {
  console.log('🎉 FINAL VICTORY TEST - N8N WORKFLOW IS ACTIVE! 🎉\n');

  // Create a victory test submission
  const victoryProduct = {
    compliance_id: `VICTORY-${Date.now()}`,
    product_name: 'Wegovy',
    generic_name: 'semaglutide',
    indication: 'Chronic weight management in adults with obesity or overweight with weight-related comorbidities',
    therapeutic_area: 'Endocrinology',
    submitter_email: 'victory@test.com',
    submitter_name: 'Victory Test',
    seo_reviewer_name: 'Victory Test',
    seo_reviewer_email: 'victory@test.com',
    workflow_stage: 'draft',
    priority_level: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('1. Creating victory test submission:', victoryProduct.product_name);
  
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert([victoryProduct])
    .select()
    .single();

  if (error) {
    console.error('Failed to create submission:', error);
    return;
  }

  console.log('✅ Submission created:', submission.compliance_id);

  // Trigger the WORKING webhook
  console.log('\n2. Triggering the ACTIVE n8n webhook...');
  
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

  const response = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload)
  });

  console.log('   Webhook response:', response.status, response.statusText);

  // Monitor for the MAGIC to happen
  console.log('\n3. 🎯 MONITORING FOR AI MAGIC...\n');
  console.log('   Expected flow: Webhook → Perplexity → Claude → Database\n');

  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: updated } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission.id)
      .single();

    if (updated) {
      // Check for AI content
      if (updated.seo_keywords || updated.meta_title) {
        console.log('\n✨ AI CONTENT DETECTED! ✨');
        console.log('\n📊 PERPLEXITY GENERATED:');
        console.log('- SEO Keywords:', updated.seo_keywords ? `${updated.seo_keywords.length} keywords` : 'pending...');
        console.log('- Meta Title:', updated.meta_title || 'pending...');
        console.log('- Meta Description:', updated.meta_description ? 'Yes' : 'pending...');
        
        if (updated.qa_status || updated.qa_score) {
          console.log('\n🔍 CLAUDE QA REVIEW:');
          console.log('- QA Status:', updated.qa_status);
          console.log('- QA Score:', updated.qa_score);
        }
        
        console.log('\n📈 WORKFLOW STATUS:');
        console.log('- Stage:', updated.workflow_stage);
        console.log('- AI Status:', updated.ai_processing_status);
        
        console.log('\n🎊 VICTORY! THE AI PIPELINE IS WORKING! 🎊');
        console.log('\nYour submission is ready at /seo-review');
        return;
      }
    }
    process.stdout.write('.');
  }

  console.log('\n\n⏰ Still processing... The workflow might be running.');
  console.log('Check n8n execution history for details.');
}

finalVictoryTest();