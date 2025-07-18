import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/supabase'
import { CheckCircle, XCircle, Shield, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { format } from 'date-fns'

// Dummy data for demonstration
const DUMMY_MLR_SUBMISSIONS: Submission[] = [
  {
    id: 'mlr-dummy-1',
    compliance_id: 'COMP-2024-004',
    submitter_name: 'David Kim',
    submitter_email: 'dkim@globalpharma.com',
    submitter_company: 'Global Pharma Corp',
    product_name: 'Arthroflex Pro',
    therapeutic_area: 'Rheumatology',
    stage: 'Launch',
    priority_level: 'High',
    raw_input_content: 'Arthroflex Pro is a targeted therapy for rheumatoid arthritis...',
    ai_output: {
      strategy: 'Target rheumatologists and pain specialists with content focusing on efficacy data, safety profile, and patient quality of life improvements.',
      keywords: ['arthroflex rheumatoid arthritis', 'targeted RA therapy', 'joint pain relief'],
      contentPlan: 'Develop comprehensive content hub with clinical trial data, mechanism of action videos, and patient testimonials.'
    },
    langchain_status: 'client_approved',
    workflow_stage: 'MLR_Review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date().toISOString(),
    client_reviewed_at: new Date('2024-01-22').toISOString(),
    client_reviewed_by: 'Jennifer Smith',
    ready_for_mlr: true,
    client_review_responses: {
      'brand-voice': 'Perfectly aligned',
      'key-messages': ['Innovation highlighted', 'Patient focus clear', 'Efficacy emphasized'],
      'differentiation': 'Very clear',
      'hcp-appropriate': 'Perfectly targeted',
      'patient-appropriate': 'Excellent fit',
      'launch-timeline': 'Perfectly timed',
      'sales-enablement': 'Excellent support',
      'market-positioning': '5',
      'conversion-path': 'Very clear',
      'kpi-alignment': ['Brand awareness lift', 'HCP engagement rate', 'Lead generation volume'],
      'roi-confidence': '5'
    }
  },
  {
    id: 'mlr-dummy-2',
    compliance_id: 'COMP-2024-005',
    submitter_name: 'Lisa Thompson',
    submitter_email: 'lthompson@biomedcorp.com',
    submitter_company: 'BioMed Corporation',
    product_name: 'GlucoBalance XR',
    therapeutic_area: 'Endocrinology',
    stage: 'Pre-Launch',
    priority_level: 'High',
    raw_input_content: 'GlucoBalance XR offers extended-release glucose control...',
    ai_output: {
      strategy: 'Focus on endocrinologists and primary care physicians. Emphasize 24-hour glucose control and reduced hypoglycemia risk.',
      keywords: ['glucobalance diabetes', 'extended release metformin', 'type 2 diabetes management'],
      contentPlan: 'Create educational content on continuous glucose control, dosing convenience, and patient adherence benefits.'
    },
    langchain_status: 'client_approved',
    workflow_stage: 'MLR_Review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-12').toISOString(),
    updated_at: new Date().toISOString(),
    client_reviewed_at: new Date('2024-01-23').toISOString(),
    client_reviewed_by: 'Mark Johnson',
    ready_for_mlr: true,
    client_review_responses: {
      'brand-voice': 'Mostly aligned',
      'key-messages': ['Innovation highlighted', 'Patient focus clear', 'Efficacy emphasized', 'All messages present'],
      'differentiation': 'Very clear',
      'hcp-appropriate': 'Well suited',
      'patient-appropriate': 'Good fit',
      'launch-timeline': 'Well aligned',
      'sales-enablement': 'Good support',
      'market-positioning': '4',
      'conversion-path': 'Mostly clear',
      'kpi-alignment': ['Brand awareness lift', 'Patient education metrics', 'Website traffic growth'],
      'roi-confidence': '4'
    }
  },
  {
    id: 'mlr-dummy-3',
    compliance_id: 'COMP-2024-006',
    submitter_name: 'Robert Chen',
    submitter_email: 'rchen@innovativebio.com',
    submitter_company: 'Innovative Bio Solutions',
    product_name: 'DermaClear',
    therapeutic_area: 'Dermatology',
    stage: 'Phase III',
    priority_level: 'Medium',
    raw_input_content: 'DermaClear is a breakthrough topical treatment for psoriasis...',
    ai_output: {
      strategy: 'Target dermatologists with clinical efficacy data. Secondary audience includes patients seeking alternative treatments.',
      keywords: ['dermaclear psoriasis', 'topical psoriasis treatment', 'skin clearance therapy'],
      contentPlan: 'Develop visual before/after content, patient journey stories, and dermatologist endorsements.'
    },
    langchain_status: 'client_approved',
    workflow_stage: 'MLR_Review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-14').toISOString(),
    updated_at: new Date().toISOString(),
    client_reviewed_at: new Date('2024-01-24').toISOString(),
    client_reviewed_by: 'Amanda Wilson',
    ready_for_mlr: true,
    client_review_responses: {
      'brand-voice': 'Perfectly aligned',
      'key-messages': ['Innovation highlighted', 'Patient focus clear'],
      'differentiation': 'Somewhat clear',
      'hcp-appropriate': 'Perfectly targeted',
      'patient-appropriate': 'Excellent fit',
      'launch-timeline': 'Well aligned',
      'sales-enablement': 'Excellent support',
      'market-positioning': '4',
      'conversion-path': 'Very clear',
      'kpi-alignment': ['HCP engagement rate', 'Patient education metrics', 'Share of voice'],
      'roi-confidence': '4'
    }
  }
]

