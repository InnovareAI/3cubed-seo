# 3Cubed SEO Platform - Production Configuration

**Last Updated:** July 31, 2025  
**Environment:** Production (Self-Hosted)

---

## 🌐 **System URLs & Endpoints**

### **Frontend (React)**
- **Form Submission:** https://3cubed-seo.netlify.app/seo-requests
- **Dashboard Review:** https://3cubed-seo.netlify.app/seo-review
- **Repository:** https://github.com/InnovareAI/3cubed-seo

### **N8N Workflow (Self-Hosted on Hetzner)**
- **Workflow URL:** https://workflows.innovareai.com/workflow/JNhVU38JFlwdRuKv
- **Webhook Endpoint:** https://workflows.innovareai.com/webhook/JNhVU38JFlwdRuKv
- **Instance:** Self-hosted on Hetzner (migrated from n8n Cloud)

### **Database (Supabase)**
- **Project URL:** https://ktchrfgkbpaixbiwbieg.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/ktchrfgkbpaixbiwbieg
- **Main Table:** `submissions`

---

## 🔐 **Authentication & Security**

### **Supabase API Keys**
```env
SUPABASE_URL=https://ktchrfgkbpaixbiwbieg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTQ1NjAsImV4cCI6MjA2Nzk5MDU2MH0.NH8E52ypjXoI4wMVuXkaXkrwzw7vr7dYRk48sHuqMkw
SUPABASE_SERVICE_ROLE=[TO_BE_CONFIGURED]
```

### **AI API Keys**
```env
# Perplexity AI
PERPLEXITY_API_KEY=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

# Claude AI (Anthropic)
CLAUDE_API_KEY=[TO_BE_CONFIGURED]
```

### **N8N Security**
```env
# Basic Auth for N8N Instance
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[TO_BE_SET]

# Webhook Security
WEBHOOK_SHARED_SECRET=[TO_BE_GENERATED]
```

---

## 🔄 **Data Flow Architecture**

### **Complete Processing Pipeline**
```
1. React Form → Supabase INSERT (anon key)
2. Supabase Trigger → N8N Webhook (shared secret)
3. N8N Workflow → FDA APIs + Perplexity + Claude
4. N8N → Supabase UPDATE (service_role key)
5. Dashboard ← Supabase SELECT (anon key)
```

### **Current Status**
- ✅ **Frontend:** Production ready
- ✅ **Supabase:** Configured and tested
- 🔄 **N8N Migration:** In progress (Cloud → Self-hosted)
- ❌ **Supabase Trigger:** Needs update to new webhook URL

---

## 🛠 **Migration Tasks**

### **Completed**
- [x] Set up self-hosted N8N on Hetzner
- [x] Update workflow URL to https://workflows.innovareai.com/
- [x] Test form submission flow

### **Pending**
- [ ] Update Supabase trigger to call new N8N webhook
- [ ] Configure service_role authentication in N8N
- [ ] Migrate workflow from n8n Cloud to self-hosted
- [ ] Test complete end-to-end flow
- [ ] Decommission n8n Cloud instance

---

## 📊 **Database Schema**

### **Submissions Table Structure**
```sql
-- Core submission fields
id: uuid (primary key)
generic_name: text (required)
product_name: text (optional)
indication: text (required)
therapeutic_area: text (required)
submitter_name: text (required)
submitter_email: text (required)

-- AI Processing fields
seo_title: text
meta_description: text
seo_keywords: text[]
h2_tags: text[]
ai_output: jsonb
qa_score: integer
workflow_stage: text
ai_processing_status: text

-- Timestamps
created_at: timestamp
last_updated: timestamp
```

---

## 🔧 **N8N Workflow Configuration**

### **Required Environment Variables**
```env
# Supabase Connection
SUPABASE_URL=https://ktchrfgkbpaixbiwbieg.supabase.co
SUPABASE_SERVICE_ROLE=[SERVICE_ROLE_KEY]

# AI APIs
PERPLEXITY_API_KEY=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
CLAUDE_API_KEY=[CLAUDE_KEY]

# Security
WEBHOOK_SHARED_SECRET=[SHARED_SECRET]
```

### **HTTP Request Node Configuration**
```json
{
  "method": "POST",
  "url": "{{ $env.SUPABASE_URL }}/rest/v1/submissions",
  "headers": {
    "Content-Type": "application/json",
    "apikey": "{{ $env.SUPABASE_SERVICE_ROLE }}",
    "Authorization": "Bearer {{ $env.SUPABASE_SERVICE_ROLE }}"
  }
}
```

---

## 🔒 **Supabase Trigger Update**

### **Current Trigger (TO BE UPDATED)**
```sql
-- OLD trigger pointing to Netlify function
-- Needs to be updated to point to new N8N endpoint
```

### **New Trigger Configuration**
```sql
CREATE OR REPLACE FUNCTION notify_n8n_workflow()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  payload := json_build_object(
    'trigger_source', 'supabase_insert',
    'submission_id', NEW.id,
    'record', row_to_json(NEW)
  );

  PERFORM http_post(
    'https://workflows.innovareai.com/webhook/JNhVU38JFlwdRuKv',
    payload::text,
    'application/json',
    '{"Authorization": "Bearer [SHARED_SECRET]"}'
  );

  -- Update processing status
  UPDATE submissions 
  SET 
    ai_processing_status = 'triggered',
    workflow_stage = 'ai_processing',
    last_updated = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER trigger_notify_n8n
  AFTER INSERT ON submissions
  FOR EACH ROW 
  EXECUTE FUNCTION notify_n8n_workflow();
```

---

## 🧪 **Testing Endpoints**

### **Health Checks**
```bash
# Test N8N webhook
curl -X POST 'https://workflows.innovareai.com/webhook/JNhVU38JFlwdRuKv' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'

# Test Supabase connection
curl -X GET 'https://ktchrfgkbpaixbiwbieg.supabase.co/rest/v1/submissions?select=id&limit=1' \
  -H "apikey: [ANON_KEY]"
```

---

## 📈 **Performance Metrics**

### **Current Performance**
- **Form → Supabase:** < 1 second
- **AI Processing:** 7-15 seconds (Netlify function baseline)
- **Dashboard Load:** < 2 seconds

### **Expected Performance (N8N)**
- **Form → Supabase:** < 1 second
- **N8N Processing:** 10-20 seconds (more complex pipeline)
- **Dashboard Updates:** Real-time via Supabase subscriptions

---

## 🚨 **Emergency Contacts & Procedures**

### **System Status**
- **Frontend:** Hosted on Netlify (auto-deploy from GitHub)
- **Database:** Supabase managed service (99.9% uptime SLA)
- **N8N:** Self-hosted on Hetzner (monitoring needed)

### **Rollback Procedures**
1. **N8N Issues:** Revert Supabase trigger to call Netlify function
2. **Database Issues:** Use Supabase dashboard for manual intervention
3. **Frontend Issues:** Rollback GitHub deploy via Netlify dashboard

---

## 📝 **Change Log**

### **2025-07-31**
- Migrated from n8n Cloud to self-hosted Hetzner instance
- Updated workflow URL to https://workflows.innovareai.com/workflow/JNhVU38JFlwdRuKv
- Discovered existing Netlify function was still processing submissions
- Identified need to update Supabase trigger configuration

### **Previous Versions**
- N8N Cloud URL: https://innovareai.app.n8n.cloud/workflow/hP9yZxUjmBKJmrZt (deprecated)
- Netlify Function: /.netlify/functions/process-submission (backup)