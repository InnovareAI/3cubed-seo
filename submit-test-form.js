#!/usr/bin/env node

// This script simulates the exact form submission process from SubmissionForm.tsx
import { createClient } from '@supabase/supabase-js'

// Use the same credentials from .env.local
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MzU2NDIsImV4cCI6MjA0NTExMTY0Mn0.lBCTlkcrxHxFqR2BCnjutXH3WNhT8lKFGBt7LKJV7_E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test form data that matches what a user would submit
const testFormData = {
  // Section 1: Product Information (Required)
  product_name: 'Test Product for Database Check',
  generic_name: 'test-generic-name',
  indication: 'Test indication for database verification',
  therapeutic_area: 'Oncology',
  
  // Section 2: Clinical Context (Optional) 
  nct_number: 'NCT12345678',
  sponsor: 'Test Sponsor Company',
  development_stage: 'Phase III',
  line_of_therapy: 'First-line',
  patient_population: ['Adults (18+)', 'Treatment-naive'],
  
  // Section 3: Advanced Optimization (Optional)
  route_of_administration: 'Oral',
  combination_partners: ['Chemotherapy'],
  primary_endpoints: ['Overall Survival'],
  geographic_markets: ['United States'],
  key_biomarkers: ['PD-L1'],
  target_age_groups: ['50-64 years'],
  
  // Section 4: Team & Review Assignment (Required)
  seo_reviewer_name: 'Test Database Checker',
  seo_reviewer_email: 'test.database@example.com',
  client_reviewer_name: 'Test Client Reviewer',
  client_reviewer_email: 'client.test@example.com',
  mlr_reviewer_name: 'Test MLR Reviewer',
  mlr_reviewer_email: 'mlr.test@example.com'
}

async function submitTestForm() {
  console.log('🧪 Submitting test form data to verify database connection...\n')
  
  try {
    // Build submission data exactly like SubmissionForm.tsx does
    let submissionData = {
      // Mandatory fields (always included)
      product_name: testFormData.product_name,
      generic_name: testFormData.generic_name,
      indication: testFormData.indication,
      therapeutic_area: testFormData.therapeutic_area,
      submitter_name: testFormData.seo_reviewer_name,
      submitter_email: testFormData.seo_reviewer_email,
      
      // Only the absolutely essential fields
      priority_level: 'medium',  // lowercase - check constraint might require this
      workflow_stage: 'draft'
    };

    // Optional fields - only include if they have values
    const optionalFields = {
      nct_number: testFormData.nct_number,
      sponsor: testFormData.sponsor,
      development_stage: testFormData.development_stage,
      line_of_therapy: testFormData.line_of_therapy,
      route_of_administration: testFormData.route_of_administration,
      seo_reviewer_name: testFormData.seo_reviewer_name,
      seo_reviewer_email: testFormData.seo_reviewer_email,
      client_reviewer_name: testFormData.client_reviewer_name,
      client_reviewer_email: testFormData.client_reviewer_email,
      mlr_reviewer_name: testFormData.mlr_reviewer_name,
      mlr_reviewer_email: testFormData.mlr_reviewer_email
    };

    // Optional arrays - only include if they have items
    const optionalArrays = {
      patient_population: testFormData.patient_population,
      combination_partners: testFormData.combination_partners,
      primary_endpoints: testFormData.primary_endpoints,
      geographic_markets: testFormData.geographic_markets,
      key_biomarkers: testFormData.key_biomarkers,
      target_age_groups: testFormData.target_age_groups
    };

    // Add optional fields that have values
    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value && value.trim()) {
        submissionData[key] = value;
      }
    });

    // Add optional arrays that have items
    Object.entries(optionalArrays).forEach(([key, value]) => {
      if (value && value.length > 0) {
        submissionData[key] = value;
      }
    });

    console.log('📋 Submission data to be sent:');
    console.log(JSON.stringify(submissionData, null, 2));
    console.log('\n🚀 Attempting to insert into Supabase...\n');

    // Submit exactly like the form does
    const { data: insertedData, error: supabaseError } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select();

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError);
      console.error('Full error details:', {
        message: supabaseError.message,
        details: supabaseError.details,
        hint: supabaseError.hint,
        code: supabaseError.code
      });
      return false;
    }

    console.log('✅ Success! Test submission created:');
    console.log('Inserted data:', JSON.stringify(insertedData, null, 2));
    
    if (insertedData && insertedData.length > 0) {
      const submission = insertedData[0];
      console.log(`\n🎯 New submission details:`);
      console.log(`   ID: ${submission.id}`);
      console.log(`   Product: ${submission.product_name}`);
      console.log(`   Submitter: ${submission.submitter_name}`);
      console.log(`   Created: ${new Date(submission.created_at).toLocaleString()}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('🔥 Unexpected error:', error);
    return false;
  }
}

async function queryTestSubmissions() {
  console.log('\n📊 Querying for test submissions...\n');
  
  try {
    // Look for our test submissions
    const { data: testSubmissions, error } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, submitter_email, created_at, workflow_stage, priority_level')
      .or('product_name.ilike.%test%,submitter_name.ilike.%test%,submitter_email.ilike.%test%')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Found ${testSubmissions.length} test submissions:`);
    if (testSubmissions.length > 0) {
      testSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. "${submission.product_name}" by ${submission.submitter_name} (${new Date(submission.created_at).toLocaleString()})`);
      });
    } else {
      console.log('   No test submissions found with "test" in product name, submitter name, or email.');
    }
    
  } catch (error) {
    console.error('🔥 Query error:', error);
  }
}

// Run the test
async function runTest() {
  console.log('🔍 Testing form submission to Supabase database\n');
  console.log('=' .repeat(60));
  
  const success = await submitTestForm();
  
  if (success) {
    console.log('\n' + '=' .repeat(60));
    await queryTestSubmissions();
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Test completed!');
}

runTest()