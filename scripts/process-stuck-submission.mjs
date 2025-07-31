import fetch from 'node-fetch';

async function processStuckSubmission() {
  console.log('🔄 Processing stuck submission\n');

  // Use one of the stuck submission IDs
  const submissionId = '50be99d3-db4c-4397-9a90-0768e3cd35b3'; // TestDrug-Demo

  console.log(`Processing submission: ${submissionId}`);

  try {
    // Call the Netlify function (we'll simulate it locally)
    const response = await fetch('https://3cubedai-seo.netlify.app/.netlify/functions/process-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ submission_id: submissionId })
    });

    const result = await response.json();
    console.log('\nResponse:', result);

    if (!response.ok) {
      console.error('Error:', response.status, result);
    }
  } catch (error) {
    console.error('Failed to call function:', error.message);
    console.log('\n⚠️  The Netlify function might not be deployed or accessible.');
    console.log('You can deploy it by running: netlify deploy --prod');
  }
}

processStuckSubmission();