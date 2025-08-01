// GEO-Optimized Perplexity Function - Creates AI-Friendly Content for Generative Engine Optimization

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { submission, fdaData } = JSON.parse(event.body);
    // Try multiple sources for API key
    let perplexityApiKey = process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY;
    
    // If not found in env, try injected config
    if (!perplexityApiKey) {
      try {
        const config = require('./config-injected.js');
        perplexityApiKey = config.PERPLEXITY_API_KEY;
      } catch (e) {
        // Config file might not exist
      }
    }
    
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // Build comprehensive context with GEO focus
    const trialContext = buildTrialContext(fdaData);
    const competitiveContext = buildCompetitiveContext(fdaData);
    const geoContext = buildGeographicContext(fdaData, submission.geographic_markets);
    const geoOptimizationStrategy = buildGEOStrategy(submission, fdaData);
    
    // Dynamic content depth based on input richness
    const inputDepth = calculateInputDepth(submission, fdaData);
    const contentDepthStrategy = buildContentDepthStrategy(inputDepth, submission);

    const geoEnhancedPrompt = `You are an expert pharmaceutical SEO strategist specializing in Generative Engine Optimization (GEO). Create content that not only ranks in traditional search but is optimized for AI systems like ChatGPT, Claude, Perplexity, and Google's AI Overviews.

PRODUCT PROFILE:
- Product: ${submission.product_name} (${submission.generic_name})
- Indication: ${submission.medical_indication}
- Therapeutic Area: ${submission.therapeutic_area}
- Development Stage: ${fdaData.summary.developmentStage}
- Line of Therapy: ${submission.line_of_therapy || 'Not specified'}
- Key Differentiator: ${submission.mechanism_of_action || 'Novel mechanism'}

${trialContext}

${competitiveContext}

${geoContext}

${geoOptimizationStrategy}

${contentDepthStrategy}

Create comprehensive SEO/GEO content following this structure for maximum AI comprehension:

{
  "seo_title": "Primary title under 60 chars optimized for both search and AI citation",
  
  "geo_optimized_h1_options": {
    "traditional": [
      "FDA-approved format with product name and primary indication",
      "Clinical positioning with generic name and therapeutic class",
      "Cost/access focused with biosimilar or value messaging"
    ],
    "conversational_ai_friendly": [
      "Question format: 'What is [Product] and How Does It Work?'",
      "Guide format: 'Complete Guide to [Product]: Benefits, Safety, Access'",
      "Comparison format: 'Understanding [Product] vs [Competitor]: Key Differences'"
    ]
  },
  
  "meta_description": "Action-oriented description under 155 chars with clear value prop for AI extraction",
  
  "primary_keywords": {
    "high_value": [
      "5-7 terms with search volume estimates",
      "Include brand, generic, indication, and class"
    ],
    "ai_entity_recognition": [
      "Key entities AI systems should recognize",
      "Relationships between drug, disease, and treatment"
    ]
  },
  
  "long_tail_keywords": {
    "question_based": [
      "Natural language queries users ask AI systems",
      "Include 'what is', 'how does', 'can I', 'should I' formats"
    ],
    "clinical_specific": [
      "Detailed medical queries HCPs might ask",
      "Include dosing, contraindications, monitoring"
    ],
    "patient_journey": [
      "Keywords mapping to patient treatment stages",
      "Include starting, switching, managing, accessing"
    ]
  },
  
  "geo_optimized_h2_tags": {
    "clinical_information": [
      "How [Product] Works: [Mechanism] Explained",
      "[Product] vs [Competitor]: Clinical Comparison",
      "Who Should Take [Product]: Eligibility Criteria",
      "[Product] Dosing and Administration Guide",
      "Safety Profile: [Product] Side Effects and Monitoring"
    ],
    "patient_focused": [
      "What to Expect When Starting [Product]",
      "Managing Side Effects on [Product] Therapy",
      "Insurance Coverage and Access for [Product]",
      "Living with [Condition] on [Product]"
    ]
  },
  
  "content_structure_for_ai": {
    "opening_definition": "Clear, concise explanation of what the product is",
    "mechanism_explanation": "How it works in simple and technical terms",
    "indication_list": {
      "approved_uses": ["Bulleted list of FDA-approved indications"],
      "off_label_mentions": ["Common off-label uses if applicable"]
    },
    "efficacy_data": {
      "key_metrics": "Primary endpoint results",
      "comparison_data": "How it compares to SOC or competitors",
      "real_world_evidence": "Post-market data if available"
    },
    "safety_profile": {
      "common_side_effects": ["Most frequent AEs"],
      "serious_warnings": ["Black box or major warnings"],
      "monitoring_requirements": ["Lab tests, exams needed"]
    }
  },
  
  "ai_friendly_content_blocks": {
    "faq_section": [
      {
        "question": "Direct question format",
        "answer": "Comprehensive, conversational answer",
        "schema_markup": "FAQPage",
        "ai_optimization": "Natural language, complete thoughts"
      }
    ],
    "comparison_tables": {
      "vs_competitor": "Side-by-side feature comparison",
      "vs_standard_of_care": "Benefits over current treatment",
      "cost_comparison": "Value proposition clearly stated"
    },
    "step_by_step_guides": [
      "Starting treatment process",
      "Injection/administration technique",
      "Insurance navigation steps"
    ]
  },
  
  "authority_signals_for_ai": {
    "clinical_citations": [
      "Key trials with NCT numbers",
      "Peer-reviewed publications",
      "Regulatory approval dates"
    ],
    "expert_validation": [
      "Medical expert quotes",
      "Institution endorsements",
      "Guideline recommendations"
    ],
    "patient_proof": [
      "Real-world outcomes data",
      "Patient reported outcomes",
      "Quality of life improvements"
    ]
  },
  
  "geo_technical_optimization": {
    "schema_markup": {
      "drug": "Pharmaceutical product markup",
      "medicalCondition": "Disease/indication markup",
      "medicalWebPage": "Page type markup",
      "faqPage": "Q&A content markup",
      "howTo": "Administration guides"
    },
    "content_formatting": {
      "bullet_points": "For easy AI extraction",
      "numbered_lists": "For sequential processes",
      "bold_key_terms": "For entity recognition",
      "clear_headings": "For content hierarchy"
    },
    "ai_accessibility": {
      "clean_urls": "Descriptive, keyword-rich",
      "fast_loading": "Under 3 second load time",
      "mobile_friendly": "Responsive design",
      "readable_structure": "Short paragraphs, clear flow"
    }
  },
  
  "conversational_content_starters": [
    "[Product] is a [class] medication that...",
    "Patients with [condition] may benefit from [Product] because...",
    "The key difference between [Product] and [competitor] is...",
    "Clinical studies have shown that [Product]...",
    "When considering [Product] for treatment, it's important to know..."
  ],
  
  "geo_measurement_framework": {
    "ai_testing_queries": [
      "Questions to test in ChatGPT/Claude/Perplexity",
      "Competitor comparison queries",
      "Treatment decision queries"
    ],
    "success_metrics": [
      "AI citation frequency",
      "Brand mention accuracy",
      "Information completeness",
      "Competitive positioning"
    ]
  },
  
  "competitive_geo_advantages": {
    "unique_positioning": [
      "First-in-class or best-in-class claims",
      "Cost/access advantages",
      "Safety or convenience benefits",
      "Novel mechanism or approach"
    ],
    "content_differentiation": [
      "Topics competitors haven't covered",
      "Deeper clinical data exploration",
      "More comprehensive patient resources",
      "Better structured for AI comprehension"
    ]
  },
  
  "content_distribution_strategy": {
    "platform_optimization": {
      "website": "Primary authoritative source",
      "linkedin": "HCP-focused articles",
      "medium": "Patient education pieces",
      "health_forums": "Community engagement"
    },
    "cross_referencing": [
      "Internal linking strategy",
      "External authority links",
      "Social proof integration"
    ]
  }
}

Ensure all content:
- Answers questions directly and conversationally for AI systems
- Uses clear entity relationships (drug → disease → outcome)
- Provides comprehensive context in each section
- Structures information for easy AI extraction
- Includes E-E-A-T signals for credibility
- Optimizes for both traditional SEO and GEO
- Addresses multiple user intents in natural language`;

    const response = await globalThis.fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmaceutical content strategist expert in both traditional SEO and Generative Engine Optimization (GEO). Create content that ranks in search engines AND gets cited by AI systems like ChatGPT, Claude, and Perplexity. Always return valid JSON.'
          },
          {
            role: 'user',
            content: geoEnhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    let parsedContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/({[\s\S]*})/);
      parsedContent = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', parseError);
      throw new Error('Invalid response format from Perplexity');
    }

    // Add GEO-specific enhancements
    parsedContent.geo_performance_indicators = calculateGEOReadiness(parsedContent);
    parsedContent.ai_optimization_score = assessAIOptimization(parsedContent);
    parsedContent.implementation_checklist = generateGEOChecklist(parsedContent);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        content: parsedContent,
        generated_at: new Date().toISOString(),
        optimization_type: 'GEO-Enhanced',
        ai_readiness_score: parsedContent.ai_optimization_score
      })
    };
  } catch (error) {
    console.error('GEO-optimized Perplexity generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'GEO-optimized content generation failed',
        message: error.message
      })
    };
  }
};

