import React, { useEffect, useState } from 'react'
import { supabase, Submission, Client, Project } from '../lib/supabase'
import { Users, CheckCircle, XCircle, FileText, MessageSquare, Clock, Building2 } from 'lucide-react'

interface SubmissionWithDetails extends Submission {
  client?: Client
  project?: Project
}

export default function ClientReview() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          client:clients(id, name, contact_email),
          project:projects(id, name, product_name)
        `)
        .or('langchain_status.eq.client_review,langchain_status.eq.seo_approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error('Error fetching client review submissions:', err)
      setError('Failed to load client review items')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submission: SubmissionWithDetails) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          langchain_status: 'mlr_review',
          workflow_stage: 'MLR_Review',
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id)

      if (error) throw error
      
      // Remove from list
      setSubmissions(submissions.filter(s => s.id !== submission.id))
      alert('Submission approved and sent to MLR review!')
    } catch (err) {
      console.error('Error approving submission:', err)
      alert('Failed to approve submission')
    }
  }

  const handleReject = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission)
    setShowRejectionModal(true)
  }

  const confirmRejection = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      alert('Please provide client feedback')
      return
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          langchain_status: 'rejected',
          workflow_stage: 'Revision_Requested',
          rejection_stage: 'Client_Review',
          rejection_reason: rejectionReason,
          rejected_by: selectedSubmission.client?.name || 'Client',
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id)

      if (error) throw error
      
      // Remove from list
      setSubmissions(submissions.filter(s => s.id !== selectedSubmission.id))
      setShowRejectionModal(false)
      setRejectionReason('')
      setSelectedSubmission(null)
      alert('Client feedback sent for revision')
    } catch (err) {
      console.error('Error rejecting submission:', err)
      alert('Failed to send client feedback')
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
          <MessageSquare className="h-5 w-5" />
          {error}
        </div>
      </div>
    )
  }

  // Group submissions by client
  const submissionsByClient = submissions.reduce((acc, submission) => {
    const clientId = submission.client_id || 'unknown'
    if (!acc[clientId]) {
      acc[clientId] = {
        client: submission.client,
        submissions: []
      }
    }
    acc[clientId].submissions.push(submission)
    return acc
  }, {} as Record<string, { client?: Client; submissions: SubmissionWithDetails[] }>)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Review</h1>
        <p className="text-gray-600">Content pending client approval</p>
      </div>

      {Object.entries(submissionsByClient).map(([clientId, { client, submissions: clientSubmissions }]) => (
        <div key={clientId} className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <span className="text-lg font-medium text-purple-900">
                  {client?.name || 'Unknown Client'}
                </span>
                {client?.contact_email && (
                  <span className="text-sm text-purple-700">({client.contact_email})</span>
                )}
              </div>
              <span className="text-sm text-purple-700">{clientSubmissions.length} items</span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {clientSubmissions.map((submission) => (
              <div key={submission.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {submission.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {submission.therapeutic_area} | Stage: {submission.stage}
                    </p>
                    {submission.project && (
                      <p className="text-sm text-gray-500 mt-1">
                        Project: {submission.project.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted by: {submission.submitter_name} ({submission.submitter_email})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    submission.priority_level === 'High' ? 'bg-red-100 text-red-700' :
                    submission.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {submission.priority_level} Priority
                  </span>
                </div>

                {/* Client Review Checklist */}
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-purple-900 mb-3">Client Review Checklist</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-purple-600" />
                      <span className="text-gray-700">Brand voice appropriate</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-purple-600" />
                      <span className="text-gray-700">Key messages included</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-purple-600" />
                      <span className="text-gray-700">Target audience addressed</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-purple-600" />
                      <span className="text-gray-700">Product benefits clear</span>
                    </label>
                  </div>
                </div>

                {/* Content Preview */}
                {submission.ai_output && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Content Preview</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      {submission.h1_tag && (
                        <p><strong>H1 Tag:</strong> {submission.h1_tag}</p>
                      )}
                      {submission.meta_description && (
                        <p><strong>Meta Description:</strong> {submission.meta_description}</p>
                      )}
                      {submission.seo_keywords && (
                        <p><strong>Keywords:</strong> {submission.seo_keywords}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(submission)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve for MLR
                  </button>
                  <button
                    onClick={() => handleReject(submission)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    Request Changes
                  </button>
                  <button
                    onClick={() => window.open(submission.dashboard_url, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <FileText className="h-4 w-4" />
                    View Full Report
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Users className="h-4 w-4" />
                    Client Portal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {submissions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No submissions pending client review</p>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Client Feedback
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide specific feedback for content improvements:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Enter client's feedback and requested changes..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={confirmRejection}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Send for Revision
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setSelectedSubmission(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
