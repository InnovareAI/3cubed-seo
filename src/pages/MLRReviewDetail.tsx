import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { mockMLRReviews } from '../data/mockMLRReviews'
import CTAButton from '../components/CTAButton'
import { 
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Scale,
  Building2,
  ClipboardCheck,
  FileWarning,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Building,
  Users,
  Pill
} from 'lucide-react'
import { format } from 'date-fns'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience: string[]
  created_at: string
  submitter_name: string
  submitter_email: string
  submitter_company?: string
  priority_level: string
  medical_indication?: string
  langchain_status?: string
  geography?: string[]
  client_name?: string
  mechanism_of_action?: string
  key_differentiators?: string[]
  client_review_responses?: any
  client_reviewed_at?: string
  client_reviewed_by?: string
  dosage_form?: string
  ai_output?: any
  seo_keywords?: string[]
  seo_long_tail?: string[]
  seo_questions?: string[]
  seo_reviewed_at?: string
  seo_reviewed_by?: string
  mlr_compliance_checks?: any
  mlr_feedback?: string
  mlr_risk_assessment?: string
}

export default function MLRReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [useDummyData] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'previous-reviews': true,
    'content-review': true,
    'compliance-checklist': true,
    'risk-assessment': false,
    'mlr-feedback': true
  })

  // Compliance state
  const [complianceChecks, setComplianceChecks] = useState({
    medicalAccuracy: false,
    fairBalance: false,
    safetyInfo: false,
    fdaGuidelines: false,
    offLabelPromotion: false,
    disclaimers: false
  })
  const [mlrFeedback, setMlrFeedback] = useState('')
  const [riskAssessment, setRiskAssessment] = useState('')
  const [riskFactors, setRiskFactors] = useState({
    comparativeClaims: false,
    patientTestimonials: false,
    efficacyData: false,
    adverseEvents: false,
    pediatricUse: false
  })

  const { data: submission, isLoading } = useQuery({
    queryKey: ['mlr-review-detail', id],
    queryFn: async () => {
      if (useDummyData) {
        const mockSubmission = mockMLRReviews.find(s => s.id === id)
        if (!mockSubmission) throw new Error('Submission not found')
        return mockSubmission
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Submission
    }
  })

  // Load existing compliance data if available
  useEffect(() => {
    if (submission && 'mlr_compliance_checks' in submission && submission.mlr_compliance_checks) {
      setComplianceChecks(submission.mlr_compliance_checks)
    }
    if (submission && 'mlr_feedback' in submission && submission.mlr_feedback) {
      setMlrFeedback(submission.mlr_feedback)
    }
    if (submission && 'mlr_risk_assessment' in submission && submission.mlr_risk_assessment) {
      setRiskAssessment(submission.mlr_risk_assessment)
    }
  }, [submission])

  const submitReview = useMutation({
    mutationFn: async (decision: 'approve' | 'revise') => {
      const updates = {
        workflow_stage: decision === 'approve' ? 'Published' : 'Revision_Requested',
        langchain_status: decision === 'approve' ? 'mlr_approved' : 'revision_requested',
        mlr_reviewed_at: new Date().toISOString(),
        mlr_reviewed_by: 'MLR Team', // Would come from auth
        mlr_compliance_checks: complianceChecks,
        mlr_feedback: mlrFeedback,
        mlr_risk_assessment: riskAssessment,
        completed_at: decision === 'approve' ? new Date().toISOString() : null
      }

      if (!useDummyData) {
        const { error } = await supabase
          .from('submissions')
          .update(updates)
          .eq('id', submission!.id)

        if (error) throw error
      }

      // Navigate back to MLR Review list
      navigate('/mlr-review')
    }
  })

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const allChecksComplete = Object.values(complianceChecks).every(v => v === true)
  const completedChecks = Object.values(complianceChecks).filter(v => v === true).length
  const totalChecks = Object.keys(complianceChecks).length
  const complianceProgress = Math.round((completedChecks / totalChecks) * 100)

  if (isLoading || !submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/mlr-review')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to MLR Review
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{submission.product_name}</h1>
                <p className="text-sm text-gray-600 mt-1">Medical Legal Review</p>
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 border rounded-full text-sm font-medium ${getPriorityColor(submission.priority_level || 'medium')}`}>
            {submission.priority_level || 'Medium'} Priority
          </span>
        </div>
      </div>

      {/* Key Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Pill className="h-4 w-4" />
              Therapeutic Area
            </p>
            <p className="mt-1 font-medium text-gray-900">{submission.therapeutic_area}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Target Audience
            </p>
            <p className="mt-1 font-medium text-gray-900">{submission.target_audience?.join(', ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Building className="h-4 w-4" />
              Company
            </p>
            <p className="mt-1 font-medium text-gray-900">{submission.submitter_company || 'Pharma Corp'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Submitted
            </p>
            <p className="mt-1 font-medium text-gray-900">{format(new Date(submission.created_at), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Previous Reviews Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('previous-reviews')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Previous Review Summary</h2>
            </div>
            {expandedSections['previous-reviews'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['previous-reviews'] && (
          <div className="px-6 pb-6 space-y-4">
            {/* SEO Review Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">SEO Review Approved</p>
                  <p className="text-xs text-blue-800">Keywords optimized, content structure validated</p>
                  {submission.created_at && (
                    <p className="text-xs text-blue-700 mt-2">
                      Reviewed by SEO Team
                    </p>
                  )}
                </div>
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="text-xs">
                  <span className="font-medium text-blue-900">Keywords:</span>
                  <span className="text-blue-800 ml-1">{submission.seo_keywords?.length || 8}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-blue-900">Long-tail:</span>
                  <span className="text-blue-800 ml-1">{3}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-blue-900">Questions:</span>
                  <span className="text-blue-800 ml-1">{2}</span>
                </div>
              </div>
            </div>

            {/* Client Review Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">Client Review Approved</p>
                  <p className="text-xs text-green-800">Brand alignment and commercial viability confirmed</p>
                  {submission.client_reviewed_at && (
                    <p className="text-xs text-green-700 mt-2">
                      Reviewed by {submission.client_reviewed_by || 'Client Team'} on {format(new Date(submission.client_reviewed_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-green-800">
                <div>
                  <span className="font-medium">Brand Voice:</span> {submission.client_review_responses?.brandAlignment?.voice || 'Aligned'}
                </div>
                <div>
                  <span className="font-medium">ROI Confidence:</span> {submission.client_review_responses?.roiConfidence || 'N/A'}/5
                </div>
                <div>
                  <span className="font-medium">Target Audience:</span> {submission.client_review_responses?.commercialAlignment?.targetAudience || 'Appropriate'}
                </div>
                <div>
                  <span className="font-medium">Market Position:</span> Clear
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content for Review */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('content-review')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Content for Final Review</h2>
            </div>
            {expandedSections['content-review'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['content-review'] && (
          <div className="px-6 pb-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Product Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Medical Indication:</span>
                  <p className="font-medium mt-1">{submission.medical_indication}</p>
                </div>
                <div>
                  <span className="text-gray-600">Dosage Form:</span>
                  <p className="font-medium mt-1">{submission.dosage_form}</p>
                </div>
                <div>
                  <span className="text-gray-600">Mechanism of Action:</span>
                  <p className="font-medium mt-1">{('mechanism_of_action' in submission && submission.mechanism_of_action) || 'Targeted therapy'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Stage:</span>
                  <p className="font-medium mt-1">{submission.stage}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Key Differentiators:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {submission.key_differentiators?.map((diff: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">SEO-Optimized Content</h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {typeof submission.ai_output === 'string' 
                  ? submission.ai_output 
                  : JSON.stringify(submission.ai_output, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* MLR Compliance Checklist */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">MLR Compliance Checklist</h2>
              <span className="text-sm text-red-600">* Required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {completedChecks} of {totalChecks} completed
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    complianceProgress === 100 ? 'bg-green-600' : 'bg-purple-600'
                  }`}
                  style={{ width: `${complianceProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceChecks.medicalAccuracy}
                  onChange={(e) => setComplianceChecks({...complianceChecks, medicalAccuracy: e.target.checked})}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">Medical Accuracy <span className="text-red-600">*</span></span>
                  <p className="text-xs text-gray-600 mt-0.5">All medical claims are substantiated with approved references</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceChecks.fairBalance}
                  onChange={(e) => setComplianceChecks({...complianceChecks, fairBalance: e.target.checked})}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">Fair Balance <span className="text-red-600">*</span></span>
                  <p className="text-xs text-gray-600 mt-0.5">Benefits and risks are presented with appropriate balance</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceChecks.safetyInfo}
                  onChange={(e) => setComplianceChecks({...complianceChecks, safetyInfo: e.target.checked})}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">Safety Information <span className="text-red-600">*</span></span>
                  <p className="text-xs text-gray-600 mt-0.5">Required safety information is included and prominently displayed</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceChecks.fdaGuidelines}
                  onChange={(e) => setComplianceChecks({...complianceChecks, fdaGuidelines: e.target.checked})}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">FDA Guidelines Compliance <span className="text-red-600">*</span></span>
                  <p className="text-xs text-gray-600 mt-0.5">Content adheres to FDA promotional guidelines and regulations</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceChecks.offLabelPromotion}
                  onChange={(e) => setComplianceChecks({...complianceChecks, offLabelPromotion: e.target.checked})}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">No Off-Label Promotion <span className="text-red-600">*</span></span>
                  <p className="text-xs text-gray-600 mt-0.5">No promotion of unapproved indications or uses</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceChecks.disclaimers}
                  onChange={(e) => setComplianceChecks({...complianceChecks, disclaimers: e.target.checked})}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">Disclaimers & Footnotes <span className="text-red-600">*</span></span>
                  <p className="text-xs text-gray-600 mt-0.5">All required disclaimers and footnotes are present</p>
                </div>
              </label>
            </div>
          </div>
          
          {!allChecksComplete && (
            <div className="flex items-center gap-2 text-sm text-amber-700 mt-4">
              <AlertTriangle className="h-4 w-4" />
              <span>Complete all required compliance checks before approval</span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('risk-assessment')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
            </div>
            {expandedSections['risk-assessment'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['risk-assessment'] && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regulatory Risk Level <span className="text-red-600">*</span>
              </label>
              <select
                value={riskAssessment}
                onChange={(e) => setRiskAssessment(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select risk level...</option>
                <option value="low">Low - Standard promotional content</option>
                <option value="medium">Medium - Some regulatory considerations</option>
                <option value="high">High - Significant compliance concerns</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Risk Factors Present:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={riskFactors.comparativeClaims}
                    onChange={(e) => setRiskFactors({...riskFactors, comparativeClaims: e.target.checked})}
                    className="rounded text-purple-600 focus:ring-purple-500" 
                  />
                  <span>Comparative claims with competitor products</span>
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={riskFactors.patientTestimonials}
                    onChange={(e) => setRiskFactors({...riskFactors, patientTestimonials: e.target.checked})}
                    className="rounded text-purple-600 focus:ring-purple-500" 
                  />
                  <span>Patient testimonials or case studies</span>
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={riskFactors.efficacyData}
                    onChange={(e) => setRiskFactors({...riskFactors, efficacyData: e.target.checked})}
                    className="rounded text-purple-600 focus:ring-purple-500" 
                  />
                  <span>Specific efficacy data or clinical trial results</span>
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={riskFactors.adverseEvents}
                    onChange={(e) => setRiskFactors({...riskFactors, adverseEvents: e.target.checked})}
                    className="rounded text-purple-600 focus:ring-purple-500" 
                  />
                  <span>Discussion of adverse events or contraindications</span>
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={riskFactors.pediatricUse}
                    onChange={(e) => setRiskFactors({...riskFactors, pediatricUse: e.target.checked})}
                    className="rounded text-purple-600 focus:ring-purple-500" 
                  />
                  <span>References to pediatric or special populations</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MLR Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileWarning className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">MLR Feedback</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Feedback & Required Changes
            </label>
            <textarea
              value={mlrFeedback}
              onChange={(e) => setMlrFeedback(e.target.value)}
              rows={6}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
              placeholder="Provide specific compliance or regulatory feedback. Required if requesting revision..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This feedback will be sent to the content creator if revision is requested
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {!allChecksComplete && (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span>Complete all required fields before approval</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <CTAButton
              variant="secondary"
              icon={<XCircle className="h-4 w-4" />}
              onClick={() => submitReview.mutate('revise')}
              disabled={submitReview.isPending || (!mlrFeedback && !allChecksComplete)}
            >
              Request Revision
            </CTAButton>
            <CTAButton
              variant="primary"
              icon={<CheckCircle className="h-4 w-4" />}
              onClick={() => submitReview.mutate('approve')}
              disabled={submitReview.isPending || !allChecksComplete || !riskAssessment}
            >
              Approve & Publish
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  )
}
