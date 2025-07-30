# 3Cubed SEO Platform - Data Flow Architecture

## Current Implementation (with FDA Integration)

```mermaid
graph TB
    subgraph "Frontend - React App"
        A[SEO Request Form] -->|Submit| B[Form Validation]
        B -->|Valid| C[Save to Supabase]
    end
    
    subgraph "Database - Supabase"
        C -->|Insert| D[(submissions table)]
        D -->|Real-time| E[Dashboard Updates]
        D -->|Webhook| F[Netlify Function]
    end
    
    subgraph "Processing - Netlify Function"
        F -->|1. Fetch| G[Get Submission Data]
        G -->|2. Enrich| H[FDA API Integration]
        
        subgraph "FDA Data Sources"
            H --> I[ClinicalTrials.gov]
            H --> J[Drugs@FDA]
            H --> K[FAERS Adverse Events]
        end
        
        H -->|3. Generate| L[Perplexity AI]
        L -->|4. Review| M[Claude QA]
        M -->|5. Update| D
    end
    
    subgraph "Real-time Updates"
        D -.->|Subscription| N[Dashboard Component]
        N -->|Display| O[Live Progress]
    end
    
    style A fill:#4CAF50
    style D fill:#2196F3
    style H fill:#FF9800
    style L fill:#9C27B0
    style M fill:#F44336
```

## Data Structure Flow

```mermaid
sequenceDiagram
    participant User
    participant Form
    participant Supabase
    participant Netlify
    participant FDA
    participant Perplexity
    participant Claude
    participant Dashboard
    
    User->>Form: Fill pharmaceutical data
    Form->>Supabase: Insert submission
    Supabase-->>Form: Return submission_id
    Form->>Netlify: POST /process-submission
    
    Note over Netlify: Processing begins
    
    Netlify->>Supabase: Update status: "processing"
    Netlify->>FDA: Query 3 databases
    FDA-->>Netlify: Clinical trials, approvals, adverse events
    
    Netlify->>Supabase: Save FDA data
    Netlify->>Perplexity: Generate content with FDA context
    Perplexity-->>Netlify: SEO content
    
    Netlify->>Claude: Review for compliance
    Claude-->>Netlify: QA scores
    
    Netlify->>Supabase: Update with results
    Supabase-->>Dashboard: Real-time update
    Dashboard-->>User: Show completed content
```

## Database Schema Updates

```mermaid
erDiagram
    submissions {
        uuid id PK
        string product_name
        string generic_name
        string indication
        string therapeutic_area
        string development_stage
        string nct_number
        jsonb fda_data
        array fda_data_sources
        timestamp fda_enrichment_timestamp
        string seo_title
        text meta_description
        array seo_keywords
        array h2_tags
        text seo_strategy_outline
        jsonb ai_output
        int qa_score
        int compliance_score
        int medical_accuracy
        int seo_effectiveness
        string workflow_stage
        string ai_processing_status
        timestamp last_updated
    }
```

## Processing States

```mermaid
stateDiagram-v2
    [*] --> draft: Form Submitted
    draft --> processing: Netlify Function Triggered
    processing --> fda_enrichment: Fetching FDA Data
    fda_enrichment --> content_generation: FDA Data Retrieved
    content_generation --> qa_review: Perplexity Complete
    qa_review --> completed: QA Passed
    qa_review --> failed: QA Failed
    completed --> [*]
    failed --> [*]
```

## API Integration Points

```mermaid
graph LR
    subgraph "External APIs"
        A[ClinicalTrials.gov API v2]
        B[OpenFDA API]
        C[Perplexity AI API]
        D[Claude API]
    end
    
    subgraph "Our Platform"
        E[Netlify Function]
    end
    
    A -->|NCT Data| E
    B -->|Drug Approval & Safety| E
    C -->|Content Generation| E
    D -->|Compliance Review| E
    
    E -->|Unified Results| F[Supabase]
```

## Error Handling Flow

```mermaid
graph TD
    A[Start Processing] --> B{FDA API Success?}
    B -->|Yes| C[Continue with FDA Data]
    B -->|No| D[Continue without FDA Data]
    
    C --> E{Perplexity Success?}
    D --> E
    
    E -->|Yes| F[Claude QA Review]
    E -->|No| G[Use Fallback Content]
    
    F --> H{QA Pass?}
    G --> I[Mark as Failed]
    
    H -->|Yes| J[Update Complete]
    H -->|No| K[Mark for Revision]
    
    I --> L[Update Status in DB]
    J --> L
    K --> L
```

## Performance Metrics

```mermaid
gantt
    title Processing Timeline
    dateFormat ss
    axisFormat %S
    
    section User Action
    Form Submit     :a1, 00, 1s
    
    section Database
    Save to Supabase :a2, after a1, 1s
    
    section FDA Processing
    ClinicalTrials   :a3, after a2, 2s
    FDA Approvals    :a4, after a2, 2s
    Adverse Events   :a5, after a2, 2s
    
    section AI Processing
    Perplexity Gen   :a6, after a3, 5s
    Claude Review    :a7, after a6, 4s
    
    section Final Update
    Update Database  :a8, after a7, 1s
    Dashboard Update :a9, after a8, 0s
```

Total Processing Time: ~15-20 seconds

## Next Implementation Phase

```mermaid
graph TD
    subgraph "Current"
        A[Direct Netlify Function]
    end
    
    subgraph "Future Enhancements"
        B[Add Caching Layer]
        C[Batch Processing]
        D[Webhook Retries]
        E[Advanced Analytics]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
```

---

Last Updated: January 30, 2025