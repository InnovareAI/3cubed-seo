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
  therapeutic_area?: string | any
  stage: string
  priority_level: string
  raw_input_content: string
  ai_output?: any
  ai_status?: string
  ai_processing_status?: string
  workflow_stage: string
  ai_phase?: string
  ai_retry_count?: number
  ai_last_retry?: string
  error_message?: string | any
  review_notes?: string | any
  rejection_stage?: string | any
  rejection_reason?: string | any
  rejected_by?: string | any
  rejected_at?: string | any
  completed_at?: string | any
  created_at: string
  updated_at: string
  last_updated?: string
  // SEO fields
  seo_keywords?: string[] | any
  long_tail_keywords?: string[] | any
  consumer_questions?: string[] | any
  h1_tag?: string | any
  meta_title?: string | any
  meta_description?: string | any
  // Additional fields for client review
  target_audience?: string[] | any
  medical_indication?: string | any
  indication?: string | any
  dosage_form?: string | any
  competitors?: string[] | any
  positioning?: string | any
  key_differentiators?: string[] | any
  mechanism_of_action?: string | any
  geography?: string[] | any
  client_name?: string | any
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
  // AI-generated SEO fields
  seo_title?: string | any
  geo_event_tags?: string[] | any
  geo_optimization?: GeoOptimization | any
  seo_strategy_outline?: string | any
  h2_tags?: string[] | any
  // Review tracking fields
  reviewer_emails?: any
  competitive_analysis?: any
  seo_enhancements?: any
  // GEO optimization fields
  geo_optimization_score?: number | any
  geo_readability_score?: number | any
  geo_featured_snippet_potential?: boolean
  sponsor_name?: string
  // Legacy fields (for backward compatibility)
  langchain_status?: string
  langchain_phase?: string
  langchain_error?: string
  langchain_retry_count?: number
  langchain_last_retry?: string
}

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  changes: any
  performed_by: string
  performed_at: string
}

export interface ContentPiece {
  id: string
  submission_id: string
  content_type: string
  title: string
  body_content: string
  seo_content?: string
  status: ContentStatus
  version_number: number
  created_at: string
  updated_at: string
  // SEO fields
  seo_title?: string
  geo_event_tags?: string[]
  geo_optimization?: GeoOptimization
  seo_strategy_outline?: string
  h2_tags?: string[]
  // Additional fields
  project?: {
    name: string
    client_name?: string
    therapeutic_area?: string
  }
  target_keyword?: string
  assigned_to?: string
}

export type ContentStatus = 'draft' | 'pending_seo_review' | 'pending_client_review' | 'pending_mlr_review' | 'requires_revision' | 'approved' | 'published'

export interface GeoOptimization {
  ai_friendly_summary?: string
  structured_data?: Record<string, any>
  key_facts?: string[]
  featured_snippet_potential?: boolean
  readability_score?: number
}

export interface SEOReview {
  id: string
  submission_id: string
  reviewer_name: string
  reviewer_email: string
  review_date: string
  status: 'approved' | 'revision_requested' | 'rejected'
  keyword_approvals?: Record<string, boolean>
  internal_notes?: string
  client_feedback?: string
  seo_title_approved?: boolean
  meta_description_approved?: boolean
  content_approved?: boolean
  created_at: string
}