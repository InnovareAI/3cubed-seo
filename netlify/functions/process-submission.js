// Netlify Function for AI Processing Pipeline
// Handles FDA database queries, Perplexity content generation, and Claude QA

const fetch = require('node-fetch');

// FDA Database Integration
const queryFDADatabases = async (productName, indication) => {
  const fdaDatabases = {
    clinicalTrials: 'https://clinicaltrials.gov/api/v2/studies',
    faers: 'https://api.fda.gov/drug/event.json',
    drugsAtFDA: 'https://api.fda.gov/drug/drugsfda.json',
    spl: 'https://api.fda.gov/drug/label.json',
    recalls: 'https://api.fda.gov/drug/enforcement.json',
    shortages: 'https://www.accessdata.fda.gov/scripts/drugshortages/default.cfm'
  };

  const results = {};
  
  // Query Clinical Trials
  try {
    const ctResponse = await fetch(`${fdaDatabases.clinicalTrials}?query.cond=${encodeURIComponent(indication)}&query.intr=${encodeURIComponent(productName)}&pageSize=5`);
    const ctData = await ctResponse.json();
    results.clinicalTrials = ctData.studies || [];
  } catch (error) {
    console.error('Clinical Trials API error:', error);
    results.clinicalTrials = [];
  }

  // Query FDA Adverse Events
  try {
    const faersResponse = await fetch(`${fdaDatabases.faers}?search=patient.drug.medicinalproduct:"${productName}"&limit=5`);
    const faersData = await faersResponse.json();
    results.adverseEvents = faersData.results || [];
  } catch (error) {
    console.error('FAERS API error:', error);
    results.adverseEvents = [];
  }

  // Query Drug Approvals
  try {
    const drugsResponse = await fetch(`${fdaDatabases.drugsAtFDA}?search=openfda.brand_name:"${productName}"&limit=1`);
    const drugsData = await drugsResponse.json();
    results.drugApprovals = drugsData.results || [];
  } catch (error) {
    console.error('Drugs@FDA API error:', error);
    results.drugApprovals = [];
  }

  return results;
};

// Perplexity AI Integration
const generateSEOContent = async (submission, fdaData) => {
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  
  const prompt = `
You are an expert pharmaceutical SEO strategist. Generate comprehensive SEO content for ${submission.product_name} (${submission.generic_name}) for ${submission.medical_indication}.

FDA REGULATORY CONTEXT:
- Clinical Trials: ${fdaData.clinicalTrials.length} ongoing/completed trials
- First Trial NCT: ${fdaData.clinicalTrials[0]?.protocolSection?.identificationModule?.nctId || 'N/A'}
- FDA Approval Status: ${fdaData.drugApprovals[0]?.products?.[0]?.marketing_status || 'Under Review'}
- Adverse Events Reported: ${fdaData.adverseEvents.length}

Generate the following SEO-optimized content:

1. SEO_TITLE (60 chars max): Compelling title incorporating product name and key benefit
2. META_DESCRIPTION (155 chars max): Engaging description with FDA approval status
3. PRIMARY_KEYWORDS (5-7): High-volume pharmaceutical search terms
4. LONG_TAIL_KEYWORDS (5-7): Specific treatment-focused phrases
5. H1_TAGS (3): Main page headers
6. H2_TAGS (5): Section headers for content structure
7. CONSUMER_QUESTIONS (5): Common patient questions with answers
8. COMPETITIVE_ADVANTAGES: Key differentiators vs competitors
9. CONTENT_STRATEGY: 300-word overview of SEO approach

Format as JSON.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw error;
  }
};

// Claude QA Integration
const performQAReview = async (content, submission) => {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  const qaPrompt = `
Review this pharmaceutical SEO content for regulatory compliance and accuracy:

Product: ${submission.product_name}
Indication: ${submission.medical_indication}
Content: ${JSON.stringify(content, null, 2)}

Evaluate on:
1. Medical Accuracy (0-100)
2. FDA Compliance (0-100)
3. SEO Effectiveness (0-100)
4. No Unsubstantiated Claims (Pass/Fail)
5. Overall Quality Score (0-100)

Provide specific feedback and required changes.
Format as JSON with scores and feedback.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: qaPrompt }]
      })
    });

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};

// Main handler
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const submission = JSON.parse(event.body);
    
    // Step 1: Query FDA Databases
    console.log('Querying FDA databases...');
    const fdaData = await queryFDADatabases(
      submission.product_name,
      submission.medical_indication
    );
    
    // Step 2: Generate SEO Content with Perplexity
    console.log('Generating SEO content with Perplexity...');
    const seoContent = await generateSEOContent(submission, fdaData);
    
    // Step 3: Perform QA Review with Claude
    console.log('Performing QA review with Claude...');
    const qaReview = await performQAReview(seoContent, submission);
    
    // Step 4: Update submission in Railway PostgreSQL
    const railwayApiUrl = process.env.RAILWAY_API_URL || 'https://3cubed-seo-production.up.railway.app';
    const updateResponse = await fetch(`${railwayApiUrl}/api/submissions/${submission.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_stage: 'ai_complete',
        seo_title: seoContent.SEO_TITLE,
        meta_description: seoContent.META_DESCRIPTION,
        primary_keywords: seoContent.PRIMARY_KEYWORDS,
        long_tail_keywords: seoContent.LONG_TAIL_KEYWORDS,
        h1_tags: seoContent.H1_TAGS,
        h2_tags: seoContent.H2_TAGS,
        consumer_questions: seoContent.CONSUMER_QUESTIONS,
        competitive_advantages: seoContent.COMPETITIVE_ADVANTAGES,
        content_strategy: seoContent.CONTENT_STRATEGY,
        fda_data: fdaData,
        qa_scores: qaReview,
        ai_output: JSON.stringify({
          perplexity_response: seoContent,
          claude_review: qaReview,
          fda_enrichment: fdaData
        }),
        processed_at: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update submission in Railway');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        submission_id: submission.id,
        workflow_stage: 'ai_complete',
        seo_content: seoContent,
        qa_review: qaReview,
        fda_data: fdaData
      })
    };
  } catch (error) {
    console.error('Processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Processing failed',
        message: error.message
      })
    };
  }
};