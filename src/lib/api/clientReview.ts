import { supabase } from '@/lib/supabase'

export interface ClientReviewSubmission {
  id: string
  product_name: string
  indication: string
  therapeutic_area: string
  development_stage: string
  target_audience: string
  sponsor_name: string
  workflow_stage: string
  langchain_status: string
  ai_generated_content: any
  seo_keywords: any
  qa_score: number
  created_at: string
  last_updated: string
  // Client review specific fields
  client_review_status?: 'pending' | 'approved' | 'revision_requested'
  client_feedback?: string
  client_approval_date?: string
  priority_level?: 'high' | 'medium' | 'low'
}

export async function fetchClientReviewSubmissions(filters?: {
  searchQuery?: string
  priority?: string
  status?: string
  client?: string
}) {
  let query = supabase
    .from('pharma_seo_submissions')
    .select('*')
    .eq('workflow_stage', 'seo_review')
    .eq('langchain_status', 'completed')
    .not('ai_generated_content', 'is', null)

  if (filters?.searchQuery) {
    query = query.or(`product_name.ilike.%${filters.searchQuery}%,indication.ilike.%${filters.searchQuery}%`)
  }

  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority_level', filters.priority.toLowerCase())
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('client_review_status', filters.status)
  }

  if (filters?.client && filters.client !== 'all') {
    query = query.eq('sponsor_name', filters.client)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client review submissions:', error)
    throw error
  }

  // Transform data to match expected format
  return data?.map(item => ({
    ...item,
    client_name: item.sponsor_name,
    target_audience: item.target_audience ? [item.target_audience] : ['Healthcare Professionals'],
    client_review_status: item.client_review_status || 'pending',
    priority_level: item.priority_level || 'medium',
    // Extract content from ai_generated_content
    seo_content: item.ai_generated_content
  })) || []
}

export async function updateClientReviewStatus(
  id: string, 
  status: 'pending' | 'approved' | 'revision_requested',
  feedback?: string
) {
  const { data, error } = await supabase
    .from('pharma_seo_submissions')
    .update({
      client_review_status: status,
      client_feedback: feedback,
      client_approval_date: status === 'approved' ? new Date().toISOString() : null,
      workflow_stage: status === 'approved' ? 'mlr_review' : 'seo_review',
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating client review status:', error)
    throw error
  }

  return data
}
