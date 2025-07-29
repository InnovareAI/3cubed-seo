import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkConstraints() {
  console.log('Checking database constraints...')
  
  try {
    // Try to get enum values or check constraint definition
    const testValues = ['draft', 'form_submitted', 'Form_Submitted', 'ai_processing', 'AI_Processing']
    
    console.log('\nTesting valid workflow_stage values:')
    for (const value of testValues) {
      const testId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const { error: testError } = await supabase
        .from('submissions')
        .insert({
          compliance_id: testId,
          product_name: 'Test',
          submitter_email: 'test@test.com',
          submitter_name: 'Test',
          workflow_stage: value,
          stage: 'Phase III',
          priority_level: 'medium',
          raw_input_content: ''
        })
      
      if (!testError) {
        console.log(`✅ "${value}" is VALID`)
        // Delete the test record
        await supabase
          .from('submissions')
          .delete()
          .eq('compliance_id', testId)
      } else if (testError.message.includes('valid_workflow_stage')) {
        console.log(`❌ "${value}" is INVALID`)
      } else {
        console.log(`? "${value}" - other error: ${testError.message}`)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the check
checkConstraints()