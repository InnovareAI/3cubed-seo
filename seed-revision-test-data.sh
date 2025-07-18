#!/bin/bash

# Script to seed test data for Revision Dashboard
# This creates realistic revision requests from SEO, Client, and MLR reviewers

echo "🔄 Seeding Revision Dashboard test data..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if Supabase URL and Service Key are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local"
    exit 1
fi

# Execute the seed script using Supabase CLI or direct API call
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db execute -f supabase/seed-revision-dashboard.sql
else
    echo "Using direct API call..."
    # Read the SQL file
    SQL_CONTENT=$(cat supabase/seed-revision-dashboard.sql)
    
    # Execute via Supabase API
    curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"${SQL_CONTENT}\"}" \
        --fail --silent --show-error
fi

if [ $? -eq 0 ]; then
    echo "✅ Test data seeded successfully!"
    echo ""
    echo "📊 Test Data Summary:"
    echo "- 11 revision requests created"
    echo "- 4 from SEO Review"
    echo "- 3 from Client Review"
    echo "- 4 from MLR Review"
    echo "- Various priority levels (high, medium, low)"
    echo "- Some items pending for 7+ days (will appear in red)"
    echo ""
    echo "🚀 Visit /revision-dashboard to see the test data"
else
    echo "❌ Error seeding test data"
    exit 1
fi
