// Enhanced FDA Database Query Function for Pre-Trial Information
// Extracts comprehensive data to empower Perplexity for SEO/GEO content generation

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
    const { 
      productName, 
      genericName, 
      indication,
      nctNumber,
      sponsor,
      developmentStage,
      lineOfTherapy,
      patientPopulation,
      geographicMarkets,
      primaryEndpoints,
      keyBiomarkers
    } = JSON.parse(event.body);
    
    const fdaResults = {
      clinicalTrials: [],
      trialDetails: {},
      adverseEvents: [],
      drugApprovals: [],
      drugLabels: [],
      recalls: [],
      competitorAnalysis: [],
      geographicData: {},
      timestamp: new Date().toISOString()
    };

    // 1. Enhanced Clinical Trials Query with Pre-Trial Focus
    try {
      // If NCT number provided, get specific trial details
      if (nctNumber) {
        const nctResponse = await fetch(
          `https://clinicaltrials.gov/api/v2/studies/${nctNumber}?format=json`
        );
        if (nctResponse.ok) {
          const nctData = await nctResponse.json();
          fdaResults.trialDetails = extractTrialIntelligence(nctData);
        }
      }

      // Broader search for all trials including pre-clinical phases
      const searchTerms = [
        indication && `query.cond=${encodeURIComponent(indication)}`,
        productName && `query.intr=${encodeURIComponent(productName)}`,
        genericName && `query.intr=${encodeURIComponent(genericName)}`,
        sponsor && `query.spons=${encodeURIComponent(sponsor)}`
      ].filter(Boolean).join('&');

      const ctResponse = await fetch(
        `https://clinicaltrials.gov/api/v2/studies?${searchTerms}&filter.overallStatus=NOT_YET_RECRUITING,RECRUITING,ENROLLING_BY_INVITATION,ACTIVE_NOT_RECRUITING,COMPLETED&pageSize=20&format=json`
      );
      
      if (ctResponse.ok) {
        const ctData = await ctResponse.json();
        fdaResults.clinicalTrials = ctData.studies?.map(study => ({
          nctId: study.protocolSection?.identificationModule?.nctId,
          title: study.protocolSection?.identificationModule?.briefTitle,
          phase: study.protocolSection?.designModule?.phases?.[0],
          status: study.protocolSection?.statusModule?.overallStatus,
          enrollment: study.protocolSection?.designModule?.enrollmentInfo?.count,
          startDate: study.protocolSection?.statusModule?.startDateStruct?.date,
          completionDate: study.protocolSection?.statusModule?.completionDateStruct?.date,
          primaryOutcome: study.protocolSection?.outcomesModule?.primaryOutcomes?.[0]?.measure,
          locations: extractGeographicLocations(study),
          studyType: study.protocolSection?.designModule?.studyType,
          interventionType: study.protocolSection?.armsInterventionsModule?.interventions?.[0]?.type,
          // Pre-trial specific data
          isFirstInHuman: study.protocolSection?.identificationModule?.briefTitle?.toLowerCase().includes('first-in-human'),
          isDoseEscalation: study.protocolSection?.designModule?.designInfo?.allocation === 'NON_RANDOMIZED',
          biomarkers: extractBiomarkers(study),
          inclusionCriteria: study.protocolSection?.eligibilityModule?.eligibilityCriteria,
          ageRange: {
            min: study.protocolSection?.eligibilityModule?.minimumAge,
            max: study.protocolSection?.eligibilityModule?.maximumAge
          }
        })) || [];
      }
    } catch (error) {
      console.error('Enhanced Clinical Trials API error:', error);
    }

    // 2. Competitor Analysis - Find similar drugs in the same indication
    try {
      const competitorResponse = await fetch(
        `https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name:*&count=openfda.pharm_class_epc.exact&limit=10`
      );
      if (competitorResponse.ok) {
        const competitorData = await competitorResponse.json();
        fdaResults.competitorAnalysis = analyzeCompetitors(competitorData, genericName, indication);
      }
    } catch (error) {
      console.error('Competitor analysis error:', error);
    }

    // 3. Geographic Market Intelligence
    if (geographicMarkets && geographicMarkets.length > 0) {
      fdaResults.geographicData = await analyzeGeographicMarkets(
        fdaResults.clinicalTrials,
        geographicMarkets,
        indication
      );
    }

    // 4. Enhanced FDA Label Analysis for SEO Keywords
    try {
      const labelResponse = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${productName}"+OR+openfda.generic_name:"${genericName}"&limit=5`
      );
      if (labelResponse.ok) {
        const labelData = await labelResponse.json();
        fdaResults.drugLabels = labelData.results?.map(label => ({
          ...label,
          seoKeywords: extractSEOKeywords(label),
          patientFriendlyTerms: extractPatientTerms(label),
          competitiveAdvantages: extractAdvantages(label)
        })) || [];
      }
    } catch (error) {
      console.error('FDA Label API error:', error);
    }

    // 5. Pre-Trial Safety Signals from FAERS
    try {
      // Search for similar drugs to predict potential AEs
      const classSearch = fdaResults.drugLabels[0]?.openfda?.pharm_class_epc?.[0] || genericName;
      const adverseResponse = await fetch(
        `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.pharm_class_epc:"${classSearch}"&count=patient.reaction.reactionmeddrapt.exact&limit=20`
      );
      if (adverseResponse.ok) {
        const adverseData = await adverseResponse.json();
        fdaResults.adverseEvents = {
          topEvents: adverseData.results,
          classBasedPrediction: true,
          disclaimer: "Based on drug class analysis for pre-approval compounds"
        };
      }
    } catch (error) {
      console.error('FDA Adverse Events API error:', error);
    }

    // Generate comprehensive summary for Perplexity
    const enhancedSummary = {
      // Basic regulatory status
      hasApprovedNDA: fdaResults.drugApprovals.length > 0,
      developmentStage: developmentStage || determineStageFromTrials(fdaResults.clinicalTrials),
      
      // Trial intelligence
      totalTrials: fdaResults.clinicalTrials.length,
      activeTrials: fdaResults.clinicalTrials.filter(t => ['RECRUITING', 'ACTIVE_NOT_RECRUITING'].includes(t.status)).length,
      trialPhases: getTrialPhaseBreakdown(fdaResults.clinicalTrials),
      geographicReach: getGeographicReach(fdaResults.clinicalTrials),
      enrollmentTarget: fdaResults.clinicalTrials.reduce((sum, t) => sum + (t.enrollment || 0), 0),
      
      // Pre-trial specific insights
      firstInHumanTrials: fdaResults.clinicalTrials.filter(t => t.isFirstInHuman).length,
      doseEscalationTrials: fdaResults.clinicalTrials.filter(t => t.isDoseEscalation).length,
      biomarkerDrivenTrials: fdaResults.clinicalTrials.filter(t => t.biomarkers && t.biomarkers.length > 0).length,
      
      // Competitive landscape
      competitorCount: fdaResults.competitorAnalysis.length,
      marketPosition: determineMarketPosition(fdaResults.competitorAnalysis, developmentStage),
      differentiators: extractDifferentiators(fdaResults, primaryEndpoints, keyBiomarkers),
      
      // Geographic insights for SEO
      primaryMarkets: fdaResults.geographicData.primaryMarkets || [],
      trialSiteCountries: [...new Set(fdaResults.clinicalTrials.flatMap(t => t.locations?.countries || []))],
      regionalApprovals: fdaResults.geographicData.approvals || {},
      
      // SEO-optimized content hints
      patientSearchTerms: generatePatientSearchTerms(indication, lineOfTherapy, patientPopulation),
      hcpSearchTerms: generateHCPSearchTerms(genericName, indication, developmentStage),
      geoSpecificTerms: generateGeoTerms(geographicMarkets, indication),
      
      // Content strategy recommendations
      contentFocus: determineContentFocus(developmentStage, fdaResults.clinicalTrials),
      targetAudience: determineTargetAudience(developmentStage, patientPopulation),
      keyMessages: generateKeyMessages(fdaResults, developmentStage, primaryEndpoints)
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        product: productName,
        generic: genericName,
        indication: indication,
        summary: enhancedSummary,
        data: fdaResults,
        seoRecommendations: generateSEORecommendations(enhancedSummary, fdaResults)
      })
    };
  } catch (error) {
    console.error('Enhanced FDA query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Enhanced FDA query failed',
        message: error.message
      })
    };
  }
};

