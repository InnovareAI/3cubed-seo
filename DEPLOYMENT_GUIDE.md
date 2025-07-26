# 3Cubed SEO Deployment Guide

## Current Status

### ✅ Completed
1. **Supabase Schema**: Most fields are already in the submissions table
2. **React Components**: 
   - Updated `SEOReviewModal.tsx` with GEO tab and approval tracking
   - `SubmissionForm.tsx` already has all required fields
3. **TypeScript Interfaces**: Already include necessary fields
4. **n8n Integration**: Migrated to n8n Cloud with new workflow

### 🔧 Pending Updates
1. **n8n Workflow Activation**: New workflow (ID: hP9yZxUjmBKJmrZt) needs manual activation in n8n UI
2. **Database Webhook Update**: Database trigger needs to be updated to new webhook URL

### 🔧 Pending Database Updates
The following tables need to be created:
- `seo_reviews` - Track SEO review history
- `client_reviews` - Track client review history
- `mlr_reviews` - Track MLR review history
- `content_versions` - Track content version history

## Deployment Steps

### 1. Database Updates (Supabase)

Run the SQL script to create missing tables:

```bash
# Option 1: Via Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Open and run: create-missing-tables.sql

# Option 2: Via Supabase CLI (if installed)
supabase db push create-missing-tables.sql
```

### 2. Update Environment Variables

Create or update your `.env.local` file:
```bash
# Copy from example
cp .env.example .env.local

# Edit with your values
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhook Configuration - NEW WORKFLOW URL
VITE_N8N_WEBHOOK_URL=https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt

# Environment
VITE_APP_ENV=development
```

### 3. Deploy to Netlify

Make the deployment script executable:
```bash
chmod +x deploy-to-netlify.sh
```

Run the deployment:
```bash
./deploy-to-netlify.sh
```

Or manually:
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### 4. Verify Deployment

1. Check build logs in Netlify dashboard
2. Visit your site: https://app.netlify.com/sites/3cubedai-seo
3. Test the updated SEO Review Modal:
   - Should show 4 tabs: Overview, SEO Analysis, GEO Optimization, Compliance
   - Should have approval checkboxes for SEO fields
   - Should track approvals in the database
4. Test the n8n webhook integration:
   - Submit a new form
   - Check n8n Cloud workflow execution

## What's New

### n8n Cloud Migration & New Workflow
- **New Workflow ID**: `hP9yZxUjmBKJmrZt`
- **New Webhook URL**: `https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt`
- **New Features**: 
  - Improved payload extraction (handles nested structures)
  - Better error handling
  - Fixed template variable replacement
  - Enhanced structured content parsing
- **Benefits**: 
  - No more schema prefix issues
  - Better reliability and scalability
  - Easier maintenance

### Recent Fixes
1. **Claude API Authentication**: Fixed with new API key
2. **Template Variable Replacement**: Now correctly replaces `{{ $json.record.XXX }}` patterns
3. **Webhook Payload Extraction**: New workflow handles nested payload structure

### SEO Review Modal Updates
- **New GEO Tab**: Shows AI optimization fields
  - Event tags
  - AI-friendly summary
  - Structured data
  - Key facts
- **Approval Tracking**: 
  - Checkboxes for title, meta description, and GEO tags
  - Stores approval status in database
- **Character Counters**: For SEO title (50-60) and meta description (140-155)

### Database Enhancements
- **Review History**: Complete audit trail for all three review stages
- **Version Control**: Track all content changes
- **Review Status View**: Comprehensive view of all reviews

## Critical Setup Steps

### 1. Activate n8n Workflow
**URGENT**: The new workflow must be manually activated in n8n UI
1. Go to https://innovareai.app.n8n.cloud
2. Find workflow "3cubed SEO" (ID: hP9yZxUjmBKJmrZt)
3. Click to open the workflow
4. Toggle the "Active" switch to enable it

### 2. Update Database Webhook Trigger
After activating the workflow, update the database trigger:
1. Go to Supabase SQL Editor
2. Find the webhook trigger function
3. Update the URL from old to new:
   - Old: `https://innovareai.app.n8n.cloud/webhook/BNKl1IJoWxTCKUak`
   - New: `https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt`

## Troubleshooting

### Build Errors
If you encounter TypeScript errors:
```bash
# Check for type errors
npm run type-check

# Fix common issues
npm run lint --fix
```

### Netlify Deployment Issues
1. Ensure you're logged in: `netlify login`
2. Check site is linked: `netlify link`
3. Verify build settings in `netlify.toml`

### Database Connection Issues
1. Check `.env.local` has correct Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Ensure RLS policies are correctly set

### n8n Webhook Issues
1. **Workflow Not Active**: Check workflow is activated in n8n UI
2. **404 Error**: Workflow needs to be activated first
3. **Payload Issues**: New workflow handles nested payloads automatically
4. Monitor n8n execution logs for errors

## Next Steps

1. **Activate New Workflow**:
   - Login to n8n Cloud
   - Activate workflow hP9yZxUjmBKJmrZt
   - Update database webhook URL

2. **Test the Review Flow**:
   - Create a test submission
   - Go through SEO review
   - Verify data is saved correctly

3. **Monitor n8n Integration**:
   - Check webhook triggers
   - Verify AI processing pipeline
   - Monitor execution logs

4. **Monitor Performance**:
   - Check Supabase logs
   - Monitor Netlify analytics
   - Review n8n execution times

## Support

For issues:
1. Check Netlify build logs
2. Review Supabase logs
3. Check browser console for errors
4. Monitor n8n Cloud execution history

## Environment Variables

Ensure these are set in Netlify:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_WEBHOOK_URL` (UPDATED - new n8n Cloud webhook)

Set via Netlify Dashboard:
Site settings → Environment variables → Add a variable

**Important**: After updating environment variables in Netlify, trigger a new deployment for changes to take effect.