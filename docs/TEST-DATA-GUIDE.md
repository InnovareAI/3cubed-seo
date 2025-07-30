# Test Data Guide for 3Cubed SEO Platform

## Quick Start

### 1. Load Test Data
```bash
# Load 5 pharmaceutical test products
npm run test:load

# Clear existing test data first, then load new
npm run test:load:clear

# Load and automatically trigger AI processing
npm run test:load:process
```

### 2. Quick Test Submission
```bash
# Create a single test submission with monitoring
npm run test:quick
```

### 3. Local Development Testing
```bash
# Start Netlify dev server (includes functions)
npm run netlify:dev

# In another terminal, run quick test
npm run test:quick
```

## Test Data Contents

### Real Pharmaceutical Products (with FDA data)
1. **Keytruda** (pembrolizumab) - Lung Cancer - NCT02220894
2. **Ozempic** (semaglutide) - Type 2 Diabetes - NCT01720446
3. **Leqembi** (lecanemab) - Alzheimer's Disease - NCT01767311

### Test Products
4. **TestDrug-001** - Phase III Melanoma drug
5. **BioTest-202** - Phase II Rheumatoid Arthritis

## Testing Workflow

### Step 1: Load Test Data
```bash
npm run test:load:clear
```
This will:
- Clear any existing test submissions
- Load 5 test pharmaceutical products
- Each with realistic data including NCT numbers

### Step 2: Check Dashboard
Visit: https://3cubedai-seo.netlify.app/dashboard

You should see the test submissions in "draft" status.

### Step 3: Process a Submission
Click on any submission and use the form to trigger processing, or:
```bash
npm run test:load:process
```

### Step 4: Monitor Progress
The dashboard will show real-time updates:
- FDA data enrichment
- Perplexity content generation
- Claude QA review
- Final results

## Expected Results

Each processed submission should have:
- **SEO Title**: ~60 characters with product name
- **Meta Description**: ~155 characters
- **Keywords**: 8-10 pharmaceutical SEO terms
- **H2 Tags**: Clinical sections
- **FDA Data**: If NCT number provided
- **QA Scores**: Compliance, accuracy, SEO effectiveness

## Troubleshooting

### If processing fails:
1. Check API keys in Netlify environment
2. Verify Supabase connection
3. Check browser console for errors
4. Review Netlify function logs

### Common Issues:
- **No FDA data**: Normal for test products without real NCT numbers
- **QA scores low**: Expected for Phase II/III products (claims restrictions)
- **Processing timeout**: FDA APIs can be slow, allow 20-30 seconds

## API Keys Required

Make sure these are set in Netlify:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `PERPLEXITY_API_KEY`
- `CLAUDE_API_KEY` (optional, will use defaults)