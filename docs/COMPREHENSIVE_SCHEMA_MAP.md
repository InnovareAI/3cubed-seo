# 3Cubed SEO Database Schema Map
**Generated:** July 30, 2025  
**Total Columns:** 153 fields across submissions table  
**GEO Fields Added:** 106 new pharmaceutical optimization fields

## Database Overview
- **Total Columns:** 153
- **Regulatory Fields:** 2 
- **Clinical Fields:** 4
- **GEO Fields:** 7
- **Audience Fields:** 9

## Field Categories & Distribution

### 1. REGULATORY & COMPLIANCE FIELDS (10 fields)
- `fda_ema_approval_status` - JSONB - FDA/EMA approval tracking
- `approval_dates` - JSONB - Regulatory approval timeline
- `black_box_warnings` - TEXT[] - Critical safety warnings
- `contraindications` - TEXT[] - Medical contraindications
- `drug_interactions` - TEXT[] - Known drug interactions
- `special_populations` - JSONB - Population-specific considerations
- `rems_requirements` - TEXT - Risk evaluation/mitigation strategies
- `pregnancy_category` - TEXT - Pregnancy safety classification
- `pediatric_considerations` - TEXT - Pediatric usage guidelines
- `geriatric_considerations` - TEXT - Geriatric usage guidelines

### 2. CLINICAL EVIDENCE FIELDS (9 fields)
- `key_clinical_trials` - JSONB[] - Major clinical trial data
- `efficacy_data` - JSONB - Treatment efficacy metrics
- `safety_profile` - JSONB - Comprehensive safety data
- `quality_of_life_outcomes` - TEXT - QoL improvement data
- `real_world_evidence` - TEXT - Real-world study results
- `response_rates` - JSONB - Treatment response statistics
- `survival_data` - JSONB - Survival outcome data
- `common_adverse_events` - TEXT[] - Frequent side effects
- `serious_adverse_events` - TEXT[] - Severe adverse reactions

### 3. ADMINISTRATION & FORMULATION FIELDS (6 fields)
- `dosage_form` - TEXT - Drug formulation type
- `administration_instructions` - TEXT - Usage instructions
- `formulation_details` - JSONB - Detailed formulation specs
- `dosing_frequency` - TEXT - Dosing schedule
- `storage_requirements` - TEXT - Storage conditions
- `preparation_instructions` - TEXT - Preparation guidelines

### 4. TECHNICAL SEO/GEO ELEMENTS (9 fields)
- `schema_markup_requirements` - JSONB - Structured data needs
- `entity_relationships` - JSONB - Knowledge graph connections
- `medical_ontology_terms` - TEXT[] - Medical terminology
- `voice_search_phrases` - TEXT[] - Voice search optimization
- `long_tail_variations` - TEXT[] - Long-tail keyword variants
- `related_search_terms` - TEXT[] - Related search keywords
- `featured_snippet_targets` - TEXT[] - Featured snippet optimization
- `faq_schema_data` - JSONB[] - FAQ structured data
- `structured_data_markup` - JSONB - Schema.org markup

### 5. AUDIENCE-SPECIFIC CONTENT SECTIONS (8 fields)
- `hcp_information` - JSONB - Healthcare provider content
- `patient_caregiver_info` - JSONB - Patient/caregiver resources
- `pharmacist_counseling` - JSONB - Pharmacist guidance
- `nurse_guidelines` - JSONB - Nursing care guidelines
- `payer_considerations` - JSONB - Insurance/payer information
- `prescribing_information` - JSONB - Prescriber resources
- `patient_counseling_points` - TEXT[] - Patient counseling topics
- `lifestyle_considerations` - TEXT[] - Lifestyle impact factors

### 6. COMMERCIAL ELEMENTS (6 fields)
- `patient_assistance_program` - TEXT - Financial assistance info
- `copay_support_details` - TEXT - Copay assistance programs
- `insurance_coverage_scenarios` - JSONB[] - Coverage scenarios
- `access_reimbursement_pathways` - TEXT - Reimbursement options
- `market_access_details` - JSONB - Market access strategy
- `pricing_information` - JSONB - Pricing and cost data

### 7. VOICE SEARCH & CONVERSATIONAL AI OPTIMIZATION (6 fields)
- `voice_search_queries` - TEXT[] - Voice search optimization
- `conversational_starters` - JSONB[] - Conversation initiators
- `natural_language_variants` - TEXT[] - Natural language variants
- `voice_intent_mapping` - JSONB - Voice search intent mapping
- `question_based_headings` - TEXT[] - Question-format headings
- `direct_answers` - JSONB - Direct answer optimization

### 8. AI PLATFORM-SPECIFIC OPTIMIZATION (6 fields)
- `chatgpt_optimization` - JSONB - ChatGPT-specific optimization
- `perplexity_optimization` - JSONB - Perplexity AI optimization
- `google_sge_optimization` - JSONB - Google SGE optimization
- `bing_chat_optimization` - JSONB - Bing Chat optimization
- `claude_optimization` - JSONB - Claude AI optimization
- `ai_readiness_score` - INTEGER - AI optimization readiness (0-100)

