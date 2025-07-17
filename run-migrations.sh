#!/bin/bash

# Run Supabase migrations
# This script helps run migrations when CLI linking has issues

echo "Running Supabase migrations for 3cubed-seo..."
echo ""
echo "Please run the following commands in your terminal:"
echo ""
echo "1. First, make sure you're logged in to Supabase CLI:"
echo "   supabase login"
echo ""
echo "2. Link your project (press Enter when prompted for password):"
echo "   cd ~/3cubed-seo"
echo "   supabase link --project-ref ktchrfgkbpaixbiwbieg"
echo ""
echo "3. Run the migrations:"
echo "   supabase db push"
echo ""
echo "Alternatively, you can run the migrations directly in Supabase Dashboard:"
echo "1. Go to: https://app.supabase.com/project/ktchrfgkbpaixbiwbieg/sql"
echo "2. Copy and run the content from:"
echo "   - supabase/migrations/20250117_create_clients_projects.sql"
echo "   - supabase/migrations/20250117_populate_clients_projects.sql"
