# 3Cubed SEO Platform Deployment Checklist

## Pre-Deployment Requirements

### 1. API Keys & Credentials
- [ ] **Perplexity API Key** 
  - Key: `pplx-[your-key]`
  - Set in: Netlify Environment Variables
  - Test endpoint: https://api.perplexity.ai/chat/completions
  
- [ ] **Claude API Key**
  - Key: `sk-ant-[your-key]`
  - Set in: Netlify Environment Variables
  - Test endpoint: https://api.anthropic.com/v1/messages

- [ ] **Railway Database**
  - Auto-configured DATABASE_URL
  - Verify connection: `curl https://3cubed-seo-production.up.railway.app/health`

### 2. Environment Variable Configuration

#### Netlify Dashboard (Site Settings → Environment Variables)
```bash
PERPLEXITY_API_KEY=pplx-your-actual-key
CLAUDE_API_KEY=sk-ant-your-actual-key
```

#### Railway (Auto-configured)
```bash
DATABASE_URL=postgresql://postgres:password@host:5432/railway
PORT=assigned-by-railway
NODE_ENV=production
```

## Database Schema Verification

### Required Tables & Columns
Run this SQL in Railway dashboard to verify schema:

```sql
-- Check if submissions table exists with all required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- Required columns checklist:
-- Core fields
-- [ ] id (UUID)
-- [ ] product_name (VARCHAR)
-- [ ] generic_name (VARCHAR)
-- [ ] medical_indication (VARCHAR)
-- [ ] therapeutic_area (VARCHAR)
-- [ ] development_stage (VARCHAR)
-- [ ] workflow_stage (VARCHAR)
-- [ ] submitter_name (VARCHAR)
-- [ ] submitter_email (VARCHAR)

-- AI-generated fields
-- [ ] seo_title (VARCHAR(60))
-- [ ] meta_description (VARCHAR(155))
-- [ ] h1_tag (TEXT)
-- [ ] h2_tags (TEXT[])
-- [ ] seo_keywords (TEXT[])
-- [ ] long_tail_keywords (TEXT[])
-- [ ] consumer_questions (JSONB)
-- [ ] geo_event_tags (TEXT[])
-- [ ] geo_optimization (JSONB)
-- [ ] seo_strategy_outline (TEXT)
-- [ ] fda_data (JSONB)
-- [ ] qa_scores (JSONB)
-- [ ] ai_output (JSONB)
-- [ ] geo_optimization_score (INTEGER)
```

### Add Missing Columns (if needed)
```sql
-- Example: Add missing AI fields
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(60),
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(155),
ADD COLUMN IF NOT EXISTS h1_tag TEXT,
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS long_tail_keywords TEXT[],
ADD COLUMN IF NOT EXISTS consumer_questions JSONB,
ADD COLUMN IF NOT EXISTS geo_event_tags TEXT[],
ADD COLUMN IF NOT EXISTS geo_optimization JSONB,
ADD COLUMN IF NOT EXISTS seo_strategy_outline TEXT,
ADD COLUMN IF NOT EXISTS fda_data JSONB,
ADD COLUMN IF NOT EXISTS qa_scores JSONB,
ADD COLUMN IF NOT EXISTS ai_output JSONB,
ADD COLUMN IF NOT EXISTS geo_optimization_score INTEGER;
```

## Deployment Steps

### 1. Deploy Netlify Functions
- [ ] Ensure latest code is pushed to GitHub
- [ ] Verify Netlify auto-deploy triggered
- [ ] Check function deployment status:
  ```
  https://app.netlify.com/sites/3cubed-seo/functions
  ```
- [ ] Verify all 3 functions deployed:
  - [ ] fda-query-enhanced
  - [ ] perplexity-generate-geo-optimized
  - [ ] claude-qa

### 2. Test Individual Components

#### A. Test Railway API
```bash
# Health check
curl https://3cubed-seo-production.up.railway.app/health

# Get submissions
curl https://3cubed-seo-production.up.railway.app/api/submissions

# Test POST (create submission)
curl -X POST https://3cubed-seo-production.up.railway.app/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "TestDrug",
    "generic_name": "testumab",
    "medical_indication": "Test Disease",
    "therapeutic_area": "Oncology",
    "development_stage": "Phase 2",
    "submitter_name": "Test User",
    "submitter_email": "test@example.com"
  }'
```

