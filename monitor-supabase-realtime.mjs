#!/usr/bin/env node

/**
 * Real-time Supabase Monitor
 * Watches for new submissions as they arrive
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Monitoring Supabase for new submissions...');
console.log('📡 Real-time listener active');
console.log('🚀 Submit your form now at: https://3cubed-seo.netlify.app/seo-requests');
console.log('=' .repeat(60));

// Get current timestamp to track new submissions
const startTime = new Date().toISOString();
console.log(`⏰ Monitoring started at: ${startTime}\n`);

// Real-time subscription
const subscription = supabase
  .channel('submissions')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'submissions' 
    }, 
    (payload) => {
      const record = payload.new;
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`🆕 NEW SUBMISSION DETECTED! [${timestamp}]`);
      console.log('─'.repeat(50));
      console.log(`📋 ID: ${record.id}`);
      console.log(`💊 Generic Name: ${record.generic_name}`);
      console.log(`🏷️  Product Name: ${record.product_name || 'Not provided'}`);
      console.log(`🎯 Indication: ${record.indication}`);
      console.log(`🏥 Therapeutic Area: ${record.therapeutic_area}`);
      console.log(`👤 Submitter: ${record.submitter_name} (${record.submitter_email})`);
      console.log(`📊 Status: ${record.workflow_stage} | ${record.ai_processing_status || 'Not set'}`);
      console.log(`⏰ Created: ${record.created_at}`);
      console.log('─'.repeat(50));
      
      // Check if this looks like it should trigger N8N
      if (record.workflow_stage === 'draft') {
        console.log('✅ Record ready for N8N trigger (workflow_stage = draft)');
      } else {
        console.log(`⚠️  Unexpected workflow_stage: ${record.workflow_stage}`);
      }
      
      console.log('\n⏳ Watching for trigger updates...\n');
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Successfully subscribed to real-time updates');
      console.log('💡 Tip: Submit a form now and watch this console!\n');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Subscription error:', status);
    }
  });

// Also poll for recent submissions every 5 seconds as backup
let pollCount = 0;
const pollInterval = setInterval(async () => {
  pollCount++;
  
  try {
    const { data: recentSubmissions, error } = await supabase
      .from('submissions')
      .select('id, generic_name, product_name, workflow_stage, ai_processing_status, created_at')
      .gte('created_at', startTime)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Polling error:', error.message);
      return;
    }
    
    if (pollCount % 12 === 0) { // Every minute
      console.log(`🔄 Poll check #${pollCount} - ${recentSubmissions.length} submissions since start`);
      
      if (recentSubmissions.length > 0) {
        console.log('Recent submissions:');
        recentSubmissions.forEach((sub, index) => {
          console.log(`   ${index + 1}. ${sub.generic_name} - ${sub.workflow_stage} (${sub.created_at})`);
        });
        console.log('');
      }
    }
    
  } catch (err) {
    console.error('Polling error:', err.message);
  }
}, 5000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping monitor...');
  clearInterval(pollInterval);
  supabase.removeAllChannels();
  process.exit(0);
});

console.log('🎯 Ready! Submit your form now and watch for real-time updates...');