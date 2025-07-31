// n8n Workflow Fix Script
// Run this in your browser console while on the n8n workflow page

// Step 1: Find and update the Perplexity node
const perplexityNode = Array.from(document.querySelectorAll('.node-wrapper')).find(el => 
  el.textContent.includes('Call Perplexity')
);
if (perplexityNode) {
  console.log('Found Perplexity node - needs URL fix from /chat/completion to /chat/completions');
}

// Step 2: Find and update the Supabase node  
const supabaseNode = Array.from(document.querySelectorAll('.node-wrapper')).find(el => 
  el.textContent.includes('Insert to Supabase')
);
if (supabaseNode) {
  console.log('Found Supabase node - needs table change from ai_fda_logs to submissions');
}

// Manual fixes needed:
console.log(`
MANUAL FIXES REQUIRED:

1. PERPLEXITY NODE:
   - Click "Call Perplexity" node
   - Change URL to: https://api.perplexity.ai/chat/completions (add the 's')
   - Set Authentication to use your Perplexity API credential
   - Set Method: POST
   - Add Body (JSON):
     {
       "model": "llama-3.1-sonar-large-128k-online",
       "messages": [{"role": "user", "content": "{{ $json.seoPrompt }}"}],
       "temperature": 0.7,
       "max_tokens": 4000
     }

2. CLAUDE NODE:
   - Click "Call Claude" node  
   - Set Authentication to use your Claude API credential
   - Add Header: anthropic-version = 2023-06-01
   - Set Method: POST
   - Add Body (JSON):
     {
       "model": "claude-3-haiku-20240307",
       "messages": [{"role": "user", "content": "{{ $json.claudePrompt }}"}],
       "max_tokens": 1000
     }

3. SUPABASE NODE:
   - Click "Insert to Supabase" node
   - Change Table from "ai_fda_logs" to "submissions"
   - Change Operation from "Insert" to "Update"
   - Add Filter: id equals {{ $json.submission_id }}
   - Update fields to include:
     * seo_title
     * meta_description
     * h1_tag
     * h2_tags (array)
     * seo_keywords (array)
     * geo_optimization_score
     * ai_processing_status = 'completed'
     * workflow_stage = 'seo_review'

4. ADD FETCH NODE:
   - Add HTTP Request node after Webhook
   - URL: https://eqokpqqjdzbzatbmqiea.supabase.co/rest/v1/submissions
   - Method: GET
   - Query params: id=eq.{{ $json.submission_id }}
   - Use Supabase API credential

5. ACTIVATE WORKFLOW:
   - Toggle the activation switch in top-right corner
`);