// Enhanced Perplexity Function - Leverages Rich FDA Pre-Trial Data for Compelling SEO/GEO Content

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
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // Build comprehensive context from enhanced FDA data
    const trialContext = buildTrialContext(fdaData);
    const competitiveContext = buildCompetitiveContext(fdaData);
    const geoContext = buildGeographicContext(fdaData, submission.geographic_markets);
    const seoKeywordHints = buildSEOKeywordHints(fdaData, submission);

    const enhancedPrompt = `You are an expert pharmaceutical SEO strategist with deep knowledge of clinical development and regulatory pathways. Create compelling, medically accurate SEO content that drives engagement across the patient journey.

PRODUCT PROFILE:
- Product: ${submission.product_name} (${submission.generic_name})
- Indication: ${submission.medical_indication}
- Therapeutic Area: ${submission.therapeutic_area}
- Development Stage: ${fdaData.summary.developmentStage}
- Line of Therapy: ${submission.line_of_therapy || 'Not specified'}
- Target Audience: ${submission.target_audience || 'HCPs and Patients'}

${trialContext}

${competitiveContext}

${geoContext}

CRITICAL SEO INSIGHTS FROM FDA DATA:
${seoKeywordHints}

Generate comprehensive SEO content that:
1. Leverages pre-trial and clinical data to build credibility
2. Addresses stage-appropriate patient and HCP information needs
3. Incorporates geographic market nuances
4. Differentiates from ${fdaData.summary.competitorCount || 0} competitors
5. Optimizes for both medical accuracy and search visibility

Required JSON output structure:
{
  "seo_title": "Compelling title under 60 chars that includes product name and key differentiator",
  "meta_description": "Action-oriented description under 155 chars with stage-appropriate CTA",
  
  "primary_keywords": [
    "5-7 high-volume terms mixing brand, generic, and indication"
  ],
  
  "long_tail_keywords": [
    "7-10 specific phrases addressing patient questions and HCP queries"
  ],
  
  "h1_tags": [
    "3 main headers optimized for featured snippets"
  ],
  
  "h2_tags": [
    "5-7 section headers following patient/HCP journey"
  ],
  
  "consumer_questions": [
    {
      "question": "Stage-appropriate patient question",
      "answer": "Medically accurate, empathetic answer with CTA",
      "search_volume_estimate": "high/medium/low",
      "intent": "informational/transactional/navigational"
    }
  ],
  
  "hcp_questions": [
    {
      "question": "Clinical question HCPs search for",
      "answer": "Data-driven response with trial references",
      "target_specialty": "oncology/cardiology/etc"
    }
  ],
  
  "competitive_advantages": [
    "Unique benefits vs standard of care and competitors"
  ],
  
  "content_strategy": {
    "overview": "300-word strategic approach",
    "content_pillars": ["4-5 main content themes"],
    "publishing_cadence": "Recommended frequency by content type",
    "cta_strategy": "Stage-appropriate calls-to-action"
  },
  
  "geo_strategy": {
    "primary_markets": {
      "USA": {
        "focus": "Insurance coverage, patient assistance programs",
        "local_keywords": ["US-specific search terms"],
        "regulatory_status": "FDA status/timeline"
      },
      "EU": {
        "focus": "EMA pathway, country-specific access",
        "local_keywords": ["European search terms"],
        "regulatory_status": "EMA status/timeline"
      }
    },
    "emerging_markets": ["Countries with trial sites"],
    "localization_priorities": ["Key content to localize first"]
  },
  
  "clinical_trial_seo": {
    "recruitment_keywords": ["Terms patients use to find trials"],
    "eligibility_snippets": ["Formatted for featured snippets"],
    "location_pages": ["Cities/regions with trial sites"],
    "trial_finder_optimization": "Schema markup recommendations"
  },
  
  "voice_search_optimization": [
    "Natural language queries optimized for voice assistants"
  ],
  
  "schema_markup_recommendations": {
    "drug": "Schema for pharmaceutical product",
    "medicalCondition": "Schema for indication",
    "clinicalTrial": "Schema for trial listings",
    "faqPage": "Schema for Q&A content"
  },
  
  "content_calendar": {
    "immediate": ["Content to publish now"],
    "30_days": ["Content for next month"],
    "quarterly": ["Milestone-based content"],
    "triggered": ["Event-driven content opportunities"]
  }
}

Ensure all content:
- Accurately reflects the product's development stage
- Complies with FDA pre-approval promotion guidelines
- Naturally incorporates keywords without stuffing
- Provides genuine value to both patients and HCPs
- Builds trust through transparency about clinical development
- Includes clear next steps appropriate to reader intent`;

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
            content: 'You are a pharmaceutical SEO expert who creates medically accurate, compliant content that ranks well in search engines while providing genuine value to patients and healthcare providers. Always return valid JSON.'
          },
          {
            role: 'user',
            content: enhancedPrompt
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

    // Enhance with additional SEO metrics
    parsedContent.seo_metrics = calculateSEOMetrics(parsedContent, fdaData);
    parsedContent.content_gaps = identifyContentGaps(parsedContent, fdaData, submission);
    parsedContent.competitor_analysis = analyzeCompetitorContent(parsedContent, fdaData);

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
        fda_insights_used: Object.keys(fdaData.summary).length,
        trial_data_incorporated: fdaData.data.clinicalTrials?.length || 0
      })
    };
  } catch (error) {
    console.error('Enhanced Perplexity generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Enhanced content generation failed',
        message: error.message
      })
    };
  }
};