// Helper functions for GEO optimization

function buildGEOStrategy(submission, fdaData) {
  const strategy = `
GENERATIVE ENGINE OPTIMIZATION (GEO) REQUIREMENTS:

1. AI SYSTEM TARGETING:
- Optimize for: ChatGPT, Claude, Perplexity, Google AI Overviews, Bing Chat
- Content must be easily extractable and citable by LLMs
- Use natural language that mirrors how users query AI systems

2. CONTENT STRUCTURE FOR AI:
- Clear hierarchical organization with descriptive headings
- Direct question-answer format for common queries  
- Bullet points and numbered lists for easy parsing
- Complete thoughts in each section (no orphaned content)

3. ENTITY RECOGNITION OPTIMIZATION:
- Clearly define: ${submission.product_name}, ${submission.generic_name}, ${submission.therapeutic_area}
- Establish relationships: drug → mechanism → disease → outcome
- Use consistent terminology throughout content

4. CONVERSATIONAL OPTIMIZATION:
- Write in natural, conversational tone
- Answer the "what," "how," "why," "when," "who" questions
- Include common patient and HCP phrasings
- Anticipate follow-up questions in content flow

5. E-E-A-T FOR AI TRUST:
- Cite FDA approval: ${fdaData.summary.hasApprovedNDA ? 'FDA approved' : 'In development'}
- Reference clinical trials: ${fdaData.summary.totalTrials} studies
- Include expert validation and institutional backing
- Provide specific data points and outcomes

6. SEARCH INTENT MAPPING:
- Informational: Disease education, treatment options, mechanism
- Navigational: Finding trials, treatment centers, resources  
- Transactional: Enrollment, prescription, support programs
- Commercial: HCP resources, formulary, medical affairs

7. COMPETITIVE DIFFERENTIATION FOR AI:
- Unique value props vs ${fdaData.summary.competitorCount} competitors
- First/best/only claims with supporting evidence
- Clear positioning in treatment algorithm
- Cost and access advantages if applicable

8. TECHNICAL GEO REQUIREMENTS:
- Schema markup for medical entities
- Fast page load (< 3 seconds)
- Mobile-responsive design
- Clean URL structure
- Proper heading hierarchy`;

  return strategy;
}

