import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Analyzing Supabase Database Architecture...')
console.log('URL:', supabaseUrl)
console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE ? 'service_role' : 'anon')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeDatabase() {
  try {
    // Get all tables in the public schema
    console.log('\n📊 Fetching table information...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name')

    if (tablesError) {
      // Try alternative approach - query known tables
      console.log('ℹ️  Using alternative approach to discover tables...')
      await discoverTablesAlternative()
      return
    }

    console.log('\n📋 Tables found:', tables?.length || 0)
    
    for (const table of tables || []) {
      await analyzeTable(table.table_name)
    }

  } catch (err) {
    console.error('🔥 Error analyzing database:', err)
  }
}

async function discoverTablesAlternative() {
  // List of potential tables based on the workflow and documentation
  const potentialTables = [
    'submissions',
    'seo_requests',
    'seo_results',
    'ai_pipeline_results',
    'ai_fda_logs',
    'clients',
    'projects',
    'users',
    'audit_logs',
    'therapeutic_areas',
    'workflow_stages'
  ]

  console.log('\n🔍 Checking for known tables...')
  
  for (const tableName of potentialTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`✅ Found table: ${tableName} (${count || 0} rows)`)
        
        // Get sample data to understand structure
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (sample && sample.length > 0) {
          console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`)
        }
      }
    } catch (err) {
      // Table doesn't exist or no access
    }
  }
}

async function analyzeTable(tableName) {
  try {
    console.log(`\n📊 Analyzing table: ${tableName}`)
    
    // Get column information
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position')

    if (columnsError) {
      console.log(`   ⚠️  Could not fetch column info: ${columnsError.message}`)
      return
    }

    console.log(`   Columns (${columns?.length || 0}):`)
    columns?.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
    })

    // Get row count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Row count: ${count || 0}`)

  } catch (err) {
    console.log(`   ❌ Error analyzing table ${tableName}:`, err.message)
  }
}

// Additional analysis for SEO workflow tables
async function analyzeSEOWorkflow() {
  console.log('\n🔄 Analyzing SEO Workflow Tables...')
  
  // Check submissions table structure
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .limit(1)
  
  if (submission && submission.length > 0) {
    console.log('\n📝 Submissions table structure:')
    console.log('Sample record:', JSON.stringify(submission[0], null, 2))
  }

  // Check ai_fda_logs table (from N8N workflow)
  const { data: fdaLogs } = await supabase
    .from('ai_fda_logs')
    .select('*')
    .limit(1)
  
  if (fdaLogs && fdaLogs.length > 0) {
    console.log('\n🤖 AI FDA Logs table structure:')
    console.log('Sample record:', JSON.stringify(fdaLogs[0], null, 2))
  }
}

// Run the analysis
analyzeDatabase().then(() => {
  analyzeSEOWorkflow()
})