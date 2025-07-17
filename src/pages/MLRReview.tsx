import React, { useEffect, useState } from 'react'
import { supabase, Submission } from '../lib/supabase'
import { Shield, CheckCircle, XCircle, FileText, AlertTriangle, Clock } from 'lucide-react'

export default function MLRReview() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('langchain_status', 'mlr_review')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error('Error fetching MLR submissions:', err)
      setError('Failed to load MLR review items')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submission: Submission) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          langchain_status: 'published',
          workflow_stage: 'Published',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id)

      if (error) throw error
      
      // Remove from list
      setSubmissions(submissions.filter(s => s.id !== submission.id))
      alert('Content approved and published!')
    } catch (err) {
      console.error('Error approving submission:', err)
      alert('Failed to approve submission')
    }
  }

  const handleReject = (submission: Submission) => {
    setSelectedSubmission(submission)
    setShowRejectionModal(true)
  }

  const confirmRejection = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          langchain_status: 'rejected',
          workflow_stage: 'Revision_Requested',
          rejection_stage: 'MLR_Review',
          rejection_reason: rejectionReason,
          rejected_by: 'MLR Team', // In production, get from auth
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
      alert('Submission sent for revision')
    } catch (err) {
      console.error('Error rejecting submission:', err)
      alert('Failed to reject submission')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MLR Review</h1>
        <p className="text-gray-600">Medical, Legal, and Regulatory compliance review</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-medium text-orange-900">Pending MLR Review</span>
            </div>
            <span className="text-sm text-orange-700">{submissions.length} items</span>
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
                    Submitted by: {submission.submitter_name} ({submission.submitter_email})
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Created: {new Date(submission.created_at).toLocaleString()}</span>
                    <span>Retry Count: {submission.langchain_retry_count}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  submission.priority_level === 'High' ? 'bg-red-100 text-red-700' :
                  submission.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {submission.priority_level} Priority
                </span>
              </div>

              {/* Compliance Checklist */}
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-orange-900 mb-3">MLR Compliance Checklist</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-orange-600" />
                    <span className="text-gray-700">Medical accuracy verified</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-orange-600" />
                    <span className="text-gray-700">Legal disclaimers present</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-orange-600" />
                    <span className="text-gray-700">Regulatory requirements met</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-orange-600" />
                    <span className="text-gray-700">Claims substantiated</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-orange-600" />
                    <span className="text-gray-700">Side effects disclosed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-orange-600" />
                    <span className="text-gray-700">FDA guidelines followed</span>
                  </label>
                </div>
              </div>

              {/* AI Output Preview */}
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
                    {submission.executive_summary && (
                      <div>
                        <strong>Executive Summary:</strong>
                        <p className="mt-1 text-gray-600">{submission.executive_summary.substring(0, 200)}...</p>
                      </div>
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
                  Approve & Publish
                </button>
                <button
                  onClick={() => handleReject(submission)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4" />
                  Request Revision
                </button>
                <button
                  onClick={() => window.open(submission.dashboard_url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <FileText className="h-4 w-4" />
                  View Full Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No submissions pending MLR review</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              MLR Revision Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide specific compliance issues that need to be addressed:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              placeholder="Specify medical, legal, or regulatory concerns..."
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
