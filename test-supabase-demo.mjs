import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

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
  
  // Check pharmaceutical demo data
  console.log('\n💊 Checking pharmaceutical demo data...')
  const { data: pharmaData, error: pharmaError } = await supabase
    .from('submissions')
    .select('id, brand_name, therapeutic_area, reference_id')
    .in('reference_id', [
      'CARDIO-001', 'ONCO-002', 'NEURO-003', 'DIAB-004', 'IMMUNO-005',
      'HEPATO-006', 'RESPIR-007', 'OSTEO-008', 'DERMA-009', 'MIGRA-010'
    ])
    .limit(10)
  
  if (pharmaError) {
    console.error('❌ Demo data query error:', pharmaError)
  } else {
    console.log('✅ Found demo products:', pharmaData?.length || 0)
    if (pharmaData && pharmaData.length > 0) {
      console.log('\n📊 Demo Products:')
      pharmaData.forEach(product => {
        console.log(`  - ${product.brand_name} (${product.reference_id}) - ${product.therapeutic_area}`)
      })
    }
  }
  
} catch (err) {
  console.error('🔥 Unexpected error:', err)
  console.error('Error stack:', err.stack)
}