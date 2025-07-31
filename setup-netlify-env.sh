#!/bin/bash

echo "Setting up Netlify environment variables..."

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "Error: netlify.toml not found. Please run this script from the project root."
    exit 1
fi

# Read .env file values
if [ -f ".env" ]; then
    export $(cat .env | xargs)
    echo "Found .env file with variables"
else
    echo "Error: .env file not found"
    exit 1
fi

# Set environment variables in Netlify
echo "Setting VITE_SUPABASE_URL..."
netlify env:set VITE_SUPABASE_URL "$VITE_SUPABASE_URL"

echo "Setting VITE_SUPABASE_ANON_KEY..."
netlify env:set VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY"

echo "Setting PERPLEXITY_API_KEY..."
netlify env:set PERPLEXITY_API_KEY "$PERPLEXITY_API_KEY"

echo ""
echo "Environment variables set successfully!"
echo "Now you need to trigger a new deployment for the changes to take effect."
echo ""
echo "You can trigger a deployment by:"
echo "1. Pushing a commit to your repository"
echo "2. Running: netlify deploy --prod"
echo "3. Or triggering a deploy from the Netlify dashboard"