### 9. CONTENT FORMAT SPECIFICATIONS FOR GEO (8 fields)
- `faq_sections` - JSONB[] - FAQ content sections
- `how_to_guides` - JSONB[] - How-to guide specifications
- `infographic_descriptions` - TEXT[] - Infographic content
- `video_content_specs` - JSONB - Video content requirements
- `interactive_elements` - JSONB[] - Interactive content elements
- `downloadable_resources` - JSONB[] - Downloadable content specs
- `case_studies` - JSONB[] - Case study content
- `clinical_data_tables` - JSONB[] - Clinical data presentation

### 10. ADVANCED GEO OPTIMIZATION (6 fields)
- `quick_facts` - JSONB[] - Quick fact snippets
- `key_takeaways` - TEXT[] - Key takeaway messages
- `extractable_data_points` - JSONB - AI-extractable data
- `patient_journey_descriptions` - TEXT[] - Patient journey mapping
- `treatment_algorithm_placement` - TEXT - Treatment algorithm context
- `knowledge_graph_connections` - JSONB - Knowledge graph integration

### 11. MULTI-MODAL CONTENT REFERENCES (4 fields)
- `image_references` - JSONB[] - Image content specifications
- `video_references` - JSONB[] - Video content references
- `audio_content_refs` - JSONB[] - Audio content references
- `multimedia_alt_text` - JSONB - Alt text for multimedia

### 12. ENHANCED MEDICAL/LEGAL REVIEW INTEGRATION (7 fields)
- `mlr_compliance_checklist` - JSONB - MLR compliance tracking
- `medical_accuracy_score` - INTEGER - Medical accuracy rating (0-100)
- `legal_risk_assessment` - TEXT - Legal risk evaluation
- `claim_substantiation` - JSONB[] - Claim support documentation
- `promotional_review_status` - TEXT - Promotional material status
- `regulatory_disclaimers` - TEXT[] - Required disclaimers
- `compliance_notes` - TEXT - Compliance review notes

### 13. ADVANCED ANALYTICS & TRACKING (6 fields)
- `geo_performance_metrics` - JSONB - GEO performance tracking
- `ai_discovery_tracking` - JSONB - AI platform discovery metrics
- `search_intent_analysis` - JSONB - Search intent analysis
- `content_freshness_score` - INTEGER - Content freshness rating (0-100)
- `geo_optimization_history` - JSONB[] - GEO optimization timeline
- `engagement_metrics` - JSONB - Content engagement data

### 14. SEMANTIC & CONTEXT OPTIMIZATION (5 fields)
- `semantic_context_tags` - TEXT[] - Semantic context labels
- `emotional_context_mapping` - JSONB - Emotional context analysis
- `patient_journey_stage` - TEXT - Patient journey phase
- `hcp_decision_factors` - TEXT[] - HCP decision influences
- `sentiment_optimization` - JSONB - Sentiment analysis optimization

### 15. CLINICAL TRIAL INTEGRATION (5 fields)
- `clinical_trial_phases` - TEXT[] - Trial phase information
- `enrollment_criteria` - JSONB - Trial enrollment requirements
- `study_endpoints` - JSONB - Primary/secondary endpoints
- `biomarker_information` - JSONB - Biomarker data
- `patient_reported_outcomes` - JSONB[] - PRO data

### 16. MARKET & COMPETITIVE INTELLIGENCE (5 fields)
- `market_size_data` - JSONB - Market size and growth data
- `market_dynamics` - TEXT - Market trends and dynamics
- `competitive_positioning` - JSONB - Competitive landscape
- `market_share_information` - JSONB - Market share data
- `healthcare_setting_specifics` - JSONB - Healthcare setting considerations

## Database Indexes Created
- `idx_submissions_fda_approval` - GIN index on FDA approval status
- `idx_submissions_clinical_trials` - GIN index on clinical trials
- `idx_submissions_voice_search` - GIN index on voice search queries
- `idx_submissions_entity_relations` - GIN index on entity relationships
- `idx_submissions_schema_markup` - GIN index on schema markup
- `idx_submissions_ai_optimization` - GIN index on ChatGPT optimization
- `idx_submissions_geo_metrics` - GIN index on GEO performance metrics

## Workflow Status Values Updated
### Valid Workflow Stages:
- `draft`, `form_submitted`, `ai_processing`, `seo_review`, `mlr_review`, `client_review`, `approved`, `published`, `rejected`, `revision_requested`, `compliance_review`, `medical_review`, `legal_review`

### Valid AI Processing Status:
- `pending`, `processing`, `geo_optimization`, `voice_optimization`, `platform_optimization`, `compliance_check`, `medical_review`, `qa_review`, `completed`, `failed`, `needs_revision`

## Integration Requirements

### React App Integration
- Form components need updates to handle 106 new JSONB and TEXT[] fields
- TypeScript interfaces require comprehensive updates
- Form validation needs expansion for new field types
- UI components for complex JSONB field editing

### n8n Workflow Integration  
- Perplexity AI node needs access to clinical and regulatory fields
- Claude QA node should validate GEO optimization fields
- New workflow stages for `geo_optimization`, `voice_optimization`, `platform_optimization`
- Webhook handling for new AI processing statuses

### Performance Considerations
- GIN indexes created for JSONB fields requiring frequent queries
- 153 total fields may impact query performance - monitor and optimize
- Consider field grouping for large form submissions

## Next Steps
1. ✅ Database schema expanded with comprehensive GEO fields
2. 🔄 Update React app TypeScript interfaces and form components
3. 🔄 Modify n8n workflows to utilize new GEO fields
4. 🔄 Test end-to-end submission flow with new fields
5. 🔄 Monitor database performance with expanded schema