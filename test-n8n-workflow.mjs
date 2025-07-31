#!/usr/bin/env node

// Test script to verify n8n workflow integration

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://eqokpqqjdzbzatbmqiea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxb2twcXFqZHpiemF0Ym1xaWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5Mzk1NTAsImV4cCI6MjA1MjUxNTU1MH0.TFLR1z7VdvKf9v_zNx8QQ6vYqLjUd2S4m3o4ZOBJZj4';

// n8n webhook URL
const N8N_WEBHOOK_URL = 'https://workflows.innovareai.com/webhook/fda-research-agent';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testN8nWebhook() {
  console.log('🧪 Testing n8n Workflow Integration');
  console.log('=====================================\n');

  // Test 1: Direct webhook test
  console.log('📡 Test 1: Direct webhook call to n8n...');
  try {
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: true,
        submission_id: 'test-webhook-001',
        product_name: 'Test Product',
        therapeutic_area: 'Oncology',
        medical_indication: 'Test Indication',
        development_stage: 'Market Launch'
      })
    });

    console.log(`✅ Webhook Response Status: ${webhookResponse.status}`);
    const responseText = await webhookResponse.text();
    console.log(`📄 Response: ${responseText.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }

  console.log('\n' + '-'.repeat(50) + '\n');

  // Test 2: Create test submission in Supabase
  console.log('💾 Test 2: Creating test submission in Supabase...');
  
  const testSubmission = {
    product_name: 'Keytruda Test',
    generic_name: 'pembrolizumab-test',
    indication: 'NSCLC Test',
    therapeutic_area: 'Oncology',
    development_stage: 'Market Launch',
    submitter_name: 'Test User',
    submitter_email: 'test@example.com',
    seo_reviewer_name: 'SEO Test',
    seo_reviewer_email: 'seo@example.com',
    priority_level: 'high',
    workflow_stage: 'draft'
  };

  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([testSubmission])
      .select();

    if (error) {
      console.error('❌ Supabase insert failed:', error);
    } else {
      console.log('✅ Test submission created with ID:', data[0].id);
      console.log('🔄 Supabase trigger should now call n8n webhook...');
      
      // Wait 5 seconds then check status
      console.log('\n⏳ Waiting 5 seconds for processing...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if the submission was updated by n8n
      const { data: updatedData, error: fetchError } = await supabase
        .from('submissions')
        .select('id, workflow_stage, ai_processing_status, seo_title, meta_description')
        .eq('id', data[0].id)
        .single();
        
      if (fetchError) {
        console.error('❌ Failed to fetch updated submission:', fetchError);
      } else {
        console.log('\n📊 Submission Status After Processing:');
        console.log(`   - Workflow Stage: ${updatedData.workflow_stage}`);
        console.log(`   - AI Processing Status: ${updatedData.ai_processing_status || 'Not set'}`);
        console.log(`   - SEO Title: ${updatedData.seo_title || 'Not generated yet'}`);
        console.log(`   - Meta Description: ${updatedData.meta_description || 'Not generated yet'}`);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n' + '-'.repeat(50) + '\n');

  // Test 3: Check n8n workflow configuration
  console.log('🔍 Test 3: Workflow Configuration Check');
  console.log(`   - n8n URL: ${N8N_WEBHOOK_URL}`);
  console.log(`   - Supabase URL: ${SUPABASE_URL}`);
  console.log(`   - Webhook Path: fda-research-agent`);
  
  console.log('\n📝 Next Steps:');
  console.log('1. Check n8n workflow execution history at:');
  console.log('   https://workflows.innovareai.com/workflow/JNhVU38JFlwdRuKv/executions');
  console.log('2. Verify Supabase trigger is using correct webhook URL');
  console.log('3. Check n8n credentials for Perplexity and Claude APIs');
}

// Run the test
testN8nWebhook().catch(console.error);