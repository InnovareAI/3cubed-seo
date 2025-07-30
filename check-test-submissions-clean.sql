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