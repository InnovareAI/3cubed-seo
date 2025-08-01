// AI Processing API client for Netlify Functions

export const aiApi = {
  // Query FDA databases
  async queryFDA(productName: string, genericName: string, indication: string) {
    const response = await fetch('/.netlify/functions/fda-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName,
        genericName,
        indication
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'FDA query failed');
    }

    return response.json();
  },

  // Generate SEO content with Perplexity
  async generateContent(submission: any, fdaData: any) {
    const response = await fetch('/.netlify/functions/perplexity-generate', {
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
  async processSubmission(submission: any) {
    try {
      // Step 1: Query FDA databases
      console.log('Querying FDA databases...');
      const fdaData = await this.queryFDA(
        submission.product_name,
        submission.generic_name,
        submission.medical_indication
      );

      // Step 2: Generate content with Perplexity
      console.log('Generating SEO content...');
      const contentResult = await this.generateContent(submission, fdaData);

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