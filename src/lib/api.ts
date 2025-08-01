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
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }

      const data = await response.json();
      // If we get an empty response, throw error to trigger fallback
      if (!data || (data.error !== undefined)) {
        throw new Error('Empty response from API');
      }
      return data;
    } catch (error) {
      // Let the component handle the fallback to mock data
      throw error;
    }
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
  }
};