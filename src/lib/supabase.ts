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
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  compliance_id: string
  client_id?: string
  project_id?: string
  submitter_name: string
  submitter_email: string
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