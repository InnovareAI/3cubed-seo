import React, { useEffect, useState } from 'react'
import { supabase, Submission } from '../lib/supabase'
import { AlertTriangle, RotateCcw, FileText, Clock, Send } from 'lucide-react'

export default function RevisionRequests() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRevisions()
  }, [])

  const fetchRevisions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .or('langchain_status.eq.rejected,langchain_status.eq.revision_requested')
        .order('rejected_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error('Error fetching revisions:', err)
      setError('Failed to load revision requests')
    } finally {
      setLoading(false)
    }
  }

  const handleReprocess = async (submission: Submission) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          langchain_status: 'needs_processing',
          workflow_stage: 'AI_Processing',
          rejection_stage: null,
          rejection_reason: null,
          rejected_by: null,
          rejected_at: null,
          langchain_retry_count: submission.langchain_retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id)

      if (error) throw error
      
      // Remove from list
      setSubmissions(submissions.filter(s => s.id !== submission.id))
      alert('Submission sent for AI reprocessing!')
    } catch (err) {
      console.error('Error reprocessing submission:', err)
      alert('Failed to reprocess submission')
    }
  }

  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case 'SEO_Review': return 'bg-blue-100 text-blue-700'
      case 'Client_Review': return 'bg-purple-100 text-purple-700'
      case 'MLR_Review': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Revision Requests</h1>
        <p className="text-gray-600">Content that needs revision based on feedback</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-lg font-medium">Pending Revisions</span>
            </div>
            <span className="text-sm text-gray-500">{submissions.length} items</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {submission.product_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {submission.therapeutic_area} | Stage: {submission.stage}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Original submitter: {submission.submitter_name} ({submission.submitter_email})
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    submission.priority_level === 'High' ? 'bg-red-100 text-red-700' :
                    submission.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {submission.priority_level} Priority
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Retry #{submission.langchain_retry_count}
                  </p>
                </div>
              </div>

              {/* Rejection Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-red-900">Rejected at:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(submission.rejection_stage)}`}>
                        {submission.rejection_stage?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-red-800 mb-2">
                      <strong>Reason:</strong> {submission.rejection_reason || 'No reason provided'}
                    </p>
                    <p className="text-xs text-red-600">
                      Rejected by: {submission.rejected_by || 'Unknown'} on{' '}
                      {submission.rejected_at ? new Date(submission.rejected_at).toLocaleString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Original Input */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Original Request</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {submission.raw_input_content?.substring(0, 200)}...
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReprocess(submission)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reprocess with AI
                </button>
                <button
                  onClick={() => window.open(submission.dashboard_url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <FileText className="h-4 w-4" />
                  View Original Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="p-12 text-center">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No revision requests pending</p>
          </div>
        )}
      </div>
    </div>
  )
}
