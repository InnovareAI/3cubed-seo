# Self-Hosted n8n + Supabase Setup Guide

## Special Requirements for Self-Hosted n8n

### 1. PostgreSQL HTTP Extension
Since Supabase uses PostgreSQL, your self-hosted n8n needs to communicate via REST API, not direct database connection.

**DO NOT use the Postgres node** - Use HTTP Request nodes instead.

### 2. Network Configuration
Your Hetzner server needs to:
- Allow outbound HTTPS traffic to Supabase (port 443)
- No special firewall rules needed (outbound is usually open)

### 3. Supabase Connection Setup

#### For Reading Data:
```
Node: HTTP Request
Method: GET
URL: https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions
Query Parameters:
  - id=eq.{{ $json.submission_id }}
  - select=*
Headers:
  - apikey: [SERVICE_ROLE_KEY]
  - Authorization: Bearer [SERVICE_ROLE_KEY]
```

#### For Updating Data:
```
Node: HTTP Request  
Method: PATCH
URL: https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions
Query Parameters:
  - id=eq.{{ $json.submission_id }}
Headers:
  - apikey: [SERVICE_ROLE_KEY]
  - Authorization: Bearer [SERVICE_ROLE_KEY]
  - Content-Type: application/json
  - Prefer: return=representation
Body: JSON with your updates
```

### 4. Common Issues with Self-Hosted n8n

1. **SSL/TLS Issues**
   - Ensure n8n trusts Supabase's SSL certificate
   - May need to set `NODE_TLS_REJECT_UNAUTHORIZED=0` (not recommended for production)

2. **DNS Resolution**
   - Verify your server can resolve supabase.co domains
   - Test: `nslookup eqokpqqjdzbzatbmqiea.supabase.co`

3. **Environment Variables**
   Add to your n8n docker-compose or env:
   ```
   N8N_PROTOCOL=https
   N8N_HOST=workflows.innovareai.com
   WEBHOOK_URL=https://workflows.innovareai.com
   ```

### 5. Testing Connection
From your Hetzner server, test:
```bash
curl -X GET \
  'https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions?select=id&limit=1' \
  -H 'apikey: YOUR_SERVICE_ROLE_KEY' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

### 6. n8n Supabase Node vs HTTP Request

**Don't use the n8n Supabase node** if you see errors. Instead use HTTP Request nodes because:
- More control over headers
- Better error messages
- Works reliably with self-hosted setups

### 7. Service Role Key Required
You MUST use the SERVICE ROLE key, not the ANON key because:
- Service role bypasses RLS (Row Level Security)
- Has full read/write access
- Required for server-to-server communication

### 8. Webhook Security
Since your n8n is publicly accessible, consider:
- Adding webhook authentication
- IP whitelisting (allow only Supabase IPs)
- Using a secret token in the webhook URL