function calculateGEOReadiness(content) {
  const indicators = {
    conversational_h1_coverage: 0,
    question_keyword_density: 0,
    faq_completeness: 0,
    entity_recognition_clarity: 0,
    ai_friendly_structure: 0,
    citation_readiness: 0
  };

  // Check conversational H1s
  if (content.geo_optimized_h1_options?.conversational_ai_friendly?.length >= 2) {
    indicators.conversational_h1_coverage = 100;
  }

  // Check question-based keywords
  const questionKeywords = content.long_tail_keywords?.question_based || [];
  indicators.question_keyword_density = Math.min(questionKeywords.length * 20, 100);

  // Check FAQ completeness
  const faqs = content.ai_friendly_content_blocks?.faq_section || [];
  indicators.faq_completeness = Math.min(faqs.length * 10, 100);

  // Check entity recognition
  if (content.primary_keywords?.ai_entity_recognition?.length >= 3) {
    indicators.entity_recognition_clarity = 100;
  }

  // Check AI-friendly structure
  const structureElements = [
    content.content_structure_for_ai?.opening_definition,
    content.content_structure_for_ai?.mechanism_explanation,
    content.content_structure_for_ai?.indication_list,
    content.content_structure_for_ai?.efficacy_data,
    content.content_structure_for_ai?.safety_profile
  ];
  indicators.ai_friendly_structure = (structureElements.filter(Boolean).length / 5) * 100;

  // Check citation readiness
  const citations = content.authority_signals_for_ai?.clinical_citations?.length || 0;
  indicators.citation_readiness = Math.min(citations * 33, 100);

  return indicators;
}

