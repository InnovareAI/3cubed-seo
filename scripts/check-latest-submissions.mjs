import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data } = await supabase
  .from('submissions')
  .select('id, product_name, workflow_stage, seo_title, seo_keywords, created_at')
  .order('created_at', { ascending: false })
  .limit(5);

console.log('Latest 5 submissions:');
data.forEach((s, i) => {
  console.log(`${i+1}. ${s.product_name}`);
  console.log(`   ID: ${s.id}`);
  console.log(`   Stage: ${s.workflow_stage}`);
  console.log(`   SEO Title: ${s.seo_title || 'NONE'}`);
  console.log(`   Keywords: ${s.seo_keywords?.length || 0}`);
  console.log('');
});