# Perplexity Output to Supabase Field Mapping

## Direct Field Mappings

### SEO Fields (Traditional)
| Perplexity Output | Supabase Field | Data Type | Notes |
|-------------------|----------------|-----------|-------|
| **1. SEO Keywords (10)** | `seo_keywords` | string[] | Array of 10 primary keywords |
| **2. Long-tail Keywords (5)** | `long_tail_keywords` | string[] | Array of 5 long-tail phrases |
| **3. Consumer Questions (10)** | `consumer_questions` | string[] | Array of 10 common questions |
| **4. H1 Tag** | `h1_tag` | string | Main page heading |
| **5. H2 Tags (5-6)** | `h2_tags` | string[] | Array of subheadings |
| **6. Title Tag** | `seo_title` | string | 50-60 characters |
| **7. Meta Description** | `meta_description` | string | 140-155 characters |
| **8. Body Content** | Store in `ai_generated_content.body_content` | string | 500-800 words |
| **9. Schema Markup** | Store in `ai_generated_content.schema_markup` | JSON | JSON-LD structured data |

### GEO Fields (AI Optimization)
| Perplexity Output | Supabase Field | Data Type | Notes |
|-------------------|----------------|-----------|-------|
| **10. GEO Content** | `geo_optimization` | JSON | Object containing all GEO fields |

## GEO Optimization JSON Structure

The `geo_optimization` field should contain:

```json
{
  "ai_summary": "2-3 sentence summary with citations",
  "medical_facts": {
    "drug_class": "Technical classification",
    "mechanism": "MOA with scientific terms",
    "administration": "Route, dosing, frequency",
    "key_efficacy": "Primary endpoint with statistics"
  },
  "evidence_statistics": [
    "Trial: NAME (NCT#) with N=X",
    "Primary Outcome: X% (95% CI)",
    "Response Rate: X%",
    "Safety: X% Grade 3+ AEs"
  ],
  "citations": {
    "fda": "Approval date, NDA/BLA#",
    "clinical_trial": "NCT#, phase",
    "publication": "Journal, DOI"
  },
  "voice_search_answers": {
    "what_is": "Answer to 'What is [product] used for?'",
    "how_works": "Answer to 'How does [product] work?'",
    "fda_approved": "Answer to 'Is [product] FDA approved?'"
  },
  // Dynamic fields based on stage:
  "trial_enrollment": { // Phase III only
    "eligibility": "Key criteria",
    "locations": "Sites/countries",
    "contact": "ClinicalTrials.gov link",
    "timeline": "Completion date"
  },
  "prescribing_highlights": { // Market Launch only
    "dosing": "Standard regimen",
    "contraindications": ["List"],
    "warnings": ["Key warnings"],
    "interactions": ["Major interactions"]
  },
  "biomarker_info": { // If applicable
    "required_testing": "Test name",
    "cutoff_values": "e.g., PD-L1 ≥50%",
    "testing_method": "FDA-approved test"
  },
  "schema_markup": { // Store schema here too
    "@context": "https://schema.org",
    "@type": "Drug",
    // ... full JSON-LD
  }
}
```

## Important: AI Generated Content Field

The `ai_generated_content` field appears to be the main storage for AI-generated outputs. This should be a JSON field containing:

```json
{
  "body_content": "500-800 word article",
  "body_preview": "First 150 characters for preview...",
  "schema_markup": { /* JSON-LD */ },
  "generation_timestamp": "2024-01-15T10:30:00Z",
  "model_used": "perplexity-sonar",
  "prompt_version": "v2-enhanced"
}
```

## N8N Workflow Mapping

In the N8N workflow, after Perplexity generates content, map to Supabase update:

```javascript
// Parse Perplexity response
const perplexityOutput = parsePerplexityResponse($json.choices[0].message.content);

// Map to Supabase fields
const supabaseUpdate = {
  // SEO Fields
  seo_keywords: perplexityOutput.seo_keywords,
  long_tail_keywords: perplexityOutput.long_tail_keywords,
  consumer_questions: perplexityOutput.consumer_questions,
  h1_tag: perplexityOutput.h1_tag,
  h2_tags: perplexityOutput.h2_tags,
  seo_title: perplexityOutput.title_tag,
  meta_description: perplexityOutput.meta_description,
  seo_strategy_outline: perplexityOutput.seo_strategy || "SEO strategy based on 4 core inputs",
  
  // AI Generated Content
  ai_generated_content: {
    body_content: perplexityOutput.body_content,
    body_preview: perplexityOutput.body_content.substring(0, 150) + "...",
    schema_markup: perplexityOutput.schema_markup,
    generation_timestamp: new Date().toISOString(),
    model_used: "perplexity-sonar",
    prompt_version: "v2-4-questions"
  },
  
  // GEO Fields (as JSON object)
  geo_optimization: {
    ai_summary: perplexityOutput.geo_content.ai_summary,
    medical_facts: perplexityOutput.geo_content.medical_facts,
    evidence_statistics: perplexityOutput.geo_content.evidence_statistics,
    citations: perplexityOutput.geo_content.citations,
    voice_search_answers: perplexityOutput.geo_content.voice_search_answers,
    // Include dynamic fields based on stage
    ...(perplexityOutput.geo_content.trial_enrollment && {
      trial_enrollment: perplexityOutput.geo_content.trial_enrollment
    }),
    ...(perplexityOutput.geo_content.prescribing_highlights && {
      prescribing_highlights: perplexityOutput.geo_content.prescribing_highlights
    }),
    ...(perplexityOutput.geo_content.biomarker_info && {
      biomarker_info: perplexityOutput.geo_content.biomarker_info
    }),
    schema_markup: perplexityOutput.schema_markup
  },
  
  // Update workflow status
  ai_processing_status: 'completed',
  ai_completed_at: new Date().toISOString()
};

// Update Supabase
await supabase
  .from('submissions')
  .update(supabaseUpdate)
  .eq('id', submission_id);
```

## Complete Supabase Field List

Based on the codebase analysis, here are all the AI-related fields:

### Existing Fields Used:
- `seo_keywords` (string[])
- `long_tail_keywords` (string[])
- `consumer_questions` (string[])
- `h1_tag` (string)
- `h2_tags` (string[])
- `seo_title` (string) - Title Tag
- `meta_description` (string)
- `meta_title` (string) - Different from seo_title?
- `seo_strategy_outline` (string) - Brief strategy
- `geo_optimization` (JSON) - All GEO content
- `geo_event_tags` (string[]) - Specific events
- `ai_generated_content` (JSON) - Body content and schema

### Potentially Missing:
- `voice_search_queries` (might be stored in geo_optimization)
- Body content as standalone field (currently in ai_generated_content)

## Field Notes

1. **seo_title** vs **meta_title**: 
   - `seo_title` = Title Tag from Perplexity (50-60 chars)
   - `meta_title` = Might be legacy or different use

2. **seo_strategy_outline**: 
   - Currently seems to store brief strategy
   - Could be repurposed for full body content
   - Or create new field `body_content`

3. **geo_optimization**: 
   - Store as JSON object
   - Contains all GEO-related fields
   - Allows flexible structure for different stages

4. **Stage-specific storage**:
   - Phase III: Include trial_enrollment in geo_optimization
   - Market Launch: Include prescribing_highlights
   - Targeted therapies: Include biomarker_info