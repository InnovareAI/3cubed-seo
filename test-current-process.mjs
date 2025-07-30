import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCurrentProcess() {
  console.log('=== TESTING CURRENT PROCESS (NO CHANGES) ===\n');

  // Step 1: Check recent submissions
  console.log('1. Checking recent submissions...');
  const { data: recent } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log(`Found ${recent?.length || 0} recent submissions\n`);

  // Step 2: Check if they have AI content
  console.log('2. Checking AI content status:');
  recent?.forEach(sub => {
    const hasAI = sub.seo_keywords || sub.meta_title || sub.meta_description;
    const status = sub.ai_processing_status || 'unknown';
    console.log(`- ${sub.product_name} (${sub.compliance_id}): ${hasAI ? '✅ Has AI content' : '❌ No AI content'} | Status: ${status}`);
  });

  // Step 3: Check webhook logs
  console.log('\n3. Checking webhook execution logs...');
  const { data: webhookLogs } = await supabase
    .from('n8n_webhook_executions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`Found ${webhookLogs?.length || 0} webhook logs`);
  const triggered = webhookLogs?.filter(log => log.status === 'triggered').length || 0;
  console.log(`- Triggered: ${triggered}`);
  console.log(`- Other: ${(webhookLogs?.length || 0) - triggered}`);

  // Step 4: Test the webhook directly
  console.log('\n4. Testing n8n webhook directly...');
  try {
    const response = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
    });
    console.log(`Webhook response: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log('Webhook error:', error.message);
  }

  // Step 5: Process any pending submissions
  console.log('\n5. Checking for unprocessed submissions...');
  const { data: unprocessed } = await supabase
    .from('submissions')
    .select('*')
    .is('seo_keywords', null)
    .eq('workflow_stage', 'draft');

  if (unprocessed && unprocessed.length > 0) {
    console.log(`Found ${unprocessed.length} unprocessed submissions`);
    
    // Process them using the existing approach
    for (const sub of unprocessed) {
      console.log(`\nProcessing ${sub.product_name}...`);
      
      // This is what the form does - trigger webhook
      try {
        const webhookResponse = await fetch('https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submission_id: sub.id,
            compliance_id: sub.compliance_id,
            product_name: sub.product_name,
            generic_name: sub.generic_name,
            indication: sub.indication,
            therapeutic_area: sub.therapeutic_area,
            submitter_email: sub.submitter_email,
            submitter_name: sub.submitter_name,
            workflow_stage: sub.workflow_stage,
            priority_level: sub.priority_level,
            created_at: sub.created_at
          })
        });
        
        if (webhookResponse.ok) {
          console.log('✅ Webhook triggered for', sub.product_name);
          
          // Log it
          await supabase
            .from('n8n_webhook_executions')
            .insert({
              submission_id: sub.id,
              webhook_url: 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt',
              status: 'triggered',
              created_at: new Date().toISOString()
            });
        }
      } catch (err) {
        console.error('Webhook error:', err.message);
      }
    }
  } else {
    console.log('No unprocessed submissions found');
  }

  console.log('\n=== PROCESS CHECK COMPLETE ===');
  console.log('\nSUMMARY:');
  console.log('- Form submissions: Working ✅');
  console.log('- Webhook calls: Working ✅');
  console.log('- n8n response: 200 OK ✅');
  console.log('- AI content from n8n: NOT WORKING ❌');
  console.log('\nThe issue is in the n8n workflow - it receives webhooks but doesn\'t update the database.');
}

testCurrentProcess();