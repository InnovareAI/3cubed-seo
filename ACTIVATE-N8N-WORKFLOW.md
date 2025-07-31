# Activate n8n Workflow - IMPORTANT!

## The Issue
The webhook URL is correct: `https://workflows.innovareai.com/webhook/fda-research-agent`

But we're getting this error:
```
"The workflow must be active for a production URL to run successfully"
```

## Solution

1. **Go to your n8n workflow**: https://workflows.innovareai.com/workflow/JNhVU38JFlwdRuKv

2. **Look for the toggle switch** in the top-right corner of the editor

3. **Click the toggle to ACTIVATE the workflow**
   - When inactive: The toggle is gray/off
   - When active: The toggle is green/on

4. **Save the workflow** after activating

## Why This Matters

- **Test URLs** work even when workflow is inactive
- **Production URLs** (like webhooks) only work when workflow is ACTIVE
- Supabase trigger uses the production webhook URL

## After Activation

Once activated, the webhook should respond properly:
- ✅ Supabase trigger will successfully call n8n
- ✅ Form submissions will be processed automatically
- ✅ AI content generation will work end-to-end

## Test After Activation

Run this command to verify:
```bash
curl -X POST https://workflows.innovareai.com/webhook/fda-research-agent \
  -H "Content-Type: application/json" \
  -d '{"test": true, "submission_id": "test-001"}'
```

You should get a success response instead of the 404 error.