// Helper functions for enhanced data extraction

function extractTrialIntelligence(trial) {
  const protocol = trial.protocolSection || {};
  const design = protocol.designModule || {};
  const outcomes = protocol.outcomesModule || {};
  
  return {
    studyDesign: design.designInfo?.studyType,
    allocation: design.designInfo?.allocation,
    interventionModel: design.designInfo?.interventionModel,
    masking: design.designInfo?.maskingInfo?.masking,
    primaryEndpoints: outcomes.primaryOutcomes?.map(o => ({
      measure: o.measure,
      timeFrame: o.timeFrame,
      description: o.description
    })),
    secondaryEndpoints: outcomes.secondaryOutcomes?.map(o => o.measure),
    inclusionCriteria: protocol.eligibilityModule?.eligibilityCriteria,
    biomarkerStrategy: extractBiomarkerStrategy(protocol),
    statisticalDesign: design.designInfo?.primaryPurpose,
    targetEnrollment: design.enrollmentInfo?.count
  };
}

function extractBiomarkers(study) {
  const text = JSON.stringify(study).toLowerCase();
  const biomarkerTerms = [
    'pd-l1', 'pdl1', 'her2', 'egfr', 'braf', 'kras', 'alk', 'ros1', 
    'met', 'ret', 'ntrk', 'msi', 'mmr', 'tmb', 'ctdna', 'cea', 'ca19-9'
  ];
  
  return biomarkerTerms.filter(marker => text.includes(marker));
}

