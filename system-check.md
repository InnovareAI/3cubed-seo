# 3Cubed SEO Platform System Check

## Current Architecture
- **Frontend**: React app on Netlify
- **Backend API**: Railway with PostgreSQL
- **AI Functions**: Netlify Functions (FDA, Perplexity, Claude)
- **No longer used**: Supabase, N8N

## Environment Variables Required

### Netlify Environment Variables
1. **PERPLEXITY_API_KEY** - For SEO content generation
2. **CLAUDE_API_KEY** - For QA review
3. **RAILWAY_API_URL** - (Optional, defaults to production URL)

### Railway Environment Variables
1. **DATABASE_URL** - PostgreSQL connection string (auto-set by Railway)
2. **PORT** - Server port (auto-set by Railway)
3. **NODE_ENV** - Should be "production"

## API Endpoints

### Railway API
- **Base URL**: https://3cubed-seo-production.up.railway.app
- **Health Check**: GET /health
- **Submissions**: 
  - GET /api/submissions
  - GET /api/submissions/:id
  - POST /api/submissions
  - PUT /api/submissions/:id

### Netlify Functions
- **Base URL**: https://3cubed-seo.netlify.app/.netlify/functions
- **FDA Query**: POST /fda-query-enhanced
- **Perplexity**: POST /perplexity-generate-geo-optimized
- **Claude QA**: POST /claude-qa

## Database Fields for AI Content

### Required Input Fields
- product_name
- generic_name
- medical_indication
- therapeutic_area
- development_stage
- submitter_name
- submitter_email

### Optional Enhancement Fields
- mechanism_of_action
- line_of_therapy
- patient_population
- geographic_markets
- key_differentiators
- primary_endpoints
- key_biomarkers

### AI-Generated Output Fields
1. **SEO Core**:
   - seo_title (60 chars)
   - meta_description (155 chars)
   - h1_tag
   - h2_tags[] (array)
   - seo_keywords[] (array)
   - long_tail_keywords[] (5 required)

2. **Consumer Questions**:
   - consumer_questions[] (10 required)
   - Format: { question: string, answer: string }

3. **GEO Optimization**:
   - geo_event_tags[]
   - geo_optimization (JSONB):
     - ai_friendly_summary
     - voice_search_answers
     - medical_facts
     - evidence_statistics
     - key_facts
     - event_tags (by platform)

4. **Strategy & Metadata**:
   - seo_strategy_outline
   - content_strategy
   - competitive_advantages[]
   - fda_data (JSONB)
   - qa_scores (JSONB)
   - ai_output (JSONB)

## Testing Checklist

### 1. Railway API
- [x] Health endpoint responds
- [ ] Can fetch submissions
- [ ] Can create new submission
- [ ] Can update submission with AI fields
- [ ] Array fields properly stored
- [ ] JSONB fields properly stored

### 2. Netlify Functions
- [ ] FDA query function deployed
- [ ] Perplexity function deployed
- [ ] Claude function deployed
- [ ] Environment variables set

### 3. Data Flow
- [ ] Form submission → Railway DB
- [ ] FDA query returns data
- [ ] Perplexity generates content
- [ ] Claude performs QA
- [ ] Results saved to Railway
- [ ] Dashboard displays AI content

## Known Issues
1. Railway API returns empty error on POST - likely database schema issue
2. Netlify functions need deployment after recent fixes
3. Need to verify all API keys are set in Netlify dashboard

## Next Steps
1. Deploy updated Netlify functions
2. Set environment variables in Netlify dashboard
3. Check Railway database schema for required columns
4. Test complete flow with real API keys
5. Remove remaining Supabase references from codebase