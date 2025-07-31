# ✅ Field Mapping Verified - Ready for Testing

## React Form → Database → n8n Workflow

### Core Fields (Required):
- ✅ `generic_name` → `generic_name` → Used in n8n
- ✅ `indication` → `medical_indication` → Used in n8n (FIXED!)
- ✅ `therapeutic_area` → `therapeutic_area` → Used in n8n
- ✅ `product_name` → `product_name` → Used in n8n (optional)
- ✅ `development_stage` → `development_stage` → Used in n8n

### Additional Fields:
- `seo_reviewer_name` → Stored in DB
- `seo_reviewer_email` → Stored in DB
- `submitter_name` → Stored in DB
- `submitter_email` → Stored in DB
- `priority_level` → Set to 'medium'
- `workflow_stage` → Set to 'draft'

### Optional Arrays:
- `patient_population` → Stored as array
- `primary_endpoints` → Stored as array (Note: n8n expects `outcomes`)
- `geographic_markets` → Stored as array
- `key_biomarkers` → Stored as array
- `target_age_groups` → Stored as array

## Supabase Trigger Payload:
```json
{
  "trigger_source": "supabase_insert",
  "table_name": "submissions",
  "operation": "INSERT",
  "submission_id": "uuid",
  "record": {
    "id": "uuid",
    "generic_name": "...",
    "medical_indication": "...",
    "therapeutic_area": "...",
    "product_name": "...",
    "development_stage": "...",
    // ... all other fields
  }
}
```

## n8n Workflow Flow:
1. Webhook receives trigger payload
2. Build SEO Prompt uses `record` data directly
3. Perplexity generates SEO content
4. Claude reviews for compliance
5. Supabase updates with results

## Ready to Test!
The field mappings are now correct. You can submit a test from the React form.