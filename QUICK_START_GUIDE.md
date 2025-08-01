# 3Cubed SEO Platform - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Netlify account with deployed site
- Railway account with PostgreSQL database
- Perplexity API key
- Claude (Anthropic) API key

### Step 1: Set Environment Variables (2 min)

#### In Netlify Dashboard:
1. Go to: Site Settings → Environment Variables
2. Add:
   ```
   PERPLEXITY_API_KEY = pplx-your-key-here
   CLAUDE_API_KEY = sk-ant-your-key-here
   ```
3. Trigger redeploy

#### Railway automatically provides:
- DATABASE_URL
- PORT
- NODE_ENV

### Step 2: Verify Deployment (1 min)

```bash
# Test Railway API
curl https://3cubed-seo-production.up.railway.app/health

# Should return: {"status":"ok","database":"connected"}
```

### Step 3: Quick Test (2 min)

1. Open: https://3cubed-seo.netlify.app/seo-requests
2. Submit test pharmaceutical:
   - Product: "TestVax"
   - Generic: "testvaxumab"
   -