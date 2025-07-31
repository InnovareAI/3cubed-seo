-- Supabase → N8N Trigger Setup (Updated for Custom Domain)
-- This creates a database trigger that calls N8N whenever a new submission is inserted

-- Step 1: Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Step 2: Create function to notify N8N workflow
CREATE OR REPLACE FUNCTION notify_n8n_workflow()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  response_status integer;
BEGIN
  -- Create JSON payload with the inserted row data
  payload := json_build_object(
    'trigger_source', 'supabase_insert',
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'submission_id', NEW.id,
    'record', row_to_json(NEW)
  );

  -- Log the trigger execution
  RAISE NOTICE 'N8N Trigger: Sending payload for submission_id: %', NEW.id;

  -- Make HTTP POST request to N8N workflow on custom domain
  SELECT status INTO response_status
  FROM http_post(
    'https://workflows.innovareai.com/webhook/hP9yZxUjmBKJmrZt',
    payload::text,
    'application/json'
  );

  -- Log the response status
  RAISE NOTICE 'N8N Trigger: HTTP response status: %', response_status;

  -- Update the record to indicate trigger was fired
  UPDATE submissions 
  SET 
    ai_processing_status = 'triggered',
    workflow_stage = 'ai_processing',
    last_updated = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and continue (don't block the insert)
    RAISE WARNING 'N8N Trigger failed for submission_id %: %', NEW.id, SQLERRM;
    
    -- Update record to indicate trigger failure
    UPDATE submissions 
    SET 
      ai_processing_status = 'trigger_failed',
      error_message = SQLERRM,
      last_updated = now()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_n8n ON submissions;

-- Step 4: Create trigger on submissions table
CREATE TRIGGER trigger_notify_n8n
  AFTER INSERT ON submissions
  FOR EACH ROW 
  EXECUTE FUNCTION notify_n8n_workflow();

-- Step 5: Verify trigger is created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notify_n8n';

-- Step 6: Test the webhook URL manually (run this in your terminal)
-- curl -X POST https://workflows.innovareai.com/webhook/hP9yZxUjmBKJmrZt \
--   -H "Content-Type: application/json" \
--   -d '{"test": true, "submission_id": "test-001"}'

COMMENT ON FUNCTION notify_n8n_workflow() IS 'Automatically triggers N8N workflow when new submissions are inserted';
COMMENT ON TRIGGER trigger_notify_n8n ON submissions IS 'Calls N8N workflow for AI processing on new submissions';