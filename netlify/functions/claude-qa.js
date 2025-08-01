// Netlify Function for Claude AI Quality Assurance Review

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
    const { content, submission, fdaData } = JSON.parse(event.body);
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    
    if (!claudeApiKey) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    const qaPrompt = `Review this pharmaceutical SEO content for regulatory compliance and accuracy.

PRODUCT INFORMATION:
- Product: ${submission.product_name} (${submission.generic_name})
- Indication: ${submission.medical_indication}
- Therapeutic Area: ${submission.therapeutic_area}
- FDA Status: ${fdaData?.summary?.hasApprovedNDA ? 'FDA Approved' : 'Not FDA Approved'}

CONTENT TO REVIEW:
${JSON.stringify(content, null, 2)}

Perform a comprehensive quality assurance review and provide scores (0-100) for:
1. Medical Accuracy - Are all medical claims accurate and supported?
2. FDA Compliance - Does content meet FDA marketing guidelines?
3. SEO Effectiveness - Are keywords naturally integrated?
4. Content Quality - Is the content clear, engaging, and professional?
5. Risk Assessment - Are there any potential regulatory risks?

Also provide:
- Specific issues found (if any)
- Required changes (if any)
- Overall recommendation (Approve/Revise/Reject)

Format your response as JSON:
{
  "scores": {
    "medical_accuracy": 0-100,
    "fda_compliance": 0-100,
    "seo_effectiveness": 0-100,
    "content_quality": 0-100,
    "risk_assessment": 0-100
  },
  "overall_score": 0-100,
  "recommendation": "Approve/Revise/Reject",
  "issues": ["List of specific issues found"],
  "required_changes": ["List of required changes"],
  "strengths": ["List of content strengths"],
  "compliance_notes": "FDA compliance observations"
}`;

    const response = await globalThis.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: qaPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const qaResult = data.content[0].text;
    
    // Parse JSON response
    let parsedQA;
    try {
      const jsonMatch = qaResult.match(/```json\n?([\s\S]*?)\n?```/) || qaResult.match(/({[\s\S]*})/);
      parsedQA = JSON.parse(jsonMatch ? jsonMatch[1] : qaResult);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      throw new Error('Invalid response format from Claude');
    }

    // Add timestamp and metadata
    parsedQA.reviewed_at = new Date().toISOString();
    parsedQA.reviewer = 'Claude AI (Haiku)';
    parsedQA.review_version = '1.0';

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        qa_review: parsedQA,
        passed: parsedQA.recommendation === 'Approve',
        needs_revision: parsedQA.recommendation === 'Revise'
      })
    };
  } catch (error) {
    console.error('Claude QA error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'QA review failed',
        message: error.message
      })
    };
  }
};