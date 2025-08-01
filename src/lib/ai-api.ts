// AI Processing API client for Netlify Functions

export const aiApi = {
  // Query FDA databases with enhanced pre-trial data
  async queryFDA(productName: string, genericName: string, indication: string, additionalData?: any) {
    const endpoint = additionalData?.useEnhanced 
      ? '/.netlify/functions/fda-query-enhanced'
      : '/.netlify/functions/fda-query';
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName,
        genericName,
        indication,
        ...additionalData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'FDA query failed');
    }

    return response.json();
  },

  // Generate SEO content with Perplexity (GEO-optimized)
  async generateContent(submission: any, fdaData: any, options?: { geoOptimized?: boolean }) {
    const endpoint = options?.geoOptimized
      ? '/.netlify/functions/perplexity-generate-geo-optimized'
      : '/.netlify/functions/perplexity-generate';
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission,
        fdaData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Content generation failed');
    }

    return response.json();
  },

  // Perform QA review with Claude
  async performQAReview(content: any, submission: any, fdaData: any) {
    const response = await fetch('/.netlify/functions/claude-qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        submission,
        fdaData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'QA review failed');
    }

    return response.json();
  },

  // Process complete submission through AI pipeline
  async processSubmission(submission: any, options?: { useGEO?: boolean, enhancedFDA?: boolean }) {
    try {
      // Step 1: Query FDA databases (enhanced if specified)
      console.log('Querying FDA databases...');
      const fdaData = await this.queryFDA(
        submission.product_name,
        submission.generic_name,
        submission.medical_indication,
        {
          useEnhanced: options?.enhancedFDA ?? true,
          nctNumber: submission.nct_number,
          sponsor: submission.sponsor,
          developmentStage: submission.development_stage,
          lineOfTherapy: submission.line_of_therapy,
          patientPopulation: submission.patient_population,
          geographicMarkets: submission.geographic_markets,
          primaryEndpoints: submission.primary_endpoints,
          keyBiomarkers: submission.key_biomarkers
        }
      );

      // Step 2: Generate content with Perplexity (GEO-optimized if specified)
      console.log('Generating SEO content...');
      const contentResult = await this.generateContent(
        submission, 
        fdaData,
        { geoOptimized: options?.useGEO ?? true }
      );

      // Step 3: Perform QA review with Claude
      console.log('Performing QA review...');
      const qaResult = await this.performQAReview(
        contentResult.content,
        submission,
        fdaData
      );

      return {
        success: true,
        fdaData: fdaData.data,
        fdaSummary: fdaData.summary,
        seoContent: contentResult.content,
        seoRecommendations: fdaData.seoRecommendations,
        geoOptimized: options?.useGEO ?? true,
        aiReadinessScore: contentResult.ai_readiness_score,
        qaReview: qaResult.qa_review,
        passed: qaResult.passed,
        needsRevision: qaResult.needs_revision
      };
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  }
};