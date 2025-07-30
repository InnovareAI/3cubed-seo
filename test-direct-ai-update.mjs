import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🚀 DIRECT AI → SUPABASE TEST (No n8n)\n');

async function testDirectFlow() {
  // 1. Get a test submission
  console.log('1️⃣ Finding test submission...');
  // First try to get any existing submission
  let { data: existingSubmissions, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  let submission = existingSubmissions && existingSubmissions.length > 0 ? existingSubmissions[0] : null;

  if (!submission) {
    console.log('❌ No submissions found. Creating one...');
    const { data: newSub, error: insertError } = await supabase
      .from('submissions')
      .insert({
        product_name: 'DirectTest Drug',
        generic_name: 'directamab',
        indication: 'Test Condition',
        therapeutic_area: 'Oncology',
        submitter_name: 'Test User',
        submitter_email: 'test@example.com',
        workflow_stage: 'draft',
        ai_processing_status: 'pending',
        priority_level: 'Medium',
        compliance_id: `TEST-${Date.now()}`
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return;
    }
    
    submission = newSub;
  }

  console.log(`✅ Using submission: ${submission.product_name} (${submission.id})\n`);

  // 2. Generate content with Perplexity (simulated for now)
  console.log('2️⃣ Generating AI content...');
  
  // In production, this would call Perplexity API
  // For now, let's simulate the response
  const aiContent = {
    seo_title: `${submission.product_name}: Advanced ${submission.indication} Treatment`,
    meta_description: `Discover ${submission.product_name} (${submission.generic_name}), a breakthrough therapy for ${submission.indication}. Learn about efficacy, safety, and patient outcomes.`,
    seo_keywords: [
      submission.product_name,
      submission.generic_name,
      `${submission.indication} treatment`,
      `${submission.therapeutic_area} therapy`,
      'FDA approved medication',
      'clinical trial results'
    ],
    h2_tags: [
      'Mechanism of Action',
      'Clinical Trial Data',
      'Safety Profile',
      'Dosing Information',
      'Patient Selection'
    ],
    geo_event_tags: [
      'medical conference',
      'FDA approval announcement',
      'clinical data release'
    ],
    ai_generated_content: `${submission.product_name} represents a significant advancement in the treatment of ${submission.indication}...`,
    seo_strategy_outline: 'Focus on clinical efficacy and safety data to build authority...'
  };

  console.log('✅ AI content generated\n');

  // 3. Run QA check (simulated Claude)
  console.log('3️⃣ Running QA review...');
  
  const qaResults = {
    qa_score: 88,
    compliance_score: 92,
    medical_accuracy: 90,
    seo_effectiveness: 85,
    recommendation: 'PASS',
    detailed_feedback: 'Content meets pharmaceutical marketing guidelines'
  };

  console.log('✅ QA review complete\n');

  // 4. Update Supabase
  console.log('4️⃣ Updating Supabase...');
  
  const { data: updated, error } = await supabase
    .from('submissions')
    .update({
      // AI content
      seo_title: aiContent.seo_title,
      meta_description: aiContent.meta_description,
      seo_keywords: aiContent.seo_keywords,
      h2_tags: aiContent.h2_tags,
      geo_event_tags: aiContent.geo_event_tags,
      ai_output: aiContent,
      seo_strategy_outline: aiContent.seo_strategy_outline,
      
      // QA results
      qa_score: qaResults.qa_score,
      compliance_score: qaResults.compliance_score,
      
      // Status updates
      workflow_stage: 'completed',
      ai_processing_status: 'completed',
      last_updated: new Date().toISOString(),
      
      // Dashboard data
      dashboard_data: {
        content_metrics: {
          word_count: 450,
          keyword_count: aiContent.seo_keywords.length,
          h2_count: aiContent.h2_tags.length
        },
        qa_assessment: qaResults,
        processing_timeline: {
          started: new Date().toISOString(),
          completed: new Date().toISOString()
        }
      }
    })
    .eq('id', submission.id)
    .select();

  if (error) {
    console.error('❌ Update failed:', error);
    return;
  }

  console.log('✅ Supabase updated successfully!\n');

  // 5. Verify the update
  console.log('5️⃣ Verifying update...');
  const { data: verified } = await supabase
    .from('submissions')
    .select('id, product_name, seo_title, workflow_stage, ai_processing_status')
    .eq('id', submission.id)
    .single();

  console.log('📊 Updated record:');
  console.log(JSON.stringify(verified, null, 2));

  console.log('\n✅ SUCCESS! Direct update works.');
  console.log('\n📱 Check your dashboard - it should show the updated content!');
  console.log(`Submission ID: ${submission.id}`);
}

// Test real-time subscription
async function testRealtimeUpdates(submissionId) {
  console.log('\n6️⃣ Testing real-time updates...');
  
  const channel = supabase
    .channel(`test-${submissionId}`)
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'submissions',
        filter: `id=eq.${submissionId}`
      }, 
      (payload) => {
        console.log('🔔 Real-time update received!');
        console.log('Updated fields:', Object.keys(payload.new));
      }
    )
    .subscribe();

  // Make a small update to trigger the subscription
  setTimeout(async () => {
    await supabase
      .from('submissions')
      .update({ last_viewed: new Date().toISOString() })
      .eq('id', submissionId);
  }, 2000);

  // Clean up after 5 seconds
  setTimeout(() => {
    channel.unsubscribe();
  }, 5000);
}

// Run the test
testDirectFlow().catch(console.error);