// Test Netlify Functions for AI Processing
import fetch from 'node-fetch';

// For local testing, you'll need to deploy to Netlify or run netlify dev
const NETLIFY_FUNCTIONS_URL = 'https://3cubed-seo.netlify.app/.netlify/functions';

async function testNetlifyFunctions() {
  console.log('🚀 Testing Netlify Functions...\n');

  const testSubmission = {
    product_name: 'Keytruda',
    generic_name: 'pembrolizumab',
    medical_indication: 'Non-Small Cell Lung Cancer',
    therapeutic_area: 'Oncology',
    development_stage: 'Market Launch',
    mechanism_of_action: 'PD-1 inhibitor',
    line_of_therapy: 'First-line',
    patient_population: 'Adults with advanced NSCLC',
    geographic_markets: ['USA', 'EU'],
    key_differentiators: ['First PD-1 for first-line NSCLC', 'Superior OS vs chemotherapy'],
    primary_endpoints: 'Overall survival, Progression-free survival',
    key_biomarkers: 'PD-L1 expression ≥50%'
  };

  // 1. Test FDA Query Function
  console.log('1. Testing FDA Query Function...');
  try {
    const fdaResponse = await fetch(`${NETLIFY_FUNCTIONS_URL}/fda-query-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: testSubmission.product_name,
        genericName: testSubmission.generic_name,
        indication: testSubmission.medical_indication,
        useEnhanced: true,
        developmentStage: testSubmission.development_stage,
        lineOfTherapy: testSubmission.line_of_therapy,
        patientPopulation: testSubmission.patient_population,
        geographicMarkets: testSubmission.geographic_markets,
        keyBiomarkers: testSubmission.key_biomarkers
      })
    });

    if (fdaResponse.ok) {
      const fdaData = await fdaResponse.json();
      console.log('✅ FDA Query successful');
      console.log('- Clinical trials found:', fdaData.data?.clinicalTrials?.length || 0);
      console.log('- Development stage:', fdaData.summary?.developmentStage);
      console.log('- Geographic reach:', fdaData.summary?.geographicReach?.join(', '));
      console.log('- SEO recommendations:', fdaData.seoRecommendations?.keywords?.length || 0, 'keywords');
      
      // 2. Test Perplexity Generation
      console.log('\n2. Testing Perplexity GEO-Optimized Generation...');
      const perplexityResponse = await fetch(`${NETLIFY_FUNCTIONS_URL}/perplexity-generate-geo-optimized`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission: testSubmission,
          fdaData: fdaData
        })
      });

      if (perplexityResponse.ok) {
        const perplexityData = await perplexityResponse.json();
        console.log('✅ Perplexity generation successful');
        console.log('- SEO Title:', perplexityData.content?.seo_title ? '✅' : '❌');
        console.log('- H1 Options:', perplexityData.content?.geo_optimized_h1_options ? '✅' : '❌');
        console.log('- Consumer Questions:', perplexityData.content?.ai_friendly_content_blocks?.faq_section?.length || 0);
        console.log('- Long-tail Keywords:', perplexityData.content?.long_tail_keywords?.question_based?.length || 0);
        console.log('- AI Readiness Score:', perplexityData.ai_readiness_score || 'N/A');
        
        // 3. Test Claude QA Review
        console.log('\n3. Testing Claude QA Review...');
        const claudeResponse = await fetch(`${NETLIFY_FUNCTIONS_URL}/claude-qa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: perplexityData.content,
            submission: testSubmission,
            fdaData: fdaData.data
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          console.log('✅ Claude QA review successful');
          console.log('- QA Passed:', claudeData.passed ? '✅' : '❌');
          console.log('- Compliance Score:', claudeData.qa_review?.compliance_score || 'N/A');
          console.log('- Medical Accuracy:', claudeData.qa_review?.medical_accuracy || 'N/A');
          console.log('- SEO Effectiveness:', claudeData.qa_review?.seo_effectiveness || 'N/A');
          console.log('- Needs Revision:', claudeData.needs_revision ? '⚠️ Yes' : '✅ No');
        } else {
          const error = await claudeResponse.json();
          console.error('❌ Claude QA failed:', error.message || 'Unknown error');
          console.log('Check if CLAUDE_API_KEY is set in Netlify environment variables');
        }
      } else {
        const error = await perplexityResponse.json();
        console.error('❌ Perplexity generation failed:', error.message || 'Unknown error');
        console.log('Check if PERPLEXITY_API_KEY is set in Netlify environment variables');
      }
    } else {
      const error = await fdaResponse.json();
      console.error('❌ FDA query failed:', error.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Function test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Functions are deployed to Netlify');
    console.log('2. Environment variables are set in Netlify dashboard:');
    console.log('   - PERPLEXITY_API_KEY');
    console.log('   - CLAUDE_API_KEY');
    console.log('   - RAILWAY_API_URL (if needed)');
  }

  console.log('\n✅ Netlify Functions test complete!');
}

// Run the test
testNetlifyFunctions().catch(console.error);