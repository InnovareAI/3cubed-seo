import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

console.log('Supabase URL:', process.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
console.log('Supabase Key:', process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestSubmission() {
  console.log('=== Creating Test Submission for 3cubed-seo ===\n');

  // Create realistic pharmaceutical submission data with all required fields
  const uniqueId = `PHR-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  const testData = {
    // Core required fields based on working example
    compliance_id: uniqueId,
    product_name: 'Pembrolizumab',
    generic_name: 'pembrolizumab',
    indication: 'Advanced or unresectable melanoma',
    therapeutic_area: 'Oncology',
    submitter_name: 'Dr. Sarah Johnson',
    submitter_email: 'sarah.johnson@pharmareviews.com',
    seo_reviewer_name: 'Dr. Sarah Johnson',
    seo_reviewer_email: 'sarah.johnson@pharmareviews.com',
    
    // Workflow fields
    workflow_stage: 'draft',
    priority_level: 'medium',
    
    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Step 1: Create the submission
  console.log('1. Creating submission in database...');
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating submission:', JSON.stringify(error, null, 2));
    console.error('Error details:', error.message, error.code, error.details);
    return null;
  }

  console.log('✅ Submission created successfully!');
  console.log('   - Submission ID:', submission.id);
  console.log('   - Compliance ID:', submission.compliance_id);
  console.log('   - Product:', submission.product_name);
  console.log('   - Therapeutic Area:', submission.therapeutic_area);

  // Step 2: Trigger the webhook
  console.log('\n2. Triggering n8n webhook...');
  const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';
  
  try {
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
      // Additional rich content for AI processing
      raw_input_content: JSON.stringify({
        product_overview: 'Pembrolizumab (Keytruda) is a humanized monoclonal antibody that blocks the interaction between PD-1 and its ligands, PD-L1 and PD-L2.',
        clinical_efficacy: 'In the pivotal KEYNOTE-006 trial, pembrolizumab demonstrated superior progression-free survival and overall survival compared to ipilimumab in patients with advanced melanoma. The median overall survival was 32.7 months with pembrolizumab vs 15.9 months with ipilimumab.',
        safety_profile: 'The most common adverse reactions (≥20%) were fatigue, musculoskeletal pain, decreased appetite, pruritus, diarrhea, nausea, rash, pyrexia, cough, dyspnea, constipation, pain, and abdominal pain.',
        mechanism_of_action: 'PD-1 blocking antibody that binds to the PD-1 receptor and blocks its interaction with PD-L1 and PD-L2',
        target_audience: 'Healthcare Professionals',
        competitors: 'Opdivo (nivolumab), Tecentriq (atezolizumab)',
        unique_selling_points: 'First-line treatment for advanced melanoma, extensive clinical trial data, improved overall survival',
        key_clinical_benefits: 'Significantly improved progression-free survival and overall survival in melanoma patients'
      })
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    console.log('✅ Webhook triggered successfully!');
    console.log('   - Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('   - Response:', responseText);
    }

  } catch (error) {
    console.error('❌ Error triggering webhook:', error.message);
  }

  // Step 3: Monitor for updates
  console.log('\n3. Monitoring for AI processing results...');
  console.log('   Checking every 3 seconds for updates...');
  
  let attempts = 0;
  const maxAttempts = 20; // Check for up to 60 seconds
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    attempts++;
    
    const { data: updated, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching updated submission:', fetchError);
      break;
    }

    // Check if AI content has been added
    if (updated.ai_generated_content || updated.seo_keywords || updated.meta_title) {
      console.log('\n✅ AI processing completed!');
      console.log('\n📊 AI Generated Content:');
      
      if (updated.seo_keywords) {
        console.log('\n🔍 SEO Keywords:', updated.seo_keywords);
      }
      
      if (updated.meta_title) {
        console.log('\n📝 Meta Title:', updated.meta_title);
      }
      
      if (updated.meta_description) {
        console.log('\n📄 Meta Description:', updated.meta_description);
      }
      
      if (updated.ai_generated_content) {
        console.log('\n📖 AI Generated Content Preview:');
        console.log(updated.ai_generated_content.substring(0, 500) + '...');
      }
      
      if (updated.claude_qa_review) {
        console.log('\n✅ Claude QA Review:', updated.claude_qa_review);
      }
      
      console.log('\n📈 Workflow Status:');
      console.log('   - Workflow Stage:', updated.workflow_stage);
      console.log('   - AI Processing Status:', updated.ai_processing_status);
      console.log('   - Last Updated:', updated.updated_at);
      
      return submission.id;
    } else {
      process.stdout.write(`   Attempt ${attempts}/${maxAttempts}: No AI content yet...\r`);
    }
  }

  console.log('\n\n⚠️  AI processing is taking longer than expected.');
  console.log('   The submission was created but AI content generation may still be in progress.');
  console.log('   You can check the submission later using ID:', submission.id);
  
  return submission.id;
}

// Run the test
createTestSubmission()
  .then(submissionId => {
    if (submissionId) {
      console.log('\n\n=== Test Complete ===');
      console.log('Submission ID:', submissionId);
      console.log('\nYou can view the submission in the dashboard or query it directly.');
    }
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
  });