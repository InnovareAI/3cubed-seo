import { createClient } from '@supabase/supabase-js'

// Direct credentials
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0MzMxNzcsImV4cCI6MjAzODAwOTE3N30.YI1RxpjqToyqY9Dj12fqEP2V3G6d2j8QZA2xj8TcTBg'

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Try a simple query to test the connection
  console.log('\n📋 Attempting to query submissions table...')
  const { data, error, count } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
  
  if (error) {
    console.error('❌ Query error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Connection successful!')
    console.log('Total submissions count:', count)
  }
  
  // Also try to check if the table exists
  console.log('\n📋 Checking table existence...')
  const { data: tableData, error: tableError } = await supabase
    .from('submissions')
    .select('id')
    .limit(1)
  
  if (tableError) {
    console.error('❌ Table check error:', tableError)
  } else {
    console.log('✅ Table exists and is accessible')
    console.log('Sample data:', tableData)
  }
  
} catch (err) {
  console.error('🔥 Unexpected error:', err)
  console.error('Error stack:', err.stack)
}