export default function MLRReview() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [useDummyData, setUseDummyData] = useState(true) // Default to dummy data
  const queryClient = useQueryClient()

  const { data: liveSubmissions, isLoading } = useQuery({
    queryKey: ['mlr-review-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'MLR_Review')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    },
    enabled: !useDummyData
  })

  // Use dummy data or live data based on toggle
  const submissions = useDummyData ? DUMMY_MLR_SUBMISSIONS : liveSubmissions

  const updateSubmission = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // For dummy data, just simulate success
      if (useDummyData) {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ success: true }), 1000)
        })
      }

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
      // Show success message for dummy data
      if (useDummyData) {
        alert('MLR review completed successfully! (Demo mode - no data was actually changed)')
      }
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

  if (!useDummyData && isLoading) {
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
        <button
          onClick={() => setUseDummyData(!useDummyData)}
          className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          {useDummyData ? 'Switch to Live Data' : 'Show Demo Data'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Medical Legal Review (MLR) Queue
                {useDummyData && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Demo Data
                  </span>
                )}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Final compliance review before publication
              </p>
            </div>
            <button
              onClick={() => setUseDummyData(!useDummyData)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              {useDummyData ? 'Live Data' : 'Demo Data'}
            </button>
          </div>
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
                  {submission.client_reviewed_at && (
                    <p className="mt-1 text-sm text-gray-600">
                      Client approved by {submission.client_reviewed_by} • {format(new Date(submission.client_reviewed_at), 'MMM d, yyyy')}
                    </p>
                  )}
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
                  {/* Client Review Summary */}
                  {submission.client_review_responses && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Client Review Summary</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Brand Voice:</strong> {submission.client_review_responses['brand-voice']}</p>
                        <p><strong>HCP Appropriateness:</strong> {submission.client_review_responses['hcp-appropriate']}</p>
                        <p><strong>Sales Enablement:</strong> {submission.client_review_responses['sales-enablement']}</p>
                        <p><strong>ROI Confidence:</strong> {submission.client_review_responses['roi-confidence']}/5</p>
                      </div>
                    </div>
                  )}

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
                      disabled={updateSubmission.isPending}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleApprove(submission.id)}
                      disabled={updateSubmission.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
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
