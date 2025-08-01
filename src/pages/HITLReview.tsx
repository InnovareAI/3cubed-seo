import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '../lib/database-types'

interface Submission {
  id: string
  [key: string]: any
}
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { format } from 'date-fns'

export default function HITLReview() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['hitl-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('langchain_status', 'needs_review')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          langchain_status: status,
          workflow_stage: status === 'seo_approved' ? 'Client_Review' : 'Revision_Requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hitl-submissions'] })
      setSelectedSubmission(null)
    }
  })

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: 'seo_approved' })
  }

  const handleReject = (id: string) => {
    updateStatus.mutate({ id, status: 'rejected' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No submissions pending review</h3>
        <p className="mt-2 text-sm text-gray-500">All submissions have been reviewed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">SEO Review Queue</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve AI-generated SEO content
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {submission.product_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {submission.therapeutic_area} • {submission.stage}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Submitted by {submission.submitter_name} • {format(new Date(submission.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleReject(submission.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(submission.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(selectedSubmission === submission.id ? null : submission.id)}
                className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                {selectedSubmission === submission.id ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show Details
                  </>
                )}
              </button>

              {selectedSubmission === submission.id && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="space-y-6">
                    {submission.ai_output && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">AI Generated Content</h4>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(submission.ai_output, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Indication</h4>
                        <p className="mt-1 text-sm text-gray-600">{submission.raw_input_content}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Priority</h4>
                        <p className="mt-1 text-sm text-gray-600">{submission.priority_level}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Compliance ID</h4>
                        <p className="mt-1 text-sm text-gray-600">{submission.compliance_id}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Workflow Stage</h4>
                        <p className="mt-1 text-sm text-gray-600">{submission.workflow_stage}</p>
                      </div>
                    </div>

                    {submission.langchain_error && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-900">Processing Error</h4>
                        <p className="mt-1 text-sm text-red-700">{submission.langchain_error}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}