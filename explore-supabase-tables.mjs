import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Exploring Supabase Tables...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

// List of tables to check based on N8N workflow and docs
const tablesToCheck = [
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
  'workflow_stages',
  'pharmaceutical_products',
  'seo_content',
  'qa_reviews',
  'fda_data'
]

async function checkTable(tableName) {
  try {
    console.log(`\n📊 Checking table: ${tableName}`)
    
    // Try to query the table
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`   ❌ Table does not exist`)
      } else {
        console.log(`   ⚠️  Error: ${error.message}`)
      }
      return
    }
    
    console.log(`   ✅ Table exists! (${count} total rows)`)
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      console.log(`   📋 Columns (${columns.length}):`)
      columns.forEach(col => {
        const value = data[0][col]
        const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
        console.log(`      - ${col} (${type})`)
      })
      
      // Show sample data for key fields
      console.log('\n   📝 Sample data:')
      const keyFields = ['id', 'created_at', 'status', 'stage', 'workflow_stage', 'product_name', 'generic_name', 'development_stage']
      keyFields.forEach(field => {
        if (data[0][field] !== undefined) {
          console.log(`      ${field}: ${JSON.stringify(data[0][field])}`)
        }
      })
    }
    
  } catch (err) {
    console.log(`   🔥 Unexpected error:`, err.message)
  }
}

async function findRelatedTables() {
  console.log('\n🔗 Looking for related tables...')
  
  // Try to find tables with common patterns
  const patterns = ['seo_', 'ai_', 'fda_', 'pharma_', 'submission', 'workflow', 'content']
  
  for (const pattern of patterns) {
    console.log(`\n   Checking pattern: ${pattern}*`)
    // This is a heuristic approach since we can't query information_schema
  }
}

async function checkWorkflowData() {
  console.log('\n\n🔄 Checking SEO Workflow Data Flow...')
  
  // Based on the N8N workflow, check the main tables
  const workflowTables = [
    { name: 'submissions', description: 'Initial form submissions' },
    { name: 'ai_fda_logs', description: 'FDA research and AI processing logs' },
    { name: 'seo_requests', description: 'SEO content generation requests' },
    { name: 'seo_results', description: 'Generated SEO content results' }
  ]
  
  for (const table of workflowTables) {
    console.log(`\n📌 ${table.description}:`)
    await checkTable(table.name)
  }
}

// Run the exploration
async function explore() {
  console.log('🚀 Starting database exploration...\n')
  
  // Check all potential tables
  for (const table of tablesToCheck) {
    await checkTable(table)
  }
  
  // Check workflow-specific tables
  await checkWorkflowData()
  
  console.log('\n\n✅ Exploration complete!')
}

explore().catch(console.error)