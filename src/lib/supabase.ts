import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('Checking Supabase environment variables...')
console.log('VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('All env vars:', Object.keys(import.meta.env))

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database tables
export interface Client {
  id: string
  client_number: string
  name: string
  company_domain: string
  contact_name?: string
  contact_email?: string
  status: 'active' | 'paused' | 'churned'
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  product_name: string
  therapeutic_area: string
  status: 'active' | 'completed' | 'on_hold'
  start_date?: string
  target_completion?: string
  created_at: string
  updated_at: string
  // Relations
  client?: Client
}

export interface Submission {
  id: string
  compliance_id: string
  client_id?: string
  project_id?: string
  submitter_name: string
  submitter_email: string
  submitter_company?: string
  product_name: string
  therapeutic_area: string
  stage: string
  priority_level: 'High' | 'Medium' | 'Low'
  raw_input_content: string
  ai_output?: any
  langchain_status: string
  workflow_stage: string
  langchain_phase?: string
  langchain_error?: string
  langchain_retry_count: number
  langchain_last_retry?: string
  review_notes?: string
  rejection_stage?: string
  rejection_reason?: string
  rejected_by?: string
  rejected_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // SEO fields
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  meta_title?: string
  meta_description?: string
  // Additional fields for client review
  target_audience?: string[]
  medical_indication?: string
  dosage_form?: string
  competitors?: string[]
  positioning?: string
  key_differentiators?: string[]
  mechanism_of_action?: string
  geography?: string[]
  client_name?: string
  client_review_responses?: any
  client_review_comments?: any
  client_reviewed_at?: string
  client_reviewed_by?: string
  ready_for_mlr?: boolean
  // SEO review fields
  seo_reviewed_at?: string
  seo_reviewed_by?: string
  seo_keyword_approvals?: Record<string, boolean>
  seo_internal_notes?: string
  seo_client_feedback?: string
}

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  changes: any
  user_id?: string
  user_email?: string
  created_at: string
}

// New database schema types for the three-stage workflow
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
