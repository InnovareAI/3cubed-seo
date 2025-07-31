-- Supabase → N8N Trigger Setup
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

  -- Make HTTP POST request to N8N workflow
  SELECT status INTO response_status
  FROM http_post(
    'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt',
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

-- Step 3: Create trigger on submissions table
DROP TRIGGER IF EXISTS trigger_notify_n8n ON submissions;

CREATE TRIGGER trigger_notify_n8n
  AFTER INSERT ON submissions
  FOR EACH ROW 
  EXECUTE FUNCTION notify_n8n_workflow();

-- Step 4: Create trigger on seo_requests table (if it exists separately)
-- Uncomment if you have a separate seo_requests table
-- DROP TRIGGER IF EXISTS trigger_notify_n8n_requests ON seo_requests;
-- CREATE TRIGGER trigger_notify_n8n_requests
--   AFTER INSERT ON seo_requests
--   FOR EACH ROW 
--   EXECUTE FUNCTION notify_n8n_workflow();

-- Step 5: Verify trigger is created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notify_n8n';

-- Step 6: Test function (optional - for manual testing)
-- You can manually test the function with:
-- SELECT notify_n8n_workflow() FROM submissions LIMIT 1;

COMMENT ON FUNCTION notify_n8n_workflow() IS 'Automatically triggers N8N workflow when new submissions are inserted';
COMMENT ON TRIGGER trigger_notify_n8n ON submissions IS 'Calls N8N workflow for AI processing on new submissions';