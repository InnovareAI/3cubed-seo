#!/usr/bin/env python3
"""
Final test: Create submission and trigger webhook properly
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
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

# Create a new submission
compliance_id = f"TEST-FINAL-{int(time.time())}"
print(f"Creating submission with compliance ID: {compliance_id}")

# Create submission with all required fields
submission_data = {
    "compliance_id": compliance_id,
    "product_name": "Opdivo Plus",
    "generic_name": "nivolumab-ipilimumab",
    "indication": "Unresectable malignant pleural mesothelioma",
    "therapeutic_area": "Oncology",
    "submitter_email": "final.test@pharma.com",
    "submitter_name": "Dr. Final Test",
    "seo_reviewer_name": "SEO Expert",
    "seo_reviewer_email": "seo@3cubed.com",
    "workflow_stage": "draft",
    "priority_level": "high",
    "ai_processing_status": "pending",
    "raw_input_content": """
    Product: Opdivo Plus (nivolumab + ipilimumab)
    Indication: First-line treatment of unresectable malignant pleural mesothelioma
    
    Key Clinical Data:
    - CheckMate 743 trial
    - Overall Survival: 18.1 vs 14.1 months (HR 0.74, p=0.002)
    - 3-year OS rate: 23% vs 15%
    - Durable responses observed
    
    Target Audience: Oncologists, thoracic surgeons
    Key Message: First immunotherapy combination approved for mesothelioma
    """,
    "created_at": datetime.now(timezone.utc).isoformat(),
    "updated_at": datetime.now(timezone.utc).isoformat()
}

try:
    result = supabase.table('submissions').insert(submission_data).execute()
    
    if result.data:
        submission_id = result.data[0]['id']
        print(f"✅ Submission created: {submission_id}")
        
        # Try to trigger the webhook function
        print("\nAttempting to trigger webhook via function...")
        try:
            # The trigger_n8n_webhook function exists, let's try it
            webhook_result = supabase.rpc('trigger_n8n_webhook').execute()
            print("✅ Webhook function called")
        except Exception as e:
            print(f"⚠️ Webhook function error: {e}")
        
        # Wait for processing
        print("\nWaiting 30 seconds for AI processing...")
        for i in range(6):
            time.sleep(5)
            print(f"  {30 - i*5} seconds remaining...")
            
            # Check status periodically
            check_result = supabase.table('submissions').select(
                "ai_processing_status, workflow_stage, ai_generated_content"
            ).eq('id', submission_id).execute()
            
            if check_result.data:
                status = check_result.data[0]
                if status.get('ai_generated_content'):
                    print("\n🎉 AI content detected early!")
                    break
        
        # Final check
        print("\n\nFinal submission check...")
        final_result = supabase.table('submissions').select("*").eq('id', submission_id).execute()
        
        if final_result.data:
            submission = final_result.data[0]
            
            print(f"\n📊 FINAL RESULTS:")
            print(f"Submission ID: {submission_id}")
            print(f"Compliance ID: {compliance_id}")
            print(f"Workflow Stage: {submission.get('workflow_stage')}")
            print(f"AI Processing Status: {submission.get('ai_processing_status')}")
            
            # Check for AI-generated content
            ai_content = submission.get('ai_generated_content')
            if ai_content:
                print("\n✅ AI CONTENT GENERATED SUCCESSFULLY!")
                print(f"\nAI Generated Content Preview:")
                if isinstance(ai_content, dict):
                    for key, value in list(ai_content.items())[:5]:
                        print(f"- {key}: {str(value)[:100]}...")
                else:
                    print(f"- Content: {str(ai_content)[:200]}...")
            
            # Check for SEO fields
            seo_fields = [
                'seo_title', 'meta_description', 'meta_title',
                'seo_keywords', 'primary_keywords', 'secondary_keywords',
                'h1_tag', 'h2_tags', 'geo_event_tags'
            ]
            
            seo_data = {}
            for field in seo_fields:
                value = submission.get(field)
                if value:
                    seo_data[field] = value
            
            if seo_data:
                print(f"\n✅ SEO FIELDS POPULATED:")
                for field, value in seo_data.items():
                    if isinstance(value, list):
                        print(f"- {field}: {', '.join(value[:3])}...")
                    else:
                        print(f"- {field}: {str(value)[:100]}...")
            else:
                print("\n❌ No SEO fields were populated")
            
            # Save full results
            output_file = f"final_test_results_{submission_id}.json"
            with open(output_file, 'w') as f:
                json.dump({
                    'submission_id': submission_id,
                    'compliance_id': compliance_id,
                    'ai_content_generated': bool(ai_content),
                    'seo_fields_populated': bool(seo_data),
                    'seo_data': seo_data,
                    'full_submission': submission
                }, f, indent=2)
            
            print(f"\n📄 Full results saved to: {output_file}")
            
            # Summary
            print(f"\n{'='*50}")
            print("SUMMARY:")
            print(f"- Submission created: ✅")
            print(f"- AI content generated: {'✅' if ai_content else '❌'}")
            print(f"- SEO fields populated: {'✅' if seo_data else '❌'}")
            print(f"{'='*50}")
            
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()