#!/bin/bash

# Pharma SEO Dashboard Setup Wizard
# This script will help you set up and deploy your dashboard

set -e

echo "🚀 Pharma SEO Dashboard Setup Wizard"
echo "===================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check npm
if ! command_exists npm; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Setting up environment variables..."
    cp .env.local.example .env
    
    echo ""
    echo "📝 Please get your Supabase anon key:"
    echo "   1. Go to: https://app.supabase.com/project/ktchrfgkbpaixbiwbieg/settings/api"
    echo "   2. Copy the 'anon public' key"
    echo "   3. Paste it below:"
    echo ""
    read -p "Supabase anon key: " SUPABASE_KEY
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/VITE_SUPABASE_ANON_KEY=/VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY/" .env
    else
        # Linux
        sed -i "s/VITE_SUPABASE_ANON_KEY=/VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY/" .env
    fi
    
    echo "✅ Environment configured"
else
    echo "✅ Environment file already exists"
fi

# Run development server
echo ""
echo "🖥️  Starting development server..."
echo "   Dashboard will open at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server and continue to deployment options"
echo ""

npm run dev &
DEV_PID=$!

# Wait for user to stop
read -p "Press Enter when ready to deploy..." 

# Kill dev server
kill $DEV_PID 2>/dev/null || true

# Build for production
echo ""
echo "🔨 Building for production..."
npm run build

echo ""
echo "✅ Build complete! Your dashboard is ready to deploy."
echo ""
echo "🚀 Deployment Options:"
echo ""
echo "Option 1: Netlify CLI (Recommended)"
echo "-----------------------------------"
echo "1. Install Netlify CLI:"
echo "   npm install -g netlify-cli"
echo ""
echo "2. Login to Netlify:"
echo "   netlify login"
echo ""
echo "3. Deploy:"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "Option 2: Manual Upload"
echo "-----------------------"
echo "1. Go to: https://app.netlify.com/drop"
echo "2. Drag the 'dist' folder from this directory"
echo "3. Your site will be live immediately!"
echo ""
echo "Option 3: GitHub + Netlify"
echo "--------------------------"
echo "1. Create a GitHub repository"
echo "2. Push this code to GitHub"
echo "3. In Netlify: New site from Git"
echo "4. Connect your repository"
echo "5. Build settings:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "6. Add environment variables in Netlify"
echo ""
echo "📌 Don't forget to add your environment variables in Netlify!"
echo "   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
echo ""
