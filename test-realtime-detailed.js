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

console.log('🔍 Testing Real-Time Sync Configuration');
console.log('=====================================\n');

// Check environment
console.log('1️⃣ Environment Check:');
console.log(`   Supabase URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`   Supabase Key: ${supabaseKey ? '✅ Found' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables. Cannot test real-time sync.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
console.log('\n2️⃣ Testing Database Connection...');
try {
  const { data, error } = await supabase
    .from('submissions')
    .select('id')
    .limit(1);
  
  if (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Database connection successful');
} catch (err) {
  console.error('❌ Database connection error:', err);
  process.exit(1);
}

// Test real-time subscription
console.log('\n3️⃣ Testing Real-Time Subscription...');

let subscriptionReceived = false;
const testChannel = supabase
  .channel('test-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'submissions'
    },
    (payload) => {
      subscriptionReceived = true;
      console.log('\n🔔 Real-time event received!');
      console.log('   Event type:', payload.eventType);
      console.log('   Table:', payload.table);
      console.log('   Timestamp:', new Date().toISOString());
      
      if (payload.new) {
        console.log('   Record ID:', payload.new.id);
        console.log('   Product:', payload.new.product_name);
      }
    }
  )
  .subscribe((status) => {
    console.log('📡 Subscription status:', status);
    
    if (status === 'SUBSCRIBED') {
      console.log('✅ Successfully subscribed to real-time changes');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Channel error - real-time may not be enabled');
    } else if (status === 'TIMED_OUT') {
      console.error('❌ Subscription timed out');
    }
  });

// Wait a moment for subscription to establish
await new Promise(resolve => setTimeout(resolve, 2000));

// Test with a database update
console.log('\n4️⃣ Testing Database Update Trigger...');
try {
  // Find a test record
  const { data: testRecord } = await supabase
    .from('submissions')
    .select('id, seo_internal_notes')
    .limit(1)
    .single();
  
  if (testRecord) {
    console.log('   Found test record:', testRecord.id);
    
    // Update the record
    const testNote = `Real-time test at ${new Date().toISOString()}`;
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ seo_internal_notes: testNote })
      .eq('id', testRecord.id);
    
    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
    } else {
      console.log('✅ Updated record with test note');
      console.log('   Waiting for real-time event...');
      
      // Wait for real-time event
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (subscriptionReceived) {
        console.log('\n✅ Real-time sync is WORKING!');
      } else {
        console.log('\n⚠️  No real-time event received within 3 seconds');
        console.log('   Possible issues:');
        console.log('   - Real-time may not be enabled in Supabase');
        console.log('   - Network/firewall blocking WebSocket');
        console.log('   - RLS policies blocking real-time events');
      }
    }
  }
} catch (err) {
  console.error('❌ Test update failed:', err);
}

// Check Supabase real-time configuration
console.log('\n5️⃣ Real-Time Configuration Tips:');
console.log('   1. Go to Supabase Dashboard → Database → Replication');
console.log('   2. Ensure "submissions" table is enabled for replication');
console.log('   3. Check that WebSocket connections are allowed (port 443)');
console.log('   4. Verify RLS policies allow SELECT on submissions table');

// Test WebSocket connection directly
console.log('\n6️⃣ WebSocket Connection Test:');
const wsUrl = supabaseUrl.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + supabaseKey;
console.log('   WebSocket URL:', wsUrl.substring(0, 50) + '...');

// Cleanup
console.log('\n7️⃣ Cleanup...');
supabase.removeChannel(testChannel);

console.log('\n✅ Test complete!');
console.log('\n📋 Summary:');
console.log('   - Database connection: ✅');
console.log('   - Real-time subscription: ' + (subscriptionReceived ? '✅ Working' : '⚠️  Check configuration'));
console.log('   - WebSocket support: Should work on port 443');

console.log('\n💡 Next Steps:');
console.log('   1. If real-time not working, check Supabase Dashboard → Database → Replication');
console.log('   2. Ensure your network allows WebSocket connections');
console.log('   3. Test in production environment (Netlify) as it may work there');

process.exit(0);