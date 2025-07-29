# Webhook URL Mismatch Issue

## Issue Discovered
**Date**: 2025-07-29 18:00 UTC
**Problem**: Database trigger using old webhook URL while n8n uses new URL

## Current Situation

### Two Different Webhook URLs Exist:
1. **Old URL**: `https://innovareai.app.n8n.cloud/webhook/3cubed-seo-webhook`
   - Still configured in database trigger
   - Logs webhooks as "3cubed-seo-webhook" in n8n_webhook_executions table
   - All recent executions use this name

2. **New URL**: `https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt`
   - Active in n8n workflow
   - Fixed Supabase credentials work with this workflow
   - But database trigger doesn't call this URL

## Evidence
- No webhook executions found with "hP9yZxUjmBKJmrZt" in logs
- All webhook executions show "3cubed-seo-webhook" as webhook_name
- Manual calls to new URL work (HTTP 200) but don't process submissions
- Database trigger is firing but calling the wrong webhook endpoint

## Impact
- AI processing not triggered automatically
- Manual webhook calls don't match database records
- Submissions stuck in "pending" status

## Solution Required

### Option 1: Update Database Trigger (Recommended)
```sql
-- Update the trigger function to use new webhook URL
CREATE OR REPLACE FUNCTION trigger_n8n_webhook()
RETURNS trigger AS $$
BEGIN
  -- Update this URL
  PERFORM pg_net.http_post(
    'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('submission_id', NEW.id)::text
  );
  
  INSERT INTO n8n_webhook_executions (
    webhook_name,
    payload,
    status,
    triggered_at
  ) VALUES (
    'hP9yZxUjmBKJmrZt',  -- Update webhook name
    jsonb_build_object('submission_id', NEW.id),
    'pending',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Option 2: Update n8n Workflow
- Change webhook path back to "3cubed-seo-webhook"
- Keep using old URL that database expects

## Verification Steps
1. Check current trigger function definition
2. Update to use correct webhook URL
3. Test with new submission
4. Verify AI processing completes

## Current Test Submissions Affected
- 367789ee-9e5d-4a16-9c27-30d475736dab
- 30e463a5-1fc1-4709-bcea-52b19f8899ca
- d3baa593-bd9a-4e9a-98e9-ab460e3a9960
- 695e8b9d-9e52-4288-8d2b-6551fae55375
- 63ebebb8-fe90-447e-8f4c-14d79fbf2fdb

All have webhook executions logged but no AI processing occurred due to URL mismatch.