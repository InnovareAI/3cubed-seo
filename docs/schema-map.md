# 3Cubed SEO Schema Map & Field Mapping

## Database Schema: pharma_seo_submissions

### Primary Key
- **id** (string) - UUID primary key

### Core Business Fields
| Column | Type | Description | Used By |
|--------|------|-------------|---------|
| product_name | text | Product/project name | Form, n8n, Display |
| therapeutic_area | text | Medical specialty area | Form, n8n, Display |
| indication | text | Condition being treated | Form, n8n, Display |
| stage | text | Development stage (Phase III, etc) | Form, n8n, Display |
| mechanism_of_action | text | How the product works | Form, n8n |
| competitive_landscape | text | Competitor information | Form, n8n |
| key_differentiators | text | Key advantages | Form, n8n |
| target_audience | text | Target demographics | Form, n8n |
| target_markets | text | Geographic targets | Form, n8n |

### Submission & Review Fields
| Column | Type | Description | Used By |
|--------|------|-------------|---------|
| submitter_name | text | SEO reviewer name | Form |
| submitter_email | text | SEO reviewer email | Form |
| client_id | text | Client identifier | System |
| project_id | text | Project identifier | System |
| compliance_id | text | Compliance tracking ID | System |
| priority_level | text | Priority (High/Medium/Low) | System |

### AI Processing Fields
| Column | Type | Description | Used By |
|--------|------|-------------|---------|
| ai_processing_status | text | Current AI status | n8n, Display |
| workflow_stage | text | Current workflow stage | n8n, Display |
| ai_generated_content | text | AI-generated SEO content | n8n, Display |
| seo_keywords | jsonb | SEO keywords (OBJECT type) | n8n |
| raw_input_content | jsonb | Complete form data JSON | n8n |

### QA & Review Fields
| Column | Type | Description | Used By |
|--------|------|-------------|---------|
| qa_status | text | QA review status | n8n, Display |
| qa_score | numeric | QA quality score | n8n, Display |
| qa_feedback | text | QA review comments | n8n, Display |

### Timestamp Fields
| Column | Type | Description | Used By |
|--------|------|-------------|---------|
| created_at | timestamptz | Record creation time | System |
| updated_at | timestamptz | Last update time | System |

### Additional Fields (28 columns)
- Various supporting fields for extended data capture

## ⚠️ CRITICAL ISSUES IDENTIFIED

### 1. Missing Database Columns
**REQUIRED FIX:**
```sql
ALTER TABLE pharma_seo_submissions 
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;
```

These columns are referenced in n8n workflow but don't exist in database!

### 2. Type Mismatches
- **seo_keywords**: Database has JSONB (object), but n8n may expect text array
- **Potential issue**: Array operations on object type will fail

## Form → Database Mapping

### React Form Fields → Database Columns
```javascript
// Form submission data structure
{
  // Reviewer Information
  seo_reviewer_name → submitter_name
  seo_reviewer_email → submitter_email
  client_name → (stored in raw_input_content)
  client_reviewer_name → (stored in raw_input_content)
  client_reviewer_email → (stored in raw_input_content)
  mlr_reviewer_name → (stored in raw_input_content)
  mlr_reviewer_email → (stored in raw_input_content)
  
  // Basic Information
  stage → stage
  product_name → product_name
  product_code → (stored in raw_input_content)
  condition_treated → indication
  therapeutic_area → therapeutic_area
  
  // Target Demographics
  target_audience[] → target_audience (joined as string)
  geography[] → target_markets (joined as string)
  
  // Key Information
  key_advantages → key_differentiators
  competitor_names → competitive_landscape
  competitor_urls → (stored in raw_input_content)
  problem_solved → (stored in raw_input_content)
  treatment_settings[] → (stored in raw_input_content)
  
  // SEO Enhancement Fields
  mechanism_of_action → mechanism_of_action
  // All other optional fields → stored in raw_input_content JSON
}

// Additional fields set by system:
priority_level: 'Medium'
ai_processing_status: 'pending'
workflow_stage: 'Form_Submitted'
compliance_id: 'COMP-{timestamp}'
```

## n8n Workflow SQL Queries

### 1. Get Submission
```sql
SELECT * FROM pharma_seo_submissions 
WHERE id = '{{ $json.body.submission_id }}'
```

### 2. Update Status - Processing
```sql
UPDATE pharma_seo_submissions 
SET ai_processing_status = 'processing',
    workflow_stage = 'AI_Processing'
WHERE id = '{{ $node["Get Submission"].json[0].id }}'
```

### 3. Update DB with AI Content
```sql
UPDATE pharma_seo_submissions 
SET ai_generated_content = '{{ $json.ai_content }}',
    meta_title = '{{ $json.meta_title }}',        -- ❌ COLUMN MISSING!
    meta_description = '{{ $json.meta_description }}', -- ❌ COLUMN MISSING!
    seo_keywords = '{{ $json.keywords }}',
    workflow_stage = 'QA_Review'
WHERE id = '{{ $json.submission_id }}'
```

### 4. Update Submission - Failed
```sql
UPDATE pharma_seo_submissions 
SET ai_processing_status = 'failed',
    workflow_stage = 'Failed'
WHERE id = '{{ $node["Validate Phase"].json.record.id }}'
```

### 5. Update DB with QA Results
```sql
UPDATE pharma_seo_submissions 
SET qa_status = '{{ $json.qa_status }}',
    qa_score = {{ $json.qa_score }},
    qa_feedback = '{{ $json.qa_feedback }}',
    workflow_stage = 'Completed'
WHERE id = '{{ $json.submission_id }}'
```

## Data Flow

1. **Form Submission** → React App
   - Collects all form data
   - Maps to database columns
   - Stores extra data in `raw_input_content` JSON
   - Inserts into `pharma_seo_submissions`

2. **Webhook Trigger** → n8n
   - Webhook receives `submission_id`
   - Fetches full record from database

3. **AI Processing** → Perplexity/Claude
   - Generates SEO content
   - Returns meta_title, meta_description, keywords

4. **Database Update** → Supabase
   - Updates AI-generated content
   - ❌ FAILS on meta_title, meta_description

5. **QA Review** → Human Review
   - Reviews AI content
   - Provides score and feedback

6. **Final Update** → Supabase
   - Updates QA results
   - Sets workflow complete

## Required Actions

1. **IMMEDIATE**: Add missing database columns
2. **VERIFY**: n8n SQL queries after database fix
3. **TEST**: End-to-end submission flow
4. **MONITOR**: Check for seo_keywords type issues

## Verification Status
- ✅ Database schema: 100% verified
- ✅ Form mapping: Verified from code
- ⚠️ n8n queries: Inferred from previous analysis
- ❌ Runtime behavior: Not tested