function assessAIOptimization(content) {
  const scores = calculateGEOReadiness(content);
  const weights = {
    conversational_h1_coverage: 0.15,
    question_keyword_density: 0.20,
    faq_completeness: 0.20,
    entity_recognition_clarity: 0.15,
    ai_friendly_structure: 0.20,
    citation_readiness: 0.10
  };

  let totalScore = 0;
  Object.entries(scores).forEach(([key, value]) => {
    totalScore += value * weights[key];
  });

  return Math.round(totalScore);
}

function generateGEOChecklist(content) {
  const checklist = [];

  // Content structure checks
  if (content.geo_optimized_h1_options?.conversational_ai_friendly?.length >= 2) {
    checklist.push({ item: "Conversational H1 options", status: "complete" });
  } else {
    checklist.push({ item: "Add conversational H1 options", status: "pending" });
  }

  // FAQ implementation
  if (content.ai_friendly_content_blocks?.faq_section?.length >= 5) {
    checklist.push({ item: "FAQ section with 5+ questions", status: "complete" });
  } else {
    checklist.push({ item: "Expand FAQ section", status: "pending" });
  }

  // Schema markup
  if (content.geo_technical_optimization?.schema_markup) {
    checklist.push({ item: "Schema markup strategy defined", status: "complete" });
  } else {
    checklist.push({ item: "Implement schema markup", status: "pending" });
  }

  // Authority signals
  if (content.authority_signals_for_ai?.clinical_citations?.length >= 3) {
    checklist.push({ item: "Clinical citations included", status: "complete" });
  } else {
    checklist.push({ item: "Add more clinical citations", status: "pending" });
  }

  // Competitive differentiation
  if (content.competitive_geo_advantages?.unique_positioning?.length >= 2) {
    checklist.push({ item: "Unique positioning defined", status: "complete" });
  } else {
    checklist.push({ item: "Strengthen competitive positioning", status: "pending" });
  }

  return checklist;
}

// Existing helper functions (buildTrialContext, buildCompetitiveContext, buildGeographicContext) 
// remain the same as in perplexity-generate-enhanced.js

