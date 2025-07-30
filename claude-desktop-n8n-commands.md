# Claude Desktop N8N Commands to Fix the Workflow

## Copy and paste these commands in Claude Desktop:

### 1. First, list your workflows to confirm the ID:
```
n8n_list_workflows()
```

### 2. Get the workflow details:
```
n8n_get_workflow("hP9yZxUjmBKJmrZt")
```

### 3. Check recent executions for errors:
```
n8n_list_executions("hP9yZxUjmBKJmrZt", 10)
```

### 4. Look for the Supabase Update Node
When you get the workflow, look for a node that:
- Type: "Supabase" or "Postgres" 
- Operation: "Update"
- Table: Should be "submissions"

### 5. Check for these common issues:

#### Missing Supabase Credentials:
- The Supabase node needs the service role key (not anon key)
- URL: Your Supabase project URL

#### Wrong Table Name:
- Must be "submissions" not "seo_submissions"

#### Missing Field Mappings:
The update should include:
```json
{
  "seo_keywords": "{{ $json.ai_output.keywords }}",
  "meta_title": "{{ $json.ai_output.title }}",
  "meta_description": "{{ $json.ai_output.description }}",
  "ai_processing_status": "completed",
  "workflow_stage": "seo_review",
  "updated_at": "{{ new Date().toISOString() }}"
}
```

### 6. If you find the issue, update the workflow:
```
n8n_update_workflow("hP9yZxUjmBKJmrZt", {
  // Your fixed workflow configuration
})
```

## What to Look For:

1. **Red X marks** in execution history = Failed nodes
2. **Supabase node** without credentials = No database connection
3. **Wrong table name** = Updates going nowhere
4. **No AI service configured** = No content to update

## Quick Test After Fix:
```
n8n_execute_workflow("hP9yZxUjmBKJmrZt", {
  "submission_id": "test-123",
  "product_name": "Test Product",
  "generic_name": "testium",
  "indication": "Testing workflow",
  "therapeutic_area": "Testing"
})
```

Then check if it updated the database!