# Webhook Endpoints

## Active Webhook URLs

### n8n Cloud Instance (innovareai.app.n8n.cloud)

**Primary SEO Content Generation Webhook**
- **URL**: `https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt`
- **Method**: POST
- **Content-Type**: application/json
- **Workflow Name**: "3cubed-SEO Jul28"
- **Workflow ID**: hP9yZxUjmBKJmrZt
- **Status**: Active ✅
- **Last Tested**: 2025-07-30

**Expected Payload Structure**:
```json
{
  "submission_id": "string",
  "product_name": "string",
  "generic_name": "string", 
  "indication": "string",
  "therapeutic_area": "string",
  "submitter_name": "string",
  "submitter_email": "string",
  "priority_level": "medium",
  "workflow_stage": "draft",
  "development_stage": "Phase III",
  "nct_number": "string (optional)",
  "sponsor": "string (optional)",
  "line_of_therapy": "string (optional)",
  "patient_population": ["array of strings (optional)"],
  "route_of_administration": "string (optional)",
  "combination_partners": ["array of strings (optional)"],
  "primary_endpoints": ["array of strings (optional)"],
  "geographic_markets": ["array of strings (optional)"],
  "key_biomarkers": ["array of strings (optional)"],
  "target_age_groups": ["array of strings (optional)"]
}
```

## Deprecated/Old URLs

❌ **Old URL (DO NOT USE)**: `https://innovareai.app.n8n.cloud/webhook-test/generate-pharma-content`
- This URL was used in previous versions but is no longer active
- Updated in form: 2025-07-30

## Workflow Details

The active workflow processes pharmaceutical SEO content requests with the following steps:
1. **Extract Submission ID** - Parses incoming webhook data
2. **Fetch Submission Data** - Retrieves full submission from Supabase
3. **Validate Phase** - Validates development stage (Phase III or Market Launch)
4. **Generate Content** - Uses Perplexity AI for SEO content generation
5. **QA Review** - Uses Claude 3.5 Sonnet for quality assurance
6. **Update Database** - Saves results back to Supabase
7. **Webhook Response** - Returns success/failure response

## Testing

Test the webhook endpoint:
```bash
curl -X POST "https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt" \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "test-12345", "product_name": "Test Product"}'
```

Expected response: HTTP 200 with JSON payload containing processing results.