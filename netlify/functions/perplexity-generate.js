// Netlify Function for Perplexity AI Content Generation

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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { submission, fdaData } = JSON.parse(event.body);
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // Build FDA context
    const fdaContext = fdaData.summary ? `
FDA REGULATORY STATUS:
- FDA Approved: ${fdaData.summary.hasApprovedNDA ? 'Yes' : 'Pending'}
- Approval Date: ${fdaData.summary.approvalDate || 'N/A'}
- Application Number: ${fdaData.summary.applicationNumber || 'N/A'}
- Active Clinical Trials: ${fdaData.summary.activeTrials || 0}
- Total Clinical Trials: ${fdaData.summary.totalTrials || 0}
- Adverse Events Reported: ${fdaData.summary.adverseEventCount || 0}
` : '';

    const prompt = `You are an expert pharmaceutical SEO strategist. Generate comprehensive SEO content for:

PRODUCT: ${submission.product_name} (${submission.generic_name})
INDICATION: ${submission.medical_indication}
THERAPEUTIC AREA: ${submission.therapeutic_area}
TARGET AUDIENCE: ${submission.target_audience}
${fdaContext}

Generate the following SEO-optimized content in JSON format:

{
  "seo_title": "Compelling title under 60 characters with product name and benefit",
  "meta_description": "Engaging description under 155 characters with FDA status if approved",
  "primary_keywords": ["5-7 high-volume pharmaceutical search terms"],
  "long_tail_keywords": ["5-7 specific treatment-focused phrases"],
  "h1_tags": ["3 main page headers"],
  "h2_tags": ["5 section headers for content structure"],
  "consumer_questions": [
    {
      "question": "Common patient question",
      "answer": "Medically accurate answer"
    }
  ],
  "competitive_advantages": ["Key differentiators vs competitors"],
  "content_strategy": "300-word SEO strategy overview",
  "geo_strategy": {
    "primary_markets": ["Top 3 geographic markets"],
    "localization_approach": "Geographic targeting strategy"
  }
}

Ensure all content is:
- Medically accurate
- FDA compliant (no unsubstantiated claims)
- SEO optimized
- Patient-friendly language`;

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
            content: 'You are a pharmaceutical SEO expert. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/({[\s\S]*})/);
      parsedContent = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', parseError);
      throw new Error('Invalid response format from Perplexity');
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        content: parsedContent,
        generated_at: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Perplexity generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Content generation failed',
        message: error.message
      })
    };
  }
};