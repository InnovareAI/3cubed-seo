import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use service key if available, otherwise anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using key type:', process.env.SUPABASE_SERVICE_KEY ? 'service' : 'anon');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('\n🧪 Testing Supabase Update\n');

  // First, try to get any submission
  const { data: submissions, error: fetchError } = await supabase
    .from('submissions')
    .select('id, product_name, workflow_stage, ai_processing_status')
    .limit(1);

  if (fetchError) {
    console.error('❌ Failed to fetch submissions:', fetchError);
    
    // Try with a direct REST API call
    console.log('\n🔄 Trying direct REST API...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/submissions?limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      const data = await response.json();
      console.log('REST API Response:', data);
    } catch (e) {
      console.error('REST API Error:', e);
    }
    return;
  }

  if (!submissions || submissions.length === 0) {
    console.log('No submissions found in database');
    return;
  }

  const submission = submissions[0];
  console.log('✅ Found submission:', submission);

  // Test updating with minimal data
  console.log('\n📝 Testing minimal update...');
  const { error: minimalError } = await supabase
    .from('submissions')
    .update({
      last_updated: new Date().toISOString()
    })
    .eq('id', submission.id);

  if (minimalError) {
    console.error('❌ Minimal update failed:', minimalError);
  } else {
    console.log('✅ Minimal update succeeded');
  }

  // Test updating SEO fields
  console.log('\n📝 Testing SEO fields update...');
  const testContent = {
    seo_title: 'Test SEO Title',
    meta_description: 'Test meta description for pharmaceutical product',
    seo_keywords: ['test', 'keyword', 'pharma'],
    h2_tags: ['Test Heading 1', 'Test Heading 2'],
    seo_strategy_outline: 'Test SEO strategy',
    ai_output: {
      seo_title: 'Test SEO Title',
      meta_description: 'Test meta description',
      seo_keywords: ['test', 'keyword'],
      h2_tags: ['Heading 1', 'Heading 2'],
      seo_strategy: 'Test strategy'
    }
  };

  const { error: seoError, data: seoData } = await supabase
    .from('submissions')
    .update(testContent)
    .eq('id', submission.id)
    .select();

  if (seoError) {
    console.error('❌ SEO update failed:', seoError);
    console.error('Error details:', {
      message: seoError.message,
      hint: seoError.hint,
      details: seoError.details,
      code: seoError.code
    });
  } else {
    console.log('✅ SEO update succeeded');
    console.log('Updated data:', seoData);
  }

  // Check table schema
  console.log('\n🔍 Checking table columns...');
  const { data: columns, error: schemaError } = await supabase
    .rpc('get_table_columns', { table_name: 'submissions' })
    .catch(() => null);

  if (columns) {
    console.log('Table columns:', columns);
  } else {
    // Try alternative method
    console.log('Trying alternative schema check...');
    const { data: sampleRow } = await supabase
      .from('submissions')
      .select('*')
      .limit(1);
    
    if (sampleRow && sampleRow[0]) {
      console.log('Available columns:', Object.keys(sampleRow[0]));
    }
  }
}

testUpdate().catch(console.error);