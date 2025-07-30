# FDA Clinical Trials API Integration for SEO Content Enhancement

## Overview
This module integrates ClinicalTrials.gov API data into the pharmaceutical SEO content generation pipeline to enhance content accuracy and regulatory compliance.

## FDA Pharmaceutical Databases Available

### 1. ClinicalTrials.gov API v2.0
- **Base URL**: `https://clinicaltrials.gov/api/v2/`
- **Data**: Clinical trial protocols, results, participant info
- **Use Case**: Trial validation, endpoint verification, regulatory status

### 2. OpenFDA Platform (Multiple Databases)
**Base URL**: `https://api.fda.gov/`

#### 2.1 FAERS (FDA Adverse Event Reporting System)
- **Endpoint**: `/drug/event.json`
- **Data**: Post-market safety surveillance, adverse events
- **Use Case**: Safety profile validation, risk assessment

#### 2.2 SPL (Structured Product Labeling)
- **Endpoint**: `/drug/label.json`
- **Data**: FDA-approved drug labeling information
- **Use Case**: Official prescribing info, indications, contraindications

#### 2.3 Drug Approvals (Drugs@FDA)
- **Endpoint**: `/drug/drugsfda.json`
- **Data**: FDA approval history, submission details
- **Use Case**: Regulatory timeline, approval status verification

#### 2.4 Drug Recalls (RES)
- **Endpoint**: `/drug/recall.json`
- **Data**: Product recalls, safety alerts, market withdrawals
- **Use Case**: Current safety status, regulatory actions

#### 2.5 Drug Shortages
- **Endpoint**: `/drug/shortage.json`
- **Data**: Current and resolved drug shortages
- **Use Case**: Market availability, supply chain issues

### 3. Additional FDA Resources
#### 3.1 FDALabel Database
- **Access**: Web-based search (150,000+ labeling documents)
- **Data**: Comprehensive drug labeling archive
- **Use Case**: Historical labeling changes, detailed prescribing info

#### 3.2 Orange Book (Approved Drug Products)
- **Data**: Therapeutic equivalence evaluations
- **Use Case**: Generic equivalents, patent information

#### 3.3 Purple Book (Biological Products)
- **Data**: FDA-licensed biologics, biosimilars
- **Use Case**: Biologic product information, biosimilar landscape

## Integration Architecture

### N8N Workflow Enhancement
Add new node between "Validate Phase" and "Generate Content - Perplexity":

```
Validate Phase → FDA Data Enrichment → Generate Content - Perplexity
```

## FDA Data Enrichment Node Implementation

### Search Parameters
Based on submission form data, search for:
- **NCT Number** (if provided): Direct trial lookup
- **Product Name**: Intervention name search
- **Generic Name**: Alternative intervention search
- **Therapeutic Area**: Condition/disease search
- **Sponsor**: Organization search

### API Endpoints

#### ClinicalTrials.gov v2.0 Endpoints
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

#### Data Fields to Extract
```json
{
  "nctId": "NCT12345678",
  "briefTitle": "Study title",
  "officialTitle": "Full official title",
  "overallStatus": "COMPLETED",
  "phase": ["PHASE3"],
  "studyType": "INTERVENTIONAL",
  "primaryCompletionDate": "2024-12-01",
  "sponsor": {
    "leadSponsor": {
      "name": "Pharmaceutical Company"
    }
  },
  "conditions": ["Diabetes", "Type 2"],
  "interventions": [
    {
      "type": "DRUG",
      "name": "Product Name",
      "description": "Product description"
    }
  ],
  "primaryOutcomes": [
    {
      "measure": "Primary endpoint description",
      "timeFrame": "52 weeks"
    }
  ],
  "eligibility": {
    "minimumAge": "18 Years",
    "maximumAge": "75 Years",
    "gender": "ALL"
  },
  "locations": [
    {
      "facility": {
        "name": "Medical Center",
        "address": {
          "city": "New York",
          "state": "NY",
          "country": "United States"
        }
      }
    }
  ]
}
```

## N8N Code Node Implementation

### Multi-Database Enrichment Strategy
```javascript
// Comprehensive FDA Data Enrichment Node
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

// 3. DRUG LABELING DATA (SPL)
try {
  const searchTerms = [productName, genericName].filter(Boolean);
  for (const term of searchTerms) {
    const labelData = await fetchWithDelay(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${term}"+openfda.generic_name:"${term}"&limit=3`);
    if (labelData?.results?.length > 0) {
      const label = labelData.results[0];
      enrichedData.drug_labeling_data = {
        indications_and_usage: label.indications_and_usage?.[0],
        dosage_and_administration: label.dosage_and_administration?.[0],
        contraindications: label.contraindications?.[0],
        warnings_and_cautions: label.warnings_and_cautions?.[0],
        adverse_reactions: label.adverse_reactions?.[0],
        drug_interactions: label.drug_interactions?.[0],
        use_in_specific_populations: label.use_in_specific_populations?.[0],
        clinical_pharmacology: label.clinical_pharmacology?.[0],
        ndc_numbers: label.openfda?.product_ndc
      };
      break;
    }
  }
} catch (error) {
  console.log('Drug labeling lookup failed:', error);
}

