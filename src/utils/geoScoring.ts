interface GEOFactors {
  // Content Structure (25 points)
  hasAISummary: boolean; // 5 points
  hasStructuredFAQ: boolean; // 5 points
  hasDirectAnswers: boolean; // 5 points
  hasHierarchicalStructure: boolean; // 5 points
  hasConversationalH1: boolean; // 5 points

  // Authority Signals (20 points)
  hasCitations: boolean; // 5 points
  citationCount: number; // 0-5 points based on count
  hasAuthorCredentials: boolean; // 5 points
  hasClinicalSources: boolean; // 5 points

  // Technical Optimization (20 points)
  hasSchemaMarkup: boolean; // 5 points
  hasMedicalSchema: boolean; // 5 points
  hasFAQSchema: boolean; // 5 points
  hasStructuredData: boolean; // 5 points

  // Statistical Evidence (15 points)
  hasStatistics: boolean; // 5 points
  statisticsCount: number; // 0-5 points based on count
  hasEfficacyData: boolean; // 5 points

  // Voice Search Optimization (10 points)
  hasVoiceAnswers: boolean; // 5 points
  hasNaturalLanguage: boolean; // 5 points

  // Platform Optimization (10 points)
  hasPlatformSpecificTags: boolean; // 5 points
  platformCount: number; // 0-5 points based on platforms optimized
}

export interface GEOScoreBreakdown {
  totalScore: number;
  maxScore: number;
  percentage: number;
  categories: {
    contentStructure: { score: number; max: number; factors: string[] };
    authoritySignals: { score: number; max: number; factors: string[] };
    technicalOptimization: { score: number; max: number; factors: string[] };
    statisticalEvidence: { score: number; max: number; factors: string[] };
    voiceSearch: { score: number; max: number; factors: string[] };
    platformOptimization: { score: number; max: number; factors: string[] };
  };
  recommendations: string[];
}

export function calculateGEOScore(submission: any): GEOScoreBreakdown {
  const factors: GEOFactors = extractGEOFactors(submission);
  
  // Calculate scores for each category
  const contentStructureScore = calculateContentStructure(factors, submission);
  const authorityScore = calculateAuthoritySignals(factors, submission);
  const technicalScore = calculateTechnicalOptimization(factors, submission);
  const statisticalScore = calculateStatisticalEvidence(factors, submission);
  const voiceSearchScore = calculateVoiceSearch(factors, submission);
  const platformScore = calculatePlatformOptimization(factors, submission);

  const totalScore = 
    contentStructureScore.score +
    authorityScore.score +
    technicalScore.score +
    statisticalScore.score +
    voiceSearchScore.score +
    platformScore.score;

  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const recommendations = generateRecommendations(factors, submission);

  return {
    totalScore,
    maxScore,
    percentage,
    categories: {
      contentStructure: contentStructureScore,
      authoritySignals: authorityScore,
      technicalOptimization: technicalScore,
      statisticalEvidence: statisticalScore,
      voiceSearch: voiceSearchScore,
      platformOptimization: platformScore
    },
    recommendations
  };
}

function extractGEOFactors(submission: any): GEOFactors {
  const geo = submission.geo_optimization || {};
  
  return {
    // Content Structure
    hasAISummary: !!geo.ai_summary || !!geo.ai_friendly_summary,
    hasStructuredFAQ: !!submission.consumer_questions?.length,
    hasDirectAnswers: checkDirectAnswers(submission),
    hasHierarchicalStructure: !!submission.h1_tag && !!submission.h2_tags?.length,
    hasConversationalH1: checkConversationalH1(submission.h1_tag),

    // Authority Signals
    hasCitations: !!geo.citations || !!geo.references,
    citationCount: countCitations(geo),
    hasAuthorCredentials: !!geo.author_credentials,
    hasClinicalSources: checkClinicalSources(geo),

    // Technical Optimization
    hasSchemaMarkup: !!submission.ai_generated_content?.schema_markup || !!geo.schema_markup,
    hasMedicalSchema: checkMedicalSchema(submission),
    hasFAQSchema: checkFAQSchema(submission),
    hasStructuredData: !!geo.structured_data,

    // Statistical Evidence
    hasStatistics: !!geo.evidence_statistics?.length || !!geo.statistics,
    statisticsCount: countStatistics(geo),
    hasEfficacyData: checkEfficacyData(geo),

    // Voice Search
    hasVoiceAnswers: !!geo.voice_search_answers,
    hasNaturalLanguage: checkNaturalLanguage(submission),

    // Platform Optimization
    hasPlatformSpecificTags: !!geo.event_tags || !!submission.geo_event_tags?.length,
    platformCount: countPlatforms(geo)
  };
}

