#!/usr/bin/env python3
"""
Check ALL fields in the submission
"""
import os
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

# Get submission
submission_id = "367789ee-9e5d-4a16-9c27-30d475736dab"

# Fetch submission
result = supabase.table('submissions').select("*").eq('id', submission_id).execute()

if result.data:
    submission = result.data[0]
    
    print(f"=== COMPLETE FIELD LIST FOR SUBMISSION {submission_id} ===\n")
    
    # Group fields by category
    ai_fields = []
    seo_fields = []
    other_fields = []
    
    for field, value in submission.items():
        if 'ai_' in field or field == 'seo_content':
            ai_fields.append((field, value))
        elif 'seo_' in field or 'meta_' in field or 'keyword' in field or '_tag' in field:
            seo_fields.append((field, value))
        else:
            other_fields.append((field, value))
    
    print("AI RELATED FIELDS:")
    for field, value in sorted(ai_fields):
        if value is not None:
            if isinstance(value, str) and len(value) > 100:
                print(f"  {field}: {value[:100]}... (truncated)")
            else:
                print(f"  {field}: {value}")
        else:
            print(f"  {field}: NULL/None")
    
    print("\nSEO RELATED FIELDS:")
    for field, value in sorted(seo_fields):
        if value is not None:
            if isinstance(value, str) and len(value) > 100:
                print(f"  {field}: {value[:100]}... (truncated)")
            else:
                print(f"  {field}: {value}")
        else:
            print(f"  {field}: NULL/None")
    
    print("\nOTHER FIELDS:")
    for field, value in sorted(other_fields):
        if value is not None and field not in ['id', 'created_at', 'updated_at']:
            if isinstance(value, str) and len(value) > 100:
                print(f"  {field}: {value[:100]}... (truncated)")
            else:
                print(f"  {field}: {value}")
    
    # Check for any fields that might contain Perplexity content
    print("\n=== CHECKING FOR ANY PERPLEXITY CONTENT ===")
    perplexity_found = False
    for field, value in submission.items():
        if value and isinstance(value, str):
            if 'perplexity' in value.lower() or 'ai-generated' in value.lower():
                print(f"Found potential AI content in {field}!")
                perplexity_found = True
    
    if not perplexity_found:
        print("No Perplexity or AI-generated content found in any fields.")
    
    # Check additional SEO fields
    print("\n=== ADDITIONAL SEO FIELD CHECK ===")
    seo_specific_fields = [
        'seo_content', 'seo_title', 'meta_title', 'meta_description', 
        'seo_keywords', 'primary_keywords', 'secondary_keywords',
        'h1_tag', 'h2_tags', 'geo_event_tags', 'seo_strategy_outline',
        'competitive_analysis'
    ]
    
    for field in seo_specific_fields:
        value = submission.get(field)
        if value:
            print(f"✓ {field}: HAS CONTENT")
        else:
            print(f"✗ {field}: EMPTY")
    
else:
    print(f"❌ Submission not found: {submission_id}")