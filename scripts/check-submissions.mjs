import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubmissions() {
  console.log('📊 Checking all submissions\n');

  // Get all submissions
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching submissions:', error);
    return;
  }

  if (!submissions || submissions.length === 0) {
    console.log('No submissions found');
    return;
  }

  console.log(`Found ${submissions.length} submissions:\n`);

  submissions.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.product_name} (ID: ${sub.id})`);
    console.log(`   Status: ${sub.ai_processing_status || 'pending'}`);
    console.log(`   Stage: ${sub.workflow_stage || 'unknown'}`);
    console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
    
    // Check AI fields
    console.log('   AI Fields:');
    console.log(`     - seo_title: ${sub.seo_title ? '✅' : '❌ NULL'}`);
    console.log(`     - ai_output: ${sub.ai_output ? '✅' : '❌ NULL'}`);
    console.log(`     - meta_description: ${sub.meta_description ? '✅' : '❌ NULL'}`);
    console.log(`     - seo_keywords: ${sub.seo_keywords?.length ? `✅ (${sub.seo_keywords.length} keywords)` : '❌ NULL/empty'}`);
    console.log(`     - h2_tags: ${sub.h2_tags?.length ? `✅ (${sub.h2_tags.length} tags)` : '❌ NULL/empty'}`);
    console.log(`     - qa_score: ${sub.qa_score !== null ? `✅ (${sub.qa_score})` : '❌ NULL'}`);
    console.log('');
  });
}

checkSubmissions().catch(console.error);