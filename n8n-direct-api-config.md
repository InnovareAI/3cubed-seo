# n8n Direct API Configuration (No OpenRouter)

## What Needs to Change in Your n8n Workflow

### 1. Replace OpenRouter Nodes with Direct API Calls

#### Perplexity AI Node Configuration:
```
Node Type: HTTP Request
Method: POST
URL: https://api.perplexity.ai/chat/completions
Headers:
  - Authorization: Bearer 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
  - Content-Type: application/json

Body:
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.prompt }}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

#### Claude API Node Configuration:
```
Node Type: HTTP Request  
Method: POST
URL: https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: [YOUR_CLAUDE_API_KEY]
  - anthropic-version: 2023-06-01
  - Content-Type: application/json

Body:
{
  "model": "claude-3-haiku-20240307",
  "max_tokens": 1000,
  "messages": [
    {
      "role": "user", 
      "content": "{{ $json.qa_prompt }}"
    }
  ]
}
```

### 2. Remove OpenRouter References

Delete any nodes that:
- Call `https://openrouter.ai/api/v1/chat/completions`
- Use OpenRouter credentials
- Reference OpenRouter models like `anthropic/claude-3-opus`

### 3. Update Model Names

- Perplexity: Use `llama-3.1-sonar-large-128k-online`
- Claude: Use `claude-3-haiku-20240307` or `claude-3-sonnet-20240229`

### 4. Update Credentials in n8n

Go to Settings > Credentials and create:

**Perplexity API Credential:**
- Type: Header Auth
- Name: Perplexity API
- Header Name: Authorization
- Header Value: Bearer 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

**Claude API Credential:**
- Type: Header Auth
- Name: Claude API  
- Add these headers:
  - x-api-key: [YOUR_CLAUDE_API_KEY]
  - anthropic-version: 2023-06-01

### 5. Workflow Structure Should Be:

1. **Webhook** → Receives submission data
2. **Supabase Get** → Fetch full submission details
3. **Perplexity AI** → Generate SEO content (direct API)
4. **Claude QA** → Validate content (direct API)
5. **Supabase Update** → Save results to database

### 6. Testing the Direct APIs

Test Perplexity:
```bash
curl -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-sonar-large-128k-online",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Test Claude:
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```