-- Comprehensive check for active triggers and webhook setup
-- Run these queries in your Supabase SQL editor

-- 1. List all triggers on the submissions table
SELECT 
    tg.tgname as trigger_name,
    tg.tgenabled as is_enabled,
    CASE 
        WHEN tg.tgenabled = 'O' THEN 'ENABLED'
        WHEN tg.tgenabled = 'D' THEN 'DISABLED'
        WHEN tg.tgenabled = 'R' THEN 'REPLICA ONLY'
        WHEN tg.tgenabled = 'A' THEN 'ALWAYS'
    END as trigger_status,
    p.proname as function_name,
    CASE
        WHEN tg.tgtype & 2 = 2 THEN 'BEFORE'
        ELSE 'AFTER'
    END as trigger_timing,
    CASE
        WHEN tg.tgtype & 4 = 4 THEN 'INSERT'
        WHEN tg.tgtype & 8 = 8 THEN 'DELETE'
        WHEN tg.tgtype & 16 = 16 THEN 'UPDATE'
        WHEN tg.tgtype & 32 = 32 THEN 'TRUNCATE'
    END as trigger_event
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE c.relname = 'submissions'
  AND tg.tgname NOT LIKE 'pg_%'  -- Exclude system triggers
ORDER BY tg.tgname;

-- 2. Check if the trigger_n8n_webhook function exists and see its source
SELECT 
    p.proname as function_name,
    p.pronargs as num_arguments,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'trigger_n8n_webhook'
  AND n.nspname = 'public';

-- 3. Check if pg_net extension is enabled
SELECT 
    e.extname as extension_name,
    e.extversion as version,
    n.nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
WHERE e.extname = 'pg_net';

-- 4. Check if the n8n_webhook_executions table exists
SELECT 
    t.table_name,
    t.table_type,
    obj_description(c.oid) as table_comment
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
WHERE t.table_name = 'n8n_webhook_executions'
  AND t.table_schema = 'public';

-- If the table exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'n8n_webhook_executions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check recent webhook executions (if table exists)
-- This will error if the table doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'n8n_webhook_executions' 
               AND table_schema = 'public') THEN
        RAISE NOTICE 'Table n8n_webhook_executions exists. Run this query separately:';
        RAISE NOTICE 'SELECT * FROM n8n_webhook_executions ORDER BY created_at DESC LIMIT 10;';
    ELSE
        RAISE NOTICE 'Table n8n_webhook_executions does not exist';
    END IF;
END $$;

-- 6. List all functions that might be related to SEO automation
SELECT 
    p.proname as function_name,
    p.pronargs as num_arguments,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END as volatility,
    obj_description(p.oid) as function_comment
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    p.proname LIKE '%seo%' 
    OR p.proname LIKE '%automation%' 
    OR p.proname LIKE '%webhook%' 
    OR p.proname LIKE '%n8n%'
  )
ORDER BY p.proname;

-- 7. Check for any active pg_net HTTP requests in the queue
SELECT 
    id,
    method,
    url,
    status,
    created
FROM net._http_request
ORDER BY created DESC
LIMIT 10;

-- 8. Check seo_automation_logs table for recent activity
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'seo_automation_logs' 
               AND table_schema = 'public') THEN
        RAISE NOTICE 'Table seo_automation_logs exists. Run this query separately:';
        RAISE NOTICE 'SELECT * FROM seo_automation_logs ORDER BY created_at DESC LIMIT 10;';
    ELSE
        RAISE NOTICE 'Table seo_automation_logs does not exist';
    END IF;
END $$;

-- 9. Summary of all automation-related objects
SELECT 'TRIGGERS' as object_type, COUNT(*) as count
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid
WHERE c.relname = 'submissions' AND tg.tgname NOT LIKE 'pg_%'
UNION ALL
SELECT 'WEBHOOK FUNCTIONS', COUNT(*)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname LIKE '%webhook%'
UNION ALL
SELECT 'SEO FUNCTIONS', COUNT(*)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname LIKE '%seo%'
UNION ALL
SELECT 'AUTOMATION TABLES', COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND (table_name LIKE '%webhook%' OR table_name LIKE '%automation%');