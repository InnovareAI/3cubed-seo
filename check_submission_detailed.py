#!/usr/bin/env python3
"""
Detailed check of a submission including all SEO and AI fields
"""
import os
import sys
import json
from datetime import datetime
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

# Get submission ID
submission_id = "367789ee-9e5d-4a16-9c27-30d475736dab"

print(f"Detailed check for submission: {submission_id}\n")

# Fetch submission with all fields
result = supabase.table('submissions').select("*").eq('id', submission_id).execute()

if result.data:
    submission = result.data[0]
    
    print("=== AI PROCESSING STATUS ===")
    print(f"ai_processing_status: {submission.get('ai_processing_status')}")
    print(f"ai_generated_content: {'YES' if submission.get('ai_generated_content') else 'NO'}")
    print(f"ai_error: {submission.get('ai_error')}")
    
    print("\n=== SEO CONTENT FIELDS ===")
    print(f"seo_content: {'YES' if submission.get('seo_content') else 'NO'}")
    if submission.get('seo_content'):
        print(f"  Length: {len(submission.get('seo_content', ''))} characters")
        print(f"  Preview: {submission.get('seo_content', '')[:200]}...")
    
    print(f"\nseo_title: {submission.get('seo_title')}")
    print(f"meta_title: {submission.get('meta_title')}")
    print(f"meta_description: {submission.get('meta_description')}")
    print(f"seo_keywords: {submission.get('seo_keywords')}")
    
    print("\n=== OTHER SEO FIELDS ===")
    print(f"primary_keywords: {submission.get('primary_keywords')}")
    print(f"secondary_keywords: {submission.get('secondary_keywords')}")
    print(f"h1_tag: {submission.get('h1_tag')}")
    print(f"h2_tags: {submission.get('h2_tags')}")
    print(f"geo_event_tags: {submission.get('geo_event_tags')}")
    print(f"seo_strategy_outline: {'YES' if submission.get('seo_strategy_outline') else 'NO'}")
    print(f"competitive_analysis: {'YES' if submission.get('competitive_analysis') else 'NO'}")
    
    print("\n=== TIMESTAMPS ===")
    print(f"created_at: {submission.get('created_at')}")
    print(f"updated_at: {submission.get('updated_at')}")
    print(f"ai_processing_started_at: {submission.get('ai_processing_started_at')}")
    print(f"ai_processing_completed_at: {submission.get('ai_processing_completed_at')}")
    
    print("\n=== WORKFLOW INFO ===")
    print(f"workflow_stage: {submission.get('workflow_stage')}")
    print(f"status: {submission.get('status')}")
    
    # Check if ai_generated_content has any content
    if submission.get('ai_generated_content'):
        print("\n=== AI GENERATED CONTENT DETAILS ===")
        try:
            # Try to parse if it's JSON
            ai_content = json.loads(submission.get('ai_generated_content'))
            print("Content is JSON format:")
            for key, value in ai_content.items():
                print(f"  {key}: {str(value)[:100]}...")
        except:
            # If not JSON, show as string
            content = submission.get('ai_generated_content')
            print(f"Content is text format ({len(content)} characters)")
            print(f"Preview: {content[:500]}...")
    
    # Save complete results
    output_file = f"detailed_submission_{submission_id}.json"
    with open(output_file, 'w') as f:
        json.dump(submission, f, indent=2)
    print(f"\n\nComplete submission data saved to: {output_file}")
    
else:
    print(f"❌ Submission not found: {submission_id}")