#### B. Test Netlify Functions
```bash
# Test FDA Query
curl -X POST https://3cubed-seo.netlify.app/.netlify/functions/fda-query-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Keytruda",
    "genericName": "pembrolizumab",
    "indication": "lung cancer"
  }'

# Test Perplexity (requires valid API key)
curl -X POST https://3cubed-seo.netlify.app/.netlify/functions/perplexity-generate-geo-optimized \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "TestDrug",
    "generic_name": "testumab",
    "medical_indication": "lung cancer",
    "therapeutic_area": "Oncology",
    "fda_data": {}
  }'

# Test Claude QA (requires valid API key)
curl -X POST https://3cubed-seo.netlify.app/.netlify/functions/claude-qa \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test content for QA review",
    "product_name": "TestDrug"
  }'
```

### 3. End-to-End Flow Test

- [ ] **Form Submission Test**
  1. Navigate to https://3cubed-seo.netlify.app/seo-requests
  2. Fill out form with test pharmaceutical data
  3. Submit and note the submission ID

- [ ] **AI Processing Verification**
  1. Check Railway logs for new submission
  2. Monitor Netlify function logs for:
     - FDA query execution
     - Perplexity content generation
     - Claude QA review
  3. Verify data saved back to Railway

- [ ] **Dashboard Verification**
  1. Navigate to https://3cubed-seo.netlify.app/seo-review
  2. Confirm new submission appears
  3. Check AI-generated fields populated
  4. Verify all sections display correctly

## Production Readiness Checklist

### Security
- [ ] API keys stored in environment variables (not in code)
- [ ] CORS properly configured on Netlify functions
- [ ] Railway database has proper access controls
- [ ] No sensitive data in client-side code

### Performance
- [ ] Railway API responds < 500ms
- [ ] Netlify functions timeout set appropriately (10s default)
- [ ] Database queries optimized with indexes
- [ ] Frontend implements proper loading states

### Monitoring
- [ ] Set up Railway logs monitoring
- [ ] Configure Netlify function error alerts
- [ ] Implement error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring for APIs

### Backup & Recovery
- [ ] Railway database backup configured
- [ ] Document recovery procedures
- [ ] Test restore process
- [ ] Export critical configurations

## Common Issues & Solutions

### Issue: Railway POST returns empty response
**Solution**: Check database schema has all required columns
```sql
SELECT * FROM submissions LIMIT 1;
```

### Issue: Netlify functions timeout
**Solution**: Increase timeout in netlify.toml
```toml
[functions]
  timeout = 20
```

### Issue: CORS errors in browser
**Solution**: Verify CORS headers in Netlify functions
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
```

### Issue: API keys not working
**Solution**: 
1. Verify keys in Netlify dashboard
2. Check for extra spaces or quotes
3. Redeploy after setting variables
4. Test with curl commands above

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Test 5 complete submissions
- [ ] Verify all AI fields populate
- [ ] Check error logs
- [ ] Document any issues

### Week 1
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Optimize slow queries
- [ ] Update documentation

### Month 1
- [ ] Review API usage/costs
- [ ] Implement missing features
- [ ] Plan scaling strategy
- [ ] Security audit

## Support Contacts

### Technical Issues
- Railway Support: support@railway.app
- Netlify Support: support@netlify.com
- API Issues:
  - Perplexity: Check API dashboard
  - Claude: console.anthropic.com

### Business/Platform
- Platform Admin: [Your contact]
- Technical Lead: [Your contact]

## Rollback Procedures

If deployment fails:

1. **Netlify Functions**: Redeploy previous commit
   ```
   git revert HEAD
   git push
   ```

2. **Railway Database**: Restore from backup
   - Access Railway dashboard
   - Navigate to database backups
   - Restore to last known good state

3. **Environment Variables**: Keep backup of working configuration

## Success Criteria

Deployment is successful when:
- [ ] Health check returns 200 OK
- [ ] Can create new submission via form
- [ ] FDA data successfully retrieved
- [ ] Perplexity generates SEO content
- [ ] Claude performs QA review
- [ ] All data visible in dashboard
- [ ] No errors in logs for 1 hour
- [ ] 5 test submissions completed successfully

---

Last Updated: [Current Date]
Deployment Version: 1.0.0
Platform: Medical/Pharmaceutical SEO/GEO