function buildTrialContext(fdaData) {
  const trials = fdaData.data.clinicalTrials || [];
  const summary = fdaData.summary || {};
  
  let context = `
CLINICAL DEVELOPMENT INTELLIGENCE:
- Development Stage: ${summary.developmentStage}
- Total Trials: ${summary.totalTrials} (${summary.activeTrials} actively recruiting)
- Trial Phases: ${JSON.stringify(summary.trialPhases)}
- Geographic Reach: ${summary.geographicReach?.join(', ') || 'Not specified'}
- Total Enrollment Target: ${summary.enrollmentTarget || 'Not specified'}
`;

  if (summary.firstInHumanTrials > 0) {
    context += `- First-in-Human Studies: ${summary.firstInHumanTrials} (early stage development)\n`;
  }
  
  if (summary.biomarkerDrivenTrials > 0) {
    context += `- Biomarker-Driven Trials: ${summary.biomarkerDrivenTrials} (precision medicine approach)\n`;
  }

  if (trials.length > 0) {
    const latestTrial = trials[0];
    context += `
LATEST TRIAL INSIGHTS:
- NCT Number: ${latestTrial.nctId}
- Title: ${latestTrial.title}
- Primary Endpoint: ${latestTrial.primaryOutcome || 'Not specified'}
- Status: ${latestTrial.status}
- Locations: ${latestTrial.locations?.siteCount || 0} sites in ${latestTrial.locations?.countries?.join(', ') || 'multiple countries'}
`;
  }

  return context;
}

function buildCompetitiveContext(fdaData) {
  const competitors = fdaData.data.competitorAnalysis || [];
  const summary = fdaData.summary || {};
  
  let context = `
COMPETITIVE LANDSCAPE:
- Market Position: ${summary.marketPosition}
- Direct Competitors: ${summary.competitorCount || 0}
- Key Differentiators: ${summary.differentiators?.join(', ') || 'Novel mechanism'}
`;

  if (competitors.length > 0) {
    context += `\nTOP THERAPEUTIC CLASSES IN SPACE:\n`;
    competitors.slice(0, 5).forEach(comp => {
      context += `- ${comp.drugClass}: ${comp.count} approved drugs\n`;
    });
  }

  if (summary.marketPosition === 'first-in-class') {
    context += `\nPOSITIONING OPPORTUNITY: Pioneer in new therapeutic approach - focus on innovation and unmet need\n`;
  } else if (summary.marketPosition === 'crowded-market') {
    context += `\nPOSITIONING CHALLENGE: Differentiation critical - emphasize unique benefits and patient selection\n`;
  }

  return context;
}

function buildGeographicContext(fdaData, targetMarkets) {
  const geoData = fdaData.data.geographicData || {};
  const trialCountries = fdaData.summary.trialSiteCountries || [];
  
  let context = `
GEOGRAPHIC OPPORTUNITIES:
- Trial Site Countries: ${trialCountries.join(', ') || 'Not specified'}
- Target Markets: ${targetMarkets?.join(', ') || 'Global'}
`;

  Object.entries(geoData).forEach(([market, data]) => {
    context += `
${market.toUpperCase()} MARKET:
- Active Trials: ${data.trialCount}
- Recruiting Sites: ${data.recruitingSites}
- Patient Access: ${data.patientAccess} potential patients
- Development Phases: ${data.phases?.join(', ')}
`;
  });

  if (targetMarkets && targetMarkets.includes('USA')) {
    context += `\nUS CONTENT FOCUS: Insurance coverage, Medicare access, patient assistance programs\n`;
  }
  
  if (targetMarkets && targetMarkets.includes('EU')) {
    context += `\nEU CONTENT FOCUS: EMA regulatory timeline, HTA assessments, country-specific reimbursement\n`;
  }

  return context;
}

