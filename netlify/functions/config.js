// Configuration for Netlify Functions
// This file is generated during build time

const config = {
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY || '',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY || ''
};

module.exports = config;