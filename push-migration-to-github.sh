#!/bin/bash

# Push database migrations to GitHub
echo "Pushing database migrations to GitHub..."

cd /Users/tvonlinz/3cubed-seo

# Add the migration file
git add supabase/migrations/20250117_current_projects_dashboard_views.sql

# Commit with descriptive message
git commit -m "Add current projects dashboard views

- current_projects_dashboard: Main view aggregating real-time status from all workflow stages
- dashboard_summary_stats: Summary statistics for dashboard cards
- workflow_status_feed: Real-time feed with attention flags for stuck items

These views aggregate data from workflow_stage field to show accurate project status across all stages:
Form_Submitted → AI_Processing → SEO_Review → Client_Review → MLR_Review → Published"

# Push to GitHub
git push origin main

echo "Migration pushed to GitHub successfully!"
