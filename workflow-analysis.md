# n8n Workflow Analysis: "3cubed-SEO Jul28" (hP9yZxUjmBKJmrZt)

## Issue: Form submission shows success but data not in Supabase

### Workflow Flow Analysis:
```
1. Webhook (receives form data) ✅ - Working (200 OK response)
2. OpenRouter (content generation) ❓ - Likely working
3. QA Agent (content validation) ❓ - May be working
4. QA Router (routing based on validation) ❓ - May be routing incorrectly
5. Save to Supabase (database update) ❌ - Likely failing here
```

### Critical Issues to Check:

#### 1. **Submission ID Field Mapping**
The workflow expects `$json.submission_id` but form might send:
- `id` instead of `submission_id`
- No submission ID at all (new submission)
- Wrong format/type

**Fix**: Update the webhook to create a submission first, then pass the ID to the workflow.

#### 2. **Supabase Update Query Issues**
The workflow tries to:
```javascript
// Update WHERE id = submission_id
.filters.conditions[0].field = "id"
.filters.conditions[0].value = "={{ $json.submission_id }}"
```

**Potential Problems**:
- Submission ID doesn't exist in database
- Wrong field name mapping
- Permission issues with the API key

#### 3. **Field Constraint Violations**
The workflow updates these fields:
```javascript
ai_output: "={{ $json.content }}"              // JSONB - may be malformed
seo_title: "={{ $json.content.seo_title }}"    // May be null/undefined
workflow_stage: "pending_seo_review"           // May not match enum values
langchain_status: "completed"                  // May not match enum values
```

#### 4. **QA Router Logic**
The QA router has 3 outputs:
- Output 0: PASS → Save to Supabase ✅
- Output 1: REVISIONS_NEEDED → Revision Loop ⚠️
- Output 2: FAIL → Error Handler ❌

**Issue**: If QA fails, the data goes to error handler instead of Supabase.

### Debugging Steps:

#### Step 1: Check n8n Execution Logs
1. Login to https://innovareai.app.n8n.cloud
2. Go to "Executions" 
3. Filter by workflow "3cubed-SEO Jul28"
4. Look for executions from the last 30 minutes
5. Check which node failed and what error message

#### Step 2: Test Individual Nodes
1. **Webhook Node**: ✅ Already confirmed working
2. **OpenRouter Node**: Check if it's generating content
3. **QA Agent Node**: Check if it's returning valid JSON
4. **QA Router**: Check which path it's taking
5. **Supabase Node**: Check for database errors

#### Step 3: Fix Common Issues

**A. Missing Submission ID**:
```javascript
// Add this to the webhook node to create submission first
const submission_id = $json.id || Date.now().toString();
```

**B. Invalid Field Values**:
```javascript
// Ensure fields have valid values before updating
seo_title: "={{ $json.content?.seo_title || 'Generated Title' }}"
workflow_stage: "seo_review"  // Use valid enum value
```

**C. Supabase Permissions**:
- Check if n8n is using correct API key
- Ensure API key has UPDATE permissions on submissions table

### Quick Test Commands:

```bash
# Test the webhook directly
node test-webhook-direct.js

# Test with minimal payload
node test-minimal-webhook.js
```

### Expected n8n Execution Log Errors:

**Most Likely Errors**:
1. "Record not found" - submission_id doesn't exist
2. "Column 'X' doesn't exist" - field mapping issue
3. "Permission denied" - API key issue
4. "Invalid input syntax" - JSON format issue
5. "Check constraint violation" - enum value issue

### Resolution Priority:
1. **High**: Check n8n execution logs for exact error
2. **High**: Verify submission_id is being passed correctly
3. **Medium**: Check Supabase API key permissions
4. **Medium**: Validate field mappings and constraints
5. **Low**: Review QA router logic and paths