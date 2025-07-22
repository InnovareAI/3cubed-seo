#!/bin/bash

# Backup current files
cd /Users/tvonlinz/3cubed-seo

# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup current components
cp src/components/SEOReviewModal.tsx backups/$(date +%Y%m%d)/SEOReviewModal.tsx.backup
cp src/lib/supabase.ts backups/$(date +%Y%m%d)/supabase.ts.backup

echo "Backups created in backups/$(date +%Y%m%d)/"