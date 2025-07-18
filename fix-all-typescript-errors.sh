#!/bin/bash

echo "Fixing all remaining TypeScript errors..."

# Fix RecentSubmissionsTable.tsx - Update field names
echo "Fixing RecentSubmissionsTable.tsx..."
sed -i '' 's/product_identifier/product_name/g' /Users/tvonlinz/3cubed-seo/src/components/RecentSubmissionsTable.tsx
sed -i '' 's/stage_new/stage/g' /Users/tvonlinz/3cubed-seo/src/components/RecentSubmissionsTable.tsx

# Fix SubmissionForm.tsx if it exists
if [ -f "/Users/tvonlinz/3cubed-seo/src/components/SubmissionForm.tsx" ]; then
  echo "Fixing SubmissionForm.tsx..."
  sed -i '' 's/setClients(data || \[\])/setClients((data || []) as Client[])/g' /Users/tvonlinz/3cubed-seo/src/components/SubmissionForm.tsx
fi

# Fix clientProjectHelpers.ts if it exists
if [ -f "/Users/tvonlinz/3cubed-seo/src/lib/clientProjectHelpers.ts" ]; then
  echo "Fixing clientProjectHelpers.ts..."
  sed -i '' 's/const { data: clientData, error: findError }/const { data: clientData }/g' /Users/tvonlinz/3cubed-seo/src/lib/clientProjectHelpers.ts
  sed -i '' 's/const { data: projectData, error: findError }/const { data: projectData }/g' /Users/tvonlinz/3cubed-seo/src/lib/clientProjectHelpers.ts
fi

# Fix HITLReview.tsx - Remove unused imports
echo "Fixing HITLReview.tsx imports..."
sed -i '' '/MessageSquare,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Sparkles,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Clock,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Building2,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/ArrowRight,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Search,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/HelpCircle,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Type,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/FileText,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Globe,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/Send,/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx
sed -i '' '/AlertCircle/d' /Users/tvonlinz/3cubed-seo/src/pages/HITLReview.tsx

# Fix SEOReview.tsx imports
echo "Fixing SEOReview.tsx imports..."
sed -i '' 's/, Send, AlertCircle//g' /Users/tvonlinz/3cubed-seo/src/pages/SEOReview.tsx

# Fix SEORequests.tsx imports
echo "Fixing SEORequests.tsx imports..."
sed -i '' 's/, Plus//g' /Users/tvonlinz/3cubed-seo/src/pages/SEORequests.tsx

# Fix unused React imports in pages
echo "Fixing unused React imports..."
for file in ClientManagement ClientReview CurrentProjects MLRReview RevisionRequests; do
  if [ -f "/Users/tvonlinz/3cubed-seo/src/pages/$file.tsx" ]; then
    sed -i '' '1s/import React from .react.//g' "/Users/tvonlinz/3cubed-seo/src/pages/$file.tsx"
  fi
done

# Fix SubmissionDetail.tsx field names
echo "Fixing SubmissionDetail.tsx..."
sed -i '' 's/product_identifier/product_name/g' /Users/tvonlinz/3cubed-seo/src/pages/SubmissionDetail.tsx
sed -i '' 's/fda_compliance_status/workflow_stage/g' /Users/tvonlinz/3cubed-seo/src/pages/SubmissionDetail.tsx
sed -i '' 's/qa_status/langchain_status/g' /Users/tvonlinz/3cubed-seo/src/pages/SubmissionDetail.tsx

echo "All fixes applied!"