function extractGeographicLocations(study) {
  const locations = study.protocolSection?.contactsLocationsModule?.locations || [];
  return {
    countries: [...new Set(locations.map(l => l.country))],
    cities: locations.map(l => `${l.city}, ${l.country}`),
    siteCount: locations.length
  };
}

function analyzeCompetitors(data, genericName, indication) {
  // Extract drugs in similar therapeutic classes
  return data.results?.map(item => ({
    drugClass: item.term,
    count: item.count,
    isDirectCompetitor: item.term.toLowerCase().includes(indication.toLowerCase())
  })).filter(item => item.count > 5) || [];
}

function analyzeGeographicMarkets(trials, targetMarkets, indication) {
  const marketData = {};
  
  targetMarkets.forEach(market => {
    const marketTrials = trials.filter(t => 
      t.locations?.countries?.includes(market) || 
      t.locations?.countries?.includes(getCountryFromMarket(market))
    );
    
    marketData[market] = {
      trialCount: marketTrials.length,
      recruitingSites: marketTrials.filter(t => t.status === 'RECRUITING').length,
      patientAccess: marketTrials.reduce((sum, t) => sum + (t.enrollment || 0), 0),
      phases: [...new Set(marketTrials.map(t => t.phase))],
      competitionLevel: 'medium' // Would need more data for accurate assessment
    };
  });
  
  return marketData;
}

function extractSEOKeywords(label) {
  const text = [
    label.indications_and_usage,
    label.clinical_pharmacology,
    label.description
  ].join(' ').toLowerCase();
  
  // Extract medical terms and patient-friendly equivalents
  const keywords = [];
  const medicalTerms = text.match(/\b\w+(?:emia|itis|osis|pathy|oma|ectomy)\b/g) || [];
  keywords.push(...new Set(medicalTerms));
  
  return keywords;
}

function extractPatientTerms(label) {
  // Convert medical jargon to patient-friendly terms
  const conversions = {
    'hypertension': 'high blood pressure',
    'hyperlipidemia': 'high cholesterol',
    'diabetes mellitus': 'diabetes',
    'myocardial infarction': 'heart attack',
    'cerebrovascular accident': 'stroke',
    'neoplasm': 'tumor',
    'malignant': 'cancer',
    'metastatic': 'spread',
    'adjuvant': 'additional treatment',
    'prophylaxis': 'prevention'
  };
  
  const patientTerms = [];
  const text = (label.indications_and_usage || '').toLowerCase();
  
  Object.entries(conversions).forEach(([medical, patient]) => {
    if (text.includes(medical)) {
      patientTerms.push(patient);
    }
  });
  
  return patientTerms;
}

function extractAdvantages(label) {
  const advantages = [];
  const text = (label.clinical_studies || '') + (label.clinical_pharmacology || '');
  
  // Look for superiority claims
  if (text.match(/superior|better|improved|greater|more effective/i)) {
    advantages.push('demonstrated superiority');
  }
  
  // Dosing advantages
  if (text.match(/once.{0,10}(daily|week|month)/i)) {
    advantages.push('convenient dosing');
  }
  
  // Safety advantages
  if (text.match(/well.{0,10}tolerated|favorable.{0,10}safety/i)) {
    advantages.push('favorable safety profile');
  }
  
  return advantages;
}

