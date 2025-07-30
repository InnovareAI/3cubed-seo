-- Check for test submissions - run one query at a time

-- Query 1: Find test submissions
SELECT 
    id,
    product_name,
    submitter_name,
    submitter_email,
    created_at
FROM submissions 
WHERE 
    LOWER(product_name) LIKE '%test%' 
    OR LOWER(submitter_name) LIKE '%test%'
    OR LOWER(submitter_email) LIKE '%test%'
ORDER BY created_at DESC;

-- Query 2: Most recent submissions
SELECT 
    id,
    product_name,
    submitter_name,
    created_at
FROM submissions 
ORDER BY created_at DESC;

-- Query 3: Count submissions today
SELECT COUNT(*) as submissions_today
FROM submissions 
WHERE DATE(created_at) = CURRENT_DATE;