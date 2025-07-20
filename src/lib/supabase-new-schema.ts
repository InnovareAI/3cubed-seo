// New database schema types for the three-stage workflow
export type ContentStatus = 
  | 'draft' 
  | 'pending_seo_review' 
  | 'pending_client_review' 
  | 'pending_mlr_review' 
  | 'requires_revision' 
  | 'approved' 
  | 'published'

export interface Project {
  id: string
  name: string
  client_name: string
  therapeutic_area: string
  target_audience: string
  status: 'active' | 'completed' | 'on_hold'
  created_at: string
  updated_at: string
}

export interface ContentPiece {
  id: string
  project_id: string
  title: string
  content: {
    seo_analysis: {
      strategy: string
      keywords: string[]
      content_recommendations: string
    }
    compliance_report: {
      status: string
      flags: string[]
      review_notes: string
    }
  }
  target_keyword: string
  status: ContentStatus
  seo_reviewer_id?: string
  client_reviewer_id?: string
  mlr_reviewer_id?: string
  assigned_to: string
  published_url?: string
  created_at: string
  updated_at: string
  // Relations
  project?: Project
  seo_reviewer?: User
  client_reviewer?: User
  mlr_reviewer?: User
  assigned_user?: User
}

export interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'seo_specialist' | 'client' | 'mlr_specialist'
  department?: string
  phone_number?: string
  status: 'active' | 'inactive'
  two_factor_enabled: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Keyword {
  id: string
  project_id: string
  keyword: string
  search_volume: number
  difficulty: number
  notes?: string
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

export interface Revision {
  id: string
  content_piece_id: string
  requested_by: string
  notes: string
  status_at_request: ContentStatus
  created_at: string
  resolved_at?: string
}

export interface VisualAsset {
  id: string
  content_piece_id: string
  placid_template_id?: string
  image_url?: string
  thumbnail_url?: string
  generation_status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  updated_at: string
}
