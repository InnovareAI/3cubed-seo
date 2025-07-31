#!/usr/bin/env node

/**
 * Test Script: Complete Supabase → N8N Flow
 * 
 * This script tests the complete flow:
 * 1. Insert test data into Supabase
 * 2. Verify trigger calls N8N
 * 3. Check if N8N processes and updates data back
 * 4. Verify dashboard can read the processed data
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Supabase → N8N Flow\n');

  try {
    // Step 1: Insert test submission (should trigger N8N)
    console.log('📝 Step 1: Inserting test submission...');
    
    const testSubmission = {
      generic_name: 'pembrolizumab-test-' + Date.now(),
      product_name: 'Keytruda Test',
      indication: 'Test indication for flow verification',
      therapeutic_area: 'Oncology',
      submitter_name: 'Test User',
      submitter_email: 'test@example.com',
      seo_reviewer_name: 'Test User',
      seo_reviewer_email: 'test@example.com',
      priority_level: 'medium',
      workflow_stage: 'draft'
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('submissions')
      .insert([testSubmission])
      .select();

    if (insertError) {
      throw insertError;
    }

    const submissionId = insertedData[0].id;
    console.log(`✅ Test submission created: ${submissionId}`);

    // Step 2: Wait and check if trigger updated the status
    console.log('\n⏱️  Step 2: Waiting for trigger to fire (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const { data: triggerCheck, error: triggerError } = await supabase
      .from('submissions')
      .select('id, ai_processing_status, workflow_stage, last_updated')
      .eq('id', submissionId)
      .single();

    if (triggerError) {
      throw triggerError;
    }

    console.log('📊 Trigger Status Check:');
    console.log(`   - Processing Status: ${triggerCheck.ai_processing_status}`);
    console.log(`   - Workflow Stage: ${triggerCheck.workflow_stage}`);
    console.log(`   - Last Updated: ${triggerCheck.last_updated}`);

    if (triggerCheck.ai_processing_status === 'triggered') {
      console.log('✅ Supabase trigger successfully fired!');
    } else {
      console.log('❌ Trigger may not have fired properly');
    }

    // Step 3: Wait for N8N processing (longer wait)
    console.log('\n🤖 Step 3: Waiting for N8N processing (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    const { data: processedData, error: processError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (processError) {
      throw processError;
    }

    console.log('🔍 N8N Processing Results:');
    console.log(`   - Processing Status: ${processedData.ai_processing_status}`);
    console.log(`   - Workflow Stage: ${processedData.workflow_stage}`);
    console.log(`   - SEO Title: ${processedData.seo_title || 'Not generated'}`);
    console.log(`   - QA Score: ${processedData.qa_score || 'Not generated'}`);
    console.log(`   - AI Output: ${processedData.ai_output ? 'Generated' : 'Not generated'}`);

    // Step 4: Test dashboard data retrieval
    console.log('\n📊 Step 4: Testing dashboard data retrieval...');
    
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('submissions')
      .select('id, product_name, generic_name, seo_title, qa_score, workflow_stage, ai_processing_status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (dashboardError) {
      throw dashboardError;
    }

    console.log(`✅ Dashboard can read ${dashboardData.length} recent submissions`);
    console.log('Recent submissions:');
    dashboardData.forEach((submission, index) => {
      console.log(`   ${index + 1}. ${submission.generic_name} - Status: ${submission.ai_processing_status}`);
    });

    // Step 5: Summary
    console.log('\n📋 Test Summary:');
    console.log('='.repeat(50));
    
    const flowSteps = [
      { step: '✅ Form → Supabase', status: 'Working' },
      { step: triggerCheck.ai_processing_status === 'triggered' ? '✅ Supabase → N8N Trigger' : '❌ Supabase → N8N Trigger', status: triggerCheck.ai_processing_status === 'triggered' ? 'Working' : 'Failed' },
      { step: processedData.ai_processing_status === 'completed' ? '✅ N8N → AI Processing' : '⏳ N8N → AI Processing', status: processedData.ai_processing_status === 'completed' ? 'Completed' : 'In Progress or Failed' },
      { step: processedData.seo_title ? '✅ N8N → Supabase Update' : '⏳ N8N → Supabase Update', status: processedData.seo_title ? 'Working' : 'Pending' },
      { step: '✅ Dashboard Reading', status: 'Working' }
    ];

    flowSteps.forEach(({ step, status }) => {
      console.log(`${step}: ${status}`);
    });

    console.log('\n🔗 Flow URLs:');
    console.log(`   - Form: https://3cubed-seo.netlify.app/seo-requests`);
    console.log(`   - Dashboard: https://3cubed-seo.netlify.app/seo-review`);
    console.log(`   - N8N Workflow: https://innovareai.app.n8n.cloud/workflow/hP9yZxUjmBKJmrZt`);

    // Cleanup option
    console.log(`\n🧹 Test submission ID: ${submissionId}`);
    console.log('   (Keep for testing or delete manually if needed)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testCompleteFlow();