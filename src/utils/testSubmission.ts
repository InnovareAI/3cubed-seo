// Test submission utility for AI pipeline
import { api } from '../lib/api';
import { aiApi } from '../lib/ai-api';

export async function createTestSubmission() {
  console.log('🧪 Creating test submission for AI pipeline...\n');

  const testData = {
    // Required fields
    product_name: 'Ozempic',
    generic_name: 'semaglutide',
    indication: 'Type 2 Diabetes', 
    therapeutic_area: 'Diabetes',
    seo_reviewer_name: 'Test User',
    seo_reviewer_email: 'test@example.com',
    
    // Optional fields for richer AI processing
    sponsor: 'Novo Nordisk',
    development_stage: 'Market Launch',
    target_audience: ['Patients', 'HCPs'],
    geographic_markets: ['USA', 'EU', 'Canada'],
    key_differentiators: ['Once weekly', 'Weight loss benefit', 'Cardiovascular benefits'],
    line_of_therapy: 'First-line after metformin'
  };

  try {
    // Step 1: Create submission in Railway
    console.log('📝 Creating submission in database...');
    const submission = await api.createSubmission(testData);
    console.log('✅ Submission created:', submission.id);
    console.log('🔗 View at: https://3cubedai-seo.netlify.app/seo-review/' + submission.id);

    // Step 2: Trigger AI processing
    console.log('\n🤖 Starting AI processing pipeline...');
    console.log('This will run in background and update the submission when complete.');
    
    // Monitor the submission status
    let retries = 0;
    const maxRetries = 30; // 5 minutes max
    
    const checkStatus = setInterval(async () => {
      try {
        const updated = await api.getSubmission(submission.id);
        console.log(`⏳ Status: ${updated.workflow_stage}`);
        
        if (updated.workflow_stage === 'ai_complete' || updated.workflow_stage === 'ai_error') {
          clearInterval(checkStatus);
          
          if (updated.workflow_stage === 'ai_complete') {
            console.log('\n✅ AI Processing Complete!');
            console.log('📊 Results:');
            console.log('- SEO Title:', updated.seo_title);
            console.log('- Meta Description:', updated.meta_description);
            console.log('- Primary Keywords:', updated.primary_keywords?.join(', '));
            console.log('- QA Score:', JSON.parse(updated.qa_scores || '{}').overall_score);
          } else {
            console.log('\n❌ AI Processing Failed');
            console.log('Error:', JSON.parse(updated.ai_output || '{}').error);
          }
        }
        
        retries++;
        if (retries >= maxRetries) {
          clearInterval(checkStatus);
          console.log('\n⏱️ Timeout - check dashboard for results');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 10000); // Check every 10 seconds

    return submission;
  } catch (error) {
    console.error('❌ Test submission failed:', error);
    throw error;
  }
}

// Function to test individual AI components
export async function testAIComponents() {
  console.log('🔬 Testing individual AI components...\n');

  const testProduct = {
    product_name: 'Keytruda',
    generic_name: 'pembrolizumab',
    medical_indication: 'Non-Small Cell Lung Cancer',
    therapeutic_area: 'Oncology'
  };

  // Test 1: FDA Query
  console.log('1️⃣ Testing FDA Database Query...');
  try {
    const fdaData = await aiApi.queryFDA(
      testProduct.product_name,
      testProduct.generic_name,
      testProduct.medical_indication
    );
    console.log('✅ FDA Query Success');
    console.log('  - FDA Approved:', fdaData.summary.hasApprovedNDA);
    console.log('  - Clinical Trials:', fdaData.summary.totalTrials);
    console.log('  - Adverse Events:', fdaData.summary.adverseEventCount);
  } catch (error) {
    console.log('❌ FDA Query Failed:', error.message);
  }

  // Test 2: Perplexity Content Generation
  console.log('\n2️⃣ Testing Perplexity Content Generation...');
  try {
    const contentResult = await aiApi.generateContent(testProduct, {
      summary: { hasApprovedNDA: true }
    });
    console.log('✅ Perplexity Generation Success');
    console.log('  - SEO Title:', contentResult.content?.seo_title);
    console.log('  - Keywords:', contentResult.content?.primary_keywords?.length || 0);
  } catch (error) {
    console.log('❌ Perplexity Failed:', error.message);
  }

  // Test 3: Claude QA Review
  console.log('\n3️⃣ Testing Claude QA Review...');
  try {
    const mockContent = {
      seo_title: 'Keytruda: Leading NSCLC Immunotherapy',
      meta_description: 'Discover Keytruda (pembrolizumab) for NSCLC treatment.'
    };
    const qaResult = await aiApi.performQAReview(
      mockContent,
      testProduct,
      { summary: { hasApprovedNDA: true } }
    );
    console.log('✅ Claude QA Success');
    console.log('  - Overall Score:', qaResult.qa_review?.overall_score);
    console.log('  - Recommendation:', qaResult.qa_review?.recommendation);
  } catch (error) {
    console.log('❌ Claude QA Failed:', error.message);
  }
}