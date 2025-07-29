import fetch from 'node-fetch';

async function testWebhookResponse() {
  console.log('=== Testing n8n Webhook Response ===\n');

  const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';
  
  const testPayload = {
    submission_id: 'test-' + Date.now(),
    compliance_id: 'TEST-001',
    product_name: 'Test Product',
    generic_name: 'test-generic',
    indication: 'Test indication',
    therapeutic_area: 'Oncology',
    submitter_email: 'test@example.com',
    workflow_stage: 'draft',
    raw_input_content: JSON.stringify({
      product_overview: 'This is a test product for verifying webhook functionality.',
      mechanism_of_action: 'Test mechanism',
      target_audience: 'Healthcare Professionals'
    })
  };

  console.log('Sending test payload to webhook...');
  console.log('URL:', webhookUrl);
  console.log('Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': '3cubed-seo-test'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('\n📊 Response Details:');
    console.log('   - Status:', response.status, response.statusText);
    console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('   - Body:', responseText || '(empty)');

    if (response.status === 200) {
      console.log('\n✅ Webhook accepted the request');
      console.log('   Note: A 200 response means n8n received the webhook.');
      console.log('   Check the n8n workflow execution logs for processing details.');
    } else {
      console.log('\n❌ Webhook returned an error status');
    }

  } catch (error) {
    console.error('\n❌ Error calling webhook:', error.message);
  }
}

testWebhookResponse().catch(console.error);