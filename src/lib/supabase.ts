import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Client {
  id: string
  client_number: number
  name: string
  company_domain: string
  contact_name?: string
  contact_email?: string
  status: 'active' | 'paused' | 'inactive'
  portal_access_enabled?: boolean
  portal_password_hash?: string
  portal_last_login?: string
  portal_access_token?: string
  created_at: string
  updated_at: string
}

export interface ClientDomain {
  id: string
  client_id: string
  domain: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface ClientPortalSession {
  id: string
  client_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface Project {
  id: string
  project_number: number
  client_id: string
  name: string
  product_name?: string
  therapeutic_area?: string
  status: 'active' | 'paused' | 'completed'
  start_date?: string
  target_completion?: string
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  submission_number: number
  compliance_id: string
  client_id?: string
  project_id?: string
  product_name: string
  therapeutic_area: string
  stage: string
  langchain_phase: string
  langchain_status: 'needs_processing' | 'processing' | 'needs_review' | 'seo_approved' | 
                   'client_review' | 'client_approved' | 'rejected' | 'revision_requested' | 
                   'mlr_review' | 'mlr_approved' | 'approved' | 'published'
  workflow_stage: 'Form_Submitted' | 'AI_Processing' | 'SEO_Review' | 'Client_Review' | 
                  'Revision_Requested' | 'MLR_Review' | 'Published'
  langchain_retry_count: number
  raw_input_content: string
  ai_output?: any
  review_feedback?: any
  h1_tag?: any
  meta_description?: any
  seo_keywords?: any
  long_tail_keywords?: any
  consumer_questions?: any
  executive_summary?: any
  full_seo_report?: any
  submitter_name: string
  submitter_email: string
  priority_level: 'High' | 'Medium' | 'Low'
  pdf_url?: string
  dashboard_url?: string
  rejection_stage?: string
  rejection_reason?: string
  rejected_by?: string
  rejected_at?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface ProjectOverview {
  client_id: string
  client_number: number
  client_name: string
  client_status: string
  project_id: string
  project_number: number
  project_name: string
  product_name?: string
  therapeutic_area?: string
  total_submissions: number
  pending_ai: number
  pending_seo_review: number
  pending_client_review: number
  pending_mlr_review: number
  pending_revisions: number
  published: number
  last_activity?: string
}

export interface SubmissionSummary {
  id: string
  submission_number: number
  submission_ref: string // e.g., "SUB-01000"
  client_number: number
  client_ref: string // e.g., "CLIENT-001"
  client_name: string
  project_number: number
  project_ref: string // e.g., "PROJ-0001"
  project_name: string
  product_name: string
  therapeutic_area: string
  langchain_status: string
  workflow_stage: string
  priority_level: string
  created_at: string
  updated_at: string
}

// Helper functions for formatting IDs
export function formatClientNumber(num: number): string {
  return `CLIENT-${num.toString().padStart(3, '0')}`
}

export function formatProjectNumber(num: number): string {
  return `PROJ-${num.toString().padStart(4, '0')}`
}

export function formatSubmissionNumber(num: number): string {
  return `SUB-${num.toString().padStart(5, '0')}`
}

// Old interface for backward compatibility
export interface Submission_Old {
  id: string
  compliance_id: string
  unique_id?: string
  email_thread_id?: string
  product_identifier: string
  medical_indication: string
  therapeutic_area: string
  stage_new: string
  target_audience: string
  geography_new?: string[]
  key_differentiators?: string
  competitor_products?: string
  your_name: string
  your_email: string
  approver_seo?: string
  langchain_status: string
  langchain_phase: string
  langchain_retry_count: number
  qa_status?: string
  fda_compliance_status?: string
  ai_output?: any
  raw_input_content: string
  created_at: string
  updated_at: string
}
