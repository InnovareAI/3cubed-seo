-- Add ai_error column to replace langchain_error
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ai_error TEXT;

-- Copy existing langchain_error data to ai_error
UPDATE submissions 
SET ai_error = langchain_error::TEXT 
WHERE langchain_error IS NOT NULL;

-- Update the view to include ai_error
CREATE OR REPLACE VIEW pharma_seo_submissions AS
SELECT * FROM submissions;