// Helper functions to build rich context for Perplexity

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

  // Add pre-trial specific insights
  if (summary.firstInHumanTrials > 0) {
    context += `- First-in-Human Studies: ${summary.firstInHumanTrials} (early stage development)\n`;
  }
  
  if (summary.biomarkerDrivenTrials > 0) {
    context += `- Biomarker-Driven Trials: ${summary.biomarkerDrivenTrials} (precision medicine approach)\n`;
  }

  // Add trial-specific details for content creation
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

  // Add specific trial intelligence
  if (fdaData.data.trialDetails && Object.keys(fdaData.data.trialDetails).length > 0) {
    const details = fdaData.data.trialDetails;
    context += `
DETAILED TRIAL DESIGN:
- Study Design: ${details.studyDesign}
- Intervention Model: ${details.interventionModel}
- Primary Endpoints: ${details.primaryEndpoints?.map(e => e.measure).join(', ')}
- Biomarker Strategy: ${details.biomarkerStrategy}
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

  // Add messaging based on competitive position
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

  // Add market-specific insights
  Object.entries(geoData).forEach(([market, data]) => {
    context += `
${market.toUpperCase()} MARKET:
- Active Trials: ${data.trialCount}
- Recruiting Sites: ${data.recruitingSites}
- Patient Access: ${data.patientAccess} potential patients
- Development Phases: ${data.phases?.join(', ')}
`;
  });

  // Add regional content recommendations
  if (targetMarkets && targetMarkets.includes('USA')) {
    context += `\nUS CONTENT FOCUS: Insurance coverage, Medicare access, patient assistance programs\n`;
  }
  
  if (targetMarkets && targetMarkets.includes('EU')) {
    context += `\nEU CONTENT FOCUS: EMA regulatory timeline, HTA assessments, country-specific reimbursement\n`;
  }

  return context;
}

function buildSEOKeywordHints(fdaData, submission) {
  const summary = fdaData.summary || {};
  const seoRecs = fdaData.seoRecommendations || {};
  
  let hints = `
KEYWORD OPPORTUNITIES FROM FDA ANALYSIS:

HIGH-VALUE PATIENT SEARCHES:
${summary.patientSearchTerms?.slice(0, 5).join('\n') || 'Generate based on indication and stage'}

HCP PROFESSIONAL SEARCHES:
${summary.hcpSearchTerms?.slice(0, 5).join('\n') || 'Generate based on mechanism and data'}

GEOGRAPHIC-SPECIFIC TERMS:
${summary.geoSpecificTerms?.slice(0, 5).join('\n') || 'Localize based on trial sites'}

STAGE-APPROPRIATE CONTENT FOCUS:
${summary.contentFocus || 'Align with development stage'}

TARGET AUDIENCE PRIORITIES:
${summary.targetAudience?.join(', ') || 'Define based on stage'}

KEY MESSAGES TO EMPHASIZE:
${summary.keyMessages?.join('\n') || 'Develop from clinical data'}
`;

  // Add extracted keywords from FDA labels if available
  if (fdaData.data.drugLabels && fdaData.data.drugLabels.length > 0) {
    const labelKeywords = fdaData.data.drugLabels[0].seoKeywords || [];
    const patientTerms = fdaData.data.drugLabels[0].patientFriendlyTerms || [];
    
    if (labelKeywords.length > 0) {
      hints += `\nMEDICAL KEYWORDS FROM FDA LABELS:\n${labelKeywords.slice(0, 10).join(', ')}\n`;
    }
    
    if (patientTerms.length > 0) {
      hints += `\nPATIENT-FRIENDLY TERMS:\n${patientTerms.join(', ')}\n`;
    }
  }

  return hints;
}

function calculateSEOMetrics(content, fdaData) {
  const metrics = {
    keyword_density: {},
    content_depth_score: 0,
    search_intent_coverage: 0,
    technical_seo_score: 0
  };

  // Calculate keyword density for primary keywords
  const allContent = JSON.stringify(content).toLowerCase();
  content.primary_keywords?.forEach(keyword => {
    const count = (allContent.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    metrics.keyword_density[keyword] = count;
  });

  // Content depth score based on comprehensiveness
  const contentElements = [
    content.consumer_questions?.length || 0,
    content.hcp_questions?.length || 0,
    content.h2_tags?.length || 0,
    content.competitive_advantages?.length || 0
  ];
  metrics.content_depth_score = contentElements.reduce((a, b) => a + b, 0) * 10;

  // Search intent coverage
  const intents = new Set();
  content.consumer_questions?.forEach(q => intents.add(q.intent));
  metrics.search_intent_coverage = intents.size * 33; // 33% per intent type

  // Technical SEO score
  if (content.schema_markup_recommendations) metrics.technical_seo_score += 25;
  if (content.voice_search_optimization?.length > 0) metrics.technical_seo_score += 25;
  if (content.clinical_trial_seo) metrics.technical_seo_score += 25;
  if (content.geo_strategy) metrics.technical_seo_score += 25;

  return metrics;
}

function identifyContentGaps(content, fdaData, submission) {
  const gaps = [];

  // Check if trial recruitment content is needed
  if (fdaData.summary.activeTrials > 0 && !content.clinical_trial_seo?.recruitment_keywords) {
    gaps.push({
      type: 'trial_recruitment',
      priority: 'high',
      recommendation: 'Add trial recruitment content and location pages'
    });
  }

  // Check if biomarker content is needed
  if (fdaData.summary.biomarkerDrivenTrials > 0 && submission.key_biomarkers?.length > 0) {
    const biomarkerContent = JSON.stringify(content).toLowerCase();
    const hasBiomarkerContent = submission.key_biomarkers.some(marker => 
      biomarkerContent.includes(marker.toLowerCase())
    );
    
    if (!hasBiomarkerContent) {
      gaps.push({
        type: 'biomarker_education',
        priority: 'medium',
        recommendation: 'Create biomarker testing and eligibility content'
      });
    }
  }

  // Check for competitive differentiation
  if (fdaData.summary.competitorCount > 5 && content.competitive_advantages?.length < 3) {
    gaps.push({
      type: 'competitive_positioning',
      priority: 'high',
      recommendation: 'Strengthen differentiation messaging'
    });
  }

  // Check for stage-appropriate content
  const stage = fdaData.summary.developmentStage;
  if (stage.includes('Phase 1') || stage === 'Pre-clinical') {
    if (!content.content_strategy?.overview?.includes('mechanism')) {
      gaps.push({
        type: 'mechanism_education',
        priority: 'high',
        recommendation: 'Add mechanism of action explainer content'
      });
    }
  }

  return gaps;
}

function analyzeCompetitorContent(content, fdaData) {
  const analysis = {
    unique_value_props: [],
    content_advantages: [],
    keyword_opportunities: []
  };

  // Identify unique angles based on trial data
  if (fdaData.summary.firstInHumanTrials > 0) {
    analysis.unique_value_props.push('First-in-class innovation story');
  }

  if (fdaData.summary.geographicReach?.length > 10) {
    analysis.unique_value_props.push('Global development program');
  }

  // Content advantages based on data availability
  if (fdaData.data.clinicalTrials?.length > 5) {
    analysis.content_advantages.push('Rich clinical trial data for content');
  }

  if (fdaData.data.trialDetails?.biomarkerStrategy) {
    analysis.content_advantages.push('Precision medicine angle');
  }

  // Keyword opportunities from less competitive spaces
  const longTailRatio = (content.long_tail_keywords?.length || 0) / (content.primary_keywords?.length || 1);
  if (longTailRatio > 1.5) {
    analysis.keyword_opportunities.push('Strong long-tail keyword strategy');
  }

  return analysis;
}