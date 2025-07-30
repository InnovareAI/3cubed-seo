# N8N WORKFLOW FIX - URGENT

## The Problem
- Webhook receives data (200 OK) ✅
- N8N is NOT updating Supabase ❌
- No AI content is being written back ❌

## Check These in N8N (https://innovareai.app.n8n.cloud/workflow/hP9yZxUjmBKJmrZt):

### 1. Execution History
- Click "Executions" tab
- Look for recent executions
- Check for ❌ red error nodes

### 2. Supabase Update Node
Find the node that updates Supabase and check:
- **Table name**: Must be `submissions` (not `seo_submissions`)
- **Operation**: Update
- **Credentials**: Supabase service role key configured?
- **Update fields**: Should include:
  - `seo_keywords`
  - `meta_title`
  - `meta_description`
  - `ai_processing_status`
  - `workflow_stage`

### 3. AI Processing Node
Check the Perplexity/Claude node:
- Is it configured with API key?
- Is it receiving the submission data?
- Is it outputting results?

### 4. Field Mapping
The update node should map:
- AI output → database fields
- Set `ai_processing_status` = 'completed'
- Set `workflow_stage` = 'seo_review'

## Quick Fix Steps:

1. **Check Executions** - Are they failing?
2. **Check Supabase Credentials** - Service role key needed
3. **Check Update Node** - Correct table and fields?
4. **Test Manually** - Click "Execute Workflow" with test data

## If you have n8n MCP in Claude Desktop:
Run these commands:
- `n8n_list_workflows()` - Find the workflow
- `n8n_get_workflow("hP9yZxUjmBKJmrZt")` - Check configuration
- `n8n_list_executions("hP9yZxUjmBKJmrZt")` - See errors