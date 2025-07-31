import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Get a submission that shows "Keytruda" with "10 keywords"
const { data } = await supabase
  .from('submissions')
  .select('*')
  .eq('product_name', 'Keytruda')
  .order('created_at', { ascending: false })
  .limit(1);

if (data && data[0]) {
  const sub = data[0];
  console.log('Submission:', sub.product_name);
  console.log('ID:', sub.id);
  console.log('SEO Title:', sub.seo_title);
  console.log('Keywords:', sub.seo_keywords);
  console.log('Client Name field exists?', 'client_name' in sub);
  console.log('Target Audience field exists?', 'target_audience' in sub);
}