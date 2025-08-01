import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/database-types'
import { ContentStatus, ContentPiece } from '../lib/database-types'

export function useContentPieces(status?: ContentStatus) {
  return useQuery({
    queryKey: ['content-pieces', status],
    queryFn: async () => {
      let query = supabase
        .from('content_pieces')
        .select(`
          *,
          project:projects(name, client_name, therapeutic_area),
          seo_reviewer:users!seo_reviewer_id(email, role),
          client_reviewer:users!client_reviewer_id(email, role),
          mlr_reviewer:users!mlr_reviewer_id(email, role),
          assigned_user:users!assigned_to(email, role)
        `)
        .order('updated_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching content pieces:', error)
        throw error
      }
      
      return data as ContentPiece[]
    }
  })
}

export function useUpdateContentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      contentId, 
      newStatus, 
      reviewerId 
    }: { 
      contentId: string
      newStatus: ContentStatus
      reviewerId?: string 
    }) => {
      // Determine which reviewer field to update based on the new status
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      
      if (newStatus === 'pending_client_review') {
        updates.seo_reviewer_id = reviewerId
      } else if (newStatus === 'pending_mlr_review') {
        updates.client_reviewer_id = reviewerId
      } else if (newStatus === 'approved') {
        updates.mlr_reviewer_id = reviewerId
      }

      const { data, error } = await supabase
        .from('content_pieces')
        .update(updates)
        .eq('id', contentId)
        .select()
        .single()

      if (error) throw error

      // Log to audit trail
      if (reviewerId) {
        await mockApi.from('audit_logs').insert({
          user_id: reviewerId,
          action: 'status_change',
          entity_type: 'content_piece',
          entity_id: contentId,
          changes: { 
            old_status: data.status, 
            new_status: newStatus 
          }
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pieces'] })
    }
  })
}
