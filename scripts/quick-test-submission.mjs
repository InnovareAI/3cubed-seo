import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createQuickTest() {
  console.log('🚀 Creating Quick Test Submission\n');

  const testData = {
    product_name: `QuickTest-${Date.now()}`,
    generic_name: "testabumab",
    indication: "Test Indication",
    therapeutic_area: "Oncology",
    development_stage: "Phase III",
    nct_number: "NCT03456789",
    sponsor: "Quick Test Pharma",
    submitter_name: "Quick Test",
    submitter_email: "quicktest@example.com",
    workflow_stage: "draft",
    ai_processing_status: "pending",
    priority_level: "High",
    compliance_id: `QUICK-${Date.now()}`
  };

  // Insert submission
  const { data, error } = await supabase
    .from('submissions')
    .insert([testData])
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Submission created!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Product: ${data.product_name}`);
  
  // Trigger processing
  console.log('\n🔄 Triggering AI processing...');
  
  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/process-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: data.id })
    });

    const result = await response.json();
    console.log('📡 Response:', result);
    
    if (response.ok) {
      console.log('\n✅ Processing started successfully!');
      console.log('⏳ Check dashboard for updates...');
      
      // Monitor status
      let attempts = 0;
      const checkStatus = setInterval(async () => {
        attempts++;
        const { data: updated } = await supabase
          .from('submissions')
          .select('workflow_stage, ai_processing_status, seo_title')
          .eq('id', data.id)
          .single();
        
        console.log(`\n[${attempts}] Status: ${updated.workflow_stage} - ${updated.ai_processing_status}`);
        
        if (updated.seo_title) {
          console.log(`    SEO Title: "${updated.seo_title}"`);
        }
        
        if (updated.workflow_stage === 'completed' || attempts > 10) {
          clearInterval(checkStatus);
          console.log('\n🎉 Processing complete!');
        }
      }, 3000);
      
    } else {
      console.error('❌ Processing failed:', result);
    }
  } catch (err) {
    console.error('❌ Error triggering processing:', err.message);
    console.log('\n💡 Make sure to run: netlify dev');
  }
}

createQuickTest().catch(console.error);