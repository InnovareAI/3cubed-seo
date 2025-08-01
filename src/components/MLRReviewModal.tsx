import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/mockData'
import UnifiedReviewModal from './UnifiedReviewModal'
import { 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Scale,
  Building2,
  ClipboardCheck,
  FileWarning
} from 'lucide-react'

interface MLRReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export default function MLRReviewModal({ isOpen, onClose, submission }: MLRReviewModalProps) {
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

      const { error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', submission.id)

      if (error) throw error
    },
    onSuccess: () => {
      onClose()
    }
  })

  const allChecksComplete = Object.values(complianceChecks).every(v => v === true)

  const sections = [
    {
      id: 'previous-reviews',
      title: 'Previous Review Summary',
      icon: <Building2 className="h-5 w-5" />,
      collapsible: false,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          {/* SEO Review Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-1">SEO Review Approved</p>
            <p className="text-xs text-blue-800">Keywords optimized, content structure validated</p>
          </div>

          {/* Client Review Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-900 mb-1">Client Review Approved</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-green-800">
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
      )
    },
    {
      id: 'compliance-checklist',
      title: 'MLR Compliance Checklist',
      icon: <ClipboardCheck className="h-5 w-5" />,
      collapsible: false,
      defaultExpanded: true,
      content: (
        <div className="space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-900 font-medium mb-2">Required Compliance Checks</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={complianceChecks.medicalAccuracy}
                  onChange={(e) => setComplianceChecks({...complianceChecks, medicalAccuracy: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span>All medical claims are substantiated with approved references</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={complianceChecks.fairBalance}
                  onChange={(e) => setComplianceChecks({...complianceChecks, fairBalance: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span>Fair balance is maintained throughout the content</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={complianceChecks.safetyInfo}
                  onChange={(e) => setComplianceChecks({...complianceChecks, safetyInfo: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span>Required safety information is included and prominent</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={complianceChecks.fdaGuidelines}
                  onChange={(e) => setComplianceChecks({...complianceChecks, fdaGuidelines: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span>Content complies with FDA promotional guidelines</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={complianceChecks.offLabelPromotion}
                  onChange={(e) => setComplianceChecks({...complianceChecks, offLabelPromotion: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span>No off-label promotion or unapproved indications</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={complianceChecks.disclaimers}
                  onChange={(e) => setComplianceChecks({...complianceChecks, disclaimers: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span>Appropriate disclaimers and footnotes are present</span>
              </label>
            </div>
          </div>
          {!allChecksComplete && (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Complete all compliance checks before approval</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'content-review',
      title: 'Content for Final Review',
      icon: <FileCheck className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Product Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Indication:</span>
                <p className="font-medium">{submission.medical_indication}</p>
              </div>
              <div>
                <span className="text-gray-600">Dosage Form:</span>
                <p className="font-medium">{submission.dosage_form}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Key Differentiators:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {submission.key_differentiators?.map((diff: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {diff}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">SEO Content Strategy</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {typeof submission.ai_output === 'string' 
                ? submission.ai_output 
                : JSON.stringify(submission.ai_output, null, 2)}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      icon: <Scale className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regulatory Risk Level
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
            <p className="text-sm font-medium text-gray-700">Common Risk Factors:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-purple-600" />
                <span>Comparative claims present</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-purple-600" />
                <span>Patient testimonials included</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-purple-600" />
                <span>Efficacy data referenced</span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mlr-feedback',
      title: 'MLR Feedback',
      icon: <FileWarning className="h-5 w-5" />,
      collapsible: false,
      content: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compliance Feedback & Required Changes
          </label>
          <textarea
            value={mlrFeedback}
            onChange={(e) => setMlrFeedback(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
            placeholder="Provide specific compliance or regulatory feedback if revision is needed..."
          />
        </div>
      )
    }
  ]

  const actions = [
    {
      label: 'Request Revision',
      icon: <XCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('revise'),
      variant: 'secondary' as const,
      disabled: submitReview.isPending || (!mlrFeedback && !allChecksComplete)
    },
    {
      label: 'Approve & Publish',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('approve'),
      variant: 'primary' as const,
      disabled: submitReview.isPending || !allChecksComplete || !riskAssessment
    }
  ]

  return (
    <UnifiedReviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`MLR Review: ${submission.product_name}`}
      subtitle={`${submission.therapeutic_area} • ${submission.stage}`}
      icon={<Shield className="h-6 w-6 text-purple-600" />}
      headerBadge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          MLR Review
        </span>
      }
      sections={sections}
      actions={actions}
    />
  )
}
