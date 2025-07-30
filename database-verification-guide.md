# Database Verification Guide

This guide helps you verify if form submission data is reaching the Supabase database and check for test submissions.

## Current Status

The form submission system is configured to submit data to a Supabase table called `submissions` with the following key fields:
- `product_name`
- `generic_name` 
- `indication`
- `therapeutic_area`
- `submitter_name`
- `submitter_email`
- `priority_level`
- `workflow_stage`

## Issue Found

The API key authentication is failing with direct Supabase client calls, which suggests either:
1. The API key has expired
2. Row Level Security (RLS) policies are preventing access
3. The credentials are for a different environment

## Verification Methods

### Method 1: Browser Console Testing (Recommended)

Since the development server is running at http://localhost:3000/, you can:

1. Open the browser and go to http://localhost:3000/
2. Open Developer Tools (F12)
3. Fill out and submit the form with test data
4. Check the Console tab for:
   - "🚀 About to submit data to Supabase:" message
   - "✅ Data successfully inserted into Supabase:" message
   - Any error messages

### Method 2: Network Tab Monitoring

1. Open Developer Tools → Network tab
2. Clear network logs
3. Submit a test form
4. Look for requests to `ktchrfgkbpaixbiwbieg.supabase.co`
5. Check if the requests return 200 (success) or error codes

### Method 3: Check Supabase Dashboard

If you have access to the Supabase dashboard:

1. Go to https://supabase.com/dashboard/projects
2. Select your project (ktchrfgkbpaixbiwbieg)
3. Go to Table Editor → submissions table
4. Look for recent entries with "test" in product_name or submitter_name

### Method 4: Update API Credentials

If you have fresh Supabase credentials:

1. Update `.env.local` with current API keys
2. Restart the development server
3. Run the test scripts again

## Expected Test Data Format

When testing, use data with "test" in these fields to make it easy to identify:

```json
{
  "product_name": "Test Product for Database Check",
  "generic_name": "test-generic-name", 
  "indication": "Test indication for database verification",
  "therapeutic_area": "Oncology",
  "submitter_name": "Test Database Checker",
  "submitter_email": "test.database@example.com",
  "priority_level": "medium",
  "workflow_stage": "draft"
}
```

## Database Schema

Based on the migration files, the submissions table includes:

**Required Fields:**
- `product_name` (varchar)
- `generic_name` (varchar) 
- `indication` (text)
- `therapeutic_area` (varchar)
- `submitter_name` (varchar)
- `submitter_email` (varchar)

**System Fields:**
- `id` (uuid, auto-generated)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `priority_level` (enum: high/medium/low)
- `workflow_stage` (enum: various stages)

**Optional Fields:**
- `nct_number`
- `sponsor`
- `development_stage`
- Various arrays like `patient_population`, `geographic_markets`

## Troubleshooting

### If Form Submission Shows Success But No Data

1. Check browser console for actual Supabase responses
2. Verify the API key hasn't expired
3. Check if RLS policies are blocking inserts
4. Ensure all required fields are being submitted

### If API Authentication Fails

1. Get fresh API keys from Supabase dashboard
2. Update `.env.local` file
3. Restart development server
4. Verify project URL is correct

### If Database Table Doesn't Exist

The migrations should create the table automatically. If issues persist:
1. Check if migrations have been run
2. Verify database connection
3. Check table permissions

## Next Steps

1. **Immediate**: Test via browser console (Method 1)
2. **If working**: Submit test data and look for it in the database
3. **If not working**: Update API credentials and retry
4. **Verification**: Check Supabase dashboard for test entries

## Test Data Patterns to Look For

Search for submissions containing:
- Product names with "test" 
- Submitter names with "test"
- Email addresses with "test"
- Recent submissions (last 24-48 hours)

These patterns will help identify test submissions vs real user data.