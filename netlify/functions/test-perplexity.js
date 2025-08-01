// Test function that returns mock Perplexity-style data for testing
exports.handler = async (event, context) => {
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
    const { product_name, generic_name, medical_indication, therapeutic_area } = JSON.parse(event.body);

    // Return mock GEO-optimized content
    const mockResponse = {
      seo_title: `${product_name} (${generic_name}) for ${medical_indication} Treatment`,
      meta_description: `Learn about ${product_name}, a ${therapeutic_area} treatment for ${medical_indication}. Comprehensive information on efficacy, safety, and patient access.`,
      h1_tag: `${product_name}: Advanced ${medical_indication} Treatment`,
      h2_tags: [
        `What is ${product_name}?`,
        `How ${product_name} Works`,
        `Clinical Trial Results`,
        `Patient Eligibility`,
        `Access and Availability`
      ],
      seo_keywords: [
        product_name.toLowerCase(),
        generic_name.toLowerCase(),
        `${medical_indication} treatment`,
        `${therapeutic_area} therapy`,
        `${generic_name} clinical trials`
      ],
      long_tail_keywords: [
        `what is ${product_name} used for`,
        `${product_name} side effects`,
        `${product_name} clinical trial enrollment`,
        `how does ${generic_name} work`,
        `${product_name} vs standard therapy`
      ],
      consumer_questions: [
        {
          question: `What is ${product_name}?`,
          answer: `${product_name} (${generic_name}) is an investigational therapy for ${medical_indication}.`
        },
        {
          question: `How does ${product_name} work?`,
          answer: `${product_name} works through a novel mechanism to target ${medical_indication}.`
        },
        {
          question: `Who can receive ${product_name}?`,
          answer: `Eligibility for ${product_name} depends on specific clinical trial criteria.`
        }
      ],
      geo_optimization: {
        ai_friendly_summary: `${product_name} is an investigational ${therapeutic_area} treatment being developed for ${medical_indication}. This innovative therapy represents a potential advancement in patient care.`,
        key_facts: [
          `${product_name} is in clinical development`,
          `Targets ${medical_indication} patients`,
          `Novel mechanism of action`
        ],
        evidence_statistics: [
          "Clinical trials ongoing",
          "Multiple study sites available"
        ]
      },
      geo_event_tags: [
        `${therapeutic_area}-innovation`,
        `${medical_indication}-research`,
        "clinical-development"
      ],
      content_strategy: `Focus on educational content about ${medical_indication} and the unmet medical need that ${product_name} addresses.`,
      seo_strategy_outline: `Build authority through disease education, clinical trial information, and patient resources.`
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockResponse)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Mock generation failed',
        message: error.message
      })
    };
  }
};