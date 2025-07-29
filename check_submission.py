#!/usr/bin/env python3
"""
Check the status of a submission
"""
import os
import sys
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

# Get submission ID from command line or use the last one created
submission_id = sys.argv[1] if len(sys.argv) > 1 else "d3baa593-bd9a-4e9a-98e9-ab460e3a9960"

print(f"Checking submission: {submission_id}\n")

# Fetch submission
result = supabase.table('submissions').select("*").eq('id', submission_id).execute()

if result.data:
    submission = result.data[0]
    
    # Check AI fields
    ai_fields = {
        'workflow_stage': submission.get('workflow_stage'),
        'ai_processing_status': submission.get('ai_processing_status'),
        'ai_generated_content': submission.get('ai_generated_content'),
        'seo_title': submission.get('seo_title'),
        'meta_description': submission.get('meta_description'),
        'primary_keywords': submission.get('primary_keywords'),
        'secondary_keywords': submission.get('secondary_keywords'),
        'h1_tag': submission.get('h1_tag'),
        'h2_tags': submission.get('h2_tags'),
        'geo_event_tags': submission.get('geo_event_tags'),
        'seo_strategy_outline': submission.get('seo_strategy_outline'),
        'competitive_analysis': submission.get('competitive_analysis'),
        'ai_error': submission.get('ai_error')
    }
    
    print("📊 Submission Status:")
    print(f"Compliance ID: {submission.get('compliance_id')}")
    print(f"Product: {submission.get('product_name')}")
    print(f"Workflow Stage: {ai_fields['workflow_stage']}")
    print(f"AI Processing Status: {ai_fields['ai_processing_status']}")
    
    if ai_fields['ai_error']:
        print(f"\n❌ AI Error: {ai_fields['ai_error']}")
    
    if ai_fields['ai_generated_content']:
        print("\n✅ AI content generated successfully!")
        print(f"\nGenerated content preview:")
        print(f"- SEO Title: {ai_fields['seo_title']}")
        print(f"- Meta Description: {ai_fields['meta_description'][:100]}..." if ai_fields['meta_description'] else "- Meta Description: Not generated")
        print(f"- Primary Keywords: {ai_fields['primary_keywords']}")
        print(f"- H1 Tag: {ai_fields['h1_tag']}")
        print(f"- H2 Tags: {ai_fields['h2_tags']}")
        print(f"- GEO Event Tags: {ai_fields['geo_event_tags']}")
        
        # Save full results
        output_file = f"submission_{submission_id}.json"
        with open(output_file, 'w') as f:
            json.dump({
                'submission_id': submission_id,
                'compliance_id': submission.get('compliance_id'),
                'ai_fields': ai_fields,
                'full_submission': submission
            }, f, indent=2)
        print(f"\nFull results saved to: {output_file}")
    else:
        print("\n⏳ No AI content generated yet")
        print("AI processing may still be in progress or there might be an error")
        
else:
    print(f"❌ Submission not found: {submission_id}")