import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Import the processing function
import('./test-process-locally.mjs').then(async () => {
  console.log('🔄 Finding all stuck submissions...\n');

  // Get all stuck submissions
  const { data: stuckSubmissions } = await supabase
    .from('submissions')
    .select('id, product_name, workflow_stage')
    .eq('ai_processing_status', 'processing')
    .is('seo_title', null);

  if (!stuckSubmissions || stuckSubmissions.length === 0) {
    console.log('No stuck submissions found!');
    return;
  }

  console.log(`Found ${stuckSubmissions.length} stuck submissions:\n`);
  
  for (const submission of stuckSubmissions) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing: ${submission.product_name} (${submission.id})`);
    console.log(`${'='.repeat(50)}\n`);
    
    try {
      // Call the local processing function
      const { processLocalSubmission } = await import('./test-process-locally.mjs');
      await processLocalSubmission(submission.id);
    } catch (error) {
      console.error(`Failed to process ${submission.product_name}:`, error.message);
    }
    
    // Add a small delay between submissions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Finished processing all stuck submissions');
});