// 4. ADVERSE EVENTS DATA (FAERS) - Recent events only
try {
  const searchTerms = [productName, genericName].filter(Boolean);
  for (const term of searchTerms) {
    const adverseData = await fetchWithDelay(`https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${term}"&count=reaction.reactionmeddrapt.exact&limit=10`);
    if (adverseData?.results?.length > 0) {
      enrichedData.adverse_events_data = {
        top_reactions: adverseData.results.slice(0, 5).map(r => ({
          reaction: r.term,
          count: r.count
        })),
        data_source: 'FAERS',
        note: 'Post-market surveillance data'
      };
      break;
    }
  }
} catch (error) {
  console.log('Adverse events lookup failed:', error);
}

// 5. RECALL DATA (RES)
try {
  const searchTerms = [productName, genericName].filter(Boolean);
  for (const term of searchTerms) {
    const recallData = await fetchWithDelay(`https://api.fda.gov/drug/recall.json?search=product_description:"${term}"&limit=5`);
    if (recallData?.results?.length > 0) {
      enrichedData.recall_data = {
        recent_recalls: recallData.results.map(r => ({
          recall_number: r.recall_number,
          recall_date: r.recall_initiation_date,
          reason: r.reason_for_recall,
          classification: r.classification,
          status: r.status
        })),
        recall_count: recallData.results.length
      };
      break;
    }
  }
} catch (error) {
  console.log('Recall lookup failed:', error);
}

// 6. DRUG SHORTAGE DATA
try {
  const searchTerms = [productName, genericName].filter(Boolean);
  for (const term of searchTerms) {
    const shortageData = await fetchWithDelay(`https://api.fda.gov/drug/shortage.json?search=product_name:"${term}"&limit=3`);
    if (shortageData?.results?.length > 0) {
      enrichedData.shortage_data = {
        current_shortages: shortageData.results.map(s => ({
          product_name: s.product_name,
          shortage_status: s.shortage_status,
          shortage_designation: s.shortage_designation,
          estimated_resupply_date: s.estimated_resupply_date
        }))
      };
      break;
    }
  }
} catch (error) {
  console.log('Shortage lookup failed:', error);
}

// Compile comprehensive FDA data
const enrichedRecord = {
  ...record,
  fda_comprehensive_data: enrichedData,
  fda_data_sources: Object.keys(enrichedData).filter(key => enrichedData[key] !== null),
  fda_enrichment_timestamp: new Date().toISOString()
};

return {
  ...enrichedRecord,
  submission_id: record.id
};
```

## Enhanced Perplexity Prompt Integration

### Additional Context for AI Generation
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

## Database Schema Updates

### Add FDA Data Fields to Submissions Table
```sql
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fda_clinical_data JSONB;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fda_data_source VARCHAR(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS nct_verified BOOLEAN DEFAULT FALSE;
```

## Implementation Benefits

### Content Quality Enhancement
- **Accurate Clinical Data**: Real FDA trial information
- **Regulatory Compliance**: Official trial details and terminology
- **Enhanced Credibility**: Reference to NCT numbers and official studies
- **Market Intelligence**: Competitive landscape insights

### SEO Benefits
- **Authority Signals**: Links to official government data
- **Rich Snippets**: Structured clinical trial data
- **Long-tail Keywords**: Specific trial terminology and endpoints
- **Entity Recognition**: Official pharmaceutical entities and relationships

## Rate Limiting & Error Handling

### ClinicalTrials.gov API Limits
- No authentication required
- Rate limits not explicitly published
- Implement 1-second delays between requests
- Cache results for 24 hours

### Error Handling Strategy
```javascript
// Fallback gracefully if FDA APIs are unavailable
try {
  // FDA API calls
} catch (error) {
  console.log('FDA API unavailable, proceeding without enrichment');
  return originalRecord;
}
```

## Next Steps

1. **Add FDA enrichment node** to n8n workflow
2. **Update Perplexity prompt** with FDA data integration
3. **Test with various NCT numbers** and product names
4. **Monitor API performance** and add caching if needed
5. **Update dashboard** to display FDA clinical trial data

This integration will significantly enhance the quality and credibility of pharmaceutical SEO content by incorporating official FDA clinical trial data.