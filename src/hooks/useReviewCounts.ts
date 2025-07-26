import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface ReviewCounts {
  seoReview: number
  clientReview: number
  mlrReview: number
}

export function useReviewCounts() {
  return useQuery<ReviewCounts>({
    queryKey: ['review-counts'],
    queryFn: async () => {
      try {
        // Fetch SEO Review count
        const { count: seoCount, error: seoError } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_stage', 'seo_review')
        
        if (seoError) {
          console.error('Error fetching SEO review count:', seoError)
        }

        // Fetch Client Review count
        const { count: clientCount, error: clientError } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_stage', 'client_review')
        
        if (clientError) {
          console.error('Error fetching client review count:', clientError)
        }

        // Fetch MLR Review count
        const { count: mlrCount, error: mlrError } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_stage', 'mlr_review')
        
        if (mlrError) {
          console.error('Error fetching MLR review count:', mlrError)
        }

        return {
          seoReview: seoCount || 0,
          clientReview: clientCount || 0,
          mlrReview: mlrCount || 0
        }
      } catch (err) {
        console.error('Error in review counts query:', err)
        return {
          seoReview: 0,
          clientReview: 0,
          mlrReview: 0
        }
      }
    },
    refetchInterval: 30000,
    retry: false
  })
}
