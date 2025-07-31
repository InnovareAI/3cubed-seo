import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkStatus() {
  console.log('📊 Checking completion status...\n');

  // Get counts
  const { count: totalCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  const { count: completedCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('ai_processing_status', 'completed');

  const { count: withSeoTitle } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .not('seo_title', 'is', null);

  const { count: stuckCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('ai_processing_status', 'processing')
    .is('seo_title', null);

  console.log('Summary:');
  console.log(`- Total submissions: ${totalCount}`);
  console.log(`- Completed (status): ${completedCount}`);
  console.log(`- With SEO title: ${withSeoTitle}`);
  console.log(`- Still stuck: ${stuckCount}`);

  // Show some examples
  console.log('\n✅ Successfully processed (latest 5):');
  const { data: successful } = await supabase
    .from('submissions')
    .select('product_name, seo_title, updated_at')
    .not('seo_title', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(5);

  successful?.forEach(sub => {
    console.log(`- ${sub.product_name}: "${sub.seo_title?.substring(0, 50)}..."`);
  });

  if (stuckCount > 0) {
    console.log('\n❌ Still stuck (first 5):');
    const { data: stuck } = await supabase
      .from('submissions')
      .select('id, product_name, created_at')
      .eq('ai_processing_status', 'processing')
      .is('seo_title', null)
      .limit(5);

    stuck?.forEach(sub => {
      console.log(`- ${sub.product_name} (${sub.id})`);
    });
  }
}

checkStatus();