#!/bin/bash

# Script to deploy therapeutic areas update to Supabase

echo "Deploying therapeutic areas update to Supabase..."
echo "================================================"
echo ""
echo "This script will:"
echo "1. Push the database migration to update therapeutic areas"
echo "2. The frontend changes are already deployed via Git"
echo ""
echo "Please ensure you have:"
echo "- Supabase CLI installed"
echo "- Access to the 3cubed-seo project"
echo "- Database password ready"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Running database migration..."
    npx supabase db push
    
    echo ""
    echo "Migration complete!"
    echo ""
    echo "To verify the changes:"
    echo "1. Check the Supabase dashboard SQL editor"
    echo "2. Run: SELECT DISTINCT therapeutic_area FROM submissions;"
    echo "3. Test the submission form in the application"
else
    echo "Deployment cancelled."
fi