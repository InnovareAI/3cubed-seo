#!/usr/bin/env python3
"""
Trigger SEO automation for a submission
"""
import os
import sys
import time
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

# Get submission ID from command line or use the most recent test submission
if len(sys.argv) > 1:
    submission_id = sys.argv[1]
else:
    # Get the most recent test submission
    result = supabase.table('submissions').select("id, compliance_id, product_name").like('compliance_id', 'TEST%').order('created_at', desc=True).limit(1).execute()
    
    if result.data:
        submission_id = result.data[0]['id']
        print(f"Using most recent test submission: {result.data[0]['compliance_id']} - {result.data[0]['product_name']}")
    else:
        print("No test submissions found")
        exit(1)

print(f"\nTriggering SEO automation for submission: {submission_id}")

# Run the SEO automation function
try:
    result = supabase.rpc('run_seo_automation', {'submission_id': submission_id}).execute()
    print("✅ SEO automation triggered successfully!")
except Exception as e:
    print(f"❌ Error triggering SEO automation: {e}")
    exit(1)

# Wait a moment for processing
print("\nWaiting 5 seconds for processing...")
time.sleep(5)

# Check the results
print("\nChecking results...")
result = supabase.table('submissions').select(
    "id, compliance_id, product_name, workflow_stage, langchain_status, "
    "seo_title, meta_description, seo_keywords, long_tail_keywords, "
    "h2_tags, geo_event_tags, geo_optimization_score"
).eq('id', submission_id).execute()

if result.data:
    submission = result.data[0]
    
    print(f"\n📊 Submission Status:")
    print(f"- Compliance ID: {submission.get('compliance_id')}")
    print(f"- Product: {submission.get('product_name')}")
    print(f"- Workflow Stage: {submission.get('workflow_stage')}")
    print(f"- Langchain Status: {submission.get('langchain_status')}")
    
    if submission.get('seo_title'):
        print(f"\n✅ SEO content generated!")
        print(f"- SEO Title: {submission.get('seo_title')}")
        print(f"- Meta Description: {submission.get('meta_description', '')[:100]}...")
        print(f"- SEO Keywords: {submission.get('seo_keywords')}")
        print(f"- Long Tail Keywords: {submission.get('long_tail_keywords')}")
        print(f"- H2 Tags: {submission.get('h2_tags')}")
        print(f"- GEO Event Tags: {submission.get('geo_event_tags')}")
        print(f"- GEO Optimization Score: {submission.get('geo_optimization_score')}")
    else:
        print("\n⚠️ SEO content generation may still be in progress or failed")
else:
    print("❌ Could not retrieve submission")