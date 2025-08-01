// Test function to check environment variables
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Check environment variables
  const envCheck = {
    perplexity_configured: !!process.env.PERPLEXITY_API_KEY,
    claude_configured: !!process.env.CLAUDE_API_KEY,
    perplexity_length: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.length : 0,
    claude_length: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0,
    perplexity_prefix: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 5) : 'not set',
    claude_prefix: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.substring(0, 7) : 'not set',
    node_env: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(key => !key.includes('AWS') && !key.includes('LAMBDA')).sort()
  };

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(envCheck, null, 2)
  };
};