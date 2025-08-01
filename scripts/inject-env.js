#!/usr/bin/env node

// Script to inject environment variables into Netlify functions at build time
const fs = require('fs');
const path = require('path');

console.log('Injecting environment variables...');

// Get environment variables
const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY || '';
const claudeKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY || '';

console.log('Perplexity key found:', perplexityKey ? 'Yes' : 'No');
console.log('Claude key found:', claudeKey ? 'Yes' : 'No');

// Create config content
const configContent = `// Auto-generated configuration - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

const config = {
  PERPLEXITY_API_KEY: '${perplexityKey}',
  CLAUDE_API_KEY: '${claudeKey}'
};

module.exports = config;
`;

// Write to config file
const configPath = path.join(__dirname, '..', 'netlify', 'functions', 'config-injected.js');
fs.writeFileSync(configPath, configContent);

console.log('Environment variables injected successfully to:', configPath);