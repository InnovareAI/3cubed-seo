import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Need service role key for DDL operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

async function runSQL() {
  console.log('🗄️ Adding Missing Columns to Supabase\n');
  
  try {
    // Read SQL file
    const sql = readFileSync('./scripts/add-missing-columns.sql', 'utf-8');
    
    console.log('📝 SQL to execute:');
    console.log(sql.substring(0, 200) + '...\n');
    
    console.log('⚠️  Note: This script requires SUPABASE_SERVICE_KEY for DDL operations');
    console.log('If it fails, please run the SQL directly in Supabase dashboard\n');
    
    // For DDL operations, we need to use raw SQL which isn't available via JS client
    // So we'll check what columns exist and report what's missing
    
    const { data: columns, error } = await supabase
      .from('submissions')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Error checking table:', error);
      return;
    }
    
    console.log('📋 Current columns in submissions table:');
    const existingColumns = Object.keys(columns || {});
    console.log(existingColumns.join(', '));
    
    const requiredColumns = [
      'ai_output',
      'seo_title', 
      'meta_description',
      'seo_keywords',
      'h2_tags',
      'seo_strategy_outline',
      'geo_event_tags',
      'fda_data',
      'fda_data_sources',
      'fda_enrichment_timestamp',
      'qa_score',
      'compliance_score',
      'medical_accuracy',
      'seo_effectiveness',
      'workflow_stage',
      'ai_processing_status',
      'last_updated',
      'error_message',
      'dashboard_data'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns:', missingColumns.join(', '));
      console.log('\n📝 Please run the following SQL in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/eqokpqqjdzbzatbmqiea/editor\n');
      console.log('Copy the contents of: scripts/add-missing-columns.sql');
    } else {
      console.log('\n✅ All required columns exist!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runSQL();