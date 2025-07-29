#!/usr/bin/env python3
"""
Test script to create a submission and trigger webhook
"""
import os
import time
import json
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

# Create test submission data
test_submission = {
    "compliance_id": f"TEST-PHARMA-{int(time.time())}",
    "product_name": "Nexavar Plus",
    "generic_name": "sorafenib-pembrolizumab",
    "indication": "Advanced hepatocellular carcinoma in patients with Child-Pugh A liver function",
    "therapeutic_area": "Oncology",
    "submitter_email": "test.pharma@example.com",
    "submitter_name": "Dr. Sarah Johnson",
    "seo_reviewer_name": "Michael Chen",
    "seo_reviewer_email": "seo.reviewer@3cubed.com",
    "workflow_stage": "draft",
    "priority_level": "medium",
    "ai_processing_status": "pending",
    "mlr_reviewer_name": "Dr. Emily Roberts",
    "mlr_reviewer_email": "mlr.reviewer@pharmatest.com",
    "raw_input_content": """
    Product: Nexavar Plus (sorafenib-pembrolizumab combination)
    Indication: Advanced hepatocellular carcinoma
    Key Clinical Data:
    - Phase 3 STELLAR trial: mPFS 9.2 months vs 7.4 months (HR 0.72, p=0.003)
    - ORR: 32% vs 18% with sorafenib alone
    - Grade 3-4 AEs: 68% (manageable with dose modifications)
    Target HCPs: Oncologists specializing in HCC treatment
    """,
    "created_at": datetime.now(timezone.utc).isoformat(),
    "updated_at": datetime.now(timezone.utc).isoformat()
}

print("Creating test submission...")
print(f"Compliance ID: {test_submission['compliance_id']}")

try:
    # Insert the submission
    result = supabase.table('submissions').insert(test_submission).execute()
    
    if result.data:
        submission_id = result.data[0]['id']
        print(f"\n✅ Submission created successfully!")
        print(f"Submission ID: {submission_id}")
        
        # Manually trigger webhook since we're inserting directly
        print("\nTriggering webhook manually...")
        webhook_data = {
            "submission_id": submission_id,
            "compliance_id": test_submission['compliance_id'],
            "product_name": test_submission['product_name'],
            "generic_name": test_submission['generic_name'],
            "indication": test_submission['indication'],
            "therapeutic_area": test_submission['therapeutic_area'],
            "submitter_email": test_submission['submitter_email'],
            "submitter_name": test_submission['submitter_name'],
            "seo_reviewer_name": test_submission['seo_reviewer_name'],
            "seo_reviewer_email": test_submission['seo_reviewer_email'],
            "workflow_stage": test_submission['workflow_stage'],
            "priority_level": test_submission['priority_level'],
            "created_at": test_submission['created_at']
        }
        
        # Trigger webhook using requests
        import requests
        webhook_url = "https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt"
        
        response = requests.post(webhook_url, json=webhook_data)
        print(f"Webhook response status: {response.status_code}")
        
        # Update submission to show it's being processed
        try:
            supabase.table('submissions').update({
                "ai_processing_status": "processing"
            }).eq('id', submission_id).execute()
        except Exception as e:
            print(f"Warning: Could not update submission status: {e}")
        
        print("\nWaiting 20 seconds for AI processing...")
        time.sleep(20)
        
        # Check if AI content was generated
        print("\nChecking for AI-generated content...")
        updated_submission = supabase.table('submissions').select("*").eq('id', submission_id).execute()
        
        if updated_submission.data:
            submission = updated_submission.data[0]
            
            # Check AI fields
            ai_fields = {
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
                'competitive_analysis': submission.get('competitive_analysis')
            }
            
            print("\n📊 AI Processing Results:")
            print(f"Status: {ai_fields['ai_processing_status']}")
            
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
                output_file = f"test_results_{submission_id}.json"
                with open(output_file, 'w') as f:
                    json.dump({
                        'submission_id': submission_id,
                        'compliance_id': test_submission['compliance_id'],
                        'ai_fields': ai_fields,
                        'full_submission': submission
                    }, f, indent=2)
                print(f"\nFull results saved to: {output_file}")
            else:
                print("\n❌ No AI content was generated")
                print("AI processing may still be in progress or there might be an error")
                
                # Check for errors
                if submission.get('ai_error'):
                    print(f"\nError detected: {submission.get('ai_error')}")
        
        print(f"\n🔍 Submission ID: {submission_id}")
        print(f"You can check the full submission at: {url}/project/default/editor/submissions?filter=id.eq.{submission_id}")
        
    else:
        print("❌ Failed to create submission")
        
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()