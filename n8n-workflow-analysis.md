# n8n Workflow Analysis - 3cubed SEO

## Current Workflow Configuration
Based on the workflow at https://workflows.innovareai.com/workflow/JNhVU38JFlwdRuKv

### Issues Found:

1. **Wrong Webhook Path**
   - Current: `hP9yZxUjmBKJmrZt`
   - Should be: `fda-research-agent`

2. **Missing/Wrong Credentials Needed**:
   - **OpenRouter API Key** - Currently using OpenRouter instead of direct APIs
   - **Supabase Credentials** - Need service role key configured
   - **Perplexity API Key** - Should use: `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`
   - **Claude API Key** - Need to add

3. **Wrong API Service**
   - Using OpenRouter proxy instead of direct Perplexity/Claude APIs
   - Should use:
     - Perplexity: https://api.perplexity.ai/chat/completions
     - Claude: https://api.anthropic.com/v1/messages

4. **Supabase Update Issues**
   - Update fields don't match our schema
   - Missing required fields like:
     - `seo_title`
     - `meta_description`
     - `seo_keywords`
     - `geo_optimization_score`
     - `voice_search_queries`
     - `faq_sections`

## Required Actions in n8n UI:

1. **Update Webhook Path**
   - Change from `hP9yZxUjmBKJmrZt` to `fda-research-agent`

2. **Add Credentials**:
   
   a) **Supabase API**:
   ```
   Type: Header Auth
   Name: Supabase API
   Headers:
     - apikey: [YOUR_SERVICE_ROLE_KEY]
     - Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
   ```

   b) **Perplexity API**:
   ```
   Type: Header Auth
   Name: Perplexity API
   Header: Authorization
   Value: Bearer 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
   ```

   c) **Claude API**:
   ```
   Type: Header Auth
   Name: Claude API
   Headers:
     - x-api-key: [YOUR_CLAUDE_API_KEY]
     - anthropic-version: 2023-06-01
   ```

3. **Replace OpenRouter Nodes**:
   - Replace with direct Perplexity API node
   - Replace with direct Claude API node

4. **Fix Supabase Update Fields**:
   Map these fields:
   - `seo_title` 
   - `meta_description`
   - `h1_tag`
   - `h2_tags` 
   - `seo_keywords`
   - `long_tail_keywords`
   - `geo_event_tags`
   - `seo_strategy_outline`
   - `voice_search_queries`
   - `faq_sections`
   - `geo_optimization_score`
   - `ai_output` (full JSON)
   - `workflow_stage` = 'seo_review'
   - `ai_processing_status` = 'completed'

## Next Steps:
1. Access n8n UI at https://workflows.innovareai.com
2. Edit workflow JNhVU38JFlwdRuKv
3. Add the credentials listed above
4. Update the nodes to use correct APIs
5. Fix field mappings
6. Activate the workflow
7. Test with sample data