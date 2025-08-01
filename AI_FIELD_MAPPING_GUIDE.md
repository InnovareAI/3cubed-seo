# AI-Generated Field Mapping Guide

## Overview
This document maps all AI-generated fields from the processing pipeline to their display locations in the SEO Review dashboard.

## Database Schema - AI Generated Fields

### Core SEO Fields
```sql
-- Primary SEO content
seo_title VARCHAR(60)              -- AI-generated SEO title
meta_description TEXT              -- AI-generated meta description
h1_tag TEXT                       -- Main page heading
h2_tags TEXT[]                    -- Array of subheadings
seo_keywords TEXT[]               -- Primary keywords
long_tail_keywords TEXT[]         -- Long-tail keyword variations

-- Content strategy
seo_strategy_outline TEXT         -- Overall SEO strategy
content_strategy TEXT             -- Content approach (from GEO)
competitive_advantages TEXT[]     -- Key differentiators
```

### GEO-Specific Fields
```sql
-- GEO optimization
geo_event_tags TEXT[]            -- Event-based keywords
geo_optimization JSONB           -- Complete GEO data structure
geo_optimization_score INTEGER   -- AI readiness score
primary_geo_market VARCHAR(100)  -- Primary geographic target
secondary_geo_markets TEXT[]     -- Additional markets

-- GEO JSONB structure includes:
{
  "ai_summary": "...",
  "voice_search_answers": {},
  "medical_facts": {},
  "evidence_statistics": [],
  "citations": {},
  "ai_friendly_summary": "...",
  "event_tags": {
    "perplexity": [],
    "claude": [],
    "chatgpt": [],
    "gemini": []
  },
  "key_facts": []
}
```

### AI Processing Metadata
```sql
-- FDA enrichment
fda_data JSONB                    -- Complete FDA query results
fda_data_sources TEXT[]           -- Which FDA databases were queried
fda_enrichment_timestamp TIMESTAMP -- When FDA data was fetched

-- Quality scores
qa_scores JSONB                   -- Claude QA review scores
qa_score INTEGER                  -- Overall quality score
compliance_score INTEGER          -- FDA compliance score
medical_accuracy INTEGER          -- Medical accuracy score
seo_effectiveness INTEGER         -- SEO effectiveness score

-- Processing status
ai_output JSONB                   -- Complete AI processing results
workflow_stage TEXT               -- Current processing stage
ai_processing_status TEXT         -- AI pipeline status
error_message TEXT                -- Any processing errors
```

### Enhanced Content Fields (from GEO)
```sql
-- Question-based content
consumer_questions JSONB[]        -- Patient FAQs with answers
hcp_questions JSONB[]            -- HCP-focused Q&As

-- Structured content
primary_keywords TEXT[]           -- High-value keywords
competitive_analysis JSONB        -- Competitor insights
seo_enhancements JSONB           -- Additional optimizations
dashboard_data JSONB             -- Formatted for display
```

## Frontend Display Mapping

### SEO Review List Page (`/seo-review`)

#### Grid View Card Display:
- **Product Name**: `submission.product_name`
- **Therapeutic Area**: `submission.therapeutic_area`
- **Priority Badge**: `submission.priority_level`
- **GEO Score**: `calculateGEOScore(submission).percentage`
- **Workflow Stage**: `submission.workflow_stage`
- **Created Date**: `submission.created_at`

#### List View Table Columns:
1. Product Name
2. Therapeutic Area  
3. Priority
4. GEO Score (with visual indicator)
5. Stage
6. Submitted By
7. Date

### SEO Review Detail Page (`/seo-review/:id`)

#### SEO Core Output Section
Displays the 4 mandatory inputs that drive AI generation:
1. **Development Stage**: `submission.development_stage`
2. **Product Name**: Conditional based on stage
   - Market Launch: `submission.product_name`
   - Earlier stages: `submission.generic_name`
3. **Indication**: `submission.medical_indication`
4. **Therapeutic Area**: `submission.therapeutic_area`

#### AI-Generated Fields Display:

##### 1. SEO Title Tag
- **Field**: `submission.seo_title`
- **Component**: `FieldApprovalControl`
- **Character Limit**: 60
- **Validation**: Length check

