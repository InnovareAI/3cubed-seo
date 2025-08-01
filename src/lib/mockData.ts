// Mock data service - no database connection

// Type exports 
export type ContentStatus = 
  | 'draft' 
  | 'pending_seo_review' 
  | 'pending_client_review' 
  | 'pending_mlr_review' 
  | 'requires_revision' 
  | 'approved' 
  | 'published'

export interface ContentPiece {
  id: string
  title: string
  status: ContentStatus
  [key: string]: any
}
export const mockSubmissions: any[] = [
  {
    id: '1',
    product_name: 'Keytruda',
    generic_name: 'pembrolizumab',
    indication: 'Non-Small Cell Lung Cancer',
    therapeutic_area: 'Oncology',
    workflow_stage: 'ai_completed',
    priority_level: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitter_name: 'Dr. Sarah Johnson',
    submitter_email: 'sarah.johnson@pharma.com',
    seo_keywords: ['keytruda', 'pembrolizumab', 'lung cancer treatment'],
    meta_title: 'Keytruda (Pembrolizumab) for NSCLC | Official Information',
    meta_description: 'Learn about Keytruda, a PD-1 inhibitor for first-line treatment of NSCLC.',
    seo_title: 'Keytruda: Revolutionary NSCLC Treatment',
    geo_optimization_score: 88
  },
  {
    id: '2',
    product_name: 'Ozempic',
    generic_name: 'semaglutide',
    indication: 'Type 2 Diabetes',
    therapeutic_area: 'Diabetes',
    workflow_stage: 'seo_review',
    priority_level: 'medium',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    submitter_name: 'Mark Chen',
    submitter_email: 'mark.chen@novonordisk.com',
    seo_keywords: ['ozempic', 'semaglutide', 'diabetes medication'],
    meta_title: 'Ozempic (Semaglutide) for Type 2 Diabetes',
    meta_description: 'Discover how Ozempic helps manage blood sugar in adults with type 2 diabetes.',
    geo_optimization_score: 75
  }
];

export const mockApi = {
  async createSubmission(data: any) {
    const submission = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockSubmissions.push(submission);
    return submission;
  },

  async getSubmissions() {
    return mockSubmissions;
  },

  async getSubmission(id: string) {
    return mockSubmissions.find(s => s.id === id) || null;
  },

  async updateSubmission(id: string, data: any) {
    const index = mockSubmissions.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSubmissions[index] = { ...mockSubmissions[index], ...data };
      return mockSubmissions[index];
    }
    throw new Error('Submission not found');
  }
};

// Mock Supabase client for compatibility
export const supabase = {
  from: (table: string) => ({
    select: () => ({ 
      data: mockSubmissions, 
      error: null,
      eq: () => ({ 
        single: () => ({ data: mockSubmissions[0], error: null }) 
      })
    }),
    insert: (data: any) => ({ 
      data: [mockApi.createSubmission(data)], 
      error: null,
      select: () => ({ data: [data], error: null })
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({ 
        data: mockApi.updateSubmission(value, data), 
        error: null 
      })
    })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  }),
  removeChannel: () => {},
  auth: {
    getUser: () => ({ data: { user: null } })
  },
  rpc: () => ({ data: null, error: null })
};