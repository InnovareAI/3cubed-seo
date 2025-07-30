#!/usr/bin/env node

// Test the n8n webhook directly to see what happens
const webhookUrl = 'https://innovareai.app.n8n.cloud/webhook/hP9yZxUjmBKJmrZt';

// Test payload that mimics what your form sends
const testPayload = {
  submission_id: "test-submission-" + Date.now(),
  product_name: "Test Webhook Product",
  generic_name: "test-generic",
  indication: "Test indication for webhook debugging",
  therapeutic_area: "Oncology",
  submitter_name: "Webhook Test User",
  submitter_email: "webhook.test@example.com",
  priority_level: "medium",
  workflow_stage: "draft",
  development_stage: "Phase III"
};

async function testWebhook() {
  console.log('🎯 Testing n8n webhook directly...\n');
  console.log('📋 Payload being sent:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n🚀 Sending to webhook...\n');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📄 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    
    console.log('\n📝 Response Body:');
    console.log(responseText);

    if (response.ok) {
      console.log('\n✅ Webhook responded successfully!');
      console.log('   This means the webhook is receiving data correctly.');
      console.log('   If Supabase data is missing, the issue is inside the n8n workflow.');
    } else {
      console.log('\n❌ Webhook failed!');
      console.log('   Check the n8n workflow configuration and credentials.');
    }

  } catch (error) {
    console.error('🔥 Network or connection error:', error.message);
  }
}

testWebhook();