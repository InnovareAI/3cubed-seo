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

// Workflow stages for Railway database
export type WorkflowStage = 
  | 'pending'
  | 'ai_processing'
  | 'ai_complete'
  | 'seo_review'
  | 'client_review'
  | 'mlr_review'
  | 'revision_requested'
  | 'approved'
  | 'published'

// Submission interface matching Railway database schema
export interface Submission {
  id: string
  // Core fields
  product_name: string
  generic_name?: string
  medical_indication?: string
  indication?: string  // Legacy field
  therapeutic_area: string
  development_stage?: string
  stage?: string  // Legacy field
  workflow_stage: WorkflowStage
  
  // Submitter info
  submitter_name: string
  submitter_email: string
  submitter_company?: string
  
  // Strategy fields
  target_audience?: string[]
  geographic_markets?: string[]
  geography?: string[]  // Legacy field
  priority_level?: string
  mechanism_of_action?: string
  line_of_therapy?: string
  key_differentiators?: string[]
  patient_population?: string
  primary_endpoints?: string
  key_biomarkers?: string
  
  // AI-generated SEO fields
  seo_title?: string
  meta_description?: string
  h1_tag?: string
  h2_tags?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: any[]
  seo_strategy_outline?: string
  content_strategy?: string
  competitive_advantages?: string[]
  
  // GEO optimization fields
  geo_event_tags?: string[]
  geo_optimization?: {
    ai_friendly_summary?: string
    voice_search_answers?: any
    medical_facts?: any
    evidence_statistics?: string[]
    citations?: any
    key_facts?: string[]
    event_tags?: {
      perplexity?: string[]
      claude?: string[]
      chatgpt?: string[]
      gemini?: string[]
    }
  }
  geo_optimization_score?: number
  
  // AI processing metadata
  fda_data?: any
  qa_scores?: any
  ai_output?: any
  ai_processing_status?: string
  error_message?: string
  
  // Timestamps
  created_at: string
  updated_at?: string
  
  // Additional fields
  client_name?: string
  sponsor?: string
  nct_number?: string
  langchain_status?: string
  ai_generated_content?: {
    body_preview?: string
    schema_markup?: string
  }
}

// DEPRECATED: Remove these imports from components
export const supabase = undefined as any;
export const mockApi = undefined as any;