#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Testing Real-Time Sync for 3Cubed SEO Dashboard');
console.log('============================================\n');

// Test 1: Subscribe to submissions changes
console.log('📡 Setting up real-time subscription to submissions table...');

const channel = supabase
  .channel('test-submissions-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'submissions'
    },
    (payload) => {
      console.log('\n🔔 Real-time update received!');
      console.log('Event:', payload.eventType);
      console.log('Table:', payload.table);
      
      if (payload.eventType === 'INSERT') {
        console.log('✅ New submission created:', payload.new.id);
        console.log('Product:', payload.new.product_name);
        console.log('Stage:', payload.new.workflow_stage);
      } else if (payload.eventType === 'UPDATE') {
        console.log('✅ Submission updated:', payload.new.id);
        console.log('Product:', payload.new.product_name);
        console.log('Workflow Stage:', payload.old.workflow_stage, '→', payload.new.workflow_stage);
        console.log('AI Status:', payload.old.ai_processing_status, '→', payload.new.ai_processing_status);
        
        // Check if AI processing completed
        if (payload.new.seo_title && !payload.old.seo_title) {
          console.log('🎉 AI Processing Complete!');
          console.log('SEO Title:', payload.new.seo_title);
          console.log('GEO Tags:', payload.new.geo_event_tags?.join(', '));
        }
      }
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });

console.log('\n✅ Real-time subscription active!');
console.log('The dashboard will automatically update when:');
console.log('  - New submissions are created');
console.log('  - AI processing completes');
console.log('  - Workflow stages change');
console.log('  - Any submission data is updated');

// Test 2: Fetch current submissions
console.log('\n📊 Current submissions in dashboard:');
const { data: submissions, error } = await supabase
  .from('submissions')
  .select('id, product_name, workflow_stage, ai_processing_status, created_at')
  .order('created_at', { ascending: false })
  .limit(5);

if (error) {
  console.error('❌ Error fetching submissions:', error);
} else {
  submissions.forEach((sub, index) => {
    console.log(`\n${index + 1}. ${sub.product_name}`);
    console.log(`   ID: ${sub.id}`);
    console.log(`   Stage: ${sub.workflow_stage}`);
    console.log(`   AI Status: ${sub.ai_processing_status}`);
    console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
  });
}

// Keep the script running
console.log('\n\n👀 Monitoring for real-time updates... (Press Ctrl+C to exit)');
console.log('Try submitting a new form or wait for AI processing to complete!\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing real-time connection...');
  supabase.removeChannel(channel);
  process.exit(0);
});