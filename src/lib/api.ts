// Railway API client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://3cubed-seo-production.up.railway.app';

export const api = {
  // Submit new pharmaceutical
  async createSubmission(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create submission');
    }

    return response.json();
  },

  // Get all submissions
  async getSubmissions() {
    const response = await fetch(`${API_BASE_URL}/api/submissions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    return response.json();
  },

  // Get single submission
  async getSubmission(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/submissions/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch submission');
    }

    return response.json();
  },

  // Update submission
  async updateSubmission(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/submissions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update submission');
    }

    return response.json();
  },

  // Get FDA data
  async getFDAData(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/submissions/${id}/fda`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch FDA data');
    }

    return response.json();
  },

  // Get QA assessment
  async getQAAssessment(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/submissions/${id}/qa`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch QA assessment');
    }

    return response.json();
  },

  // Ask AI
  async askAI(question: string, context: string, submissionId?: string, fieldName?: string) {
    const response = await fetch(`${API_BASE_URL}/api/ask-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context, submissionId, fieldName }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    return response.json();
  }
};