import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  try {
    // Try to query information_schema
    const { data, error } = await supabase
      .rpc('get_table_names')
    
    if (error) {
      console.log('Could not get table names via RPC:', error.message)
      
      // Try known tables
      const tables = [
        'submissions',
        'n8n_webhook_executions',
        'webhook_executions',
        'seo_automation_logs',
        'automation_logs',
        'audit_logs'
      ]
      
      console.log('\nChecking known tables:')
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          if (!error) {
            console.log(`✓ ${table} exists (${count} rows)`)
          } else {
            console.log(`✗ ${table}: ${error.message}`)
          }
        } catch (e) {
          console.log(`✗ ${table}: ${e.message}`)
        }
      }
    } else {
      console.log('Tables in database:', data)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkTables()
