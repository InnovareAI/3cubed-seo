# n8n Supabase Credential Fix Instructions

## Issue Identified
**Date**: 2025-07-29 17:30 UTC
**Problem**: n8n workflow failing due to missing/misconfigured Supabase credentials
**Error**: "Found credential with no ID"
**Credential ID Referenced**: pgPh6lGomFMfn2ju

## Current Workflow Status
- ✅ Webhook receives data correctly  
- ✅ Submission ID extraction works (JavaScript syntax fixed)
- ❌ Database access fails (credential issue)
- ❓ AI content generation blocked by DB issue

## Required Information

### Supabase Connection Details
- **Project URL**: https://ktchrfgkbpaixbiwbieg.supabase.co
- **Service Role Key**: [Need to get from Supabase dashboard]

### How to Get Service Role Key
1. Go to https://supabase.com/dashboard/project/ktchrfgkbpaixbiwbieg
2. Navigate to Settings → API
3. Copy the "service_role" key (starts with `eyJ...`)
4. Keep this key secure - it has full database access

## Fix Instructions

### Step 1: Access n8n Credentials
1. Go to https://innovareai.app.n8n.cloud
2. Click on "Credentials" in the left sidebar
3. Look for Supabase credential (may be named differently)

### Step 2: Configure Supabase Credential
1. Click on the Supabase credential to edit
2. Fill in:
   - **Host**: ktchrfgkbpaixbiwbieg.supabase.co
   - **Database**: postgres
   - **Port**: 5432
   - **User**: postgres
   - **Password**: [Your database password]
   - OR use **Service Role Key** authentication if available

### Step 3: Update Workflow Nodes
1. Open workflow ID: hP9yZxUjmBKJmrZt
2. Check each database node:
   - "Fetch Submission Data"
   - "Update Status to Processing"
   - "Update with SEO Content"
   - "Update QA Review"
   - "Handle Error"
3. Ensure each node uses the correct credential

### Step 4: Test the Fix
1. Save the workflow
2. Use test webhook call:
```bash
curl -X POST https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "695e8b9d-9e52-4288-8d2b-6551fae55375"}'
```

## Expected Results After Fix
1. Webhook triggers workflow ✅
2. Database fetch retrieves submission data ✅
3. AI services generate content ✅
4. Database updates with results ✅
5. Full execution in ~5-10 seconds

## Alternative Credential Types

### Option 1: PostgreSQL Connection
- Use standard PostgreSQL credentials
- Requires database password

### Option 2: Supabase Service Role
- Use service_role key from API settings
- Provides full access to all tables

### Option 3: Connection String
```
postgresql://postgres:[password]@db.ktchrfgkbpaixbiwbieg.supabase.co:5432/postgres
```

## Verification Query
After fixing, run this in Supabase SQL Editor:
```sql
-- Check if AI content was generated
SELECT 
  id,
  product_name,
  workflow_stage,
  ai_processing_status,
  ai_generated_content IS NOT NULL as has_ai_content,
  qa_feedback IS NOT NULL as has_qa_feedback,
  updated_at
FROM submissions 
WHERE id IN (
  '63ebebb8-fe90-447e-8f4c-14d79fbf2fdb',
  '695e8b9d-9e52-4288-8d2b-6551fae55375'
)
ORDER BY created_at DESC;
```

## Common Issues
1. **Wrong credential type**: Ensure using Supabase/PostgreSQL credential type
2. **SSL required**: May need to enable SSL in connection settings
3. **Password with special characters**: Use URL encoding if needed
4. **Connection timeout**: Check if IP is whitelisted in Supabase

## Contact Support
If credentials still fail:
1. Check Supabase service status
2. Verify project is active (not paused)
3. Regenerate service role key if needed