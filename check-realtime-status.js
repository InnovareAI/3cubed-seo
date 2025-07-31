#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking Real-Time Status for Your Supabase Project');
console.log('=====================================================\n');

// Display connection info
console.log('📡 Project Details:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Step 1: Test basic connection
console.log('1️⃣ Testing Database Connection...');
try {
  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  console.log(`✅ Connected! Found ${count} submissions in database\n`);
} catch (err) {
  console.error('❌ Connection error:', err);
  process.exit(1);
}

// Step 2: Test real-time subscription
console.log('2️⃣ Testing Real-Time Subscription...');
console.log('   Creating subscription to submissions table...');

let realtimeWorking = false;
let subscriptionStatus = 'PENDING';

const channel = supabase
  .channel('realtime-test-' + Date.now())
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'submissions'
    },
    (payload) => {
      realtimeWorking = true;
      console.log('\n🎉 REAL-TIME IS WORKING!');
      console.log('   Received event:', payload.eventType);
      console.log('   Table:', payload.table);
      console.log('   Real-time subscription is properly configured!\n');
    }
  )
  .subscribe((status) => {
    subscriptionStatus = status;
    console.log(`   Subscription status: ${status}`);
    
    if (status === 'SUBSCRIBED') {
      console.log('   ✅ Successfully subscribed to real-time changes\n');
    } else if (status === 'CHANNEL_ERROR') {
      console.log('   ❌ Channel error - real-time may not be enabled\n');
    } else if (status === 'TIMED_OUT') {
      console.log('   ⏱️ Subscription timed out\n');
    }
  });

// Wait for subscription
await new Promise(resolve => setTimeout(resolve, 3000));

// Step 3: Test with actual database change
console.log('3️⃣ Testing with Database Update...');
try {
  // Find a record to test with
  const { data: testRecord } = await supabase
    .from('submissions')
    .select('id, product_name, seo_internal_notes')
    .limit(1)
    .single();
  
  if (testRecord) {
    console.log(`   Found test record: ${testRecord.product_name} (${testRecord.id})`);
    
    // Make a small update
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        seo_internal_notes: `Real-time test at ${timestamp}` 
      })
      .eq('id', testRecord.id);
    
    if (updateError) {
      console.log('   ❌ Update failed:', updateError.message);
    } else {
      console.log('   ✅ Updated record');
      console.log('   ⏳ Waiting 3 seconds for real-time event...');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
} catch (err) {
  console.log('   ⚠️  Could not test with update:', err.message);
}

// Step 4: Check WebSocket connection
console.log('\n4️⃣ WebSocket Connection Details:');
const wsUrl = supabaseUrl.replace('https://', 'wss://') + '/realtime/v1/websocket';
console.log(`   WebSocket URL: ${wsUrl}`);
console.log(`   Expected port: 443 (standard HTTPS/WSS)`);

// Step 5: Summary and recommendations
console.log('\n📊 REAL-TIME STATUS SUMMARY:');
console.log('=============================');

if (realtimeWorking) {
  console.log('✅ Real-time is WORKING PERFECTLY!');
  console.log('   - WebSocket connection established');
  console.log('   - Database changes trigger instant updates');
  console.log('   - Your dashboard will update in real-time');
} else if (subscriptionStatus === 'SUBSCRIBED') {
  console.log('⚠️  Real-time subscription created but no events received');
  console.log('   Possible reasons:');
  console.log('   - Replication might not be enabled for submissions table');
  console.log('   - RLS policies might be blocking real-time events');
  console.log('   - Network might be blocking WebSocket frames');
} else {
  console.log('❌ Real-time is NOT working');
  console.log('   Status:', subscriptionStatus);
}

console.log('\n🔧 TO ENABLE REAL-TIME:');
console.log('========================');
console.log('1. Go to Supabase Dashboard: https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Navigate to: Database → Replication');
console.log('4. Find "submissions" table');
console.log('5. Toggle "Realtime" to ON');
console.log('6. Click "Apply" button');
console.log('\n✅ That\'s it! Real-time will work immediately after enabling.');

console.log('\n💡 CURRENT FUNCTIONALITY:');
console.log('=========================');
console.log('Even without real-time, your dashboard has:');
console.log('✅ Auto-save after 2 seconds of typing');
console.log('✅ Manual save button');
console.log('✅ 30-second auto-refresh (if real-time is off)');
console.log('✅ Conflict detection');
console.log('✅ Optimistic updates');

// Cleanup
supabase.removeChannel(channel);

console.log('\n🏁 Test complete!\n');

// Exit with status code
process.exit(realtimeWorking ? 0 : 1);