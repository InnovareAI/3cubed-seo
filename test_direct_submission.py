#!/usr/bin/env python3
"""
Create and trigger submission using direct SQL approach
"""
import os
import time
import json
import requests
from datetime import datetime, timezone
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

# Generate unique compliance ID
compliance_id = f"TEST-AI-{int(time.time())}"

print(f"Creating test submission with compliance ID: {compliance_id}")

# Use the create_submission function if it exists
try:
    result = supabase.rpc('create_submission', {
        'p_compliance_id': compliance_id,
        'p_product_name': 'Keytruda Plus',
        'p_generic_name': 'pembrolizumab-lenvatinib',
        'p_indication': 'First-line treatment of advanced renal cell carcinoma',
        'p_therapeutic_area': 'Oncology',
        'p_submitter_email': 'test.ai@pharma.com',
        'p_submitter_name': 'Dr. AI Test',
        'p_seo_reviewer_name': 'SEO Reviewer',
        'p_seo_reviewer_email': 'seo@3cubed.com',
        'p_workflow_stage': 'draft',
        'p_stage': 'Phase III',
        'p_priority_level': 'medium'
    }).execute()
    
    if result.data:
        submission_id = result.data
        print(f"✅ Submission created via function: {submission_id}")
    else:
        raise Exception("No data returned from function")
        
except Exception as e:
    print(f"Function call failed: {e}")
    print("Falling back to direct insert...")
    
    # Direct insert
    result = supabase.table('submissions').insert({
        "compliance_id": compliance_id,
        "product_name": "Keytruda Plus",
        "generic_name": "pembrolizumab-lenvatinib",
        "indication": "First-line treatment of advanced renal cell carcinoma",
        "therapeutic_area": "Oncology",
        "submitter_email": "test.ai@pharma.com",
        "submitter_name": "Dr. AI Test",
        "seo_reviewer_name": "SEO Reviewer",
        "seo_reviewer_email": "seo@3cubed.com",
        "workflow_stage": "draft",
        "priority_level": "medium",
        "ai_processing_status": "pending",
        "raw_input_content": """
        Product: Keytruda Plus (pembrolizumab + lenvatinib)
        Indication: First-line advanced RCC
        Key Data:
        - CLEAR trial: mPFS 23.9 vs 9.2 months (HR 0.39)
        - ORR: 71% vs 36%
        - CR rate: 16.1% vs 4.2%
        Target: Oncologists, urologists
        """,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).execute()
    
    if result.data:
        submission_id = result.data[0]['id']
        print(f"✅ Submission created via insert: {submission_id}")

# Now trigger the webhook
print("\nTriggering webhook...")
webhook_url = "https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt"

webhook_data = {
    "submission_id": submission_id,
    "compliance_id": compliance_id,
    "trigger_type": "manual_test",
    "timestamp": datetime.now(timezone.utc).isoformat()
}

response = requests.post(webhook_url, json=webhook_data)
print(f"Webhook response: {response.status_code}")
if response.text:
    print(f"Response body: {response.text[:200]}")

# Wait and check results
print("\nWaiting 30 seconds for AI processing...")
for i in range(30, 0, -5):
    print(f"  {i} seconds remaining...")
    time.sleep(5)

# Check results
print("\nChecking results...")
result = supabase.table('submissions').select("*").eq('id', submission_id).execute()

if result.data:
    submission = result.data[0]
    
    print(f"\n📊 Final Status:")
    print(f"- Workflow Stage: {submission.get('workflow_stage')}")
    print(f"- AI Processing Status: {submission.get('ai_processing_status')}")
    print(f"- AI Error: {submission.get('ai_error', 'None')}")
    
    if submission.get('ai_generated_content'):
        print("\n✅ AI content was generated!")
        print(f"- SEO Title: {submission.get('seo_title')}")
        print(f"- Meta Description: {submission.get('meta_description', '')[:100]}...")
        print(f"- Primary Keywords: {submission.get('primary_keywords')}")
    else:
        print("\n❌ No AI content was generated")
        
    # Save full results
    with open(f"test_result_{submission_id}.json", 'w') as f:
        json.dump(submission, f, indent=2)
    
print(f"\n🔍 Submission ID: {submission_id}")
print(f"🔍 Compliance ID: {compliance_id}")