function calculateContentStructure(factors: GEOFactors, submission: any): { score: number; max: number; factors: string[] } {
  let score = 0;
  const max = 25;
  const achievedFactors: string[] = [];

  if (factors.hasAISummary) {
    score += 5;
    achievedFactors.push('AI-optimized summary');
  }
  if (factors.hasStructuredFAQ) {
    score += 5;
    achievedFactors.push('Structured FAQ section');
  }
  if (factors.hasDirectAnswers) {
    score += 5;
    achievedFactors.push('Direct answer format');
  }
  if (factors.hasHierarchicalStructure) {
    score += 5;
    achievedFactors.push('Clear H1/H2 hierarchy');
  }
  if (factors.hasConversationalH1) {
    score += 5;
    achievedFactors.push('Conversational heading');
  }

  return { score, max, factors: achievedFactors };
}

function calculateAuthoritySignals(factors: GEOFactors, submission: any): { score: number; max: number; factors: string[] } {
  let score = 0;
  const max = 20;
  const achievedFactors: string[] = [];

  if (factors.hasCitations) {
    score += 5;
    achievedFactors.push('Authoritative citations');
  }
  
  // Citation count scoring (0-5 points)
  const citationScore = Math.min(factors.citationCount, 5);
  if (citationScore > 0) {
    score += citationScore;
    achievedFactors.push(`${factors.citationCount} citations included`);
  }
  
  if (factors.hasAuthorCredentials) {
    score += 5;
    achievedFactors.push('Author credentials');
  }
  if (factors.hasClinicalSources) {
    score += 5;
    achievedFactors.push('Clinical trial sources');
  }

  return { score, max, factors: achievedFactors };
}

function calculateTechnicalOptimization(factors: GEOFactors, submission: any): { score: number; max: number; factors: string[] } {
  let score = 0;
  const max = 20;
  const achievedFactors: string[] = [];

  if (factors.hasSchemaMarkup) {
    score += 5;
    achievedFactors.push('Schema markup');
  }
  if (factors.hasMedicalSchema) {
    score += 5;
    achievedFactors.push('Medical schema');
  }
  if (factors.hasFAQSchema) {
    score += 5;
    achievedFactors.push('FAQ schema');
  }
  if (factors.hasStructuredData) {
    score += 5;
    achievedFactors.push('Structured data');
  }

  return { score, max, factors: achievedFactors };
}

function calculateStatisticalEvidence(factors: GEOFactors, submission: any): { score: number; max: number; factors: string[] } {
  let score = 0;
  const max = 15;
  const achievedFactors: string[] = [];

  if (factors.hasStatistics) {
    score += 5;
    achievedFactors.push('Statistical evidence');
  }
  
  // Statistics count scoring (0-5 points)
  const statScore = Math.min(factors.statisticsCount, 5);
  if (statScore > 0) {
    score += statScore;
    achievedFactors.push(`${factors.statisticsCount} statistics cited`);
  }
  
  if (factors.hasEfficacyData) {
    score += 5;
    achievedFactors.push('Efficacy data included');
  }

  return { score, max, factors: achievedFactors };
}

function calculateVoiceSearch(factors: GEOFactors, submission: any): { score: number; max: number; factors: string[] } {
  let score = 0;
  const max = 10;
  const achievedFactors: string[] = [];

  if (factors.hasVoiceAnswers) {
    score += 5;
    achievedFactors.push('Voice search answers');
  }
  if (factors.hasNaturalLanguage) {
    score += 5;
    achievedFactors.push('Natural language format');
  }

  return { score, max, factors: achievedFactors };
}

function calculatePlatformOptimization(factors: GEOFactors, submission: any): { score: number; max: number; factors: string[] } {
  let score = 0;
  const max = 10;
  const achievedFactors: string[] = [];

  if (factors.hasPlatformSpecificTags) {
    score += 5;
    achievedFactors.push('Platform-specific tags');
  }
  
  // Platform count scoring (0-5 points based on number of platforms)
  const platformScore = Math.min(factors.platformCount, 5);
  if (platformScore > 0) {
    score += platformScore;
    achievedFactors.push(`Optimized for ${factors.platformCount} platforms`);
  }

  return { score, max, factors: achievedFactors };
}

// Helper functions
function checkDirectAnswers(submission: any): boolean {
  const content = submission.ai_generated_content?.body_content || '';
  const questions = submission.consumer_questions || [];
  return questions.length > 0 && content.includes('?');
}

