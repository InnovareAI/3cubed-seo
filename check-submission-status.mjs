import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubmission() {
  const submissionId = '695e8b9d-9e52-4288-8d2b-6551fae55375';
  
  console.log(`Checking submission ID: ${submissionId}\n`);

  // First try pharma_seo_submissions (view), then try submissions (table)
  let { data: submission, error } = await supabase
    .from('pharma_seo_submissions')
    .select(`
      id,
      ai_generated_content,
      qa_feedback,
      seo_keywords,
      meta_title,
      meta_description,
      workflow_stage,
      ai_processing_status,
      created_at,
      updated_at,
      product_name,
      submitter_name,
      submitter_email
    `)
    .eq('id', submissionId)
    .single();

  if (error) {
    console.log('pharma_seo_submissions not found, trying submissions table...');
    
    // Try the base table
    const result = await supabase
      .from('submissions')
      .select(`
        id,
        ai_generated_content,
        qa_feedback,
        seo_keywords,
        meta_title,
        meta_description,
        workflow_stage,
        ai_processing_status,
        created_at,
        updated_at,
        product_name,
        submitter_name,
        submitter_email
      `)
      .eq('id', submissionId)
      .single();
    
    submission = result.data;
    error = result.error;
    
    if (error) {
      console.error('Error fetching submission from both tables:', error);
      return;
    }
  }

  if (!submission) {
    console.log('No submission found with this ID');
    return;
  }

  console.log('=== SUBMISSION STATUS ===\n');
  console.log(`Product Name: ${submission.product_name || 'N/A'}`);
  console.log(`Submitter: ${submission.submitter_name} (${submission.submitter_email})`);
  console.log(`Created: ${submission.created_at}`);
  console.log(`Last Updated: ${submission.updated_at}\n`);

  console.log('=== FIELD STATUS ===\n');
  
  // Check AI Generated Content
  console.log('1. AI Generated Content:');
  if (submission.ai_generated_content) {
    console.log(`   ✅ POPULATED (${submission.ai_generated_content.length} characters)`);
    console.log(`   Preview: ${submission.ai_generated_content.substring(0, 100)}...`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Check QA Feedback
  console.log('\n2. QA Feedback (Claude\'s Review):');
  if (submission.qa_feedback) {
    console.log(`   ✅ POPULATED (${submission.qa_feedback.length} characters)`);
    console.log(`   Preview: ${submission.qa_feedback.substring(0, 100)}...`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Check SEO Keywords
  console.log('\n3. SEO Keywords:');
  if (submission.seo_keywords) {
    console.log(`   ✅ POPULATED`);
    console.log(`   Keywords: ${submission.seo_keywords}`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Check Meta Title
  console.log('\n4. Meta Title:');
  if (submission.meta_title) {
    console.log(`   ✅ POPULATED`);
    console.log(`   Title: ${submission.meta_title}`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Check Meta Description
  console.log('\n5. Meta Description:');
  if (submission.meta_description) {
    console.log(`   ✅ POPULATED`);
    console.log(`   Description: ${submission.meta_description}`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Check Workflow Stage
  console.log('\n6. Workflow Stage:');
  console.log(`   Current Stage: ${submission.workflow_stage || 'Not set'}`);

  // Check AI Processing Status
  console.log('\n7. AI Processing Status:');
  console.log(`   Status: ${submission.ai_processing_status || 'Not set'}`);

  console.log('\n=== END OF REPORT ===');
}

checkSubmission().catch(console.error);