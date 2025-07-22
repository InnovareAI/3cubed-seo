#!/bin/bash

# 3Cubed SEO Deployment Script

echo "🚀 Starting deployment process for 3Cubed SEO..."

# Ensure we're in the right directory
cd /Users/tvonlinz/3cubed-seo

# 1. Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed."
fi

# 2. Build the project
echo "🔨 Building the project..."
npm run build

# 3. Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build completed successfully!"

# 4. Deploy to Netlify
echo "🌐 Deploying to Netlify..."

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null
then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 Your changes are now live on Netlify!"
else
    echo "❌ Deployment failed. Please check your Netlify configuration."
fi