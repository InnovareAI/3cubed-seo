-- Migration: Rename langchain columns to generic AI terms
-- Date: 2025-01-24
-- Purpose: Remove langchain-specific naming to support multiple AI agents

-- Rename langchain columns to generic AI terms
ALTER TABLE submissions 
  RENAME COLUMN langchain_phase TO ai_phase;

ALTER TABLE submissions 
  RENAME COLUMN langchain_status TO ai_status;

ALTER TABLE submissions 
  RENAME COLUMN langchain_retry_count TO ai_retry_count;

ALTER TABLE submissions 
  RENAME COLUMN langchain_error TO ai_error_legacy;

ALTER TABLE submissions 
  RENAME COLUMN langchain_last_retry TO ai_last_retry;

-- Note: ai_error column already exists (added in previous migration)
-- The langchain_error column is being renamed to ai_error_legacy to preserve any existing data

-- After running this migration:
-- 1. Update n8n workflow to use new column names:
--    - langchain_phase → ai_phase
--    - langchain_status → ai_status  
--    - langchain_retry_count → ai_retry_count
--    - langchain_error → ai_error (new column)
--    - langchain_last_retry → ai_last_retry
-- 2. Update any views that reference these columns
-- 3. Update application code to use new column names
