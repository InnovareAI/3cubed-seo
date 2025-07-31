import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function cleanDefaults() {
  console.log('🧹 Cleaning default values from database...\n');

  // Update all records with default values
  const { error: clientError } = await supabase
    .from('submissions')
    .update({ client_name: null })
    .eq('client_name', 'Pharma Corp');

  if (clientError) {
    console.error('Error updating client names:', clientError);
  } else {
    console.log('✅ Removed "Pharma Corp" defaults');
  }

  // Update target_audience
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, target_audience');

  let updated = 0;
  for (const sub of submissions || []) {
    if (sub.target_audience?.length === 1 && sub.target_audience[0] === 'Healthcare Professionals') {
      await supabase
        .from('submissions')
        .update({ target_audience: [] })
        .eq('id', sub.id);
      updated++;
    }
  }
  
  console.log(`✅ Cleared ${updated} "Healthcare Professionals" defaults`);

  // Update keywords that are exactly 10
  const { data: keywordSubs } = await supabase
    .from('submissions')
    .select('id, seo_keywords')
    .not('seo_keywords', 'is', null);

  let keywordsUpdated = 0;
  for (const sub of keywordSubs || []) {
    if (sub.seo_keywords?.length === 10) {
      // Keep only first 3 keywords as they're likely the real ones
      await supabase
        .from('submissions')
        .update({ seo_keywords: sub.seo_keywords.slice(0, 3) })
        .eq('id', sub.id);
      keywordsUpdated++;
    }
  }
  
  console.log(`✅ Fixed ${keywordsUpdated} submissions with default 10 keywords`);
  
  console.log('\n🎉 Database cleaned!');
}

cleanDefaults().catch(console.error);