# 3Cubed SEO Platform - Medical/Pharmaceutical SEO GEO Platform

## Table of Contents
1. [System Overview](#system-overview)
2. [Platform URLs](#platform-urls)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [AI Integration & Agents](#ai-integration--agents)
8. [User Flow](#user-flow)
9. [Deployment](#deployment)
10. [Environment Variables](#environment-variables)
11. [Common Issues & Solutions](#common-issues--solutions)
12. [Development Guide](#development-guide)
13. [Medical/Pharmaceutical Context](#medical-pharmaceutical-context)
14. [Critical Information for New Assistants](#critical-information-for-new-assistants)
15. [Business Model & Pricing](#business-model--pricing)

---

## System Overview

**3Cubed SEO** is a specialized SEO/GEO (Search Engine Optimization/Generative Engine Optimization) platform designed exclusively for medical and pharmaceutical companies. The platform automates the creation of FDA-compliant, medically accurate content that ranks in both traditional search engines (Google, Bing) and AI-powered search systems (ChatGPT, Perplexity, Claude, Google AI Overviews).

### Platform Purpose
- **Industry**: Medical devices, pharmaceuticals, biotech, healthcare
- **Compliance**: FDA, EMA, and global regulatory requirements
- **Content Types**: Drug information, clinical trial data, patient education, HCP resources
- **Optimization**: Dual optimization for search engines (SEO) and AI systems (GEO)

### Key Features
- **Medical/Pharma Focused**: Built specifically for healthcare regulatory requirements
- **AI-Powered Content Generation**: FDA-compliant titles, descriptions, medical Q&As
- **FDA Data Integration**: Real-time queries to 6 FDA databases
- **GEO Optimization**: First platform to optimize pharma content for AI search
- **MLR Workflow**: Built-in Medical Legal Review process
- **Multi-Geographic**: Supports US (FDA), EU (EMA), and global markets

### Current Status (August 2025)
- **Migration Complete**: Moved from Supabase/N8N to Railway/Netlify
- **Deployment Needed**: Functions updated but need deployment
- **API Keys Required**: Perplexity and Claude keys need to be set in Netlify

---

## Platform URLs

### Production URLs
- **Main Application**: https://3cubed-seo.netlify.app
- **SEO Request Form**: https://3cubed-seo.netlify.app/seo-requests
- **SEO Review Dashboard**: https://3cubed-seo.netlify.app/seo-review
- **Client Review Portal**: https://3cubed-seo.netlify.app/client-review
- **MLR Review Interface**: https://3cubed-seo.netlify.app/mlr-review

### API Endpoints
- **Railway Backend API**: https://3cubed-seo-production.up.railway.app
- **Health Check**: https://3cubed-seo-production.up.railway.app/health
- **Netlify Functions Base**: https://3cubed-seo.netlify.app/.netlify/functions

### External Medical/Pharma APIs
- **FDA Clinical Trials**: https://clinicaltrials.gov/api/v2/
- **FDA Adverse Events**: https://api.fda.gov/drug/event.json
- **FDA Drug Labels**: https://api.fda.gov/drug/label.json
- **FDA Drug Approvals**: https://api.fda.gov/drug/drugsfda.json
- **DailyMed**: https://dailymed.nlm.nih.gov/dailymed/
- **FDA Recalls**: https://api.fda.gov/drug/enforcement.json

### Documentation URLs
- **FDA API Documentation**: https://open.fda.gov/apis/
- **ClinicalTrials.gov API**: https://clinicaltrials.gov/api/gui
- **Perplexity API Docs**: https://docs.perplexity.ai/
- **Claude API Docs**: https://docs.anthropic.com/

---

## Architecture

### Current Architecture (Railway + Netlify)
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Railway API    │────▶│  PostgreSQL DB  │
│  (Netlify)      │     │  (Express.js)   │     │   (Railway)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                                │
         │                                                │
         ▼                                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│Netlify Functions│────▶│ External APIs   │     │   AI Results    │
│ FDA/AI Process  │     │FDA/Perplexity   │     │ Stored in DB    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Legacy Architecture (Being Phased Out)
- **Supabase**: Previously used for database and real-time updates
- **N8N**: Previously used for workflow automation
- **Status**: Code references exist but return mock values

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Hosting**: Netlify

### Backend
- **API Server**: Express.js on Railway
- **Database**: PostgreSQL on Railway
- **Serverless Functions**: Netlify Functions
- **Language**: Node.js v18+

### AI Services
- **FDA Data**: Public FDA APIs (ClinicalTrials.gov, FAERS, etc.)
- **Content Generation**: Perplexity AI (sonar model)
- **Quality Review**: Claude AI (haiku model)

---

## Database Schema

### Primary Table: `submissions`

```sql
CREATE TABLE submissions (
  -- Core Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Information (Required)
  product_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  medical_indication VARCHAR(500),
  therapeutic_area VARCHAR(100) NOT NULL,
  development_stage VARCHAR(50),
  workflow_stage VARCHAR(50) DEFAULT 'pending',
  
  -- Submitter Information (Required)
  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  submitter_company VARCHAR(255),
  priority_level VARCHAR(20) DEFAULT 'medium',
  
  -- Strategic Fields (Optional but Enhance AI Output)
  target_audience TEXT[], -- ['HCPs', 'Patients', 'Payers']
  geographic_markets TEXT[], -- ['USA', 'EU', 'APAC']
  mechanism_of_action TEXT,
  line_of_therapy VARCHAR(100), -- 'First-line', 'Second-line'
  key_differentiators TEXT[],
  patient_population TEXT,
  primary_endpoints TEXT,
  key_biomarkers TEXT,
  
  -- Clinical/Business Context (Optional)
  nct_number VARCHAR(50), -- NCT12345678
  sponsor VARCHAR(255),
  client_name VARCHAR(255),
  
  -- AI-Generated SEO Fields
  seo_title VARCHAR(60), -- Optimized for search engines
  meta_description VARCHAR(155), -- Meta description tag
  h1_tag TEXT, -- Main page heading
  h2_tags TEXT[], -- Subheadings array
  seo_keywords TEXT[], -- Primary keywords
  long_tail_keywords TEXT[], -- Long-tail variations (5 required)
  consumer_questions JSONB, -- Array of Q&A objects (10 required)
  seo_strategy_outline TEXT, -- Overall SEO/GEO strategy
  content_strategy TEXT,
  competitive_advantages TEXT[],
  
  -- GEO (Generative Engine Optimization) Fields
  geo_event_tags TEXT[], -- ['ASCO 2024', 'FDA Approval']
  geo_optimization JSONB, -- Complex GEO data structure
  geo_optimization_score INTEGER, -- 0-100 AI readiness score
  
  -- AI Processing Metadata
  fda_data JSONB, -- Raw FDA query results
  qa_scores JSONB, -- Claude QA review scores
  ai_output JSONB, -- Complete AI processing results
  ai_processing_status VARCHAR(50),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_stage ON submissions(workflow_stage);
CREATE INDEX idx_created_at ON submissions(created_at DESC);
CREATE INDEX idx_therapeutic_area ON submissions(therapeutic_area);
```

### JSONB Field Structures

#### `geo_optimization` Structure:
```json
{
  "ai_friendly_summary": "Conversational summary for AI systems",
  "voice_search_answers": {
    "what is [drug]": "Answer optimized for voice",
    "how does [drug] work": "Mechanism explanation"
  },
  "medical_facts": ["Fact 1", "Fact 2", "Fact 3"],
  "evidence_statistics": ["95% response rate", "2-year survival"],
  "key_facts": ["First-in-class", "Once-daily dosing"],
  "event_tags": {
    "perplexity": ["ASCO 2024", "FDA Breakthrough"],
    "claude": ["Clinical Trial", "Safety Profile"],
    "chatgpt": ["Treatment Option", "Side Effects"],
    "gemini": ["Mechanism", "Patient Selection"]
  }
}
```

#### `consumer_questions` Structure:
```json
[
  {
    "question": "What is Keytruda used for?",
    "answer": "Keytruda is used to treat various cancers including..."
  },
  {
    "question": "What are the side effects?",
    "answer": "Common side effects include..."
  }
]
```

#### `qa_scores` Structure:
```json
{
  "overall_score": 85,
  "compliance_score": 90,
  "medical_accuracy": 95,
  "seo_effectiveness": 80,
  "recommendations": ["Add more long-tail keywords", "Expand safety section"]
}
```

---

## API Endpoints

### Railway API (Backend)

**Base URL**: `https://3cubed-seo-production.up.railway.app`

#### Health Check
```http
GET /health
Response: { "status": "ok", "timestamp": "2025-08-01T12:00:00Z" }
```

#### Submissions CRUD
```http
# List all submissions
GET /api/submissions
Response: Array of submission objects

# Get single submission
GET /api/submissions/:id
Response: Single submission object

# Create submission
POST /api/submissions
Body: {
  "product_name": "Keytruda",
  "generic_name": "pembrolizumab",
  "therapeutic_area": "Oncology",
  "submitter_name": "John Doe",
  "submitter_email": "john@pharma.com",
  ...
}

# Update submission (with AI results)
PUT /api/submissions/:id
Body: Any fields to update
```

### Netlify Functions (AI Processing)

**Base URL**: `https://3cubed-seo.netlify.app/.netlify/functions`

#### FDA Query Enhanced
```http
POST /fda-query-enhanced
Body: {
  "productName": "Keytruda",
  "genericName": "pembrolizumab",
  "indication": "NSCLC",
  "developmentStage": "Market Launch",
  "geographicMarkets": ["USA", "EU"],
  ...
}
Response: {
  "success": true,
  "summary": { ... },
  "data": {
    "clinicalTrials": [...],
    "adverseEvents": [...],
    "drugLabels": [...],
    "competitorAnalysis": [...]
  },
  "seoRecommendations": { ... }
}
```

#### Perplexity GEO-Optimized Generation
```http
POST /perplexity-generate-geo-optimized
Body: {
  "submission": { ...submission data },
  "fdaData": { ...FDA query results }
}
Response: {
  "success": true,
  "content": {
    "seo_title": "...",
    "meta_description": "...",
    "consumer_questions": [...],
    "geo_optimization": { ... }
  },
  "ai_readiness_score": 85
}
```

#### Claude QA Review
```http
POST /claude-qa
Body: {
  "content": { ...Perplexity output },
  "submission": { ...original data },
  "fdaData": { ...FDA data }
}
Response: {
  "success": true,
  "passed": true,
  "qa_review": {
    "compliance_score": 90,
    "medical_accuracy": 95,
    "seo_effectiveness": 85
  },
  "needs_revision": false
}
```

---

## AI Integration & Agents

### Overview of AI Agents

The platform uses three specialized AI agents that work in sequence to create medically accurate, SEO/GEO-optimized content:

1. **FDA Intelligence Agent** - Gathers regulatory and clinical data
2. **Perplexity Content Agent** - Generates SEO/GEO optimized content
3. **Claude QA Agent** - Reviews for compliance and accuracy

### 1. FDA Intelligence Agent

The FDA agent queries 6 public databases to build a comprehensive regulatory profile for each drug/device.

#### FDA Databases Queried:
- **ClinicalTrials.gov API v2**: Active trials, enrollment, endpoints, study designs
- **FDA Adverse Event Reporting System (FAERS)**: Real-world safety data
- **Drugs@FDA**: Approval history, NDAs, regulatory milestones
- **DailyMed/SPL**: Structured product labels, black box warnings
- **FDA Recalls**: Safety recalls and field corrections
- **Drug Shortages**: Current shortage status

#### FDA Agent Prompt Structure:
```javascript
// Enhanced FDA Query (fda-query-enhanced.js)
const fdaQueryPrompt = {
  primary_search: {
    product_name: "[BRAND_NAME]",
    generic_name: "[GENERIC_NAME]",
    indication: "[MEDICAL_INDICATION]",
    nct_number: "[NCT_NUMBER]" // Optional specific trial
  },
  
  intelligence_gathering: {
    pre_trial_data: {
      first_in_human: true,
      dose_escalation: true,
      biomarker_studies: true
    },
    competitive_landscape: {
      same_moa_drugs: true,
      same_indication_competitors: true,
      market_position_analysis: true
    },
    geographic_intelligence: {
      trial_locations: true,
      regional_approvals: true,
      market_access: true
    }
  },
  
  seo_extraction: {
    extract_keywords_from_labels: true,
    identify_patient_populations: true,
    capture_unique_differentiators: true
  }
}
```

#### FDA Agent Output:
```json
{
  "summary": {
    "development_stage": "Phase 3",
    "total_trials": 15,
    "active_trials": 5,
    "geographic_reach": ["USA", "EU", "APAC"],
    "competitor_count": 8,
    "market_position": "best-in-class"
  },
  "clinical_trials": [...],
  "safety_profile": {
    "black_box_warning": false,
    "common_aes": ["nausea", "fatigue"],
    "serious_aes": ["pneumonitis"]
  },
  "seo_recommendations": {
    "keywords": ["pembrolizumab", "pd-1 inhibitor", "nsclc"],
    "patient_terms": ["lung cancer immunotherapy"],
    "competitive_angles": ["first-line treatment"]
  }
}
```

### 2. Perplexity Content Generation Agent

The Perplexity agent creates comprehensive SEO/GEO content based on FDA data and submission details.

#### Perplexity Agent Prompts:

##### GEO-Optimized Prompt (perplexity-generate-geo-optimized.js):
```javascript
const perplexityGEOPrompt = `
You are an expert pharmaceutical SEO strategist specializing in 
Generative Engine Optimization (GEO). Create content that ranks in 
both traditional search and AI systems (ChatGPT, Claude, Perplexity).

MEDICAL CONTEXT:
- Product: ${submission.product_name} (${submission.generic_name})
- Indication: ${submission.medical_indication}
- Therapeutic Area: ${submission.therapeutic_area}
- Development Stage: ${fdaData.summary.developmentStage}
- Regulatory Status: ${fdaData.summary.approvalStatus}

${trialContext}
${competitiveContext}
${geoContext}

CONTENT REQUIREMENTS:
1. Medical Accuracy: Every claim must be supported by FDA data
2. Fair Balance: Include safety information with efficacy
3. Patient-Friendly: 8th-grade reading level for patient content
4. HCP-Optimized: Technical accuracy for healthcare providers
5. GEO Structure: Q&A format for AI comprehension

Generate content following this medical SEO/GEO structure:
{
  "seo_title": "60-char limit, include brand + generic + indication",
  
  "h1_options": {
    "traditional": "FDA-approved [BRAND] ([GENERIC]) for [INDICATION]",
    "conversational": "What Is [BRAND] and How Does It Treat [CONDITION]?"
  },
  
  "meta_description": "155-char limit with clear medical value prop",
  
  "consumer_questions": [
    // 10 REQUIRED questions patients actually ask
    {
      "question": "Is [BRAND] chemotherapy or immunotherapy?",
      "answer": "Medically accurate, patient-friendly answer"
    }
  ],
  
  "medical_keywords": {
    "clinical_terms": ["MoA terms", "drug class", "indication"],
    "patient_terms": ["lay language", "symptoms", "treatment"],
    "insurance_terms": ["coverage", "prior auth", "copay"]
  },
  
  "geo_optimization": {
    "voice_search": {
      "alexa": "What is [BRAND] used for?",
      "siri": "How do I take [BRAND]?"
    },
    "ai_citations": {
      "mechanism": "Clear explanation for AI extraction",
      "clinical_evidence": "Key trial data points",
      "safety_profile": "Balanced AE information"
    }
  },
  
  "regulatory_compliance": {
    "indication_statement": "FDA-approved indication only",
    "safety_information": "Important safety information",
    "contraindications": "Who should not take this"
  }
}
`;
```

##### Dynamic Content Depth:
The agent adjusts output based on input completeness:

```javascript
function calculateContentDepth(submission, fdaData) {
  // Scoring factors for medical content
  const depthFactors = {
    // Clinical data (+50 points)
    hasNCTNumber: 10,
    hasPrimaryEndpoints: 15,
    hasKeyBiomarkers: 15,
    hasSafetyData: 10,
    
    // Regulatory context (+30 points)
    hasFDAApproval: 10,
    hasBlackBoxWarning: 10,
    hasREMS: 10,
    
    // Market context (+20 points)
    hasCompetitorData: 10,
    hasGeographicMarkets: 10
  };
  
  // Returns: comprehensive | detailed | standard | basic
}
```

### 3. Claude QA Review Agent

Claude reviews all generated content for medical accuracy and compliance.

#### Claude QA Prompt (claude-qa.js):
```javascript
const claudeQAPrompt = `
You are a pharmaceutical regulatory reviewer ensuring content meets 
FDA compliance standards and medical accuracy requirements.

REVIEW CRITERIA:
1. Medical Accuracy (40%)
   - Claims supported by FDA label or clinical trials
   - Mechanism of action correctly described
   - Dosing and administration accurate
   - Drug interactions properly noted

2. Regulatory Compliance (40%)
   - Only FDA-approved indications mentioned
   - Fair balance (benefits with risks)
   - Required safety information included
   - No off-label promotion

3. SEO Effectiveness (20%)
   - Keywords naturally integrated
   - Content answers user intent
   - Proper heading structure
   - Schema markup appropriate

CONTENT TO REVIEW:
${JSON.stringify(perplexityOutput, null, 2)}

FDA DATA REFERENCE:
${JSON.stringify(fdaData, null, 2)}

ORIGINAL SUBMISSION:
${JSON.stringify(submission, null, 2)}

Perform a comprehensive review and return:
{
  "passed": boolean,
  "scores": {
    "medical_accuracy": 0-100,
    "regulatory_compliance": 0-100,
    "seo_effectiveness": 0-100,
    "overall": 0-100
  },
  "issues": [
    {
      "severity": "critical|major|minor",
      "category": "medical|regulatory|seo",
      "description": "Specific issue found",
      "recommendation": "How to fix"
    }
  ],
  "strengths": [
    "What was done well"
  ],
  "needs_revision": boolean,
  "revision_instructions": "Specific changes needed"
}
`;
```

### Agent Orchestration Flow

```mermaid
graph TD
    A[Form Submission] --> B[FDA Agent]
    B --> C{FDA Data Found?}
    C -->|Yes| D[Perplexity Agent]
    C -->|No| E[Basic Template]
    D --> F[Claude QA Agent]
    F --> G{Passed QA?}
    G -->|Yes| H[Save to Database]
    G -->|No| I[Retry with Feedback]
    I --> D
    H --> J[Display in Dashboard]
```

### Prompt Engineering Best Practices

#### Medical Specificity:
- Always include drug class and mechanism
- Reference specific clinical trials by NCT number
- Include stage of development context
- Specify target patient population

#### Regulatory Guardrails:
- Explicitly state "FDA-approved indications only"
- Require balanced safety information
- Prohibit off-label promotion
- Include contraindications

#### SEO/GEO Optimization:
- Request both technical and lay terminology
- Include voice search variations
- Structure for featured snippets
- Optimize for AI extraction

### Error Handling & Retry Logic

```javascript
// Retry logic with medical context
const retryWithMedicalContext = async (error, attempt) => {
  if (error.includes("medical accuracy")) {
    // Add more FDA context
    enhancedPrompt += "\nFocus on FDA-approved claims only";
  } else if (error.includes("safety information")) {
    // Emphasize fair balance
    enhancedPrompt += "\nInclude full safety profile from FDA label";
  }
  
  return regenerateContent(enhancedPrompt);
};
```

### Agent Configuration

#### Environment Variables:
```env
# FDA Agent - No API key needed (public APIs)
FDA_CLINICAL_TRIALS_BASE=https://clinicaltrials.gov/api/v2
FDA_OPEN_API_BASE=https://api.fda.gov

# Perplexity Agent
PERPLEXITY_API_KEY=pplx-xxxxx
PERPLEXITY_MODEL=sonar
PERPLEXITY_TEMPERATURE=0.7
PERPLEXITY_MAX_TOKENS=4000

# Claude Agent  
CLAUDE_API_KEY=sk-ant-xxxxx
CLAUDE_MODEL=claude-3-haiku-20240307
CLAUDE_TEMPERATURE=0.3  # Lower for accuracy
CLAUDE_MAX_TOKENS=2000
```

### Agent Performance Metrics

Track agent effectiveness:
- **FDA Agent**: Data completeness, API response time
- **Perplexity Agent**: Content quality score, keyword density
- **Claude Agent**: Approval rate, revision frequency

### Real-World Agent Examples

#### Example 1: New Oncology Drug Submission
```javascript
// Input
{
  "product_name": "Enhertu",
  "generic_name": "fam-trastuzumab deruxtecan-nxki",
  "indication": "HER2-positive metastatic breast cancer",
  "development_stage": "Market Launch",
  "line_of_therapy": "Second-line"
}

// FDA Agent finds:
- 12 active clinical trials
- DESTINY-Breast03 pivotal trial data
- Competitor: Kadcyla (T-DM1)
- Black box warning: ILD/pneumonitis

// Perplexity generates:
- SEO Title: "Enhertu (Trastuzumab Deruxtecan): HER2+ Breast Cancer ADC Therapy"
- H1: "How Does Enhertu Work for HER2-Positive Breast Cancer?"
- 10 Consumer Questions:
  1. "What is the difference between Enhertu and Herceptin?"
  2. "How often is Enhertu given?"
  3. "What are Enhertu's most serious side effects?"
  4. "Does insurance cover Enhertu?"
  ...

// Claude QA scores:
- Medical Accuracy: 95/100
- Regulatory Compliance: 92/100  
- SEO Effectiveness: 88/100
- Overall: PASSED
```

#### Example 2: Medical Device
```javascript
// Input
{
  "product_name": "Guardian Connect CGM",
  "device_type": "Continuous Glucose Monitor",
  "indication": "Diabetes management",
  "fda_class": "Class II",
  "510k_number": "K181422"
}

// FDA Agent adapts for devices:
- Searches 510(k) database
- Finds predicate devices
- Extracts indications for use
- Identifies special controls

// Different prompt structure for devices
```

### Advanced FDA Agent Features

#### 1. Competitive Intelligence Module
```javascript
// Extracts competitive landscape
function analyzeCompetitors(indication, mechanism) {
  // Query same indication
  const indicationCompetitors = await queryFDA({
    search: `openfda.indication:"${indication}"`
  });
  
  // Query same mechanism
  const moaCompetitors = await queryFDA({
    search: `openfda.pharm_class_moa:"${mechanism}"`
  });
  
  // Analyze market position
  return {
    direct_competitors: filterDirectCompetitors(indicationCompetitors),
    class_competitors: filterClassCompetitors(moaCompetitors),
    market_position: determinePosition(competitorCount, approvalDate)
  };
}
```

#### 2. Pre-Trial Intelligence
```javascript
// For drugs in development
function extractPreTrialIntelligence(trials) {
  return {
    first_in_human: trials.filter(t => 
      t.phase === "Phase 1" && 
      t.title.includes("first-in-human")
    ),
    dose_finding: trials.filter(t => 
      t.title.includes("dose") && 
      ["escalation", "finding", "ranging"].some(term => 
        t.title.includes(term)
      )
    ),
    biomarker_enriched: trials.filter(t => 
      t.eligibility?.criteria?.includes("biomarker") ||
      t.outcome_measures?.some(o => o.includes("biomarker"))
    )
  };
}
```

#### 3. Geographic Market Analysis
```javascript
// Analyzes global opportunity
function analyzeGeographicOpportunity(trials, markets) {
  const analysis = {};
  
  markets.forEach(market => {
    analysis[market] = {
      trial_sites: countSitesByRegion(trials, market),
      enrollment_potential: calculateEnrollment(trials, market),
      regulatory_status: checkApprovalStatus(market),
      competitor_presence: analyzeLocalCompetition(market),
      seo_opportunity: {
        local_search_volume: getSearchVolume(market),
        language_variants: getLanguageVariants(market),
        regulatory_terms: getLocalRegulatoryTerms(market)
      }
    };
  });
  
  return analysis;
}
```

### Prompt Templates by Therapeutic Area

#### Oncology-Specific Prompts
```javascript
const oncologyPrompt = `
Focus on:
- Line of therapy positioning (1L, 2L, 3L+)
- Biomarker requirements (PD-L1, HER2, BRAF, etc.)
- Combination vs monotherapy
- Overall survival vs progression-free survival
- NCCN guideline recommendations
- Manage immune-related adverse events
`;
```

#### Diabetes-Specific Prompts
```javascript
const diabetesPrompt = `
Focus on:
- A1C reduction percentages
- Weight loss/gain profile  
- Cardiovascular outcomes (MACE)
- Hypoglycemia risk
- Dosing convenience (daily, weekly)
- Insurance coverage tiers
`;
```

#### Rare Disease Prompts
```javascript
const rareDiseasePrompt = `
Focus on:
- Patient finding/diagnosis journey
- Centers of excellence
- Genetic testing requirements
- Patient assistance programs
- Caregiver resources
- Small patient population SEO
`;
```

### Integration with Medical Guidelines

The agents reference authoritative medical sources:

```javascript
const medicalGuidelines = {
  oncology: [
    "NCCN Guidelines",
    "ASCO Recommendations",
    "ESMO Clinical Practice"
  ],
  cardiology: [
    "ACC/AHA Guidelines",
    "ESC Guidelines"
  ],
  diabetes: [
    "ADA Standards of Care",
    "AACE/ACE Algorithm"
  ]
};

// Agents check guidelines for:
// - Treatment algorithms
// - Recommended sequences
// - Quality measures
// - Contraindications
```

---

## User Flow

### 1. Form Submission Flow
```
User fills form → React validates → POST to Railway API → 
Saved to PostgreSQL → Trigger AI processing → 
Query FDA → Generate with Perplexity → Review with Claude → 
Update database → Display in dashboard
```

### 2. Review Workflow
```
SEO Review → Approve/Revise → Client Review → 
Approve/Revise → MLR Review → Final Approval → Published
```

### 3. Dashboard Views
- **/seo-requests**: Drug/device submission form
- **/seo-review**: SEO team review dashboard
- **/seo-review/:id**: Detailed review with field approval
- **/client-review**: Pharma client approval dashboard
- **/mlr-review**: Medical legal review interface

### 4. Medical Content Examples

#### Oncology Drug Example (Keytruda)
```
Input:
- Product: Keytruda (pembrolizumab)
- Indication: Non-Small Cell Lung Cancer
- Stage: Market Launch
- Target: HCPs and Patients

AI Generated Output:
- SEO Title: "Keytruda (Pembrolizumab) for NSCLC: FDA-Approved First-Line PD-1 Therapy"
- Meta Description: "Learn about Keytruda, an FDA-approved immunotherapy for NSCLC. See clinical data, dosing information, and patient eligibility criteria."
- H1: "What Is Keytruda and How Does It Treat Advanced Lung Cancer?"
- H2 Tags: 
  - "How Keytruda Works: PD-1 Inhibitor Mechanism"
  - "Who Is Eligible for Keytruda Treatment?"
  - "Clinical Trial Results: KEYNOTE Studies"
  - "Managing Immune-Related Side Effects"
- Consumer Questions:
  1. "Is Keytruda chemotherapy or immunotherapy?"
  2. "What are the most common Keytruda side effects?"
  3. "How long do patients stay on Keytruda?"
  4. "Does insurance cover Keytruda treatment?"
  5. "What is the Keytruda infusion schedule?"
- GEO Event Tags: ["ASCO 2024", "FDA Approval", "NCCN Guidelines"]
```

#### Diabetes Medication Example (Ozempic)
```
Input:
- Product: Ozempic (semaglutide)
- Indication: Type 2 Diabetes
- Stage: Market Launch
- Geographic: USA, EU

AI Generated Output:
- SEO Title: "Ozempic (Semaglutide): Once-Weekly GLP-1 for Type 2 Diabetes"
- H1: "How Does Ozempic Help Control Blood Sugar in Type 2 Diabetes?"
- Voice Search Optimized: "Hey Siri, what is Ozempic used for?"
- Patient FAQs:
  - "Can Ozempic cause weight loss?"
  - "How do I inject Ozempic?"
  - "Ozempic vs Trulicity: which is better?"
```

#### Medical Device Example (CGM)
```
Input:
- Product: FreeStyle Libre 3
- Type: Continuous Glucose Monitor
- FDA Class: Class II Medical Device

AI Generated Output:
- SEO Title: "FreeStyle Libre 3 CGM: Real-Time Glucose Monitoring System"
- Schema Markup: MedicalDevice + Product
- Regulatory: "FDA 510(k) cleared"
- Insurance Keywords: "CGM Medicare coverage", "Libre 3 insurance"
```

---

## Deployment

### Frontend (Netlify)
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (set in Netlify dashboard)
VITE_API_BASE_URL=https://3cubed-seo-production.up.railway.app
```

### Backend (Railway)
```bash
# Automatic deployment from GitHub
# Uses railway-api/package.json start script
# Database automatically provisioned
```

### Netlify Functions
```bash
# Functions directory
netlify/functions/

# Required environment variables
PERPLEXITY_API_KEY=pplx-...
CLAUDE_API_KEY=sk-ant-...
```

---

## Environment Variables

### Required for Production

#### Netlify Dashboard
```env
# API Keys (REQUIRED)
PERPLEXITY_API_KEY=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
CLAUDE_API_KEY=your_claude_api_key_here

# Frontend Config (OPTIONAL - has defaults)
VITE_API_BASE_URL=https://3cubed-seo-production.up.railway.app
```

#### Railway (Auto-configured)
```env
DATABASE_URL=postgresql://user:pass@host:5432/railway
PORT=3001
NODE_ENV=production
```

### Local Development
```env
# .env.local
VITE_API_BASE_URL=http://localhost:3001
```

---

## Common Issues & Solutions

### 1. "patientPopulation.forEach is not a function"
**Issue**: FDA function expects arrays but receives strings
**Solution**: Fixed in code - functions now handle both string and array inputs

### 2. Empty POST errors from Railway
**Issue**: Database schema missing required columns
**Solution**: Run migration script to add AI fields to database

### 3. Netlify functions return 404
**Issue**: Functions not deployed or wrong URL
**Solution**: Deploy functions and use correct URL format

### 4. No AI content appearing
**Issue**: API keys not set in Netlify
**Solution**: Add PERPLEXITY_API_KEY and CLAUDE_API_KEY to Netlify environment

### 5. Dashboard not updating
**Issue**: No real-time sync (was using Supabase realtime)
**Solution**: Implement polling or refresh manually

---

## Development Guide

### Local Setup
```bash
# 1. Clone repository
git clone [repo-url]
cd 3cubed-seo

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run locally
npm run dev

# 5. Test functions locally
netlify dev
```

### Code Structure
```
3cubed-seo/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Route pages
│   ├── lib/           # Utilities and API client
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript types
├── netlify/
│   └── functions/     # Serverless functions
├── railway-api/       # Express backend
└── public/           # Static assets
```

### Key Files to Know
- `src/lib/api.ts` - Railway API client
- `src/lib/ai-api.ts` - AI processing client
- `src/pages/SEOReviewDetail.tsx` - Main review interface
- `netlify/functions/perplexity-generate-geo-optimized.js` - Content generation
- `railway-api/server.js` - Backend API server

### Adding New AI Fields
1. Add column to PostgreSQL schema
2. Update `Submission` interface in `database-types.ts`
3. Update Railway API PUT endpoint to handle field
4. Update Perplexity function to generate field
5. Add field display in `SEOReviewDetail.tsx`

---

## Medical/Pharmaceutical Context

### Why Medical/Pharma Needs Specialized SEO/GEO

Medical and pharmaceutical companies face unique challenges:
1. **Regulatory Compliance**: FDA, EMA, MHRA requirements
2. **Medical Accuracy**: Life-critical information must be precise
3. **Fair Balance**: Side effects must accompany benefits
4. **Off-Label Restrictions**: Cannot promote unapproved uses
5. **HIPAA/Privacy**: Patient data protection
6. **Global Variations**: Different rules per country

### What is GEO for Pharma?
**Generative Engine Optimization (GEO)** for pharmaceutical content means:
- **Medical Q&A Format**: How patients ask health questions
- **Clinical Evidence**: AI systems need authoritative sources
- **Drug-Disease Relationships**: Clear entity mapping
- **Safety Information**: Prominent adverse event data
- **Regulatory Citations**: FDA approvals, clinical trial NCT numbers

### Target Audiences in Healthcare

#### 1. Patients & Caregivers
- Search: "What is [drug] used for?"
- Need: Simple language, side effects, cost info
- GEO: Voice search optimization, FAQ format

#### 2. Healthcare Providers (HCPs)
- Search: "[drug] mechanism of action"
- Need: Clinical data, dosing, drug interactions
- GEO: Technical accuracy, study citations

#### 3. Payers & Formulary Managers
- Search: "[drug] cost effectiveness"
- Need: Pharmacoeconomics, ICER data
- GEO: Comparative effectiveness, value propositions

### Regulatory Compliance Features

#### FDA Requirements
- **Fair Balance**: Automated risk/benefit ratio
- **Black Box Warnings**: Prominent display
- **Indication Specificity**: Only approved uses
- **Study Registration**: NCT numbers included

#### MLR (Medical Legal Review)
- **Review Stages**: Draft → SEO → Legal → Medical → Final
- **Audit Trail**: Complete history of changes
- **Approval Workflow**: Multi-stakeholder sign-off
- **Version Control**: Track all iterations

### Medical SEO Best Practices
1. **E-A-T**: Expertise, Authoritativeness, Trustworthiness
2. **YMYL**: Your Money or Your Life content standards
3. **Schema Markup**: MedicalEntity, Drug, MedicalCondition
4. **Clinical Evidence**: Peer-reviewed citations required
5. **Medical Accuracy**: Fact-checked against FDA labels

### Pharmaceutical Keywords Strategy
- **Brand Names**: Keytruda, Humira, Ozempic
- **Generic Names**: pembrolizumab, adalimumab, semaglutide
- **Indication Terms**: NSCLC, rheumatoid arthritis, diabetes
- **MoA Terms**: PD-1 inhibitor, TNF blocker, GLP-1 agonist
- **Patient Terms**: "lung cancer treatment", "RA medication"

### Success Metrics for Medical SEO/GEO
- **Compliance Score**: 95%+ required for publication
- **Medical Accuracy**: Verified against FDA label
- **Patient Comprehension**: 8th-grade reading level
- **HCP Relevance**: Clinical utility score
- **AI Citation Rate**: Frequency in ChatGPT/Claude responses
- **SERP Features**: Featured snippets, knowledge panels
- **Voice Search**: Alexa/Siri medical queries

---

## Quick Reference

### Testing Commands
```bash
# Test Railway API
curl https://3cubed-seo-production.up.railway.app/health

# Test local functions
netlify dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Workflow Stages
- `pending` - New submission
- `ai_processing` - AI generation in progress
- `ai_complete` - Ready for review
- `seo_review` - Under SEO review
- `client_review` - Awaiting client approval
- `mlr_review` - Medical legal review
- `approved` - All approvals complete
- `published` - Live on website

### Priority Levels
- `high` - Rush/urgent (red)
- `medium` - Standard (yellow)
- `low` - Non-urgent (green)

---

## Contacts & Resources

### Documentation
- FDA API Documentation: https://open.fda.gov/apis/
- Perplexity API: https://docs.perplexity.ai/
- Claude API: https://docs.anthropic.com/
- Netlify Functions: https://docs.netlify.com/functions/

### Platform URLs
- Production App: https://3cubed-seo.netlify.app
- Railway API: https://3cubed-seo-production.up.railway.app
- Legacy References: CLAUDE.md, GEO_IMPLEMENTATION_GUIDE.md

### Common Tasks
1. **Add new therapeutic area**: Update `THERAPEUTIC_AREAS` constant
2. **Change AI model**: Update model parameter in function
3. **Add new field**: Follow "Adding New AI Fields" guide
4. **Debug AI output**: Check Netlify function logs

---

### Supported Therapeutic Areas

The platform is configured for all major therapeutic areas:
- **Oncology**: Cancer drugs, immunotherapies, targeted therapies
- **Cardiology**: Hypertension, heart failure, anticoagulants
- **Neurology**: MS, Alzheimer's, Parkinson's, epilepsy
- **Psychiatry**: Depression, schizophrenia, ADHD
- **Endocrinology**: Diabetes, thyroid, growth disorders
- **Immunology**: RA, psoriasis, Crohn's, UC
- **Infectious Disease**: Antibiotics, antivirals, vaccines
- **Respiratory**: Asthma, COPD, cystic fibrosis
- **Hematology**: Blood disorders, sickle cell, hemophilia
- **Rare Diseases**: Orphan drugs, genetic conditions
- **Dermatology**: Skin conditions, aesthetics
- **Ophthalmology**: Glaucoma, macular degeneration

### Medical Compliance URLs

#### Regulatory Agencies
- **FDA (US)**: https://www.fda.gov/drugs
- **EMA (EU)**: https://www.ema.europa.eu/
- **MHRA (UK)**: https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency
- **Health Canada**: https://www.canada.ca/en/health-canada/
- **PMDA (Japan)**: https://www.pmda.go.jp/english/
- **TGA (Australia)**: https://www.tga.gov.au/

#### Medical Guidelines
- **NCCN Guidelines**: https://www.nccn.org/
- **ASCO**: https://www.asco.org/
- **ACC/AHA**: https://www.acc.org/guidelines
- **ADA Standards**: https://professional.diabetes.org/

#### Drug Information Sources
- **PubMed**: https://pubmed.ncbi.nlm.nih.gov/
- **ClinicalTrials.gov**: https://clinicaltrials.gov/
- **DailyMed**: https://dailymed.nlm.nih.gov/
- **Drugs.com**: https://www.drugs.com/
- **RxList**: https://www.rxlist.com/

### Platform Differentiators

What makes 3Cubed SEO unique for medical/pharmaceutical companies:

1. **FDA-First Approach**: Every piece of content starts with FDA data
2. **Medical Accuracy**: Claude AI trained on medical compliance
3. **GEO Pioneer**: First platform to optimize pharma content for AI search
4. **MLR Integration**: Built-in medical legal review workflow
5. **Global Compliance**: Supports FDA, EMA, and other regulatory frameworks
6. **Real-Time Updates**: Integrates live clinical trial data
7. **Therapeutic Expertise**: Pre-configured for all major disease areas
8. **HIPAA Compliant**: No patient data stored or processed
9. **Audit Trail**: Complete history for regulatory inspections
10. **White-Label Ready**: Can be branded for pharma companies

## Final Notes

The 3Cubed SEO platform represents the future of medical and pharmaceutical digital marketing. As AI becomes the primary way patients and HCPs search for medical information, pharmaceutical companies need specialized tools that understand both:

1. **Medical Requirements**: FDA compliance, fair balance, medical accuracy
2. **AI Optimization**: How ChatGPT, Claude, and Perplexity understand medical content

This platform bridges that gap, ensuring pharmaceutical companies can:
- Maintain 100% regulatory compliance
- Rank in traditional search engines
- Get cited by AI systems
- Reach patients at their moment of need
- Support HCPs with accurate clinical information

When in doubt, always prioritize:
1. **Patient Safety**: Accurate medical information saves lives
2. **Regulatory Compliance**: FDA/EMA requirements are non-negotiable
3. **Medical Ethics**: First, do no harm
4. **User Trust**: Build long-term credibility

The platform will continue evolving as new AI systems emerge and regulatory guidelines adapt to the AI age. The foundation is built to scale with these changes while maintaining the highest standards of medical content integrity.

---

## Critical Information for New Assistants

### Day 1 Checklist
1. **Verify Access**:
   - [ ] Netlify account access
   - [ ] Railway dashboard access
   - [ ] GitHub repository access
   - [ ] API keys are set in Netlify environment

2. **Test Core Functions**:
   - [ ] Submit test drug via form
   - [ ] Verify FDA data appears
   - [ ] Check AI content generation
   - [ ] Confirm dashboard updates

3. **Common First Tasks**:
   - Adding new therapeutic area
   - Updating FDA API endpoints
   - Adjusting AI prompts
   - Debugging failed submissions

### Data Flow Debugging

#### When Content Doesn't Generate:
```bash
# 1. Check Railway API
curl https://3cubed-seo-production.up.railway.app/health

# 2. Check Netlify Functions logs
# Go to Netlify Dashboard > Functions > View logs

# 3. Verify submission in database
# Check Railway logs for submission ID

# 4. Test individual functions
curl -X POST https://3cubed-seo.netlify.app/.netlify/functions/fda-query-enhanced \
  -H "Content-Type: application/json" \
  -d '{"productName":"Keytruda","genericName":"pembrolizumab","indication":"NSCLC"}'
```

### Database Migration Commands

```sql
-- Add new AI field
ALTER TABLE submissions 
ADD COLUMN new_ai_field JSONB;

-- Add array field
ALTER TABLE submissions 
ADD COLUMN new_tags TEXT[];

-- Check existing columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions';
```

### Emergency Contacts & Resources

#### Platform Support
- **Technical Issues**: Check Railway/Netlify status pages
- **API Failures**: Verify API keys in environment
- **Database Issues**: Railway dashboard > PostgreSQL logs

#### Medical/Regulatory Resources
- **FDA Labeling**: https://labels.fda.gov/
- **Orange Book**: https://www.accessdata.fda.gov/scripts/cder/ob/
- **Purple Book**: https://purplebooksearch.fda.gov/
- **FAERS Dashboard**: https://fis.fda.gov/sense/app/95239e26-e0be-42d9-a960-9a5f7f1c25ee/sheet/

### Performance Optimization

#### Slow Dashboard Loading
1. Check Railway API response times
2. Optimize database queries (add indexes)
3. Implement pagination for large datasets
4. Use React.memo for expensive components

#### AI Generation Timeouts
1. Increase Netlify function timeout (max 10 min)
2. Break large requests into smaller chunks
3. Cache FDA data when possible
4. Use background processing for bulk operations

### Security Considerations

#### HIPAA Compliance
- Never store patient names or IDs
- Use submission IDs only
- No PHI in logs or error messages
- Audit trail for all changes

#### API Security
- Rotate API keys quarterly
- Use environment variables only
- Never commit keys to Git
- Monitor usage for anomalies

### Frequently Needed Code Snippets

#### Add New Therapeutic Area
```javascript
// src/constants/therapeuticAreas.ts
export const THERAPEUTIC_AREAS = [
  'Oncology',
  'Cardiology',
  'NEW_AREA', // Add here
  ...
];
```

#### Update AI Temperature
```javascript
// netlify/functions/perplexity-generate-geo-optimized.js
temperature: 0.7, // Increase for creativity, decrease for consistency
```

#### Add Custom FDA Query
```javascript
// netlify/functions/fda-query-enhanced.js
// Add new endpoint
const customResponse = await fetch(
  `https://api.fda.gov/drug/newEndpoint.json?search=${query}`
);
```

### Platform Limitations

1. **Rate Limits**:
   - FDA API: 1000 requests/day without key
   - Perplexity: Check dashboard for limits
   - Claude: 1000 requests/minute

2. **Data Restrictions**:
   - No personal health information
   - No patient-specific content
   - US market focus (FDA primary)

3. **Technical Constraints**:
   - Max 10MB for Netlify function payload
   - 10-minute timeout for functions
   - PostgreSQL connection limit on Railway

### Future Roadmap

#### Planned Features
1. EMA (European) database integration
2. Real-time collaboration
3. Version control for content
4. A/B testing for SEO
5. Multi-language support
6. API for enterprise clients

#### AI Enhancements
1. GPT-4 integration option
2. Gemini for medical imaging
3. Local LLM for sensitive data
4. Voice content optimization
5. Video script generation

---

## Quick Start for Urgent Issues

### "The site is down!"
```bash
# 1. Check services
curl https://3cubed-seo-production.up.railway.app/health
curl https://3cubed-seo.netlify.app/

# 2. Check status pages
# https://www.netlifystatus.com/
# https://status.railway.app/

# 3. Restart if needed
# Railway: Dashboard > Restart
# Netlify: Trigger redeploy
```

### "AI content is wrong!"
1. Check FDA data quality
2. Review Perplexity prompt
3. Verify Claude QA caught issue
4. Add specific rule to prompts
5. Retrigger generation

### "Client needs custom feature!"
1. Check if configurable via prompts
2. Estimate development time
3. Consider regulatory impact
4. Test with sample data first

Remember: When in doubt, prioritize medical accuracy and regulatory compliance over SEO performance. The platform's reputation depends on trustworthy medical content.

---

## Business Model & Pricing

### Target Customers
1. **Pharmaceutical Companies**: Pfizer, Merck, Novartis, etc.
2. **Biotech Startups**: Pre-revenue to commercial stage
3. **Medical Device Manufacturers**: Class II/III devices
4. **Digital Health Companies**: FDA-regulated apps
5. **Healthcare Marketing Agencies**: Serving pharma clients

### Pricing Tiers

#### Starter ($2,500/month)
- 10 products/drugs
- 100 AI generations/month
- Basic FDA data
- Email support

#### Professional ($5,000/month)
- 50 products/drugs
- 500 AI generations/month
- Enhanced FDA intelligence
- Priority support
- Custom therapeutic areas

#### Enterprise ($10,000+/month)
- Unlimited products
- Unlimited AI generations
- White-label option
- Dedicated account manager
- API access
- Custom AI training

### Value Proposition
- **Time Savings**: 90% faster than manual SEO content creation
- **Compliance**: 100% FDA-compliant content
- **AI Optimization**: First-mover advantage in AI search
- **Cost Reduction**: Replace 3-5 FTE medical writers
- **Scale**: Generate content for entire portfolio

### Competitive Landscape
- **Traditional SEO Tools**: Not medical-compliant
- **Medical Writing Agencies**: Not SEO/GEO optimized
- **In-House Teams**: Lack AI optimization expertise
- **3Cubed SEO**: Only platform combining all three

---

## Data Privacy & Compliance

### HIPAA Compliance
- Platform is **NOT** a covered entity
- No patient data processed or stored
- Only drug/device information
- Business Associate Agreement (BAA) not required

### Data Handling
```javascript
// What we store
{
  drug_information: "✓",
  company_information: "✓",
  user_accounts: "✓",
  ai_generated_content: "✓",
  
  // What we DON'T store
  patient_data: "✗",
  clinical_trial_participants: "✗",
  personal_health_information: "✗",
  prescriber_data: "✗"
}
```

### International Compliance
- **GDPR (EU)**: User consent for data processing
- **PIPEDA (Canada)**: Privacy policy compliance
- **Data Residency**: US-based servers only currently

### Audit Trail
All actions are logged for compliance:
- User actions (create, edit, approve)
- AI generation requests
- Content modifications
- Approval workflows
- Export history

---

## Platform Maintenance

### Daily Tasks
- Monitor Railway/Netlify status
- Check AI generation queue
- Review error logs
- Verify FDA API connectivity

### Weekly Tasks
- Database backup verification
- Performance metrics review
- AI accuracy spot checks
- User feedback review

### Monthly Tasks
- Update FDA endpoints if changed
- Review AI model performance
- Security updates
- Usage analytics report

### Quarterly Tasks
- Rotate API keys
- Compliance audit
- Disaster recovery test
- Platform roadmap review

---

## Glossary of Medical/Pharma Terms

- **IND**: Investigational New Drug application
- **NDA**: New Drug Application
- **BLA**: Biologics License Application
- **510(k)**: Medical device clearance
- **PMA**: Premarket Approval (devices)
- **REMS**: Risk Evaluation and Mitigation Strategy
- **MoA**: Mechanism of Action
- **AE**: Adverse Event
- **SAE**: Serious Adverse Event
- **PI**: Prescribing Information
- **ISI**: Important Safety Information
- **HCP**: Healthcare Provider/Professional
- **DTC**: Direct to Consumer
- **MLR**: Medical Legal Review
- **Fair Balance**: Equal presentation of benefits/risks
- **Off-Label**: Use beyond FDA approval
- **Black Box Warning**: FDA's strongest warning
- **HEOR**: Health Economics and Outcomes Research
- **RWE**: Real World Evidence
- **ICER**: Incremental Cost-Effectiveness Ratio

---

## File Structure Reference

```
3cubed-seo/
├── src/
│   ├── components/
│   │   ├── FieldApprovalControl.tsx    # Individual field review
│   │   ├── GEOScoreBreakdown.tsx      # GEO scoring display
│   │   └── SubmissionForm.tsx         # Main input form
│   ├── pages/
│   │   ├── SEORequests.tsx           # Form page
│   │   ├── SEOReview.tsx             # Review dashboard
│   │   └── SEOReviewDetail.tsx       # Detailed review
│   ├── lib/
│   │   ├── api.ts                    # Railway API client
│   │   └── ai-api.ts                 # AI processing client
│   └── constants/
│       └── therapeuticAreas.ts        # Medical specialties
├── netlify/
│   └── functions/
│       ├── fda-query-enhanced.js      # FDA intelligence
│       ├── perplexity-generate-geo.js # Content generation
│       └── claude-qa.js               # QA review
├── railway-api/
│   └── server.js                      # Express backend
└── docs/
    ├── GEO_IMPLEMENTATION_GUIDE.md    # GEO details
    └── AI_FIELD_MAPPING_GUIDE.md      # Field reference
```

---

## Version History

### Current Version: 2.0 (August 2025)
- Migrated from Supabase/N8N to Railway/Netlify
- Added GEO optimization
- Enhanced FDA intelligence
- 10 consumer questions requirement
- Dynamic content depth

### Version 1.0 (2024)
- Initial platform launch
- Basic SEO generation
- Supabase backend
- N8N workflows

### Upcoming Version 3.0
- EMA integration
- Real-time collaboration
- Advanced analytics
- Enterprise API