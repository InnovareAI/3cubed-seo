# Netlify Environment Variables Setup

## Required Environment Variables

Add these in Netlify Dashboard → Site Settings → Environment Variables:

### AI API Keys
```
PERPLEXITY_API_KEY=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
CLAUDE_API_KEY=[Get from Anthropic Console]
```

### Railway Connection
```
RAILWAY_API_URL=https://3cubed-seo-production.up.railway.app
```

## How to Add in Netlify

1. Go to: https://app.netlify.com/sites/3cubedai-seo/settings/env
2. Click "Add a variable"
3. Add each key-value pair
4. Deploy will automatically trigger

## Test After Setup

Visit: https://3cubedai-seo.netlify.app/seo-requests
Submit a test pharmaceutical product

The AI pipeline will:
1. Query FDA databases (working ✅)
2. Generate SEO content with Perplexity
3. Review with Claude QA
4. Save to Railway database
5. Display in dashboard

## Verify Functions are Working

Test endpoints:
- FDA Query: `/.netlify/functions/fda-query`
- Perplexity: `/.netlify/functions/perplexity-generate`
- Claude QA: `/.netlify/functions/claude-qa`