# Migration Guide: Supabase/N8N to Railway/Netlify

## Summary of Changes

The 3Cubed SEO platform has been migrated from Supabase/N8N to Railway/Netlify:

- **Database**: Supabase → Railway PostgreSQL
- **Workflow Engine**: N8N → Netlify Functions
- **Real-time Updates**: Supabase Realtime → Polling (temporary)
- **Authentication**: Supabase Auth → Not implemented yet

## Current Status

### ✅ Completed
1. Railway API setup with PostgreSQL database
2. Netlify Functions for AI processing (FDA, Perplexity, Claude)
3. Updated database-types.ts with proper interfaces
4. Fixed array handling in FDA query function
5. Comprehensive field mapping for AI-generated content

### ⚠️ Files Still Using Supabase
Many components still import from the old Supabase setup. These imports currently return mock/undefined values to prevent crashes.

### 🔧 Required Environment Variables

#### Netlify Dashboard
```
PERPLEXITY_API_KEY=your_perplexity_key
CLAUDE_API_KEY=your_claude_key
```

#### Railway (Auto-configured)
```
DATABASE_URL=postgresql://...
PORT=...
NODE_ENV=production
```

## Testing the System

### 1. Test Railway API
```bash
curl https://3cubed-seo-production.up.railway.app/health
```

### 2. Test Form Submission
1. Go to https://3cubed-seo.netlify.app/seo-requests
2. Fill out the form with test data
3. Check if submission appears in /seo-review

### 3. Verify AI Processing
After submission, the system should:
1. Query FDA databases for regulatory data
2. Generate SEO content with Perplexity
3. Review content with Claude QA
4. Save results to Railway database

## Known Issues

1. **Database Schema**: Railway database may be missing some columns for AI fields
2. **Real-time Updates**: Dashboard doesn't auto-refresh (was using Supabase realtime)
3. **Authentication**: No auth system implemented yet
4. **Legacy Imports**: Many files still try to import Supabase

## Next Steps for Full Migration

1. **Update Components**: Remove all Supabase imports from components
2. **Add Authentication**: Implement auth system (Auth0, Clerk, or custom)
3. **Real-time Updates**: Add WebSocket or polling for dashboard updates
4. **Database Schema**: Ensure all AI fields exist in Railway database
5. **Deploy Functions**: Push latest Netlify function updates

## Quick Fix for Components

To quickly fix components still using Supabase:

```typescript
// OLD
import { supabase } from '@/lib/database-types'

// NEW
import { api } from '@/lib/api'

// Replace supabase calls:
// OLD: const { data } = await supabase.from('submissions').select()
// NEW: const data = await api.getSubmissions()
```

## Database Schema Required

The Railway PostgreSQL database needs these columns in the `submissions` table:

```sql
-- Core fields (already exist)
id, product_name, generic_name, therapeutic_area, etc.

-- AI-generated fields (may be missing)
seo_title VARCHAR(60)
meta_description VARCHAR(155)
h1_tag TEXT
h2_tags TEXT[]
seo_keywords TEXT[]
long_tail_keywords TEXT[]
consumer_questions JSONB
geo_event_tags TEXT[]
geo_optimization JSONB
seo_strategy_outline TEXT
fda_data JSONB
qa_scores JSONB
ai_output JSONB
geo_optimization_score INTEGER
```

## Contact for Issues

If you encounter issues:
1. Check Netlify function logs for errors
2. Verify environment variables are set
3. Check Railway logs for database errors
4. Ensure latest code is deployed