function determineStageFromTrials(trials) {
  const phases = trials.map(t => t.phase).filter(Boolean);
  if (phases.includes('PHASE3')) return 'Phase 3';
  if (phases.includes('PHASE2')) return 'Phase 2';
  if (phases.includes('PHASE1')) return 'Phase 1';
  if (phases.includes('EARLY_PHASE1')) return 'Early Phase 1';
  return 'Pre-clinical';
}

function getTrialPhaseBreakdown(trials) {
  const phases = {};
  trials.forEach(t => {
    if (t.phase) {
      phases[t.phase] = (phases[t.phase] || 0) + 1;
    }
  });
  return phases;
}

function getGeographicReach(trials) {
  const countries = new Set();
  trials.forEach(t => {
    if (t.locations?.countries) {
      t.locations.countries.forEach(c => countries.add(c));
    }
  });
  return Array.from(countries);
}

function determineMarketPosition(competitors, stage) {
  if (!competitors || competitors.length === 0) return 'first-in-class';
  if (competitors.length < 3) return 'early-market';
  if (competitors.length < 10) return 'competitive';
  return 'crowded-market';
}

function extractDifferentiators(fdaResults, primaryEndpoints, keyBiomarkers) {
  const differentiators = [];
  
  // Novel mechanism
  if (fdaResults.competitorAnalysis.length === 0) {
    differentiators.push('novel mechanism of action');
  }
  
  // Biomarker-driven
  if (keyBiomarkers && keyBiomarkers.length > 0) {
    differentiators.push('biomarker-driven patient selection');
  }
  
  // Unique endpoints
  if (primaryEndpoints && primaryEndpoints.length > 0) {
    differentiators.push('differentiated clinical endpoints');
  }
  
  return differentiators;
}

function generatePatientSearchTerms(indication, lineOfTherapy, patientPopulation) {
  const terms = [];
  
  // Basic patient searches
  terms.push(`${indication} treatment options`);
  terms.push(`new ${indication} medication`);
  terms.push(`${indication} clinical trials near me`);
  
  // Line of therapy specific
  if (lineOfTherapy) {
    terms.push(`${lineOfTherapy} ${indication} treatment`);
    terms.push(`failed ${lineOfTherapy} ${indication} what next`);
  }
  
  // Population specific
  if (patientPopulation && patientPopulation.length > 0) {
    patientPopulation.forEach(pop => {
      terms.push(`${indication} treatment ${pop}`);
    });
  }
  
  return terms;
}

function generateHCPSearchTerms(genericName, indication, stage) {
  const terms = [];
  
  // Professional searches
  terms.push(`${genericName} ${indication} data`);
  terms.push(`${genericName} mechanism of action`);
  terms.push(`${genericName} clinical trials`);
  
  // Stage specific
  if (stage && stage.includes('Phase')) {
    terms.push(`${genericName} ${stage} results`);
    terms.push(`${genericName} ${stage} data ${indication}`);
  }
  
  return terms;
}

function generateGeoTerms(markets, indication) {
  const terms = [];
  
  if (markets && markets.length > 0) {
    markets.forEach(market => {
      terms.push(`${indication} treatment ${market}`);
      terms.push(`${indication} clinical trials ${market}`);
      terms.push(`${indication} specialist ${market}`);
    });
  }
  
  return terms;
}

function determineContentFocus(stage, trials) {
  if (stage === 'Pre-clinical' || stage === 'Phase 1') {
    return 'mechanism of action and safety';
  } else if (stage === 'Phase 2') {
    return 'efficacy signals and patient selection';
  } else if (stage === 'Phase 3') {
    return 'clinical benefits and differentiation';
  } else {
    return 'real-world evidence and access';
  }
}

function determineTargetAudience(stage, patientPopulation) {
  const audiences = [];
  
  if (stage === 'Pre-clinical' || stage === 'Phase 1') {
    audiences.push('investigators', 'investors');
  } else if (stage === 'Phase 2' || stage === 'Phase 3') {
    audiences.push('clinicians', 'patients', 'advocates');
  } else {
    audiences.push('prescribers', 'patients', 'payers');
  }
  
  return audiences;
}

