# n8n Workflow Credentials & Configuration Checklist

## Required Credentials in n8n

### 1. **Supabase API Credential**
- **Type**: HTTP Request (OAuth2) or Header Auth
- **Name**: `Supabase API` (or similar)
- **Configuration**:
  ```
  URL: https://eqokpqqjdzbzatbmqiea.supabase.co
  Headers:
    - apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[YOUR_SERVICE_ROLE_KEY]
    - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[YOUR_SERVICE_ROLE_KEY]
    - Content-Type: application/json
    - Prefer: return=representation
  ```
- **IMPORTANT**: Use SERVICE ROLE key, not ANON key for full access

### 2. **Perplexity API Credential**
- **Type**: HTTP Request (Header Auth)
- **Name**: `Perplexity API`
- **Configuration**:
  ```
  Header Name: Authorization
  Header Value: Bearer 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
  ```

### 3. **Claude API Credential** 
- **Type**: HTTP Request (Header Auth)
- **Name**: `Claude API`
- **Configuration**:
  ```
  Headers:
    - Authorization: Bearer [YOUR_CLAUDE_API_KEY]
    - anthropic-version: 2023-06-01
    - Content-Type: application/json
  ```

## Workflow Nodes to Check

### 1. **Webhook Node** (First Node)
- Path: `fda-research-agent`
- HTTP Method: `POST`
- Response Mode: `Immediately`
- Response Data: `First Entry JSON`

### 2. **Supabase Fetch Node** (Get Submission Data)
Should be configured to:
- URL: `https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions`
- Method: `GET`
- Query Parameters:
  - `id=eq.{{ $json.submission_id }}`
  - `select=*`
- Authentication: Use Supabase API credential

### 3. **Perplexity AI Node** (Generate SEO Content)
- URL: `https://api.perplexity.ai/chat/completions`
- Method: `POST`
- Body:
  ```json
  {
    "model": "llama-3.1-sonar-large-128k-online",
    "messages": [{"role": "user", "content": "{{ $json.prompt }}"}],
    "temperature": 0.7,
    "max_tokens": 4000
  }
  ```

### 4. **Claude QA Node** (Validate Content)
- URL: `https://api.anthropic.com/v1/messages`
- Method: `POST`
- Body:
  ```json
  {
    "model": "claude-3-haiku-20240307",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "{{ $json.qa_prompt }}"}]
  }
  ```

### 5. **Supabase Update Node** (Save Results)
- URL: `https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions`
- Method: `PATCH`
- Query Parameters:
  - `id=eq.{{ $json.submission_id }}`
- Body: All the AI-generated fields

## Missing Fields to Map

Make sure these fields are mapped in the final Supabase update:
- `seo_title`
- `meta_description`
- `h1_tag`
- `h2_tags`
- `seo_keywords`
- `long_tail_keywords`
- `geo_event_tags`
- `seo_strategy_outline`
- `ai_output` (complete JSON)
- `workflow_stage` → `seo_review`
- `ai_processing_status` → `completed`
- `geo_optimization_score`

## Environment Variables in n8n

Set these in n8n Settings → Variables:
```
SUPABASE_URL=https://eqokpqqjdzbzatbmqiea.supabase.co
SUPABASE_SERVICE_KEY=[Your Service Role Key]
PERPLEXITY_API_KEY=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
CLAUDE_API_KEY=[Your Claude API Key]
```

## Testing Checklist

1. [ ] Webhook is activated (green toggle)
2. [ ] All credentials are created and tested
3. [ ] Each node has proper error handling
4. [ ] Supabase nodes use service role key
5. [ ] All field mappings are correct
6. [ ] Test with a sample submission

## Common Issues to Check

1. **Webhook not responding**: Ensure workflow is ACTIVE
2. **Supabase errors**: Check you're using SERVICE ROLE key
3. **AI API errors**: Verify API keys are valid
4. **Field mapping errors**: Ensure all {{ expressions }} are correct
5. **JSON parsing errors**: Add error handling in Code nodes

## Logs to Monitor

- n8n execution history
- Supabase logs (check for trigger errors)
- Browser console when submitting forms