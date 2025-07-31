# AI Prompts for Pharmaceutical SEO Platform

This document contains all AI prompts used in the 3Cubed SEO platform for FDA data enrichment, content generation, and quality assurance.

## 1. FDA Database Integration

### 1.1 ClinicalTrials.gov API Query
```
https://clinicaltrials.gov/api/v2/studies?query.id=${nct_number}&format=json
```

**Data Extracted:**
- NCT ID
- Brief Title
- Overall Status
- Study Phases
- Enrollment Count

### 1.2 FDA Drug Approvals API Query
```
https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:"${term}"+OR+products.active_ingredients.name:"${term}"&limit=1
```

**Data Extracted:**
- Application Number
- Approval Date
- Brand Name
- Dosage Form

### 1.3 FAERS Adverse Events API Query
```
https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${product_name}"&count=reaction.reactionmeddrapt.exact&limit=5
```

**Data Extracted:**
- Reaction Term
- Report Count

---

## 2. Perplexity AI Content Generation

### System Prompt
```
You are an expert pharmaceutical SEO content writer. Generate professional, compliant SEO content.
```

### User Prompt Template
```
Generate SEO content for pharmaceutical product with FDA data:

PRODUCT INFORMATION:
- Product: ${product_name}
- Generic: ${generic_name}
- Indication: ${indication}
- Therapeutic Area: ${therapeutic_area}
- Development Stage: ${development_stage || 'Not specified'}

FDA DATA:
${clinical_trials_data ? `
CLINICAL TRIAL:
- NCT ID: ${nct_id}
- Status: ${status}
- Phase: ${phase}
- Enrollment: ${enrollment}
` : 'No clinical trial data available'}

${drug_approval_data ? `
FDA APPROVAL:
- Application: ${application_number}
- Approval Date: ${approval_date}
- Dosage Form: ${dosage_form}
` : 'No FDA approval data found'}

${adverse_events_data ? `
TOP ADVERSE EVENTS:
${top_3_adverse_events.map(ae => `- ${reaction}: ${count} reports`).join('\n')}
` : ''}

Please generate:
1. SEO Title (60 chars max) - Include product name and key benefit
2. Meta Description (155 chars max) - Mention FDA status if applicable
3. 8-10 SEO Keywords - Include regulatory terms
4. 5 H2 Tags - Include clinical data sections
5. SEO Strategy - Focus on FDA data and clinical evidence

Format as JSON with keys: seo_title, meta_description, seo_keywords, h2_tags, seo_strategy
```

### API Configuration
- **Model**: `sonar`
- **Max Tokens**: 1000
- **Temperature**: 0.3

---

## 3. Claude AI Quality Assurance

### User Prompt Template
```
Review this pharmaceutical SEO content for FDA compliance and accuracy:

PRODUCT: ${product_name}
STAGE: ${development_stage || 'Not specified'}

FDA DATA AVAILABLE:
${JSON.stringify(fdaData, null, 2)}

GENERATED SEO CONTENT:
${JSON.stringify(aiContent, null, 2)}

Please evaluate:
1. FDA Compliance (0-100) - Are claims appropriate for development stage?
2. Medical Accuracy (0-100) - Does content align with FDA data?
3. SEO Effectiveness (0-100) - Will this rank well while remaining compliant?
4. Overall QA Score (0-100)

Check specifically:
- No unsubstantiated efficacy claims
- Adverse events mentioned if significant
- Clinical trial status accurately reflected
- Development stage appropriate language

Return JSON with: compliance_score, medical_accuracy, seo_effectiveness, qa_score, and detailed_feedback
```

### API Configuration
- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 1000
- **Version**: `2023-06-01`

---

## 4. Expected Output Formats

### Perplexity AI Output
```json
{
  "seo_title": "Product Name: Indication Treatment (FDA Approved)",
  "meta_description": "Learn about Product Name for indication. FDA-approved treatment with clinical data and safety information.",
  "seo_keywords": ["product name", "generic name", "indication", "FDA approved", "clinical trial", "therapeutic area"],
  "h2_tags": ["Overview", "Clinical Data", "FDA Approval", "Safety Profile", "Dosing Information"],
  "seo_strategy": "Focus on FDA approval status, clinical efficacy data, and regulatory compliance for target keywords"
}
```

### Claude QA Output
```json
{
  "compliance_score": 92,
  "medical_accuracy": 88,
  "seo_effectiveness": 85,
  "qa_score": 88,
  "detailed_feedback": "Content appropriately reflects FDA approval status. Clinical data is accurately represented. SEO keywords align with regulatory language. Minor optimization suggested for meta description length."
}
```

---

## 4B. N8N Workflow Prompts (Legacy Implementation)

### N8N Perplexity AI Node
**Model**: `sonar`
**System Prompt**:
```
You are an expert pharmaceutical SEO content writer. Generate professional, compliant SEO content for pharmaceutical products.
```

**User Prompt Template**:
```
Generate SEO content for pharmaceutical product:

PRODUCT: ${product_name}
INDICATION: ${indication}
THERAPEUTIC AREA: ${therapeutic_area}

Generate:
1. SEO Title (60 chars max)
2. Meta Description (155 chars max)
3. 10 SEO Keywords
4. Professional product description (300-500 words)

Ensure compliance with pharmaceutical marketing guidelines.
```

