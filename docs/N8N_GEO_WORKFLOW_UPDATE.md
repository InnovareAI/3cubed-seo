# n8n Workflow Update for GEO Fields Integration

## Overview
Update the existing n8n workflow to utilize the 106 new comprehensive GEO fields for pharmaceutical content optimization.

## Current Workflow Analysis
The existing workflow (`n8n-workflow-config.json`) has:
- Basic content generation via Perplexity AI (OpenRouter)
- Claude QA validation
- Simple field mapping (seo_title, geo_event_tags, h2_tags, seo_strategy_outline)
- Revision loop with 3-attempt limit

## Required Updates

### 1. Enhanced Content Generation Prompt
Update the Perplexity AI node to include GEO-specific content generation:

```javascript
// Enhanced prompt structure for GEO optimization
const geoPrompt = `
Generate comprehensive pharmaceutical content for: ${$json.product_name}

REGULATORY REQUIREMENTS:
- FDA/EMA approval status: ${$json.fda_ema_approval_status || 'Not specified'}
- Development stage: ${$json.development_stage || 'Not specified'}
- Target patient population: ${$json.patient_population || 'Not specified'}

GEO OPTIMIZATION REQUIREMENTS:
1. Voice Search Optimization
   - Generate natural language queries for voice search
   - Create conversational starters for AI platforms
   - Develop question-based headings

2. AI Platform Optimization
   - ChatGPT-specific content structure
   - Perplexity AI snippet optimization  
   - Google SGE feature targeting
   - Claude AI conversation optimization

3. Clinical Evidence Integration
   - Key clinical trial summaries
   - Efficacy data presentation
   - Safety profile highlights
   - Real-world evidence integration

4. Multi-Modal Content Specifications
   - FAQ sections for schema markup
   - How-to guides for patient education
   - Infographic content descriptions
   - Video content specifications

OUTPUT FORMAT:
Return structured JSON with all GEO fields populated according to the comprehensive schema.
`;
```

### 2. Enhanced Field Mapping for Supabase Update
Update the `save_to_supabase` node to handle all new GEO fields:

```javascript
// Enhanced Supabase update with GEO fields
{
  "updateFields": {
    // Existing fields
    "ai_output": "={{ $json.content }}",
    "seo_title": "={{ $json.content.seo_title }}",
    "geo_event_tags": "={{ $json.content.geo_event_tags }}",
    "h2_tags": "={{ $json.content.h2_tags }}",
    "seo_strategy_outline": "={{ $json.content.seo_strategy_outline }}",
    
    // NEW GEO FIELDS - Regulatory & Compliance
    "fda_ema_approval_status": "={{ $json.content.fda_ema_approval_status }}",
    "approval_dates": "={{ $json.content.approval_dates }}",
    "black_box_warnings": "={{ $json.content.black_box_warnings }}",
    "contraindications": "={{ $json.content.contraindications }}",
    "drug_interactions": "={{ $json.content.drug_interactions }}",
    
    // Clinical Evidence Fields
    "key_clinical_trials": "={{ $json.content.key_clinical_trials }}",
    "efficacy_data": "={{ $json.content.efficacy_data }}",
    "safety_profile": "={{ $json.content.safety_profile }}",
    "real_world_evidence": "={{ $json.content.real_world_evidence }}",
    
    // Voice Search & AI Optimization
    "voice_search_queries": "={{ $json.content.voice_search_queries }}",
    "conversational_starters": "={{ $json.content.conversational_starters }}",
    "natural_language_variants": "={{ $json.content.natural_language_variants }}",
    "question_based_headings": "={{ $json.content.question_based_headings }}",
    
    // AI Platform Optimization
    "chatgpt_optimization": "={{ $json.content.chatgpt_optimization }}",
    "perplexity_optimization": "={{ $json.content.perplexity_optimization }}",
    "google_sge_optimization": "={{ $json.content.google_sge_optimization }}",
    "claude_optimization": "={{ $json.content.claude_optimization }}",
    "ai_readiness_score": "={{ $json.content.ai_readiness_score }}",
    
    // Content Format Specifications
    "faq_sections": "={{ $json.content.faq_sections }}",
    "how_to_guides": "={{ $json.content.how_to_guides }}",
    "infographic_descriptions": "={{ $json.content.infographic_descriptions }}",
    "video_content_specs": "={{ $json.content.video_content_specs }}",
    
    // Advanced GEO Optimization
    "quick_facts": "={{ $json.content.quick_facts }}",
    "key_takeaways": "={{ $json.content.key_takeaways }}",
    "extractable_data_points": "={{ $json.content.extractable_data_points }}",
    "knowledge_graph_connections": "={{ $json.content.knowledge_graph_connections }}",
    
    // Performance Tracking
    "geo_performance_metrics": "={{ $json.content.geo_performance_metrics }}",
    "content_freshness_score": "={{ $json.content.content_freshness_score }}",
    
    // Status Updates
    "workflow_stage": "geo_optimization",
    "ai_processing_status": "geo_optimization",
    "langchain_status": "completed"
  }
}
```

### 3. Enhanced QA Validation
Update Claude QA agent to validate GEO-specific content:

```javascript
// Enhanced QA prompt for GEO validation
const qaPrompt = `
PHARMACEUTICAL GEO CONTENT QA CHECKLIST

Review the generated content for: ${$json.product_name}

VALIDATION CRITERIA:

1. REGULATORY COMPLIANCE ✓
   - FDA/EMA approval status accuracy
   - Contraindications completeness
   - Black box warnings if applicable
   - Regulatory disclaimers present

