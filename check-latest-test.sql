SELECT 
    id,
    product_name,
    submitter_name,
    submitter_email,
    created_at
FROM submissions 
WHERE 
    created_at >= NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;