#!/usr/bin/env python3
"""
Check webhook execution logs
"""
import os
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

# Check recent webhook executions
print("Checking recent webhook executions...\n")

# Try the n8n_webhook_executions table
try:
    result = supabase.table('n8n_webhook_executions').select("*").order('created_at', desc=True).limit(10).execute()
    
    if result.data:
        print(f"Found {len(result.data)} recent webhook executions:")
        for log in result.data:
            print(f"\n- Submission ID: {log.get('submission_id')}")
            print(f"  Status: {log.get('status')}")
            print(f"  Created: {log.get('created_at')}")
            print(f"  Response: {log.get('response_data', 'No response data')}")
            print(f"  Error: {log.get('error_message', 'No error')}")
    else:
        print("No webhook executions found in n8n_webhook_executions table")
except Exception as e:
    print(f"Error accessing n8n_webhook_executions: {e}")

# Check for any audit logs
print("\n\nChecking audit logs...")
try:
    result = supabase.table('audit_logs').select("*").order('created_at', desc=True).limit(10).execute()
    
    if result.data:
        print(f"\nFound {len(result.data)} recent audit logs:")
        for log in result.data[:5]:  # Show only first 5
            print(f"\n- Action: {log.get('action')}")
            print(f"  Entity: {log.get('entity_type')} - {log.get('entity_id')}")
            print(f"  User: {log.get('user_email')}")
            print(f"  Created: {log.get('created_at')}")
    else:
        print("No audit logs found")
except Exception as e:
    print(f"Error accessing audit_logs: {e}")

# Check submissions with AI processing status
print("\n\nChecking submissions with AI processing...")
try:
    result = supabase.table('submissions').select("id, compliance_id, workflow_stage, ai_processing_status, ai_error, created_at").neq('ai_processing_status', 'pending').order('created_at', desc=True).limit(5).execute()
    
    if result.data:
        print(f"\nFound {len(result.data)} submissions with AI processing updates:")
        for sub in result.data:
            print(f"\n- ID: {sub.get('id')}")
            print(f"  Compliance ID: {sub.get('compliance_id')}")
            print(f"  Workflow Stage: {sub.get('workflow_stage')}")
            print(f"  AI Status: {sub.get('ai_processing_status')}")
            print(f"  AI Error: {sub.get('ai_error', 'None')}")
    else:
        print("No submissions found with AI processing updates")
except Exception as e:
    print(f"Error checking submissions: {e}")