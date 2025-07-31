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

console.log('Testing Supabase Connection...\n');

console.log('Environment Check:');
console.log('- URL:', supabaseUrl);
console.log('- Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Try different approaches
  console.log('\n1. Testing basic select...');
  const { data: data1, error: error1 } = await supabase
    .from('submissions')
    .select('id')
    .limit(1);
    
  if (error1) {
    console.log('❌ Basic select failed:', error1.message);
    console.log('   Error code:', error1.code);
    console.log('   Error hint:', error1.hint);
    console.log('   Error details:', error1.details);
  } else {
    console.log('✅ Basic select worked!');
    console.log('   Found records:', data1?.length || 0);
  }
  
  // Try count
  console.log('\n2. Testing count...');
  const { count, error: error2 } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });
    
  if (error2) {
    console.log('❌ Count failed:', error2.message);
  } else {
    console.log('✅ Count worked!');
    console.log('   Total records:', count);
  }
  
  // Test RLS
  console.log('\n3. Checking RLS policies...');
  const { data: rls, error: rlsError } = await supabase
    .rpc('check_rls_policies', { table_name: 'submissions' })
    .single();
    
  if (rlsError) {
    console.log('⚠️  Cannot check RLS directly (this is normal)');
  } else {
    console.log('RLS info:', rls);
  }
  
} catch (err) {
  console.error('\n❌ Unexpected error:', err.message);
  console.error('Stack:', err.stack);
}

console.log('\n\nPossible Issues:');
console.log('1. Check if the Supabase URL is correct');
console.log('2. Verify the anon key has proper permissions');
console.log('3. Ensure RLS policies allow SELECT on submissions table');
console.log('4. Check if the submissions table exists');

process.exit(0);