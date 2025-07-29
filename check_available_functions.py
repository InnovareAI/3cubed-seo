#!/usr/bin/env python3
"""
Check available RPC functions in Supabase
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

# Try some known functions
functions_to_test = [
    'run_seo_automation',
    'create_submission',
    'trigger_n8n_webhook',
    'check_submissions_schema'
]

print("Testing available functions:\n")

for func_name in functions_to_test:
    try:
        # Try to call with dummy params - we expect an error but it tells us if function exists
        result = supabase.rpc(func_name, {}).execute()
        print(f"✅ {func_name} - Function exists")
    except Exception as e:
        error_msg = str(e)
        if "Could not find the function" in error_msg:
            print(f"❌ {func_name} - Function not found")
        else:
            print(f"⚠️  {func_name} - Function exists but error: {error_msg[:100]}...")

# Check for check_submissions_schema which was mentioned in the hint
print("\n\nTrying check_submissions_schema function...")
try:
    result = supabase.rpc('check_submissions_schema', {}).execute()
    if result.data:
        print("✅ check_submissions_schema returned data:")
        print(result.data)
except Exception as e:
    print(f"Error: {e}")