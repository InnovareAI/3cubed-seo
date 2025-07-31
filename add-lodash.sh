#!/bin/bash
# Add lodash dependency for debounce functionality in editable dashboard

echo "📦 Adding lodash dependency..."
npm install lodash
npm install --save-dev @types/lodash

echo "✅ Lodash installed successfully!"
echo ""
echo "🚀 Ready to deploy to Netlify:"
echo "1. git add ."
echo "2. git commit -m 'Add editable SEO dashboard with real-time sync'"
echo "3. git push origin main"
echo ""
echo "📱 New dashboard will be available at:"
echo "https://3cubed-seo.netlify.app/seo-review-editable"