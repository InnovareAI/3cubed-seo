# n8n Webhook Node Fix

## The Issue
The Supabase trigger sends data in this format:
```json
{
  "trigger_source": "supabase_insert",
  "table_name": "submissions",
  "operation": "INSERT",
  "submission_id": "uuid-here",
  "record": { ...full record... }
}
```

## What's Missing in the Workflow

1. **Add a Code node after Webhook** to handle different input formats:

```javascript
// Handle different webhook payload formats
const input = $input.first().json;

// Extract submission_id from various possible locations
let submission_id = 
  input.submission_id ||                    // Direct from Supabase trigger
  input.body?.submission_id ||              // From HTTP request body
  input.query?.submission_id ||             // From query params
  input.record?.id ||                       // From Supabase record
  input.id;                                 // Direct ID

if (!submission_id) {
  throw new Error('No submission_id found in webhook payload');
}

return [{
  json: {
    submission_id: submission_id,
    original_payload: input
  }
}];
```

2. **Update Fetch Submission URL** to use the extracted ID properly

## Alternative: Use the Full Record
Since the Supabase trigger already sends the complete record in the `record` field, you could skip the Fetch Submission node entirely and use the data directly from the webhook.

## Manual Fix in n8n UI:
1. Add a "Code" node between Webhook and Fetch Submission
2. Use the code above to extract submission_id
3. Connect: Webhook → Code → Fetch Submission → rest of workflow