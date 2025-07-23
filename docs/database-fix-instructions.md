# Instructions for Deep Agent - Critical Database Fixes Required

## Overview
The React form has been fixed to use the correct table, but the database is missing critical columns that n8n references, which will cause the workflow to fail.

## Step 1: Add Missing Database Columns (CRITICAL)

### Access Required
- Supabase dashboard access (https://supabase.com/dashboard/project/ktchrfgkbpaixbiwbieg)
- OR direct database access

### Execute SQL
```sql
-- Add missing columns that n8n workflow requires
ALTER TABLE pharma_seo_submissions 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;
```

### Why This Is Critical
The n8n workflow has a node called "Update DB with AI Content" that tries to update these columns:
- `meta_title` 
- `meta_description`

Without these columns, the workflow will FAIL with an SQL error when it tries to update them.

## Step 2: Verify n8n Workflow SQL Queries

### Access Required
- n8n dashboard: https://workflows.innovareai.com/workflow/2o3DxEeLInnYV1Se

### Check These Specific Nodes
1. **Node: "Update DB with AI Content"**
   - Look for SQL query that updates `meta_title` and `meta_description`
   - Verify it's updating the correct table: `pharma_seo_submissions`
   - Check if `seo_keywords` is being set correctly (it's JSONB type)

2. **Node: "Get Submission"**
   - Should query: `WHERE id = '{{ $json.body.submission_id }}'`
   - Verify it's querying `pharma_seo_submissions` table

3. **Node: "Update Status - Processing"**
   - Should update `ai_processing_status` and `workflow_stage`
   - Verify correct table name

## Step 3: Fix Type Mismatch Issue (If Needed)

### Check in n8n
The `seo_keywords` column is JSONB type in database, but n8n might expect text array.

**If n8n expects array format:**
```sql
-- Option 1: Change column type
ALTER TABLE pharma_seo_submissions 
ALTER COLUMN seo_keywords TYPE TEXT[] USING ARRAY[seo_keywords::text];

-- OR Option 2: Keep JSONB and ensure n8n sends JSON
-- (Check how n8n is formatting the keywords)
```

## Step 4: Test End-to-End Flow

### Test Sequence
1. **Submit test form** at the React app
2. **Check Supabase** - Verify record created in `pharma_seo_submissions`
3. **Check n8n** - Monitor workflow execution
4. **Watch for errors** specifically at:
   - "Update DB with AI Content" node (most likely failure point)
   - Any node referencing `meta_title` or `meta_description`

### Expected Test Results
- ✅ Form submission creates record
- ✅ n8n webhook triggers
- ❌ Workflow fails at "Update DB with AI Content" (if columns not added)
- ✅ After fix: Complete workflow execution

## Step 5: Monitor First Real Submission

### What to Watch
1. **Supabase Logs** - Any SQL errors
2. **n8n Execution History** - Failed nodes
3. **Error Messages** - Specifically looking for:
   - "column does not exist" errors
   - Type mismatch errors
   - JSON parsing errors

## Summary of Issues

### What I Fixed ✅
- React form now uses correct table `pharma_seo_submissions` (was using `submissions`)
- Removed deprecated fields from form submission
- Updated form to use `ai_processing_status: 'pending'`

### What Still Needs Fixing ❌
1. **Database missing columns**: `meta_title`, `meta_description`
2. **Potential type issue**: `seo_keywords` JSONB vs array
3. **Untested**: End-to-end workflow execution

### Why This Happened
- Database schema and n8n workflow are out of sync
- n8n workflow expects columns that don't exist in database
- No integration testing was done after schema changes

## Verification Checklist

- [ ] Added `meta_title` column to database
- [ ] Added `meta_description` column to database  
- [ ] Verified n8n SQL queries use correct table name
- [ ] Checked `seo_keywords` type compatibility
- [ ] Submitted test form entry
- [ ] Workflow completed without errors
- [ ] AI content properly stored in database
- [ ] All status fields updated correctly

## If Workflow Still Fails

1. **Check n8n execution history** for specific error
2. **Look for node that failed** and examine its configuration
3. **Common issues**:
   - Wrong table name in SQL
   - Missing columns
   - Type mismatches (expecting string, getting object)
   - Incorrect field references in expressions

## Contact for Issues
If you encounter issues that aren't covered here:
1. Document the exact error message
2. Note which n8n node failed
3. Check Supabase logs for SQL errors
4. Update the handover document with findings