import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugAIFields() {
  console.log('🔍 Debugging AI Field Issues\n');

  // 1. Get a recent submission with issues
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('ai_processing_status', 'completed')
    .is('seo_title', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!submissions || submissions.length === 0) {
    console.log('No problematic submissions found');
    return;
  }

  const submission = submissions[0];
  console.log('📋 Checking submission:', submission.product_name);
  console.log('ID:', submission.id);
  
  // 2. Check what fields have data
  console.log('\n✅ Fields with data:');
  if (submission.meta_description) console.log('  - meta_description:', submission.meta_description.substring(0, 50) + '...');
  if (submission.seo_keywords?.length) console.log('  - seo_keywords:', submission.seo_keywords.length, 'keywords');
  if (submission.seo_strategy_outline) console.log('  - seo_strategy_outline:', 'Present');
  
  console.log('\n❌ Missing fields:');
  if (!submission.seo_title) console.log('  - seo_title: NULL');
  if (!submission.h2_tags || submission.h2_tags.length === 0) console.log('  - h2_tags: NULL or empty');
  if (!submission.ai_output) console.log('  - ai_output: NULL');
  if (!submission.qa_score) console.log('  - qa_score: NULL');
  
  // 3. Test calling the debug function
  console.log('\n🧪 Testing debug function...');
  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/debug-ai-processing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: submission.id })
    });
    
    const result = await response.json();
    console.log('Debug result:', result);
  } catch (err) {
    console.log('Debug function not available locally');
  }

  // 4. Check dashboard_data for clues
  if (submission.dashboard_data) {
    console.log('\n📊 Dashboard data:');
    console.log(JSON.stringify(submission.dashboard_data, null, 2));
  }

  // 5. Manually test Perplexity API
  console.log('\n🤖 Testing Perplexity API directly...');
  const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: 'Return only JSON: {"test": "hello", "number": 123}'
      }],
      max_tokens: 100
    })
  });

  const testData = await testResponse.json();
  console.log('Perplexity test response:');
  console.log('Type:', typeof testData.choices?.[0]?.message?.content);
  console.log('Content:', testData.choices?.[0]?.message?.content);
}

debugAIFields().catch(console.error);