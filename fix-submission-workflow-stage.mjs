import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixSubmissionWorkflowStage() {
  const submissionId = '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb';
  
  console.log('=== FIXING SUBMISSION WORKFLOW STAGE ===\n');
  console.log('Submission ID:', submissionId);
  console.log('=====================================\n');

  // 1. Check current state
  console.log('1. Current submission state:');
  const { data: before, error: beforeError } = await supabase
    .from('submissions')
    .select('workflow_stage, ai_processing_status, ai_generated_content')
    .eq('id', submissionId)
    .single();

  if (beforeError) {
    console.error('❌ Error fetching submission:', beforeError);
    return;
  }

  console.log('   - Workflow Stage:', before.workflow_stage);
  console.log('   - AI Processing Status:', before.ai_processing_status);
  console.log('   - AI Content Generated:', before.ai_generated_content ? 'Yes' : 'No');

  if (before.workflow_stage === 'draft') {
    console.log('\n2. Updating workflow stage to trigger automation...');
    
    // Update to form_submitted to trigger the webhook
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        workflow_stage: 'form_submitted',
        ai_processing_status: 'pending'
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('❌ Error updating submission:', updateError);
      return;
    }

    console.log('✅ Updated workflow_stage to "form_submitted"');
    console.log('   This should trigger the database trigger and webhook!');

    // Wait a moment for trigger to fire
    console.log('\n3. Waiting 3 seconds for trigger to fire...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if it was updated
    const { data: after, error: afterError } = await supabase
      .from('submissions')
      .select('workflow_stage, ai_processing_status')
      .eq('id', submissionId)
      .single();

    if (!afterError && after) {
      console.log('\n4. New submission state:');
      console.log('   - Workflow Stage:', after.workflow_stage);
      console.log('   - AI Processing Status:', after.ai_processing_status);

      if (after.workflow_stage === 'ai_processing') {
        console.log('\n✅ SUCCESS! The trigger fired and updated the stage to "ai_processing"');
        console.log('   The webhook should have been called to n8n');
      } else {
        console.log('\n⚠️  The workflow stage wasn\'t updated by the trigger');
        console.log('   The trigger might not be working properly');
      }
    }
  } else {
    console.log('\n⚠️  Submission is not in draft stage. Current stage:', before.workflow_stage);
    console.log('   No action needed.');
  }

  console.log('\n5. Next steps:');
  console.log('   - Check n8n workflow execution at: https://tb.3cubed.cloud');
  console.log('   - Look for workflow ID: hP9yZxUjmBKJmrZt');
  console.log('   - Check if the webhook was received and processed');
  console.log('   - If not, you can manually trigger with: node trigger-stelara-webhook.mjs');
}

fixSubmissionWorkflowStage().catch(console.error);