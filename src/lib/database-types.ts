// Database type definitions
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

// Temporary compatibility layer for files still using old imports
export const supabase = {
  from: () => ({ 
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ eq: () => ({ data: null, error: null }) })
  }),
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  removeChannel: () => {},
  auth: { getUser: () => ({ data: { user: null } }) },
  rpc: () => ({ data: null, error: null })
};

export const mockApi = {
  from: () => supabase.from(),
  auth: supabase.auth
};