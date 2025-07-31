# Self-Hosted N8N Migration Guide

## 🚀 Migration from N8N Cloud to Self-Hosted

### Current Setup
- **Old N8N Cloud URL**: `https://innovareai.app.n8n.cloud/workflow/hP9yZxUjmBKJmrZt`
- **Workflow ID**: `hP9yZxUjmBKJmrZt`
- **Workflow Name**: `3cubed-SEO Jul28`

### New Self-Hosted Setup
- **New N8N URL**: `https://YOUR-N8N-DOMAIN/webhook/[webhook-id]`
- **Infrastructure**: Self-hosted (Hetzner recommended)
- **Authentication**: Service role key required

## 📋 Migration Checklist

### 1. Update Supabase Database Trigger
```sql
-- Run the updated trigger SQL
-- File: supabase-n8n-trigger-selfhosted.sql
-- Update YOUR-N8N-DOMAIN with your actual domain
```

### 2. Update Environment Variables

#### Local Development (.env)
```env
N8N_WEBHOOK_URL=https://your-n8n-domain/webhook/[webhook-id]
N8N_API_URL=https://your-n8n-domain/api/v1
N8N_API_KEY=your-n8n-api-key
```

#### Netlify Environment Variables
Update in Netlify dashboard or via CLI:
```bash
netlify env:set N8N_WEBHOOK_URL "https://your-n8n-domain/webhook/[webhook-id]"
```

### 3. Update N8N Workflow Configuration

#### Export from Cloud
1. Login to N8N Cloud
2. Export workflow: `3cubed-SEO Jul28`
3. Download JSON file

#### Import to Self-Hosted
1. Login to self-hosted N8N
2. Import workflow JSON
3. Update credentials:
   - Supabase credentials (use service_role key)
   - Perplexity API key
   - Claude API key

### 4. Configure N8N Authentication

#### Headers for Supabase → N8N
```javascript
{
  "Authorization": "Bearer YOUR_SHARED_SECRET"
}
```

#### Headers for N8N → Supabase
```javascript
{
  "apikey": "{{ $env.SUPABASE_SERVICE_ROLE }}",
  "Authorization": "Bearer {{ $env.SUPABASE_SERVICE_ROLE }}"
}
```

## 🔐 Security Configuration

### 1. N8N Basic Auth (Recommended)
```env
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=strong-password
```

### 2. Webhook Authentication
Add shared secret validation in N8N webhook node:
```javascript
if ($headers.authorization !== 'Bearer YOUR_SHARED_SECRET') {
  throw new Error('Unauthorized webhook call');
}
```

### 3. Reverse Proxy Setup (Nginx/Caddy)
```nginx
server {
    server_name n8n.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## 🧪 Testing the Migration

### 1. Test Webhook Manually
```javascript
// File: test-selfhosted-n8n.mjs
import fetch from 'node-fetch'

const webhookUrl = 'https://your-n8n-domain/webhook/[webhook-id]'
const testPayload = {
  trigger_source: 'manual_test',
  submission_id: 'test-123',
  record: {
    generic_name: 'test-drug',
    indication: 'test-indication',
    development_stage: 'Phase III'
  }
}

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SHARED_SECRET'
  },
  body: JSON.stringify(testPayload)
})

console.log('Response:', await response.json())
```

### 2. Test Supabase Trigger
```sql
-- In Supabase SQL Editor
SELECT test_n8n_webhook('existing-submission-uuid');
```

### 3. Test End-to-End Flow
1. Submit form at https://3cubed-seo.netlify.app/seo-requests
2. Check N8N execution logs
3. Verify AI processing completed
4. Check dashboard at https://3cubed-seo.netlify.app/seo-review

## 📊 Monitoring

### N8N Execution Logs
- Access at: `https://your-n8n-domain/workflow/[workflow-id]/executions`
- Monitor for failed executions
- Check webhook response times

### Database Monitoring
```sql
-- Check recent trigger activity
SELECT 
  id,
  ai_processing_status,
  workflow_stage,
  error_message,
  updated_at
FROM submissions
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## 🚨 Rollback Plan

If issues occur, you can temporarily revert to N8N Cloud:
```sql
-- Update the webhook URL back to cloud
UPDATE n8n_config 
SET value = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt'
WHERE key = 'n8n_webhook_url';
```

## 📝 Post-Migration Tasks

- [ ] Update all documentation references
- [ ] Update CLAUDE.md with new N8N URL
- [ ] Test all workflow paths
- [ ] Set up monitoring alerts
- [ ] Document new backup procedures
- [ ] Train team on self-hosted access

## 🔗 Useful Resources

- N8N Self-Hosting Docs: https://docs.n8n.io/hosting/
- Docker Compose Setup: https://github.com/n8n-io/n8n/blob/master/docker/compose/docker-compose.yml
- Hetzner Cloud Setup: https://community.n8n.io/t/tutorial-installing-n8n-on-hetzner-cloud/