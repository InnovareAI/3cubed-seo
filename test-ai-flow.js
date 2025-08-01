// Test AI Processing Flow
import fetch from 'node-fetch';

async function testAIFlow() {
  console.log('🧪 Testing Complete AI Processing Flow\n');
  
  // Test submission data
  const testSubmission = {
    product_name: 'Keytruda',
    generic_name: 'pembrolizumab',
    medical_indication: 'Non-Small Cell Lung Cancer',
    therapeutic_area: 'Oncology',
    submitter_name: 'Test User',
    submitter_email: 'test@example.com'
  };

  try {
    // Step 1: Test FDA Query
    console.log('🏛️  STEP 1: Testing FDA Database Query');
    console.log('Sending to FDA APIs:', {
      productName: testSubmission.product_name,
      genericName: testSubmission.generic_name,
      indication: testSubmission.medical_indication
    });
    
    const fdaResponse = await fetch('https://3cubedai-seo.netlify.app/.netlify/functions/fda-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: testSubmission.product_name,
        genericName: testSubmission.generic_name,
        indication: testSubmission.medical_indication
      })
    });
    
    const fdaData = await fdaResponse.json();
    console.log('✅ FDA Query Result:', {
      success: fdaData.success,
      summary: fdaData.summary,
      dataKeys: Object.keys(fdaData.data || {})
    });
    console.log('\n');

    // Step 2: Test Perplexity Content Generation
    console.log('🤖 STEP 2: Testing Perplexity Content Generation');
    console.log('PERPLEXITY PROMPT STRUCTURE:');
    console.log(`
You are an expert pharmaceutical SEO strategist. Generate comprehensive SEO content for:

PRODUCT: ${testSubmission.product_name} (${testSubmission.generic_name})
INDICATION: ${testSubmission.medical_indication}
THERAPEUTIC AREA: ${testSubmission.therapeutic_area}

FDA REGULATORY STATUS:
- FDA Approved: ${fdaData.summary?.hasApprovedNDA ? 'Yes' : 'Pending'}
- Approval Date: ${fdaData.summary?.approvalDate || 'N/A'}
- Application Number: ${fdaData.summary?.applicationNumber || 'N/A'}
- Active Clinical Trials: ${fdaData.summary?.activeTrials || 0}
- Total Clinical Trials: ${fdaData.summary?.totalTrials || 0}
- Adverse Events Reported: ${fdaData.summary?.adverseEventCount || 0}

Generate JSON with: seo_title, meta_description, primary_keywords, long_tail_keywords, h1_tags, h2_tags, consumer_questions, competitive_advantages, content_strategy, geo_strategy
    `);
    
    const perplexityResponse = await fetch('https://3cubedai-seo.netlify.app/.netlify/functions/perplexity-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission: testSubmission,
        fdaData: fdaData
      })
    });
    
    const perplexityData = await perplexityResponse.json();
    console.log('✅ Perplexity Generation Result:', {
      success: perplexityData.success,
      contentKeys: Object.keys(perplexityData.content || {})
    });
    console.log('\n');

    // Step 3: Test Claude QA Review
    console.log('🔍 STEP 3: Testing Claude QA Review');
    console.log('CLAUDE QA PROMPT STRUCTURE:');
    console.log(`
Review this pharmaceutical SEO content for regulatory compliance and accuracy.

PRODUCT INFORMATION:
- Product: ${testSubmission.product_name} (${testSubmission.generic_name})
- Indication: ${testSubmission.medical_indication}
- Therapeutic Area: ${testSubmission.therapeutic_area}
- FDA Status: ${fdaData?.summary?.hasApprovedNDA ? 'FDA Approved' : 'Not FDA Approved'}

CONTENT TO REVIEW:
${JSON.stringify(perplexityData.content, null, 2)}

Score (0-100) for: medical_accuracy, fda_compliance, seo_effectiveness, content_quality, risk_assessment
Provide: overall_score, recommendation (Approve/Revise/Reject), issues, required_changes, strengths, compliance_notes
    `);
    
    const claudeResponse = await fetch('https://3cubedai-seo.netlify.app/.netlify/functions/claude-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: perplexityData.content,
        submission: testSubmission,
        fdaData: fdaData
      })
    });
    
    const claudeData = await claudeResponse.json();
    console.log('✅ Claude QA Result:', {
      success: claudeData.success,
      passed: claudeData.passed,
      overallScore: claudeData.qa_review?.overall_score,
      recommendation: claudeData.qa_review?.recommendation
    });
    console.log('\n');

    // Summary
    console.log('📊 COMPLETE AI FLOW SUMMARY:');
    console.log('================================');
    console.log(`FDA Data Retrieved: ${fdaData.success ? 'YES' : 'NO'}`);
    console.log(`Content Generated: ${perplexityData.success ? 'YES' : 'NO'}`);
    console.log(`QA Review Complete: ${claudeData.success ? 'YES' : 'NO'}`);
    console.log(`Final Recommendation: ${claudeData.qa_review?.recommendation || 'Unknown'}`);
    console.log(`Overall Quality Score: ${claudeData.qa_review?.overall_score || 'N/A'}/100`);
    
    return {
      fdaData,
      perplexityData,
      claudeData,
      flowComplete: fdaData.success && perplexityData.success && claudeData.success
    };

  } catch (error) {
    console.error('❌ AI Flow Test Error:', error.message);
    return { error: error.message };
  }
}

// Run the test
testAIFlow().then(result => {
  console.log('\n🎯 Test Complete');
  if (result.flowComplete) {
    console.log('✅ All AI processing steps successful');
  } else {
    console.log('❌ Some steps failed - check logs above');
  }
}).catch(console.error);