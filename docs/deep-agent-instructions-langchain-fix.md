# Instructions for Deep Agent: Fix LangChain → Perplexity Migration

## Overview
The 3Cubed SEO system was migrated from LangChain to Perplexity, but the database schema and n8n workflow still reference LangChain columns. This is causing AI processing to fail completely.

## Access Required
- n8n Instance: https://workflows.innovareai.com/workflow/2o3DxEeLInnYV1Se
- Credentials: Use your existing n8n login

## Step-by-Step Fix Instructions

### Phase 1: Identify All LangChain References in n8n Workflow

1. **Open the n8n workflow**
2. **Search for these column references**:
   - `langchain_status`
   - `langchain_phase`
   - `langchain_retry_count`
   - `langchain_error`
   - `langchain_last_retry`

3. **Document each node** that references these columns:
   - Node name
   - Current column reference
   - What it's trying to do

### Phase 2: Update Database Operations

For each node you found, make these replacements:

#### Status Updates
- **FIND**: `langchain_status`
- **REPLACE WITH**: `ai_processing_status`

#### Error Handling
- **FIND**: `langchain_error`
- **REPLACE WITH**: `error_message`

#### Remove These Completely
- `langchain_phase` - Not needed anymore
- `langchain_retry_count` - Use `processing_metadata` instead
- `langchain_last_retry` - Use `last_updated` instead

### Phase 3: Specific Node Updates

1. **"Update Status - Processing" Node**:
   - Change any `langchain_status = 'processing'` to `ai_processing_status = 'processing'`
   - Ensure `workflow_stage` is also updated

2. **"Update DB with AI Content" Node**:
   - Remove any `langchain_*` column updates
   - Ensure it updates:
     - `ai_processing_status`
     - `ai_generated_content`
     - `workflow_stage`

3. **"Update Submission Failed" Node**:
   - Change `langchain_error` to `error_message`
   - Change `langchain_status` to `ai_processing_status = 'failed'`

4. **Any Conditional/IF Nodes**:
   - Check conditions using `langchain_status`
   - Update to use `ai_processing_status`

### Phase 4: Check Perplexity Integration

1. **Find the AI/LangChain node** (might be called "Generate Content" or similar)
2. **Verify it's configured for Perplexity**:
   - Should NOT reference LangChain
   - Should use Perplexity API
   - Model should be: `llama-3.1-sonar-large-128k-online`

3. **Check the output mapping**:
   - Ensure it maps to `ai_generated_content`
   - Not to any `langchain_*` columns

### Phase 5: Test the Workflow

1. **Save all changes**
2. **Execute a test**:
   - Click "Execute Workflow" 
   - Use test payload: `{"submission_id": "12182ddd-c266-4d4a-9f79-13dca5bbaf7a"}`
3. **Monitor execution**:
   - Check each node executes successfully
   - Look for any errors
   - Verify database updates use new columns

### Phase 6: Verify API Credentials

1. **In the Credentials section**:
   - Find Perplexity API credential
   - Test the connection
   - If it fails, the API key may be expired

2. **Also check**:
   - Anthropic API credential (for QA review)
   - Both should show "Connection tested successfully"

## Expected Results

After completing these steps:
- No more references to `langchain_*` columns in the workflow
- All status updates use `ai_processing_status`
- Error handling uses `error_message`
- Workflow should process submissions end-to-end

## Validation Query

Run this in Supabase SQL Editor after fix:
```sql
SELECT 
  id,
  product_name,
  workflow_stage,
  ai_processing_status,
  langchain_status,
  created_at
FROM submissions 
WHERE id = '12182ddd-c266-4d4a-9f79-13dca5bbaf7a';
```

The `ai_processing_status` should change from 'pending' to 'processing' to 'completed' as the workflow runs.

## If You Encounter Issues

1. **Workflow won't save**: Check for syntax errors in SQL queries
2. **Execution fails**: Look at the error message on the failed node
3. **API errors**: Verify credentials are active and have proper permissions
4. **Database errors**: Ensure column names match exactly (case-sensitive)

## Report Back

Document:
1. Which nodes were updated
2. Any errors encountered
3. Test execution results
4. Whether AI content is now being generated