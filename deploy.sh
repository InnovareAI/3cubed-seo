#!/bin/bash

# Build and deploy script
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful!"
    
    # Git commands
    echo "Committing changes..."
    git add -A
    git commit -m "fix: add route for /admin/clients to display Client Management page"
    
    echo "Pushing to GitHub..."
    git push origin main
    
    echo "Deployment initiated! Check Netlify for build status."
else
    echo "Build failed! Please fix errors before deploying."
    exit 1
fi