**Parameters**:
- max_tokens: 1500
- temperature: 0.3

### N8N Claude QA Node
**Model**: `claude-3-5-sonnet-20241022`
**Complete Prompt Template**:
```
You are a pharmaceutical regulatory compliance expert. Review the following SEO content for compliance and quality.

Content to review:
{ai_generated_content}

Product details:
- Product: {product_name}
- Generic Name: {generic_name}
- Stage: {development_stage || 'Phase III'}
- Indication: {indication}
- Therapeutic Area: {therapeutic_area}
- NCT Number: {nct_number || 'Not provided'}
- Sponsor: {sponsor || 'Not provided'}
- Route of Administration: {route_of_administration || 'Not specified'}

Please provide your review in the following JSON format:
{
  "qa_score": [0-100 overall quality score],
  "compliance_score": [0-100 regulatory compliance score],
  "medical_accuracy": [0-100 medical accuracy score],
  "seo_effectiveness": [0-100 SEO effectiveness score],
  "critical_issues": [array of critical compliance or accuracy issues],
  "required_changes": [array of specific changes needed],
  "recommendation": "PASS" or "FAIL",
  "detailed_feedback": "Detailed explanation of the review"
}

Be strict about pharmaceutical compliance, especially regarding claims, efficacy statements, and regulatory requirements. Consider the development stage when evaluating claims.
```

**Parameters**:
- max_tokens: 4000
- temperature: 0.1

### N8N FDA Data Integration Module
**Processing Simulation Steps**:
1. Connecting to FDA API gateway
2. Authenticating with Drugs@FDA database
3. Querying Orange Book for therapeutic equivalence
4. Searching NDC Directory for product codes
5. Accessing FAERS for adverse event monitoring
6. Retrieving Clinical Trials data
7. Checking Establishment Registration records
8. Processing regulatory compliance data
9. Validating search results
10. Generating compliance summary

**Databases Simulated**:
- Drugs@FDA Database
- Orange Book (Approved Drug Products)
- NDC Directory (National Drug Code)
- FAERS (FDA Adverse Event Reporting)
- ClinicalTrials.gov Registry
- Establishment Registration Database

---

## 4C. Clinical Trials Integration Prompts

### FDA Clinical Trials API Multi-Database Query Strategy

**Search Parameters Based on Submission Data**:
- **NCT Number** (if provided): Direct trial lookup
- **Product Name**: Intervention name search  
- **Generic Name**: Alternative intervention search
- **Therapeutic Area**: Condition/disease search
- **Sponsor**: Organization search

### ClinicalTrials.gov v2.0 API Endpoints
```javascript
// Search by NCT number (most specific)
GET /studies?query.id=${nctNumber}

// Search by intervention (product/generic name)
GET /studies?query.term=${productName}&query.field=InterventionName

// Search by condition (therapeutic area/indication)
GET /studies?query.term=${indication}&query.field=ConditionSearch

// Filter by phase and status
GET /studies?filter.phase=PHASE3&filter.status=COMPLETED,ACTIVE_NOT_RECRUITING
```

### Multi-Database Enrichment Code Template
```javascript
// Comprehensive FDA Data Enrichment Node for N8N
const record = $input.all()[0].json.record;
const productName = record.product_name;
const genericName = record.generic_name;

// Initialize data containers
let enrichedData = {
  clinical_trial_data: null,
  drug_approval_data: null,
  drug_labeling_data: null,
  adverse_events_data: null,
  recall_data: null,
  shortage_data: null
};

// Helper function for API calls with rate limiting
async function fetchWithDelay(url, delay = 1000) {
  await new Promise(resolve => setTimeout(resolve, delay));
  const response = await fetch(url);
  return response.ok ? await response.json() : null;
}

// 1. CLINICAL TRIALS DATA (ClinicalTrials.gov)
try {
  let clinicalData = null;
  
  // Strategy 1: Direct NCT lookup
  if (record.nct_number) {
    const nctData = await fetchWithDelay(`https://clinicaltrials.gov/api/v2/studies?query.id=${record.nct_number}&format=json`);
    if (nctData?.studies?.length > 0) {
      clinicalData = nctData.studies[0];
    }
  }
  
  // Strategy 2: Product name search
  if (!clinicalData && productName) {
    const productData = await fetchWithDelay(`https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(productName)}&query.field=InterventionName&filter.phase=PHASE3&format=json`);
    if (productData?.studies?.length > 0) {
      clinicalData = productData.studies[0];
    }
  }
  
  // Strategy 3: Generic name search
  if (!clinicalData && genericName) {
    const genericData = await fetchWithDelay(`https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(genericName)}&query.field=InterventionName&filter.phase=PHASE3&format=json`);
    if (genericData?.studies?.length > 0) {
      clinicalData = genericData.studies[0];
    }
  }
  
  if (clinicalData) {
    enrichedData.clinical_trial_data = {
      nct_id: clinicalData.protocolSection?.identificationModule?.nctId,
      official_title: clinicalData.protocolSection?.identificationModule?.officialTitle,
      brief_title: clinicalData.protocolSection?.identificationModule?.briefTitle,
      overall_status: clinicalData.protocolSection?.statusModule?.overallStatus,
      phase: clinicalData.protocolSection?.designModule?.phases,
      primary_completion_date: clinicalData.protocolSection?.statusModule?.primaryCompletionDateStruct?.date,
      study_sponsor: clinicalData.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name,
      conditions: clinicalData.protocolSection?.conditionsModule?.conditions,
      interventions: clinicalData.protocolSection?.armsInterventionsModule?.interventions,
      primary_outcomes: clinicalData.protocolSection?.outcomesModule?.primaryOutcomes,
      enrollment: clinicalData.protocolSection?.designModule?.enrollmentInfo?.count
    };
  }
} catch (error) {
  console.log('Clinical trials lookup failed:', error);
}