// New function to calculate input depth
function calculateInputDepth(submission, fdaData) {
  let depthScore = 0;
  const depthFactors = {
    // Basic required fields (base score)
    hasProductName: submission.product_name ? 10 : 0,
    hasGenericName: submission.generic_name ? 10 : 0,
    hasIndication: submission.medical_indication ? 10 : 0,
    hasTherapeuticArea: submission.therapeutic_area ? 10 : 0,
    
    // Additional strategic fields
    hasMechanism: submission.mechanism_of_action ? 15 : 0,
    hasLineOfTherapy: submission.line_of_therapy ? 10 : 0,
    hasKeyDifferentiators: submission.key_differentiators?.length > 0 ? 10 : 0,
    hasTargetAudience: submission.target_audience?.length > 0 ? 5 : 0,
    hasGeography: submission.geographic_markets?.length > 0 ? 5 : 0,
    
    // Clinical data richness
    hasNCTNumber: submission.nct_number ? 10 : 0,
    hasPrimaryEndpoints: submission.primary_endpoints ? 10 : 0,
    hasKeyBiomarkers: submission.key_biomarkers ? 10 : 0,
    hasPatientPopulation: submission.patient_population ? 10 : 0,
    
    // FDA data richness
    hasClinicalTrials: fdaData?.data?.clinicalTrials?.length > 0 ? 15 : 0,
    hasAdverseEvents: fdaData?.data?.adverseEvents?.length > 0 ? 10 : 0,
    hasCompetitorData: fdaData?.data?.competitorAnalysis?.length > 0 ? 10 : 0,
    hasGeographicData: Object.keys(fdaData?.data?.geographicData || {}).length > 0 ? 10 : 0,
    
    // Business context
    hasClientName: submission.client_name ? 5 : 0,
    hasSponsor: submission.sponsor ? 5 : 0,
    hasPriorityLevel: submission.priority_level === 'high' ? 5 : 0
  };
  
  // Calculate total depth score
  Object.values(depthFactors).forEach(score => depthScore += score);
  
  // Categorize depth level
  if (depthScore >= 150) return 'comprehensive';
  if (depthScore >= 100) return 'detailed';
  if (depthScore >= 60) return 'standard';
  return 'basic';
}

// Build content strategy based on input depth
function buildContentDepthStrategy(depth, submission) {
  const strategies = {
    comprehensive: `
CONTENT DEPTH: COMPREHENSIVE (Maximum detail available)

Generate ADVANCED SEO/GEO content with:
- 10 detailed consumer questions with comprehensive answers (include patient journey stages)
- 5 sophisticated long-tail keywords targeting specific patient segments
- 7 dynamic GEO fields including voice search, medical facts, evidence stats
- Deep competitive positioning analysis
- Multi-market geographic optimization
- Advanced clinical trial intelligence
- Biomarker-driven content sections
- Insurance and access pathways
- HCP-specific technical content
- Patient support program details
- Real-world evidence integration
- Formulary positioning strategy

CONSUMER QUESTIONS should span:
1. Pre-diagnosis awareness
2. Diagnosis confirmation
3. Treatment initiation
4. Ongoing management
5. Side effect management
6. Insurance/access navigation
7. Lifestyle integration
8. Long-term outcomes
9. Switching from other therapies
10. Caregiver support needs`,

    detailed: `
CONTENT DEPTH: DETAILED (Rich information provided)

Generate ENHANCED SEO/GEO content with:
- 10 consumer questions covering key patient concerns
- 5 targeted long-tail keywords
- 5-6 GEO fields based on available FDA and clinical data
- Competitive differentiation messaging
- Primary market optimization
- Clinical efficacy highlights
- Safety profile details
- Basic access information

CONSUMER QUESTIONS should focus on:
1. What is the medication
2. How it works
3. Who should take it
4. Expected benefits
5. Common side effects
6. Administration details
7. Cost considerations
8. Lifestyle impacts
9. Monitoring requirements
10. When to contact doctor`,

    standard: `
CONTENT DEPTH: STANDARD (Core information available)

Generate SOLID SEO/GEO content with:
- 10 consumer questions covering fundamentals
- 5 long-tail keywords for basic searches
- 5 essential GEO fields
- Basic competitive context
- Primary indication focus
- Key clinical benefits
- Important safety information

CONSUMER QUESTIONS should address:
1-3. Basic product understanding
4-6. Usage and administration
7-8. Safety and side effects
9-10. Access and support`,

    basic: `
CONTENT DEPTH: BASIC (Limited information provided)

Generate FOUNDATIONAL SEO/GEO content with:
- 10 consumer questions based on standard template
- 5 generic long-tail keywords
- 5 core GEO fields
- General therapeutic area positioning
- Basic product information
- Standard safety language

Note: With more detailed input about ${submission.product_name || 'the product'}, including clinical trial data, competitive landscape, and patient demographics, we could create much more targeted and effective content.`
  };
  
  return strategies[depth] || strategies.basic;
}