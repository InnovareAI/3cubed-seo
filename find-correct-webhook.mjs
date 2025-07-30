import fetch from 'node-fetch';

async function findCorrectWebhook() {
  console.log('🔍 FINDING THE CORRECT WEBHOOK URL...\n');

  const baseUrl = 'https://innovareai.app.n8n.cloud';
  const workflowId = 'hP9yZxUjmBKJmrZt';
  
  // Test different webhook URL patterns
  const possibleUrls = [
    `${baseUrl}/webhook/${workflowId}`,
    `${baseUrl}/webhook-test/${workflowId}`,
    `${baseUrl}/webhook/3cubed-seo-webhook`,
    `${baseUrl}/webhook-test/3cubed-seo-webhook`,
    `${baseUrl}/webhook/hP9yZxUjmBKJmrZt`,
    `${baseUrl}/webhook-test/hP9yZxUjmBKJmrZt`
  ];

  console.log('Testing possible webhook URLs:\n');

  for (const url of possibleUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      console.log(`${response.status === 200 ? '✅' : '❌'} ${url}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log('\n🎯 FOUND WORKING WEBHOOK URL!');
        console.log(`\nUpdate your code to use: ${url}`);
        return url;
      }
      
      if (response.status === 404) {
        const body = await response.text();
        if (body.includes('not registered')) {
          console.log('   Message: Webhook not registered');
        }
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log('\n📝 IMPORTANT:');
  console.log('None of the standard webhook URLs are working.');
  console.log('\nIn n8n, please check:');
  console.log('1. Open your workflow');
  console.log('2. Click on the Webhook node');
  console.log('3. Look for "Production URL" or "Webhook URL"');
  console.log('4. Copy the EXACT URL shown there');
  console.log('\nThe webhook URL might have a custom path that we need to use.');
}

findCorrectWebhook();