import fetch from 'node-fetch';

console.log('🚀 Testing form submission flow...\n');

// Test data matching your form structure
const testSubmission = {
  product_name: 'Test Product ' + new Date().toISOString(),
  generic_name: 'Test Generic Name',
  indication: 'Test Indication',
  therapeutic_area: 'Oncology',
  submitter_name: 'Test User',
  submitter_email: 'test@example.com',
  seo_reviewer_name: 'Test User',
  seo_reviewer_email: 'test@example.com',
  priority_level: 'medium',
  workflow_stage: 'draft'
};

console.log('📝 Test submission data:', JSON.stringify(testSubmission, null, 2));

// Try to submit directly to your Netlify function
try {
  console.log('\n🌐 Submitting to Netlify function...');
  const response = await fetch('https://pharma-seo-dashboard.netlify.app/.netlify/functions/process-submission', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_data: testSubmission,
      trigger_source: 'test_script'
    })
  });

  console.log('Response status:', response.status, response.statusText);
  
  const responseText = await response.text();
  console.log('Response body:', responseText);
  
  if (response.ok) {
    console.log('\n✅ Submission successful!');
    try {
      const data = JSON.parse(responseText);
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Response was not JSON:', responseText);
    }
  } else {
    console.log('\n❌ Submission failed');
  }
} catch (error) {
  console.error('🔥 Error during submission:', error);
}

// Also try to check if we can access the dashboard
console.log('\n📊 Checking dashboard availability...');
try {
  const dashboardResponse = await fetch('https://pharma-seo-dashboard.netlify.app/');
  console.log('Dashboard status:', dashboardResponse.status, dashboardResponse.statusText);
} catch (error) {
  console.error('Dashboard check error:', error.message);
}
