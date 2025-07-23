-- =====================================================
-- 3CUBED SEO SYSTEM VALIDATION QUERIES
-- Run these in order to validate all fixes
-- =====================================================

-- 1. VERIFY TABLE VS VIEW STRUCTURE
-- Check if pharma_seo_submissions is a view or table
SELECT 
    schemaname,
    tablename as object_name,
    'TABLE' as object_type
FROM pg_tables 
WHERE tablename = 'pharma_seo_submissions'
UNION ALL
SELECT 
    schemaname,
    viewname as object_name,
    'VIEW' as object_type
FROM pg_views 
WHERE viewname = 'pharma_seo_submissions';

-- 2. CHECK BASE TABLE COLUMNS
-- Verify critical columns exist in submissions table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
AND column_name IN ('id', 'meta_title', 'meta_description', 'seo_keywords', 
                    'ai_processing_status', 'workflow_stage', 'qa_status', 
                    'qa_score', 'qa_feedback', 'ai_generated_content')
ORDER BY column_name;

-- 3. VERIFY VIEW DEFINITION
-- Check what columns the view exposes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pharma_seo_submissions'
AND column_name IN ('id', 'meta_title', 'meta_description', 'seo_keywords', 
                    'ai_processing_status', 'workflow_stage')
ORDER BY column_name;

-- 4. TEST FORM SUBMISSION COMPATIBILITY
-- Verify INSERT works on the view
EXPLAIN (VERBOSE, COSTS FALSE)
INSERT INTO pharma_seo_submissions (
    submitter_name,
    submitter_email,
    product_name,
    therapeutic_area,
    stage,
    indication,
    mechanism_of_action,
    competitive_landscape,
    key_differentiators,
    target_audience,
    target_markets,
    raw_input_content,
    priority_level,
    ai_processing_status,
    workflow_stage,
    compliance_id
) VALUES (
    'Test User',
    'test@example.com',
    'Test Product',
    'Oncology',
    'Phase III',
    'Test Indication',
    'Test MOA',
    'Test Competitors',
    'Test Advantages',
    'Test Audience',
    'Test Markets',
    '{}',
    'Medium',
    'pending',
    'Form_Submitted',
    'COMP-TEST'
);

-- 5. VERIFY N8N QUERY COMPATIBILITY
-- Test each n8n query pattern

-- 5a. Get Submission Query
EXPLAIN (VERBOSE, COSTS FALSE)
SELECT * FROM pharma_seo_submissions 
WHERE id = '12182ddd-c266-4d4a-9f79-13dca5bbaf7a'
LIMIT 1;

-- 5b. Update Status Query
EXPLAIN (VERBOSE, COSTS FALSE)
UPDATE pharma_seo_submissions 
SET ai_processing_status = 'processing',
    workflow_stage = 'AI_Processing'
WHERE id = '12182ddd-c266-4d4a-9f79-13dca5bbaf7a';

-- 5c. Update AI Content Query (CRITICAL TEST)
EXPLAIN (VERBOSE, COSTS FALSE)
UPDATE pharma_seo_submissions 
SET ai_generated_content = '{"test": "content"}',
    meta_title = 'Test Title',
    meta_description = 'Test Description',
    seo_keywords = '{"keywords": ["test1", "test2"]}',
    workflow_stage = 'QA_Review'
WHERE id = '12182ddd-c266-4d4a-9f79-13dca5bbaf7a';

-- 5d. Update Failed Query
EXPLAIN (VERBOSE, COSTS FALSE)
UPDATE pharma_seo_submissions 
SET ai_processing_status = 'failed',
    workflow_stage = 'Failed'
WHERE id = '12182ddd-c266-4d4a-9f79-13dca5bbaf7a';

-- 5e. Update QA Results Query
EXPLAIN (VERBOSE, COSTS FALSE)
UPDATE pharma_seo_submissions 
SET qa_status = 'approved',
    qa_score = 95,
    qa_feedback = 'Looks good',
    workflow_stage = 'Completed'
WHERE id = '12182ddd-c266-4d4a-9f79-13dca5bbaf7a';

-- 6. CHECK DATA TYPE COMPATIBILITY
-- Verify object vs text type handling
SELECT 
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.data_type = 'text' THEN 'TEXT - Compatible'
        WHEN c.data_type = 'jsonb' THEN 'JSONB - Check n8n formatting'
        WHEN c.data_type = 'json' THEN 'JSON - Check n8n formatting'
        ELSE 'OTHER - ' || c.data_type
    END as compatibility_note
