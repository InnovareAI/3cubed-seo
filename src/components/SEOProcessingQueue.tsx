import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Clock, CheckCircle, AlertCircle, FileText, Loader2, PlayCircle } from 'lucide-react'

interface Submission {
  id: string
  product_name: string
  ai_processing_status: string
  ai_status: string
  seo_title: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export default function SEOProcessingQueue() {
  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['seo-processing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          product_name,
          ai_processing_status,
          ai_status,
          seo_title,
          meta_title,
          meta_description,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'SEO Generated'
      case 'processing': return 'Generating SEO'
      case 'pending': return 'Queued'
      case 'error': return 'Generation Failed'
      default: return 'Unknown'
    }
  }

  const triggerSEOGeneration = async (submissionId: string) => {
    try {
      const response = await fetch('https://innovareai.app.n8n.cloud/webhook/BNKl1IJoWxTCKUak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submissionId,
          action: 'generate_seo_content'
        })
      })

      if (response.ok) {
        // Update local status optimistically
        await supabase
          .from('submissions')
          .update({ 
            ai_processing_status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', submissionId)
        
        // Refetch data
        refetch()
      }
    } catch (error) {
      console.error('Error triggering SEO generation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No submissions found. Create a new submission to generate SEO content.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {submission.product_name}
              </h4>
              
              {submission.seo_title && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                  {submission.seo_title}
                </p>
              )}
              
              <div className="mt-2 flex items-center gap-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.ai_processing_status || 'pending')}`}>
                  {getStatusIcon(submission.ai_processing_status || 'pending')}
                  {getStatusLabel(submission.ai_processing_status || 'pending')}
                </span>
                <span className="text-xs text-gray-500">
                  Created {format(new Date(submission.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
            
            <div className="ml-4 flex items-center gap-2">
              {submission.ai_processing_status === 'pending' && (
                <button
                  onClick={() => triggerSEOGeneration(submission.id)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500"
                  title="Trigger SEO Generation"
                >
                  <PlayCircle className="w-4 h-4" />
                </button>
              )}
              
              {submission.ai_processing_status === 'completed' && (
                <Link
                  to={`/seo-review/${submission.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View SEO →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
