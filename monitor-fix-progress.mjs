import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function monitorFixProgress() {
  console.log('=== MONITORING N8N FIX PROGRESS ===\n');
  console.log('Looking for recent test submissions...\n');

  // Get recent test submissions
  const { data: recent } = await supabase
    .from('submissions')
    .select('*')
    .or('compliance_id.like.%TEST%,compliance_id.like.%DEBUG%,product_name.eq.Ozempic')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recent || recent.length === 0) {
    console.log('No test submissions found');
    return;
  }

  console.log(`Monitoring ${recent.length} test submissions:\n`);

  // Check each submission
  for (const submission of recent) {
    console.log(`\n📋 ${submission.product_name} (${submission.compliance_id})`);
    console.log(`   Created: ${new Date(submission.created_at).toLocaleTimeString()}`);
    
    // Check AI processing status
    const checks = {
      '1️⃣ Webhook Triggered': submission.workflow_stage !== 'draft' || submission.ai_processing_status === 'pending',
      '2️⃣ Perplexity Generated Content': !!submission.seo_keywords || !!submission.meta_title,
      '3️⃣ Claude QA Review': !!submission.qa_status || !!submission.qa_score,
      '4️⃣ Database Updated': submission.ai_processing_status === 'completed',
      '5️⃣ Ready for Dashboard': submission.workflow_stage === 'seo_review'
    };

    Object.entries(checks).forEach(([step, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${step}`);
    });

    if (submission.seo_keywords) {
      console.log(`\n   🔍 Generated Keywords: ${submission.seo_keywords.slice(0, 3).join(', ')}...`);
    }
    if (submission.meta_title) {
      console.log(`   📝 Generated Title: ${submission.meta_title}`);
    }
    if (submission.qa_score) {
      console.log(`   ✓ QA Score: ${submission.qa_score}/100`);
    }
  }

  // Check webhook logs
  console.log('\n\n📊 Recent Webhook Activity:');
  const { data: webhookLogs } = await supabase
    .from('n8n_webhook_executions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  webhookLogs?.forEach(log => {
    const time = new Date(log.created_at).toLocaleTimeString();
    console.log(`   ${time} - Status: ${log.status}`);
  });

  console.log('\n\n💡 Quick Test Command:');
  console.log('To test if the fix is working, run:');
  console.log('node test-ai-pipeline.mjs');
}

// Run once immediately
monitorFixProgress();

// Then monitor every 10 seconds
console.log('\n🔄 Monitoring every 10 seconds... (Ctrl+C to stop)\n');
setInterval(monitorFixProgress, 10000);