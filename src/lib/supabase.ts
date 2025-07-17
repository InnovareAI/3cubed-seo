import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY3NzM2NzQsImV4cCI6MjAxMjM0OTY3NH0.placeholder' // Placeholder key

if (!supabaseUrl) {
  console.error('Missing Supabase URL!')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
  console.warn('Using placeholder Supabase key - database features may not work properly')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types for your submissions table
export interface Submission {
  id: string
  compliance_id: string
  unique_id: string
  email_thread_id: string
  
  // Core fields
  product_identifier: string
  medical_indication: string
  therapeutic_area: string
  stage_new: string
  target_audience: string
  geography_new: string[]
  key_differentiators: string
  competitor_products: string
  
  // User info
  your_name: string
  your_email: string
  approver_seo: string
  
  // Status fields
  langchain_status: 'needs_processing' | 'processing' | 'needs_review' | 'approved' | 'rejected' | 'complete'
  langchain_phase: string
  langchain_retry_count: number
  qa_status: string
  fda_compliance_status: string
  
  // Review fields
  reviewer_notes?: string
  reviewed_at?: string
  reviewer_email?: string
  
  // AI output
  ai_output: any
  raw_input_content: string
  
  // Timestamps
  created_at: string
  updated_at: string
  completed_at?: string
  
  // Additional fields
  processing_time_seconds?: number
  current_version?: number
}

// SEO Content with dual approval
export interface SEOContent {
  id: string
  submission_id: string
  client_name: string
  product_name: string
  
  // SEO Keywords (10 primary)
  seo_keywords: SEOKeyword[]
  
  // Long-tail Keywords (10)
  longtail_keywords: LongtailKeyword[]
  
  // Consumer Questions
  consumer_questions: ConsumerQuestion[]
  
  // Meta content
  h1_tags: string[]
  h2_tags: string[]
  meta_descriptions: MetaDescription[]
  
  // AI Summary
  ai_summary: string
  
  // Dual approval system
  internal_approval_status: 'pending' | 'approved' | 'rejected'
  internal_approver: string
  internal_approved_at?: string
  internal_comments: string
  
  client_approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  client_approver?: string
  client_approved_at?: string
  client_comments?: string
  
  // Selected keywords for content generation
  selected_keywords: string[]
  
  created_at: string
  updated_at: string
}

export interface SEOKeyword {
  id: string
  keyword: string
  search_volume: number
  difficulty: number
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  internal_approved: boolean
  client_approved: boolean
  comments: string
  selected_for_content: boolean
}

export interface LongtailKeyword {
  id: string
  keyword: string
  parent_keyword: string
  search_volume: number
  internal_approved: boolean
  client_approved: boolean
  comments: string
  selected_for_content: boolean
}

export interface ConsumerQuestion {
  id: string
  question: string
  answer: string
  priority: 'high' | 'medium' | 'low'
  internal_approved: boolean
  client_approved: boolean
  comments: string
}

export interface MetaDescription {
  id: string
  page_type: string
  description: string
  character_count: number
  internal_approved: boolean
  client_approved: boolean
  comments: string
}

// Content types that can be generated
export interface ContentPiece {
  id: string
  seo_content_id: string
  client_name: string
  product_name: string
  
  content_type: ContentType
  title: string
  content: string
  keywords_used: string[]
  
  // Status
  generation_status: 'pending' | 'generating' | 'complete' | 'failed'
  review_status: 'pending' | 'approved' | 'rejected'
  
  // Metadata
  word_count: number
  character_count: number
  reading_time: number
  
  // Compliance
  compliance_checked: boolean
  compliance_issues: string[]
  
  created_at: string
  updated_at: string
  published_at?: string
}

export type ContentType = 
  | 'landing_page'
  | 'email_campaign'
  | 'social_media_post'
  | 'paid_ad_copy'
  | 'newsletter_article'
  | 'blog_post'
  | 'press_release'
  | 'product_description'
  | 'faq_section'
  | 'video_script'

// Content template types
export interface ContentTemplate {
  id: string
  content_type: ContentType
  name: string
  description: string
  structure: {
    sections: Array<{
      name: string
      required: boolean
      maxLength?: number
      guidelines: string
    }>
  }
  compliance_requirements: string[]
}

// Client/Project type
export interface Client {
  id: string
  name: string
  company: string
  products: string[]
  active_campaigns: number
  total_submissions: number
  approval_rate: number
  last_activity: string
  status: 'active' | 'paused' | 'completed'
}
