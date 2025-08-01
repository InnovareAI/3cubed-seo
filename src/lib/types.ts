// Type definitions
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