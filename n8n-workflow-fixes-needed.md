# n8n Workflow Fixes Needed

## Current Issues in Your Workflow

### 1. ✅ Webhook Path (CORRECT)
- Already using `fda-research-agent` - Good!

### 2. ❌ Perplexity API URL (WRONG)
**Current:** `https://api.perplexity.ai/chat/completion`
**Should be:** `https://api.perplexity.ai/chat/completions` (with 's')

### 3. ❌ Missing HTTP Request Configuration
Both Perplexity and Claude nodes need proper configuration:

#### Perplexity Node:
- Method: POST
- Headers: Authorization: Bearer [use credential]
- Body:
```json
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.seoPrompt }}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

#### Claude Node:
- Method: POST
- Headers: 
  - x-api-key: [use credential]
  - anthropic-version: 2023-06-01
- Body:
```json
{
  "model": "claude-3-haiku-20240307",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.claudePrompt }}"
    }
  ],
  "max_tokens": 1000
}
```

### 4. ❌ Wrong Table Name
**Current:** `ai_fda_logs`
**Should be:** `submissions`

### 5. ❌ Wrong Fields in Supabase Update
Current fields don't match our schema. Should update:
- `seo_title`
- `meta_description`
- `seo_keywords`
- `h1_tag`
- `h2_tags`
- `geo_optimization_score`
- `ai_processing_status` = 'completed'
- `workflow_stage` = 'seo_review'

### 6. ❌ No Error Handling
Add error catching nodes for failed API calls

### 7. ❌ Missing Submission Fetch
Need to fetch full submission data from Supabase first

### 8. ❌ Workflow Not Active
`"active": false` - needs to be activated

## Quick Fix Instructions

1. Fix Perplexity URL: Add the 's' to make it `/chat/completions`
2. Configure HTTP bodies for both API calls
3. Change Supabase table from `ai_fda_logs` to `submissions`
4. Update Supabase fields to match our schema
5. Activate the workflow