FROM information_schema.columns c
WHERE c.table_name = 'submissions'
AND c.column_name IN ('meta_title', 'meta_description', 'seo_keywords', 
                      'ai_generated_content', 'qa_feedback')
ORDER BY c.column_name;

-- 7. COUNT EXISTING RECORDS
-- Check how many records exist
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN ai_processing_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN ai_processing_status = 'processing' THEN 1 END) as processing,
    COUNT(CASE WHEN ai_processing_status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN ai_processing_status = 'failed' THEN 1 END) as failed
FROM pharma_seo_submissions;

-- 8. CHECK FOR NULL VALUES IN CRITICAL COLUMNS
-- Identify potential issues with existing data
SELECT 
    COUNT(*) as total_records,
    COUNT(id) as has_id,
    COUNT(meta_title) as has_meta_title,
    COUNT(meta_description) as has_meta_description,
    COUNT(seo_keywords) as has_seo_keywords,
    COUNT(ai_processing_status) as has_status,
    COUNT(workflow_stage) as has_stage
FROM pharma_seo_submissions;

-- 9. VERIFY VIEW UPDATABILITY
-- Check if the view is updatable
SELECT 
    table_name,
    is_insertable_into,
    is_updatable,
    is_trigger_insertable_into,
    is_trigger_updatable
FROM information_schema.views
WHERE table_name = 'pharma_seo_submissions';

-- 10. FINAL VALIDATION - TEST COMPLETE FLOW
-- This simulates the entire workflow
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    validation_passed BOOLEAN := true;
    error_message TEXT := '';
BEGIN
    -- Test 1: Insert (Form Submission)
    BEGIN
        INSERT INTO pharma_seo_submissions (
            id,
            submitter_name,
            submitter_email,
            product_name,
            ai_processing_status,
            workflow_stage
        ) VALUES (
            test_id,
            'Validation Test',
            'validate@test.com',
            'Test Product',
            'pending',
            'Form_Submitted'
        );
    EXCEPTION WHEN OTHERS THEN
        validation_passed := false;
        error_message := error_message || 'INSERT FAILED: ' || SQLERRM || '; ';
    END;

    -- Test 2: Update Status
    BEGIN
        UPDATE pharma_seo_submissions 
        SET ai_processing_status = 'processing',
            workflow_stage = 'AI_Processing'
        WHERE id = test_id;
    EXCEPTION WHEN OTHERS THEN
        validation_passed := false;
        error_message := error_message || 'STATUS UPDATE FAILED: ' || SQLERRM || '; ';
    END;

    -- Test 3: Update AI Content (CRITICAL)
    BEGIN
        UPDATE pharma_seo_submissions 
        SET meta_title = 'Test Title',
            meta_description = 'Test Description',
            seo_keywords = '{"keywords": ["test"]}',
            workflow_stage = 'QA_Review'
        WHERE id = test_id;
    EXCEPTION WHEN OTHERS THEN
        validation_passed := false;
        error_message := error_message || 'AI CONTENT UPDATE FAILED: ' || SQLERRM || '; ';
    END;

    -- Test 4: Update QA
    BEGIN
        UPDATE pharma_seo_submissions 
        SET qa_status = 'approved',
            qa_score = 100,
            qa_feedback = 'Test passed',
            workflow_stage = 'Completed'
        WHERE id = test_id;
    EXCEPTION WHEN OTHERS THEN
        validation_passed := false;
        error_message := error_message || 'QA UPDATE FAILED: ' || SQLERRM || '; ';
    END;

    -- Clean up test record
    DELETE FROM submissions WHERE id = test_id;

    -- Report results
    IF validation_passed THEN
        RAISE NOTICE 'VALIDATION PASSED: All operations successful';
    ELSE
        RAISE EXCEPTION 'VALIDATION FAILED: %', error_message;
    END IF;
END $$;

-- =====================================================
-- EXPECTED RESULTS:
-- 1. pharma_seo_submissions should be a VIEW
-- 2. submissions table should have meta_title column
-- 3. All EXPLAIN queries should succeed
-- 4. View should be updatable
-- 5. Final validation should show "VALIDATION PASSED"
-- =====================================================