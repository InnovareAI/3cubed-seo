import fs from 'fs'

const SUPABASE_URL = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQxNDU2MCwiZXhwIjoyMDY3OTkwNTYwfQ.mHRqlaGYVn3TyDIhFSb9URfXS-Vzntzs6Vks7QiRnpA'

async function runSQL(sqlFile) {
  try {
    const sql = fs.readFileSync(sqlFile, 'utf8')
    console.log(`🔧 Running SQL from ${sqlFile}...`)
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ sql })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ SQL executed successfully!')
      console.log('Result:', result)
    } else {
      console.error('❌ SQL execution failed:', response.status, response.statusText)
      const error = await response.text()
      console.error('Error details:', error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the real-time SQL
runSQL('/Users/tvonlinz/3cubed-seo/supabase/01-enable-realtime.sql')