#!/bin/bash

# Script to push all dashboard files to GitHub
echo "Preparing to push dashboard to GitHub..."

# Read all component files
COMPONENTS=(
  "src/components/DashboardLayout.tsx"
  "src/components/MetricCard.tsx"
  "src/components/ProcessingQueue.tsx"
  "src/components/RecentSubmissionsTable.tsx"
  "src/components/StatusDistributionChart.tsx"
  "src/components/Tabs.tsx"
)

PAGES=(
  "src/pages/Overview.tsx"
  "src/pages/Submissions.tsx"
  "src/pages/SubmissionDetail.tsx"
  "src/pages/Analytics.tsx"
  "src/pages/ContentLibrary.tsx"
  "src/pages/Compliance.tsx"
)

LIB=(
  "src/lib/supabase.ts"
)

ROOT_FILES=(
  "package.json"
  "README.md"
  "index.html"
  "vite.config.ts"
  "tsconfig.json"
  "tsconfig.node.json"
  "tailwind.config.js"
  "postcss.config.js"
  "netlify.toml"
  ".gitignore"
  ".env.example"
  "src/App.tsx"
  "src/main.tsx"
  "src/index.css"
)

echo "Files to push:"
echo "- Root files: ${#ROOT_FILES[@]}"
echo "- Components: ${#COMPONENTS[@]}"
echo "- Pages: ${#PAGES[@]}"
echo "- Lib files: ${#LIB[@]}"
echo ""
echo "Total files: $((${#ROOT_FILES[@]} + ${#COMPONENTS[@]} + ${#PAGES[@]} + ${#LIB[@]}))"
