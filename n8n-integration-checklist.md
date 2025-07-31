# n8n Integration Checklist for 3Cubed SEO

## Current Status
- ✅ n8n instance running at: https://workflows.innovareai.com
- ✅ Workflow ID: JNhVU38JFlwdRuKv
- ❌ Webhook not responding at: https://workflows.innovareai.com/webhook/hP9yZxUjmBKJmrZt

## Required Actions

### 1. In n8n Workflow
1. Open your workflow: https://workflows.innovareai.com/workflow/JNhVU38JFlwdRuKv
2. Find the **Webhook** node (should be the first node)
3. Check the webhook path - it will show something like:
   - Test URL: `https://workflows.innovareai.com/webhook-test/XXXXX`
   - Production URL: `https://workflows.innovareai.com/webhook/XXXXX`
4. **Copy the production webhook URL**

### 2. Update Supabase Trigger
Run this SQL in Supabase SQL Editor, replacing `YOUR_WEBHOOK_URL` with the actual URL from n8n:

```sql
-- Update the webhook URL in the function
CREATE OR REPLACE FUNCTION notify_n8n_workflow()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  response_status integer;
BEGIN
  payload := json_build_object(
    'trigger_source', 'supabase_insert',
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'submission_id', NEW.id,
    'record', row_to_json(NEW)
  );

  -- Replace this URL with your actual n8n webhook URL
  SELECT status INTO response_status
  FROM http_post(
    'YOUR_WEBHOOK_URL', -- <-- REPLACE THIS
    payload::text,
    'application/json'
  );

  UPDATE submissions 
  SET 
    ai_processing_status = 'triggered',
    workflow_stage = 'ai_processing',
    last_updated = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'N8N Trigger failed: %', SQLERRM;
    UPDATE submissions 
    SET 
      ai_processing_status = 'trigger_failed',
      error_message = SQLERRM
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. n8n Workflow Configuration

Your workflow should have these nodes in order:

1. **Webhook** (Trigger)
   - HTTP Method: POST
   - Response Mode: "Immediately"
   - Response Data: "First Entry JSON"

2. **Supabase - Get Full Submission** (HTTP Request)
   - URL: `https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions`
   - Method: GET
   - Query Parameters:
     - `id=eq.{{ $json.submission_id }}`
     - `select=*`
   - Headers:
     - `apikey`: Your Supabase service role key
     - `Authorization`: Bearer [Your Supabase service role key]

3. **Perplexity - Generate Content** (HTTP Request)
   - URL: `https://api.perplexity.ai/chat/completions`
   - Method: POST
   - Headers:
     - `Authorization`: Bearer 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
   - Body: (see perplexity prompt in your files)

4. **Parse AI Response** (Code node)
   - Extract and structure the AI-generated content

5. **Claude - QA Review** (HTTP Request)
   - URL: `https://api.anthropic.com/v1/messages`
   - Method: POST
   - Headers:
     - `Authorization`: Bearer [Your Claude API key]
     - `anthropic-version`: 2023-06-01

6. **Update Supabase** (HTTP Request)
   - URL: `https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions`
   - Method: PATCH
   - Query Parameters:
     - `id=eq.{{ $json.submission_id }}`
   - Body: Updated fields with AI-generated content

### 4. Test the Integration

1. **Test the webhook directly**:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "test-001", "test": true}'
```

2. **Submit a test form** from your React dashboard
3. **Check n8n execution history**
4. **Verify Supabase updates**

### 5. Credentials Needed in n8n

1. **Supabase API** (HTTP Header Auth)
   - Header Name: `apikey`
   - Header Value: Your service role key

2. **Perplexity API** (HTTP Header Auth)  
   - Header Name: `Authorization`
   - Header Value: `Bearer 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`

3. **Claude API** (HTTP Header Auth)
   - Header Name: `Authorization`
   - Header Value: `Bearer [Your Claude API key]`

## Troubleshooting

If submissions aren't processing:
1. Check n8n execution history for errors
2. Check Supabase logs for trigger errors
3. Verify all API keys are correct
4. Test each node individually in n8n