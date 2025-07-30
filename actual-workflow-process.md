# Actual AI Workflow Process

## Complete Flow:
1. **Form Submission** → Supabase ✅ WORKING
2. **Webhook Trigger** → n8n ✅ WORKING (200 OK)
3. **Perplexity Agent** → AI Content Generation ❌ NOT WORKING
4. **Claude Agent** → QA Review ❌ NOT WORKING
5. **Update Database** → Dashboard Display ❌ NOT WORKING

## Current Status:

### ✅ What's Working:
- Form submissions create records in Supabase
- Webhook is triggered and receives data (200 OK)
- Dashboard displays data from database

### ❌ What's NOT Working:
- Perplexity Agent is not generating AI content
- Claude Agent is not doing QA review
- Database is not being updated with AI results

## The n8n Workflow Should:

### Step 1: Receive Webhook Data
```json
{
  "submission_id": "xxx",
  "product_name": "Humira",
  "generic_name": "adalimumab",
  "indication": "...",
  "therapeutic_area": "Immunology"
}
```

### Step 2: Send to Perplexity for AI Generation
- Generate SEO keywords
- Create meta title/description
- Generate H1/H2 tags
- Create content suggestions

### Step 3: Send to Claude for QA
- Review Perplexity output
- Check for accuracy
- Ensure compliance
- Add QA score

### Step 4: Update Supabase
```json
{
  "seo_keywords": ["generated", "keywords"],
  "meta_title": "AI generated title",
  "meta_description": "AI generated description",
  "ai_processing_status": "completed",
  "qa_status": "approved",
  "qa_score": 95,
  "workflow_stage": "seo_review"
}
```

## What to Check in n8n:

### 1. Perplexity Node
- Is API key configured?
- Is it receiving the submission data?
- What prompt is being used?
- Is it outputting results?

### 2. Claude Node
- Is API key configured?
- Is it receiving Perplexity's output?
- What QA prompt is being used?
- Is it outputting QA results?

### 3. Supabase Update Node
- Is it receiving both AI outputs?
- Are fields mapped correctly?
- Is the table name "submissions"?

## Debug Commands for Claude Desktop:

```javascript
// Check workflow configuration
n8n_get_workflow("hP9yZxUjmBKJmrZt")

// Check last 5 executions
n8n_list_executions("hP9yZxUjmBKJmrZt", 5)

// Look for nodes named:
// - "Perplexity" or "AI Generation"
// - "Claude" or "QA Review"
// - "Supabase" or "Update Database"
```

## Common Issues:

1. **Missing API Keys**
   - Perplexity API key not set
   - Claude/Anthropic API key not set

2. **Wrong Node Configuration**
   - Perplexity prompt not receiving product data
   - Claude not receiving Perplexity output

3. **Data Flow Issues**
   - Nodes not connected properly
   - Output from one node not passed to next

4. **Update Issues**
   - Wrong field names in Supabase update
   - Missing credentials