2. CLINICAL EVIDENCE QUALITY ✓
   - Clinical trial data accuracy
   - Efficacy claims substantiated
   - Safety profile completeness
   - Real-world evidence relevance

3. GEO OPTIMIZATION STANDARDS ✓
   - Voice search queries natural and relevant
   - AI platform optimization specific and actionable
   - FAQ sections comprehensive
   - Knowledge graph connections logical

4. CONTENT STRUCTURE ✓
   - Question-based headings for voice search
   - Extractable data points for AI consumption
   - Multi-modal content specifications complete
   - Schema markup requirements defined

QA DECISION:
- PASS: All criteria met, content ready for SEO review
- REVISIONS_NEEDED: Specify required improvements
- FAIL: Major issues requiring complete regeneration

RESPONSE FORMAT:
{
  "qa_status": "PASS|REVISIONS_NEEDED|FAIL",
  "compliance_score": 0-100,
  "geo_optimization_score": 0-100,
  "content_quality_score": 0-100,
  "feedback": "Detailed feedback and recommendations",
  "required_revisions": ["list", "of", "specific", "improvements"]
}
`;
```

### 4. New Workflow Stages
Add new processing stages for comprehensive GEO optimization:

```javascript
// Enhanced workflow stage routing
const stageRouter = {
  "rules": [
    {
      "condition": "={{ $json.qa_status === 'PASS' && $json.geo_optimization_score >= 80 }}",
      "output": 0, // Proceed to SEO review
      "workflow_stage": "seo_review",
      "ai_processing_status": "completed"
    },
    {
      "condition": "={{ $json.qa_status === 'PASS' && $json.geo_optimization_score < 80 }}",
      "output": 1, // Additional GEO optimization needed
      "workflow_stage": "geo_optimization",
      "ai_processing_status": "geo_optimization"
    },
    {
      "condition": "={{ $json.qa_status === 'REVISIONS_NEEDED' }}",
      "output": 2, // Revision loop
      "workflow_stage": "ai_processing",
      "ai_processing_status": "needs_revision"
    },
    {
      "condition": "={{ $json.qa_status === 'FAIL' }}",
      "output": 3, // Error handling
      "workflow_stage": "failed",
      "ai_processing_status": "failed"
    }
  ]
};
```

### 5. Performance Monitoring
Add performance tracking for GEO optimization:

```javascript
// GEO performance tracking node
const performanceTracker = {
  "type": "n8n-nodes-base.code",
  "parameters": {
    "jsCode": `
// Calculate GEO performance metrics
const startTime = new Date($json.processing_start_time);
const endTime = new Date();
const processingTime = endTime - startTime;

const geoMetrics = {
  processing_time_ms: processingTime,
  field_completion_rate: calculateFieldCompletion($json.content),
  ai_readiness_score: $json.content.ai_readiness_score || 0,
  voice_optimization_score: calculateVoiceOptimization($json.content),
  platform_optimization_scores: {
    chatgpt: $json.content.chatgpt_optimization?.score || 0,
    perplexity: $json.content.perplexity_optimization?.score || 0,
    google_sge: $json.content.google_sge_optimization?.score || 0,
    claude: $json.content.claude_optimization?.score || 0
  },
  content_structure_score: calculateContentStructure($json.content),
  compliance_score: $json.qa_results.compliance_score || 0
};

function calculateFieldCompletion(content) {
  const requiredFields = 106; // Total GEO fields
  const completedFields = Object.values(content).filter(val => 
    val !== null && val !== undefined && val !== '' && 
    (Array.isArray(val) ? val.length > 0 : true)
  ).length;
  return Math.round((completedFields / requiredFields) * 100);
}

return {
  ...items[0].json,
  geo_performance_metrics: geoMetrics,
  processing_completed_at: endTime.toISOString()
};
`
  }
};
```

## Implementation Steps

1. **Update Perplexity AI Node**
   - Enhance prompt to request comprehensive GEO content
   - Include regulatory and clinical context
   - Request structured JSON output with all GEO fields

2. **Expand Supabase Update Node**
   - Add all 106 new GEO field mappings
   - Update workflow stage to "geo_optimization"
   - Set ai_processing_status appropriately

3. **Enhance Claude QA Node**
   - Add GEO-specific validation criteria
   - Include compliance and optimization scoring
   - Provide detailed feedback for revisions

4. **Add Performance Tracking**
   - Monitor GEO optimization completion rates
   - Track AI platform readiness scores
   - Measure processing efficiency

5. **Update Workflow Stages**
   - Add new stages: geo_optimization, voice_optimization, platform_optimization
   - Update routing logic for enhanced QA decisions
   - Implement performance-based routing

## Testing Requirements

1. **Field Population Testing**
   - Verify all 106 GEO fields are populated
   - Test JSONB field structure and validation
   - Confirm TEXT[] arrays are properly formatted

2. **Performance Testing**
   - Measure processing time impact
   - Test with various pharmaceutical products
   - Validate optimization scores

3. **Integration Testing**
   - Test end-to-end workflow with new fields
   - Verify database constraints and indexes
   - Confirm React app compatibility

## Expected Benefits

1. **Enhanced AI Discovery**
   - Improved content visibility in AI search results
   - Better voice search optimization
   - Platform-specific content optimization

2. **Regulatory Compliance**
   - Automated compliance checking
   - Structured regulatory information
   - Audit trail for medical/legal review

3. **Performance Optimization**
   - Faster content generation with structured prompts
   - Better quality assurance with enhanced validation
   - Comprehensive performance tracking

This update will transform the basic content generation workflow into a comprehensive pharmaceutical GEO optimization system, leveraging all 106 new database fields for maximum AI platform visibility and regulatory compliance.