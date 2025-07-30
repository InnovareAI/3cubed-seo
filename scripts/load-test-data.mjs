import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function loadTestData() {
  console.log('🚀 Loading Test Data into Supabase\n');

  try {
    // Read test data
    const testDataPath = join(__dirname, '../test-data/pharmaceutical-test-data.json');
    const testData = JSON.parse(readFileSync(testDataPath, 'utf-8'));
    
    console.log(`Found ${testData.test_submissions.length} test submissions to load\n`);

    // Process each submission
    for (const submission of testData.test_submissions) {
      console.log(`📝 Creating submission for ${submission.product_name}...`);
      
      // Add required fields
      const submissionData = {
        ...submission,
        compliance_id: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflow_stage: 'draft',
        ai_processing_status: 'pending',
        created_at: new Date().toISOString()
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('submissions')
        .insert([submissionData])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting ${submission.product_name}:`, error.message);
      } else {
        console.log(`✅ Created: ${data.product_name} (ID: ${data.id})`);
        
        // Optionally trigger processing
        if (process.argv.includes('--process')) {
          console.log(`   🔄 Triggering AI processing...`);
          
          try {
            const response = await fetch('https://3cubedai-seo.netlify.app/.netlify/functions/process-submission', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submission_id: data.id })
            });
            
            if (response.ok) {
              console.log(`   ✅ Processing triggered successfully`);
            } else {
              console.log(`   ⚠️  Processing trigger failed: ${response.status}`);
            }
          } catch (err) {
            console.log(`   ⚠️  Could not trigger processing:`, err.message);
          }
        }
      }
      
      console.log(''); // Empty line between submissions
    }

    // Summary
    console.log('\n📊 Test Data Loading Complete!');
    console.log('----------------------------');
    
    // Show recent submissions
    const { data: recent } = await supabase
      .from('submissions')
      .select('id, product_name, workflow_stage, ai_processing_status')
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log('\nRecent submissions in database:');
    recent?.forEach(sub => {
      const status = sub.ai_processing_status === 'completed' ? '✅' : '⏳';
      console.log(`${status} ${sub.product_name} - ${sub.workflow_stage}`);
    });

  } catch (error) {
    console.error('❌ Error loading test data:', error);
  }
}

// Check if we should clear existing test data first
async function clearTestData() {
  console.log('🧹 Clearing existing test data...\n');
  
  const { error } = await supabase
    .from('submissions')
    .delete()
    .like('compliance_id', 'TEST-%');
  
  if (error) {
    console.error('Error clearing test data:', error);
  } else {
    console.log('✅ Test data cleared\n');
  }
}

// Main execution
async function main() {
  if (process.argv.includes('--clear')) {
    await clearTestData();
  }
  
  await loadTestData();
  
  console.log('\n💡 Tips:');
  console.log('- Use --clear to remove existing test data first');
  console.log('- Use --process to trigger AI processing for each submission');
  console.log('- View results at: https://3cubedai-seo.netlify.app/dashboard');
}

main().catch(console.error);