##### 2. Meta Description
- **Field**: `submission.meta_description`
- **Component**: `FieldApprovalControl`
- **Character Limit**: 155
- **Validation**: Length check

##### 3. H1 Main Heading
- **Field**: `submission.h1_tag`
- **Component**: `FieldApprovalControl`
- **Display**: Single editable field

##### 4. H2 Subheadings
- **Field**: `submission.h2_tags[]`
- **Component**: Individual `FieldApprovalControl` for each
- **Display**: List with individual approval

##### 5. Target Keywords
- **Fields**: Combined display of:
  - `submission.seo_keywords[]`
  - `submission.long_tail_keywords[]`
- **Display**: Tag list with 10-15 terms

##### 6. Body Content Summary
- **Field**: `submission.ai_generated_content?.body_preview`
- **Fallback**: Generated from product/indication
- **Character Limit**: 800

##### 7. Schema Markup
- **Field**: `submission.ai_generated_content?.schema_markup`
- **Format**: JSON-LD
- **Display**: Code editor view

#### GEO Optimization Section

##### GEO Event Tags
- **Field**: `submission.geo_event_tags[]`
- **Display**: Tag list

##### AI-Friendly Summary
- **Field**: `submission.geo_optimization.ai_friendly_summary`
- **Display**: Text block with purple background

##### Platform-Specific Tags
- **Field**: `submission.geo_optimization.event_tags`
- **Platforms**: perplexity, claude, chatgpt, gemini
- **Display**: Grid layout by platform

##### Key Facts for AI
- **Field**: `submission.geo_optimization.key_facts[]`
- **Display**: Bulleted list

### GEO Score Calculation

The GEO score is calculated based on:
1. **Content Completeness** (40%)
   - SEO title presence
   - Meta description presence
   - H1/H2 tags
   - Keywords

2. **AI Optimization** (30%)
   - Conversational headers
   - Question-based keywords
   - FAQ content
   - Entity relationships

3. **Technical SEO** (30%)
   - Schema markup
   - Page structure
   - Mobile optimization
   - Load speed

### Field Processing Flow

1. **Form Submission** → Creates record with basic fields
2. **FDA Query** → Populates:
   - `fda_data`
   - `fda_data_sources`
   - `fda_enrichment_timestamp`

3. **Perplexity Generation** → Creates:
   - `seo_title`
   - `meta_description`
   - `h1_tag`
   - `h2_tags`
   - `seo_keywords`
   - `long_tail_keywords`
   - `consumer_questions`
   - `content_strategy`
   - `geo_event_tags`

4. **Claude QA Review** → Adds:
   - `qa_scores`
   - `compliance_score`
   - `medical_accuracy`
   - `seo_effectiveness`
   - `qa_score` (overall)

5. **Final Processing** → Updates:
   - `workflow_stage` → 'ai_complete'
   - `ai_output` → Complete results
   - `geo_optimization_score` → Calculated

### Approval Workflow

Each field supports individual approval with:
- **Status**: approved/rejected/pending
- **Notes**: Reviewer comments
- **Timestamp**: When reviewed
- **Reviewer**: Who approved

Bulk actions available for:
- Approve all fields
- Reject with notes
- Request revisions

### Export Formats

AI-generated content can be exported as:
1. **CSV**: Flat structure with all fields
2. **PDF**: Formatted report with sections
3. **JSON**: Complete data structure
4. **HTML**: Ready-to-publish format

## Implementation Notes

### Adding New AI Fields

1. **Database**: Add column to submissions table
2. **AI Function**: Update Perplexity/Claude to generate
3. **API**: Update Railway PUT endpoint to handle
4. **Frontend**: Add to `Submission` interface
5. **Display**: Add `FieldApprovalControl` component

### Field Validation

- **Character Limits**: Enforced in frontend and database
- **Array Fields**: PostgreSQL array format `{value1,value2}`
- **JSON Fields**: Stored as JSONB for querying
- **Timestamps**: Auto-set on processing

### Performance Considerations

- **Lazy Loading**: GEO optimization data loaded on expand
- **Batch Updates**: Multiple fields updated together
- **Caching**: AI results cached in `ai_output`
- **Real-time**: Updates via Railway API polling