import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/supabase'
import { CheckCircle, XCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

export default function MLRReview() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['mlr-review-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'MLR_Review')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  const updateSubmission = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlr-review-submissions'] })
      setSelectedSubmission(null)
      setFeedback({})
    }
  })

  const handleApprove = (id: string) => {
    updateSubmission.mutate({
      id,
      updates: {
        langchain_status: 'mlr_approved',
        workflow_stage: 'Published',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
  }

  const handleReject = (id: string) => {
    const feedbackText = feedback[id] || 'Please revise based on MLR feedback'
    updateSubmission.mutate({
      id,
      updates: {
        langchain_status: 'revision_requested',
        workflow_stage: 'Revision_Requested',
        rejection_stage: 'MLR_Review',
        rejection_reason: feedbackText,
        rejected_by: 'MLR Team',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
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
        <h3 className="text-lg font-medium text-gray-900">No submissions pending MLR review</h3>
        <p className="mt-2 text-sm text-gray-500">All submissions have completed MLR review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Medical Legal Review (MLR) Queue</h2>
          <p className="mt-1 text-sm text-gray-500">
            Final compliance review before publication
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
                    {submission.therapeutic_area} • Stage: {submission.stage}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Submitted by {submission.submitter_name} • {format(new Date(submission.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <Shield className="w-3 h-3 mr-1" />
                    MLR Review
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(selectedSubmission === submission.id ? null : submission.id)}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center"
              >
                {selectedSubmission === submission.id ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View Details
                  </>
                )}
              </button>

              {selectedSubmission === submission.id && (
                <div className="mt-6 space-y-6">
                  {submission.ai_output && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Client Approved Content</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {typeof submission.ai_output === 'string' 
                          ? submission.ai_output 
                          : JSON.stringify(submission.ai_output, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MLR Feedback (if rejecting)
                    </label>
                    <textarea
                      value={feedback[submission.id] || ''}
                      onChange={(e) => setFeedback({ ...feedback, [submission.id]: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Provide specific compliance or regulatory feedback..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(submission.id)}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleApprove(submission.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </button>
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