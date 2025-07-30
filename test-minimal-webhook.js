#!/usr/bin/env node

// Test the webhook with minimal data to isolate the issue
const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';

// Minimal payload focusing on just the essential fields
const minimalPayload = {
  // Try different variations to test what the workflow expects
  submission_id: "existing-submission-id-123",  // Use a real ID if you have one
  id: "existing-submission-id-123",             // Alternative field name
  product_name: "Minimal Test Product",
  therapeutic_area: "Oncology",
  submitter_name: "Minimal Test User",
  submitter_email: "minimal.test@example.com"
};

async function testMinimalWebhook() {
  console.log('🎯 Testing webhook with minimal payload...\n');
  console.log('📋 Minimal payload:');
  console.log(JSON.stringify(minimalPayload, null, 2));
  console.log('\n🚀 Sending to webhook...\n');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },  
      body: JSON.stringify(minimalPayload)
    });

    const responseText = await response.text();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📝 Response Body:', responseText || '(empty)');

    // Try with different field names
    console.log('\n🔄 Testing with "id" instead of "submission_id"...');
    
    const altPayload = { ...minimalPayload };
    delete altPayload.submission_id;
    altPayload.id = "existing-submission-id-123";

    const response2 = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(altPayload)
    });

    const responseText2 = await response2.text();
    console.log(`📊 Alt Response Status: ${response2.status} ${response2.statusText}`);
    console.log('📝 Alt Response Body:', responseText2 || '(empty)');

  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
}

testMinimalWebhook();