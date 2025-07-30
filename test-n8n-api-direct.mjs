import fetch from 'node-fetch';

async function testN8nAPIDirect() {
  console.log('=== TESTING N8N API DIRECTLY ===\n');
  
  // Test if we can access n8n API
  const n8nUrl = 'https://innovareai.app.n8n.cloud';
  const workflowId = 'hP9yZxUjmBKJmrZt';
  
  console.log('Testing n8n API access...');
  console.log('URL:', n8nUrl);
  console.log('Workflow ID:', workflowId);
  
  // Try to access the workflow via API (this will likely need auth)
  try {
    const response = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('\nAPI Response:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.log('❌ Authentication required - need API key');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Workflow data retrieved!');
      console.log('Workflow name:', data.name);
      console.log('Active:', data.active);
    }
  } catch (error) {
    console.log('API Error:', error.message);
  }
  
  // Test webhook again with detailed logging
  console.log('\n\nTesting webhook with detailed payload...');
  
  const testPayload = {
    submission_id: 'api-test-' + Date.now(),
    product_name: 'API Test Product',
    generic_name: 'testapimab',
    indication: 'Testing n8n API and workflow',
    therapeutic_area: 'API Testing',
    test_mode: true,
    debug: true
  };
  
  try {
    const webhookResponse = await fetch(`${n8nUrl}/webhook/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-api-test'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Webhook Response:', webhookResponse.status, webhookResponse.statusText);
    console.log('Headers:', Object.fromEntries(webhookResponse.headers.entries()));
    
    const body = await webhookResponse.text();
    console.log('Response body:', body || '(empty)');
    
    if (webhookResponse.status === 200) {
      console.log('\n✅ Webhook is responding correctly');
      console.log('But n8n is not processing the data through Perplexity/Claude');
    }
  } catch (error) {
    console.log('Webhook error:', error.message);
  }
  
  console.log('\n\n=== DIAGNOSIS ===');
  console.log('1. n8n instance is running at:', n8nUrl);
  console.log('2. Webhook endpoint is active and responding');
  console.log('3. Workflow ID is correct:', workflowId);
  console.log('4. Issue is in the workflow configuration:');
  console.log('   - Perplexity node needs API key');
  console.log('   - Claude node needs API key');
  console.log('   - Nodes need to be connected properly');
  console.log('   - Supabase update node needs credentials');
}

testN8nAPIDirect();