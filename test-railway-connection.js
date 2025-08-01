// Test Railway Database Connection and Fields
import fetch from 'node-fetch';

const RAILWAY_API_URL = 'https://3cubed-seo-production.up.railway.app';

async function testRailwayConnection() {
  console.log('🚂 Testing Railway API Connection...\n');

  // 1. Test health check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${RAILWAY_API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // 2. Test fetching submissions
  try {
    console.log('\n2. Testing GET /api/submissions...');
    const response = await fetch(`${RAILWAY_API_URL}/api/submissions`);
    const data = await response.json();
    console.log('✅ Fetched submissions:', data.length, 'records');
    
    if (data.length > 0) {
      console.log('\n📊 Sample record structure:');
      const fields = Object.keys(data[0]);
      console.log('Available fields:', fields);
      
      // Check for AI-generated fields
      const aiFields = [
        'seo_title', 'meta_description', 'h1_tag', 'h2_tags',
        'seo_keywords', 'long_tail_keywords', 'consumer_questions',
        'geo_event_tags', 'geo_optimization', 'seo_strategy_outline',
        'fda_data', 'qa_scores', 'ai_output'
      ];
      
      console.log('\n🤖 AI Fields Status:');
      aiFields.forEach(field => {
        const exists = fields.includes(field);
        console.log(`${exists ? '✅' : '❌'} ${field}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to fetch submissions:', error.message);
  }

  // 3. Test creating a submission
  try {
    console.log('\n3. Testing POST /api/submissions...');
    const testData = {
      product_name: 'Test Product ' + Date.now(),
      generic_name: 'testgeneric',
      indication: 'Test Indication',
      therapeutic_area: 'Oncology',
      submitter_name: 'Test User',
      submitter_email: 'test@example.com',
      priority_level: 'high',
      development_stage: 'Phase III',
      medical_indication: 'Advanced NSCLC',
      target_audience: ['HCPs', 'Patients'],
      geographic_markets: ['USA', 'EU'],
      mechanism_of_action: 'Test MOA',
      key_differentiators: ['First-in-class', 'Superior efficacy'],
      line_of_therapy: 'First-line',
      patient_population: 'Adults with advanced NSCLC',
      primary_endpoints: 'Overall survival',
      key_biomarkers: 'PD-L1 expression'
    };

    const createResponse = await fetch(`${RAILWAY_API_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (createResponse.ok) {
      const newSubmission = await createResponse.json();
      console.log('✅ Created submission:', newSubmission.id);
      
      // 4. Test updating with AI fields
      console.log('\n4. Testing PUT /api/submissions/:id with AI fields...');
      const aiData = {
        seo_title: 'Test SEO Title for AI Processing',
        meta_description: 'Test meta description with 155 character limit for search engines',
        h1_tag: 'Test H1 Heading for Page',
        h2_tags: ['How It Works', 'Clinical Benefits', 'Patient Access'],
        seo_keywords: ['test drug', 'oncology treatment', 'nsclc therapy'],
        long_tail_keywords: ['test drug for advanced nsclc', 'first line treatment options'],
        consumer_questions: [
          { question: 'What is this medication?', answer: 'Test answer' },
          { question: 'How does it work?', answer: 'Test mechanism' }
        ],
        geo_event_tags: ['ASCO 2024', 'ESMO 2024'],
        geo_optimization: {
          ai_friendly_summary: 'Test AI-optimized summary',
          voice_search_answers: { 'what is test drug': 'Answer for voice search' },
          key_facts: ['Fact 1', 'Fact 2', 'Fact 3']
        },
        seo_strategy_outline: 'Test SEO/GEO strategy for pharmaceutical content',
        workflow_stage: 'ai_processing'
      };

      const updateResponse = await fetch(`${RAILWAY_API_URL}/api/submissions/${newSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiData)
      });

      if (updateResponse.ok) {
        const updated = await updateResponse.json();
        console.log('✅ Updated with AI fields');
        
        // Verify fields were saved
        console.log('\n📝 Verifying AI field storage:');
        console.log('- SEO Title:', updated.seo_title ? '✅' : '❌');
        console.log('- H2 Tags:', Array.isArray(updated.h2_tags) ? '✅' : '❌');
        console.log('- GEO Optimization:', updated.geo_optimization ? '✅' : '❌');
      } else {
        const error = await updateResponse.json();
        console.error('❌ Update failed:', error);
      }
    } else {
      const error = await createResponse.json();
      console.error('❌ Create failed:', error);
    }
  } catch (error) {
    console.error('❌ Test submission failed:', error.message);
  }

  console.log('\n✅ Railway API test complete!');
}

// Run the test
testRailwayConnection().catch(console.error);