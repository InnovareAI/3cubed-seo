import fetch from 'node-fetch';

async function testWebhookSimple() {
  console.log('🔧 SIMPLE WEBHOOK TEST\n');
  
  const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';
  
  console.log('Testing webhook:', webhookUrl);
  console.log('Sending test payload...\n');
  
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Testing if n8n workflow executes'
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Response Status:', response.status, response.statusText);
    const body = await response.text();
    console.log('Response Body:', body || '(empty)');
    
    if (response.status === 200) {
      console.log('\n✅ Webhook is accepting requests');
      console.log('\n❌ BUT: AI processing is not happening');
      console.log('\n📋 NEXT STEPS IN N8N:');
      console.log('1. Open your workflow at https://innovareai.app.n8n.cloud');
      console.log('2. Check execution history - are workflows running?');
      console.log('3. Verify all nodes are connected:');
      console.log('   - Webhook → Fetch Submission');
      console.log('   - Fetch Submission → Generate Content (Perplexity)');
      console.log('   - Generate Content → Review Content (Claude)');
      console.log('   - Review Content → Update Database');
      console.log('4. Click "Execute Workflow" to test manually');
      console.log('5. Check for error messages in any node');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testWebhookSimple();