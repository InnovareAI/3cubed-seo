# Netlify CLI Environment Variable Setup

## Steps to Set Environment Variables via CLI

1. **First, link your project** (if not already linked):
   ```bash
   cd /Users/tvonlinz/3C\ SEO/3cubed-seo
   netlify link
   ```
   - Choose: "Use current git remote origin"
   - Or search for: "3cubed-seo"

2. **Set the Perplexity API Key**:
   ```bash
   netlify env:set PERPLEXITY_API_KEY "your-perplexity-api-key-here"
   ```

3. **Set the Claude API Key**:
   ```bash
   netlify env:set CLAUDE_API_KEY "your-claude-api-key-here"
   ```

4. **Verify the environment variables are set**:
   ```bash
   netlify env:list
   ```

5. **Trigger a new deployment**:
   ```bash
   netlify deploy --prod
   ```

## Alternative: Using Site ID Directly

If linking doesn't work, you can specify the site ID directly:

1. Find your site ID in Netlify dashboard (Site settings → General → Site ID)
   
2. Use commands with site ID:
   ```bash
   netlify env:set PERPLEXITY_API_KEY "your-key" --site YOUR_SITE_ID
   netlify env:set CLAUDE_API_KEY "your-key" --site YOUR_SITE_ID
   ```

## Testing After Setup

Once the environment variables are set and deployed:

```bash
# Test Perplexity function
curl -X POST https://3cubed-seo.netlify.app/.netlify/functions/perplexity-generate-geo-optimized \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "TestDrug",
    "generic_name": "testumab",
    "medical_indication": "lung cancer",
    "therapeutic_area": "Oncology"
  }'

# Test Claude function
curl -X POST https://3cubed-seo.netlify.app/.netlify/functions/claude-qa \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test content",
    "product_name": "TestDrug"
  }'
```

## Note
Environment variables set via CLI are more reliable than those set via the web UI for Netlify Functions.