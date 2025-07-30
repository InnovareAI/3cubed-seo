import pg from 'pg'
import fs from 'fs'

const { Client } = pg

async function runSQL(sqlFile) {
  const client = new Client({
    host: 'db.ktchrfgkbpaixbiwbieg.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'ThqDk.qR9rZTTBT', // Service role JWT won't work here, need actual password
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('🔗 Connected to Supabase database')
    
    const sql = fs.readFileSync(sqlFile, 'utf8')
    console.log(`🔧 Running SQL from ${sqlFile}...`)
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim().substring(0, 60)}...`)
        await client.query(statement)
      }
    }
    
    console.log('✅ All SQL statements executed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

// Run the real-time SQL
runSQL('/Users/tvonlinz/3cubed-seo/supabase/01-enable-realtime.sql')