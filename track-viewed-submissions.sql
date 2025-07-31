-- Track which submissions have been viewed in SEO Review

-- 1. Create table to track viewed submissions
CREATE TABLE IF NOT EXISTS seo_review_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  viewed_by TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, viewed_by)
);

-- 2. Add index for fast lookups
CREATE INDEX idx_seo_review_views_submission ON seo_review_views(submission_id);
CREATE INDEX idx_seo_review_views_user ON seo_review_views(viewed_by);

-- 3. Grant permissions
GRANT SELECT, INSERT ON seo_review_views TO anon;

-- 4. Function to mark as viewed
CREATE OR REPLACE FUNCTION mark_submission_viewed(
  p_submission_id UUID,
  p_user_email TEXT DEFAULT 'anonymous'
)
RETURNS void AS $$
BEGIN
  INSERT INTO seo_review_views (submission_id, viewed_by)
  VALUES (p_submission_id, p_user_email)
  ON CONFLICT (submission_id, viewed_by) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 5. View to get submissions with viewed status
CREATE OR REPLACE VIEW seo_review_with_status AS
SELECT 
  s.*,
  CASE 
    WHEN srv.submission_id IS NULL THEN TRUE
    ELSE FALSE
  END as is_new
FROM submissions s
LEFT JOIN seo_review_views srv ON s.id = srv.submission_id AND srv.viewed_by = 'anonymous'
ORDER BY s.created_at DESC;

-- Grant permission
GRANT SELECT ON seo_review_with_status TO anon;