function checkConversationalH1(h1: string): boolean {
  if (!h1) return false;
  const conversationalPatterns = ['what', 'how', 'why', 'when', 'guide', 'understanding'];
  return conversationalPatterns.some(pattern => h1.toLowerCase().includes(pattern));
}

function countCitations(geo: any): number {
  if (geo.citations) {
    if (Array.isArray(geo.citations)) return geo.citations.length;
    if (typeof geo.citations === 'object') return Object.keys(geo.citations).length;
  }
  return 0;
}

function checkClinicalSources(geo: any): boolean {
  const clinicalKeywords = ['clinical trial', 'fda', 'ema', 'study', 'research', 'journal'];
  const content = JSON.stringify(geo).toLowerCase();
  return clinicalKeywords.some(keyword => content.includes(keyword));
}

function checkMedicalSchema(submission: any): boolean {
  const schema = submission.ai_generated_content?.schema_markup || submission.geo_optimization?.schema_markup;
  if (!schema) return false;
  const schemaStr = typeof schema === 'string' ? schema : JSON.stringify(schema);
  return schemaStr.includes('Drug') || schemaStr.includes('MedicalCondition');
}

function checkFAQSchema(submission: any): boolean {
  const schema = submission.ai_generated_content?.schema_markup || submission.geo_optimization?.schema_markup;
  if (!schema) return false;
  const schemaStr = typeof schema === 'string' ? schema : JSON.stringify(schema);
  return schemaStr.includes('FAQPage') || schemaStr.includes('Question');
}

function countStatistics(geo: any): number {
  const stats = geo.evidence_statistics || geo.statistics || [];
  if (Array.isArray(stats)) return stats.length;
  
  // Count percentages in content
  const content = JSON.stringify(geo);
  const percentMatches = content.match(/\d+%/g) || [];
  return percentMatches.length;
}

function checkEfficacyData(geo: any): boolean {
  const efficacyKeywords = ['efficacy', 'effectiveness', 'response rate', 'survival', 'outcome'];
  const content = JSON.stringify(geo).toLowerCase();
  return efficacyKeywords.some(keyword => content.includes(keyword));
}

function checkNaturalLanguage(submission: any): boolean {
  const content = submission.ai_generated_content?.body_content || '';
  const h1 = submission.h1_tag || '';
  const h2s = submission.h2_tags || [];
  
  // Check for question formats and conversational tone
  const allContent = `${h1} ${h2s.join(' ')} ${content}`.toLowerCase();
  const naturalPatterns = ['you', 'your', 'what is', 'how to', 'can i', 'should i'];
  
  return naturalPatterns.some(pattern => allContent.includes(pattern));
}

function countPlatforms(geo: any): number {
  const platforms = ['chatgpt', 'perplexity', 'claude', 'gemini', 'bard'];
  const content = JSON.stringify(geo).toLowerCase();
  
  return platforms.filter(platform => content.includes(platform)).length;
}

function generateRecommendations(factors: GEOFactors, submission: any): string[] {
  const recommendations: string[] = [];

  // Content Structure Recommendations
  if (!factors.hasAISummary) {
    recommendations.push('Add an AI-optimized summary at the beginning of content');
  }
  if (!factors.hasStructuredFAQ) {
    recommendations.push('Include a structured FAQ section with common questions');
  }
  if (!factors.hasConversationalH1) {
    recommendations.push('Consider a more conversational H1 tag (e.g., "What is..." or "How does...")');
  }

  // Authority Recommendations
  if (!factors.hasCitations || factors.citationCount < 3) {
    recommendations.push('Add more authoritative citations (aim for 3-5 sources)');
  }
  if (!factors.hasClinicalSources) {
    recommendations.push('Include clinical trial data or FDA references');
  }

  // Technical Recommendations
  if (!factors.hasSchemaMarkup) {
    recommendations.push('Implement comprehensive schema markup');
  }
  if (!factors.hasMedicalSchema) {
    recommendations.push('Add Drug or MedicalCondition schema');
  }

  // Statistical Recommendations
  if (!factors.hasStatistics || factors.statisticsCount < 3) {
    recommendations.push('Include more statistical evidence (efficacy rates, patient outcomes)');
  }

  // Voice Search Recommendations
  if (!factors.hasVoiceAnswers) {
    recommendations.push('Add voice search optimized Q&A format');
  }

  // Platform Recommendations
  if (factors.platformCount < 3) {
    recommendations.push('Optimize for more AI platforms (currently optimized for ' + factors.platformCount + ')');
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
}