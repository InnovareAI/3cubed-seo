# 3Cubed SEO Deployment Guide

## Current Status

### ✅ Completed
1. **Supabase Schema**: Most fields are already in the submissions table
2. **React Components**: 
   - Updated `SEOReviewModal.tsx` with GEO tab and approval tracking
   - `SubmissionForm.tsx` already has all required fields
3. **TypeScript Interfaces**: Already include necessary fields
4. **n8n Integration**: Migrated to n8n Cloud

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

# n8n Webhook Configuration - UPDATED TO N8N CLOUD
VITE_N8N_WEBHOOK_URL=https://innovareai.app.n8n.cloud/webhook-test/3cubed-seo-webhook

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

### n8n Cloud Migration
- **New Webhook URL**: `https://innovareai.app.n8n.cloud/webhook-test/3cubed-seo-webhook`
- **Benefits**: 
  - No more schema prefix issues
  - Better reliability and scalability
  - Easier maintenance

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
1. Verify the webhook URL is correct in your `.env.local`
2. Check n8n Cloud workflow is active
3. Monitor n8n execution logs for errors

## Next Steps

1. **Test the Review Flow**:
   - Create a test submission
   - Go through SEO review
   - Verify data is saved correctly

2. **Monitor n8n Integration**:
   - Check webhook triggers
   - Verify AI processing pipeline
   - Monitor execution logs

3. **Monitor Performance**:
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
- `VITE_N8N_WEBHOOK_URL` (NEW - n8n Cloud webhook)

Set via Netlify Dashboard:
Site settings → Environment variables → Add a variable

**Important**: After updating environment variables in Netlify, trigger a new deployment for changes to take effect.