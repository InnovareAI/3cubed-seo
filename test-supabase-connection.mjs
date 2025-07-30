import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('submissions')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }
    
    console.log(`✅ Connected successfully! Found ${data} submissions in database`)
    
    // Get recent submissions (check what columns exist)
    const { data: recent, error: recentError } = await supabase
      .from('submissions')
      .select('*')
      .limit(1)
    
    if (recentError) {
      console.error('❌ Error fetching recent submissions:', recentError.message)
      return
    }
    
    console.log('\n📋 Available columns in submissions table:')
    if (recent.length > 0) {
      console.log(Object.keys(recent[0]).sort().join(', '))
      console.log('\n📋 Sample submission data:')
      console.log(JSON.stringify(recent[0], null, 2))
    } else {
      console.log('No submissions found in table')
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message)
  }
}

testConnection()