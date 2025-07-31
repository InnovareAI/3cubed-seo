-- Supabase → Self-Hosted N8N Trigger Setup
-- Updated for self-hosted N8N instance
-- This creates a database trigger that calls your self-hosted N8N whenever a new submission is inserted

-- Step 1: Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Step 2: Create or replace function to notify N8N workflow
CREATE OR REPLACE FUNCTION notify_n8n_workflow()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  response_status integer;
  n8n_webhook_url text;
  auth_header text;
BEGIN
  -- IMPORTANT: Update this URL to your self-hosted N8N instance
  -- Format: https://your-n8n-domain.com/webhook/[webhook-id]
  -- Example: https://n8n.yourdomain.com/webhook/hP9yZxUjmBKJmrZt
  n8n_webhook_url := 'https://YOUR-N8N-DOMAIN/webhook/hP9yZxUjmBKJmrZt';
  
  -- Optional: Add authentication header for security
  -- auth_header := 'Bearer YOUR_SHARED_SECRET';

  -- Create JSON payload with the inserted row data
  payload := json_build_object(
    'trigger_source', 'supabase_insert',
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'submission_id', NEW.id,
    'record', row_to_json(NEW),
    'timestamp', now()
  );

  -- Log the trigger execution
  RAISE NOTICE 'N8N Trigger: Sending payload for submission_id: %', NEW.id;

  -- Make HTTP POST request to self-hosted N8N workflow
  -- If using authentication, uncomment the headers parameter
  SELECT status INTO response_status
  FROM http_post(
    n8n_webhook_url,
    payload::text,
    'application/json'
    -- Uncomment for authentication:
    -- , json_build_object('Authorization', auth_header)::text
  );

  -- Log the response status
  RAISE NOTICE 'N8N Trigger: HTTP response status: %', response_status;

  -- Update the record to indicate trigger was fired
  UPDATE submissions 
  SET 
    ai_processing_status = 'triggered',
    workflow_stage = 'AI_Processing',
    updated_at = now()
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
      updated_at = now()
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

-- Step 5: Create a test function for manual triggering
CREATE OR REPLACE FUNCTION test_n8n_webhook(submission_id uuid)
RETURNS json AS $$
DECLARE
  test_payload json;
  response json;
  n8n_webhook_url text;
BEGIN
  -- Same URL as in the main function
  n8n_webhook_url := 'https://YOUR-N8N-DOMAIN/webhook/hP9yZxUjmBKJmrZt';
  
  -- Get the submission data
  SELECT row_to_json(s.*) INTO test_payload
  FROM submissions s
  WHERE s.id = submission_id;
  
  IF test_payload IS NULL THEN
    RAISE EXCEPTION 'Submission not found: %', submission_id;
  END IF;
  
  -- Make test request
  SELECT content::json INTO response
  FROM http_post(
    n8n_webhook_url,
    json_build_object(
      'trigger_source', 'manual_test',
      'submission_id', submission_id,
      'record', test_payload
    )::text,
    'application/json'
  );
  
  RETURN response;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Verify trigger is created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notify_n8n';

-- Step 7: Create environment configuration table (optional)
CREATE TABLE IF NOT EXISTS n8n_config (
  key varchar(255) PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert N8N webhook configuration
INSERT INTO n8n_config (key, value, description) 
VALUES (
  'n8n_webhook_url', 
  'https://YOUR-N8N-DOMAIN/webhook/hP9yZxUjmBKJmrZt',
  'Self-hosted N8N webhook URL for SEO automation workflow'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = now();

-- Comments
COMMENT ON FUNCTION notify_n8n_workflow() IS 'Triggers self-hosted N8N workflow when new submissions are inserted';
COMMENT ON TRIGGER trigger_notify_n8n ON submissions IS 'Calls self-hosted N8N workflow for AI processing on new submissions';
COMMENT ON FUNCTION test_n8n_webhook(uuid) IS 'Manually test N8N webhook with a specific submission ID';

-- Usage:
-- 1. Update 'YOUR-N8N-DOMAIN' with your actual self-hosted N8N domain
-- 2. Run this SQL in your Supabase SQL editor
-- 3. Test with: SELECT test_n8n_webhook('your-submission-uuid');