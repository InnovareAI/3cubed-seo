import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubmissionDetailed() {
  const submissionId = '695e8b9d-9e52-4288-8d2b-6551fae55375';
  
  console.log(`Checking submission ID: ${submissionId}\n`);

  // Fetch ALL fields from the submission
  let { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('Error fetching submission:', error);
    return;
  }

  if (!submission) {
    console.log('No submission found with this ID');
    return;
  }

  console.log('=== BASIC INFORMATION ===\n');
  console.log(`ID: ${submission.id}`);
  console.log(`Compliance ID: ${submission.compliance_id || 'N/A'}`);
  console.log(`Product Name: ${submission.product_name || 'N/A'}`);
  console.log(`Submitter: ${submission.submitter_name} (${submission.submitter_email})`);
  console.log(`Company: ${submission.submitter_company || 'N/A'}`);
  console.log(`Created: ${submission.created_at}`);
  console.log(`Last Updated: ${submission.updated_at}`);

  console.log('\n=== WORKFLOW STATUS ===\n');
  console.log(`Workflow Stage: ${submission.workflow_stage || 'Not set'}`);
  console.log(`AI Processing Status: ${submission.ai_processing_status || 'Not set'}`);
  console.log(`AI Phase: ${submission.ai_phase || 'Not set'}`);
  console.log(`AI Status: ${submission.ai_status || 'Not set'}`);
  console.log(`AI Retry Count: ${submission.ai_retry_count || 0}`);
  console.log(`AI Last Retry: ${submission.ai_last_retry || 'N/A'}`);

  console.log('\n=== CONTENT STATUS ===\n');
  
  // Raw Input Content
  console.log('1. Raw Input Content:');
  if (submission.raw_input_content) {
    console.log(`   ✅ POPULATED (${submission.raw_input_content.length} characters)`);
    console.log(`   Preview: ${submission.raw_input_content.substring(0, 200)}...`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // AI Generated Content
  console.log('\n2. AI Generated Content:');
  if (submission.ai_generated_content) {
    console.log(`   ✅ POPULATED`);
    if (typeof submission.ai_generated_content === 'string') {
      console.log(`   Length: ${submission.ai_generated_content.length} characters`);
      console.log(`   Preview: ${submission.ai_generated_content.substring(0, 200)}...`);
    } else {
      console.log(`   Type: ${typeof submission.ai_generated_content}`);
      console.log(`   Content:`, JSON.stringify(submission.ai_generated_content, null, 2));
    }
  } else {
    console.log('   ❌ EMPTY');
  }

  // AI Output
  console.log('\n3. AI Output:');
  if (submission.ai_output) {
    console.log(`   ✅ POPULATED`);
    console.log(`   Type: ${typeof submission.ai_output}`);
    if (typeof submission.ai_output === 'object') {
      console.log(`   Keys: ${Object.keys(submission.ai_output).join(', ')}`);
    }
  } else {
    console.log('   ❌ EMPTY');
  }

  console.log('\n=== QA & FEEDBACK ===\n');
  
  // QA Feedback
  console.log('1. QA Feedback (Claude\'s Review):');
  if (submission.qa_feedback) {
    console.log(`   ✅ POPULATED`);
    if (typeof submission.qa_feedback === 'string') {
      console.log(`   Length: ${submission.qa_feedback.length} characters`);
      console.log(`   Preview: ${submission.qa_feedback.substring(0, 200)}...`);
    } else {
      console.log(`   Type: ${typeof submission.qa_feedback}`);
      console.log(`   Content:`, JSON.stringify(submission.qa_feedback, null, 2));
    }
  } else {
    console.log('   ❌ EMPTY');
  }

  // QA Score
  console.log('\n2. QA Score:');
  if (submission.qa_score !== null && submission.qa_score !== undefined) {
    console.log(`   ✅ Score: ${submission.qa_score}`);
  } else {
    console.log('   ❌ NOT SET');
  }

  console.log('\n=== SEO FIELDS ===\n');

  // SEO Keywords
  console.log('1. SEO Keywords:');
  if (submission.seo_keywords) {
    console.log(`   ✅ POPULATED`);
    if (Array.isArray(submission.seo_keywords)) {
      console.log(`   Keywords: ${submission.seo_keywords.join(', ')}`);
    } else {
      console.log(`   Value: ${submission.seo_keywords}`);
    }
  } else {
    console.log('   ❌ EMPTY');
  }

  // Meta Title
  console.log('\n2. Meta Title:');
  if (submission.meta_title) {
    console.log(`   ✅ POPULATED`);
    console.log(`   Title: ${submission.meta_title}`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Meta Description
  console.log('\n3. Meta Description:');
  if (submission.meta_description) {
    console.log(`   ✅ POPULATED`);
    console.log(`   Description: ${submission.meta_description}`);
  } else {
    console.log('   ❌ EMPTY');
  }

  // Additional SEO fields
  console.log('\n4. Additional SEO Fields:');
  console.log(`   Long Tail Keywords: ${submission.long_tail_keywords ? '✅' : '❌'}`);
  console.log(`   Consumer Questions: ${submission.consumer_questions ? '✅' : '❌'}`);
  console.log(`   H1 Tag: ${submission.h1_tag ? '✅' : '❌'}`);
  console.log(`   H2 Tags: ${submission.h2_tags ? '✅' : '❌'}`);
  console.log(`   SEO Title: ${submission.seo_title ? '✅' : '❌'}`);
  console.log(`   SEO Strategy Outline: ${submission.seo_strategy_outline ? '✅' : '❌'}`);

  console.log('\n=== ADDITIONAL INFORMATION ===\n');
  
  // Product details
  console.log('Product Information:');
  console.log(`   Therapeutic Area: ${submission.therapeutic_area || 'N/A'}`);
  console.log(`   Stage: ${submission.stage || 'N/A'}`);
  console.log(`   Priority Level: ${submission.priority_level || 'N/A'}`);
  console.log(`   Target Audience: ${submission.target_audience || 'N/A'}`);
  console.log(`   Medical Indication: ${submission.medical_indication || submission.indication || 'N/A'}`);
  console.log(`   Dosage Form: ${submission.dosage_form || 'N/A'}`);

  // Error information
  if (submission.error_message) {
    console.log('\n⚠️  ERROR INFORMATION:');
    console.log(`   Error Message: ${submission.error_message}`);
  }

  // Client review status
  console.log('\nClient Review Status:');
  console.log(`   Ready for MLR: ${submission.ready_for_mlr || false}`);
  console.log(`   Client Reviewed At: ${submission.client_reviewed_at || 'N/A'}`);
  console.log(`   Client Reviewed By: ${submission.client_reviewed_by || 'N/A'}`);

  // SEO review status
  console.log('\nSEO Review Status:');
  console.log(`   SEO Reviewed At: ${submission.seo_reviewed_at || 'N/A'}`);
  console.log(`   SEO Reviewed By: ${submission.seo_reviewed_by || 'N/A'}`);

  console.log('\n=== RAW DATA (for debugging) ===\n');
  console.log('All fields in submission:', Object.keys(submission).sort().join(', '));

  console.log('\n=== END OF DETAILED REPORT ===');
}

checkSubmissionDetailed().catch(console.error);