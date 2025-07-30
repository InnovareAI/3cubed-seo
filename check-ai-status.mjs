import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAIStatus() {
  console.log('📊 CHECKING AI PROCESSING STATUS\n');

  // Get recent submissions
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('compliance_id, product_name, workflow_stage, ai_processing_status, created_at, seo_keywords, meta_title')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Recent submissions:\n');
  
  for (const sub of submissions) {
    const hasAI = sub.seo_keywords || sub.meta_title;
    console.log(`${hasAI ? '✅' : '❌'} ${sub.compliance_id}`);
    console.log(`   Product: ${sub.product_name}`);
    console.log(`   Stage: ${sub.workflow_stage}`);
    console.log(`   AI Status: ${sub.ai_processing_status || 'not started'}`);
    console.log(`   AI Content: ${hasAI ? 'YES' : 'NO'}`);
    console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
    console.log('');
  }

  // Check if any have AI content
  const withAI = submissions.filter(s => s.seo_keywords || s.meta_title);
  
  if (withAI.length > 0) {
    console.log(`\n✅ Found ${withAI.length} submissions with AI content!`);
  } else {
    console.log('\n❌ No submissions have AI-generated content yet.');
    console.log('\nPossible issues:');
    console.log('1. n8n workflow nodes not connected properly');
    console.log('2. Perplexity API key not active');
    console.log('3. Claude API key not active');
    console.log('4. Database update node not configured');
  }
}

checkAIStatus();