import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function monitorAIProcessing() {
  console.log('👀 MONITORING AI PROCESSING IN REAL-TIME\n');
  console.log('Watching for changes in the database...\n');
  
  let lastCheck = new Date();
  let processedCount = 0;
  
  setInterval(async () => {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('compliance_id, product_name, workflow_stage, ai_processing_status, seo_keywords, meta_title, updated_at')
      .gte('updated_at', lastCheck.toISOString())
      .order('updated_at', { ascending: false });
    
    if (!error && submissions && submissions.length > 0) {
      for (const sub of submissions) {
        const hasAI = sub.seo_keywords || sub.meta_title;
        
        if (hasAI) {
          processedCount++;
          console.log(`\n🎉 AI CONTENT DETECTED! (#${processedCount})`);
          console.log(`✅ ${sub.compliance_id} - ${sub.product_name}`);
          console.log(`   Stage: ${sub.workflow_stage}`);
          console.log(`   AI Status: ${sub.ai_processing_status}`);
          console.log(`   Keywords: ${sub.seo_keywords ? '✓' : '✗'}`);
          console.log(`   Title: ${sub.meta_title ? '✓' : '✗'}`);
          console.log(`   Time: ${new Date().toLocaleTimeString()}`);
          console.log('   ---');
        } else if (sub.workflow_stage !== 'draft') {
          console.log(`\n📝 Status Update: ${sub.compliance_id}`);
          console.log(`   Stage: draft → ${sub.workflow_stage}`);
          console.log(`   Time: ${new Date().toLocaleTimeString()}`);
        }
      }
      
      lastCheck = new Date();
    }
  }, 2000);
  
  console.log('Press Ctrl+C to stop monitoring\n');
  
  // Show initial status
  const { data: recent } = await supabase
    .from('submissions')
    .select('compliance_id, product_name, workflow_stage')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (recent) {
    console.log('Recent submissions:');
    recent.forEach(s => {
      console.log(`- ${s.compliance_id} (${s.product_name}) - ${s.workflow_stage}`);
    });
    console.log('\nWaiting for AI processing...\n');
  }
}

monitorAIProcessing();