import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/supabase'
import { RefreshCw, MessageSquare, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

export default function RevisionRequests() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['revision-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'Revision_Requested')
        .order('rejected_at', { ascending: false })
      
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
      queryClient.invalidateQueries({ queryKey: ['revision-requests'] })
      setSelectedSubmission(null)
      setRevisionNotes({})
    }
  })

  const handleResubmit = (submission: Submission) => {
    // Determine which stage to return to based on rejection stage
    let newStage = 'SEO_Review'
    let newStatus = 'needs_review'
    
    if (submission.rejection_stage === 'Client_Review') {
      newStage = 'Client_Review'
      newStatus = 'client_review'
    } else if (submission.rejection_stage === 'MLR_Review') {
      newStage = 'MLR_Review'
      newStatus = 'mlr_review'
    }

    updateSubmission.mutate({
      id: submission.id,
      updates: {
        workflow_stage: newStage,
        langchain_status: newStatus,
        rejection_stage: null,
        rejection_reason: null,
        rejected_by: null,
        rejected_at: null,
        updated_at: new Date().toISOString()
      }
    })
  }

  const handleCancel = (id: string) => {
    updateSubmission.mutate({
      id,
      updates: {
        workflow_stage: 'Published',
        langchain_status: 'rejected',
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
        <h3 className="text-lg font-medium text-gray-900">No revision requests</h3>
        <p className="mt-2 text-sm text-gray-500">All submissions are in good standing.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Revision Requests</h2>
          <p className="mt-1 text-sm text-gray-500">
            Submissions requiring revisions before approval
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
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Submitted by {submission.submitter_name} • {format(new Date(submission.created_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-red-600">
                      Rejected by {submission.rejected_by} • {submission.rejected_at && format(new Date(submission.rejected_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Revision Requested
                  </span>
                </div>
              </div>

              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <MessageSquare className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                    <p className="mt-1 text-sm text-red-700">
                      {submission.rejection_reason || 'No specific reason provided'}
                    </p>
                  </div>
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
                    View & Revise
                  </>
                )}
              </button>

              {selectedSubmission === submission.id && (
                <div className="mt-6 space-y-6">
                  {submission.ai_output && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Current Content</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {typeof submission.ai_output === 'string' 
                          ? submission.ai_output 
                          : JSON.stringify(submission.ai_output, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revision Notes
                    </label>
                    <textarea
                      value={revisionNotes[submission.id] || ''}
                      onChange={(e) => setRevisionNotes({ ...revisionNotes, [submission.id]: e.target.value })}
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Add notes about the revisions made..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleCancel(submission.id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Submission
                    </button>
                    <button
                      onClick={() => handleResubmit(submission)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resubmit for Review
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