function generateKeyMessages(fdaResults, stage, endpoints) {
  const messages = [];
  
  // Stage-appropriate messaging
  if (stage === 'Pre-clinical' || stage === 'Phase 1') {
    messages.push('novel therapeutic approach');
    messages.push('advancing to clinical development');
  } else if (stage === 'Phase 2' || stage === 'Phase 3') {
    messages.push('demonstrating clinical benefit');
    messages.push('enrolling patients now');
  }
  
  // Trial-based messages
  if (fdaResults.clinicalTrials.length > 5) {
    messages.push('extensive clinical development program');
  }
  
  if (fdaResults.geographicData && Object.keys(fdaResults.geographicData).length > 3) {
    messages.push('global development program');
  }
  
  return messages;
}

function getCountryFromMarket(market) {
  const marketMap = {
    'USA': 'United States',
    'US': 'United States',
    'EU': 'Germany', // Use Germany as EU proxy
    'UK': 'United Kingdom',
    'Japan': 'Japan',
    'China': 'China',
    'Canada': 'Canada',
    'Australia': 'Australia'
  };
  
  return marketMap[market] || market;
}

function extractBiomarkerStrategy(protocol) {
  const eligibility = protocol.eligibilityModule?.eligibilityCriteria || '';
  const outcomes = JSON.stringify(protocol.outcomesModule || {});
  
  const biomarkerMentions = (eligibility + outcomes).match(/biomarker|mutation|expression|positive|negative|amplification/gi) || [];
  
  if (biomarkerMentions.length > 5) {
    return 'biomarker-driven patient selection';
  } else if (biomarkerMentions.length > 0) {
    return 'biomarker-informed development';
  }
  
  return 'all-comer population';
}

function generateSEORecommendations(summary, fdaResults) {
  const recommendations = {
    contentPillars: [],
    keywordStrategy: {},
    geoStrategy: {},
    competitivePositioning: ''
  };
  
  // Content pillars based on development stage
  if (summary.developmentStage.includes('Phase 1') || summary.developmentStage === 'Pre-clinical') {
    recommendations.contentPillars = [
      'Scientific innovation and mechanism',
      'Clinical trial recruitment',
      'Disease education and unmet need',
      'Company pipeline and expertise'
    ];
  } else if (summary.developmentStage.includes('Phase 2') || summary.developmentStage.includes('Phase 3')) {
    recommendations.contentPillars = [
      'Clinical data and efficacy',
      'Patient eligibility and access',
      'Differentiation from competitors',
      'Treatment journey and experience'
    ];
  }
  
  // Keyword strategy
  recommendations.keywordStrategy = {
    primary: summary.hcpSearchTerms.slice(0, 5),
    secondary: summary.patientSearchTerms.slice(0, 5),
    longtail: [...summary.geoSpecificTerms.slice(0, 3), ...generateLongtailKeywords(summary)],
    branded: [`${fdaResults.product} ${fdaResults.indication}`, `${fdaResults.generic} clinical trials`]
  };
  
  // Geographic strategy
  recommendations.geoStrategy = {
    primaryMarkets: summary.trialSiteCountries.slice(0, 5),
    contentLocalization: summary.trialSiteCountries.map(country => ({
      market: country,
      focus: determineMarketFocus(country, summary)
    })),
    regionalKeywords: summary.geoSpecificTerms
  };
  
  // Competitive positioning
  if (summary.marketPosition === 'first-in-class') {
    recommendations.competitivePositioning = 'Pioneer positioning - focus on innovation and unmet need';
  } else if (summary.marketPosition === 'early-market') {
    recommendations.competitivePositioning = 'Differentiation positioning - highlight unique benefits';
  } else {
    recommendations.competitivePositioning = 'Best-in-class positioning - emphasize superiority';
  }
  
  return recommendations;
}

function generateLongtailKeywords(summary) {
  const longtail = [];
  
  // Question-based long-tail
  longtail.push(`what is ${summary.generic} used for`);
  longtail.push(`how does ${summary.product} work`);
  longtail.push(`${summary.product} side effects`);
  
  // Stage-specific long-tail
  if (summary.activeTrials > 0) {
    longtail.push(`${summary.product} clinical trial enrollment`);
    longtail.push(`qualify for ${summary.product} trial`);
  }
  
  return longtail;
}

function determineMarketFocus(country, summary) {
  // Customize content focus by market
  const marketFocus = {
    'United States': 'Insurance coverage and patient access programs',
    'Germany': 'HTA assessment and reimbursement pathway',
    'United Kingdom': 'NICE evaluation and NHS access',
    'Japan': 'PMDA approval timeline and local trials',
    'China': 'NMPA pathway and local development',
    'Canada': 'Health Canada approval and provincial coverage'
  };
  
  return marketFocus[country] || 'Regulatory pathway and patient access';
}