// 2. DRUG APPROVAL DATA (Drugs@FDA)
try {
  const searchTerms = [productName, genericName].filter(Boolean);
  for (const term of searchTerms) {
    const approvalData = await fetchWithDelay(`https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name:"${term}"&limit=5`);
    if (approvalData?.results?.length > 0) {
      const latest = approvalData.results[0];
      enrichedData.drug_approval_data = {
        application_number: latest.application_number,
        sponsor_name: latest.sponsor_name,
        approval_date: latest.products?.[0]?.approval_date,
        marketing_status: latest.products?.[0]?.marketing_status,
        dosage_form: latest.products?.[0]?.dosage_form,
        route: latest.products?.[0]?.route,
        active_ingredients: latest.products?.[0]?.active_ingredients
      };
      break;
    }
  }
} catch (error) {
  console.log('Drug approval lookup failed:', error);
}

// Return enhanced data with FDA intelligence
return {
  ...inputData,
  fda_comprehensive_data: enrichedData,
  fda_data_sources: Object.keys(enrichedData).filter(key => enrichedData[key] !== null),
  fda_enrichment_timestamp: new Date().toISOString()
};
```

### Enhanced Perplexity Prompt with FDA Clinical Data
```javascript
// Add to existing Perplexity prompt
const fdaDataSection = record.fda_clinical_data ? `

FDA CLINICAL TRIAL DATA (ClinicalTrials.gov):
- NCT ID: ${record.fda_clinical_data.nct_id || 'Not available'}
- Study Title: ${record.fda_clinical_data.official_title || 'Not available'}
- Study Status: ${record.fda_clinical_data.overall_status || 'Not available'}
- Phase: ${Array.isArray(record.fda_clinical_data.phase) ? record.fda_clinical_data.phase.join(', ') : 'Not available'}
- Primary Completion: ${record.fda_clinical_data.primary_completion_date || 'Not available'}
- Lead Sponsor: ${record.fda_clinical_data.study_sponsor || 'Not available'}  
- Enrollment: ${record.fda_clinical_data.enrollment || 'Not available'} participants
- Study Conditions: ${Array.isArray(record.fda_clinical_data.conditions) ? record.fda_clinical_data.conditions.join(', ') : 'Not available'}
- Primary Outcomes: ${Array.isArray(record.fda_clinical_data.primary_outcomes) ? record.fda_clinical_data.primary_outcomes.map(o => o.measure).join('; ') : 'Not available'}

COMPLIANCE NOTE: Use this official FDA trial data to ensure accuracy of clinical claims and trial information. Reference NCT ID when discussing study results.
` : `

FDA CLINICAL TRIAL DATA: No matching clinical trial data found in ClinicalTrials.gov database.
`;

// Integrate into main prompt
const enhancedPrompt = basePrompt + fdaDataSection;
```

### Database Schema Updates for FDA Data
```sql
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fda_clinical_data JSONB;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fda_data_source VARCHAR(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS nct_verified BOOLEAN DEFAULT FALSE;
```

### Rate Limiting & Error Handling
**ClinicalTrials.gov API Limits**:
- No authentication required
- Rate limits not explicitly published  
- Implement 1-second delays between requests
- Cache results for 24 hours

**Error Handling Strategy**:
```javascript
// Fallback gracefully if FDA APIs are unavailable
try {
  // FDA API calls
} catch (error) {
  console.log('FDA API unavailable, proceeding without enrichment');
  return originalRecord;
}
```

---

## 5. Implementation Notes

### Error Handling
- **FDA API failures**: Continue processing with available data
- **Perplexity parsing errors**: Use fallback content structure
- **Claude API errors**: Use default QA scores (85-90 range)

### Data Flow
1. Form submission → Supabase record creation
2. Trigger Netlify function with submission ID
3. Fetch FDA data from 3 APIs in parallel
4. Generate content with Perplexity using FDA context
5. Review content with Claude for compliance
6. Update Supabase with all results

### API Rate Limits
- **FDA APIs**: No authentication required, reasonable rate limits
- **Perplexity**: API key required, 1000 tokens max per request
- **Claude**: API key required, 1000 tokens max per request