import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/database-types'
import UnifiedReviewModal from './UnifiedReviewModal'
import { 
  Building2,
  TrendingUp,
  CheckCircle,
  XCircle,
  Target,
  Briefcase,
  LineChart,
  Globe
} from 'lucide-react'

interface ClientReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export default function ClientReviewModal({ isOpen, onClose, submission }: ClientReviewModalProps) {
  const [brandAlignment, setBrandAlignment] = useState({
    voice: '',
    messaging: '',
    guidelines: true
  })
  const [commercialAlignment, setCommercialAlignment] = useState({
    targetAudience: '',
    marketPosition: '',
    roi: ''
  })
  const [feedback, setFeedback] = useState('')

  const submitReview = useMutation({
    mutationFn: async (decision: 'approve' | 'revise') => {
      const updates = {
        workflow_stage: decision === 'approve' ? 'MLR_Review' : 'Revision_Requested',
        langchain_status: decision === 'approve' ? 'client_approved' : 'revision_requested',
        client_reviewed_at: new Date().toISOString(),
        client_reviewed_by: 'Brand Manager', // Would come from auth
        client_review_responses: {
          brandAlignment,
          commercialAlignment,
          feedback
        }
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

  const sections = [
    {
      id: 'seo-summary',
      title: 'SEO Review Summary',
      icon: <TrendingUp className="h-5 w-5" />,
      collapsible: false,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900 font-medium mb-2">SEO Strategy Approved</p>
            <p className="text-sm text-green-800">{submission.ai_output}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Projected Traffic Increase</p>
              <p className="text-lg font-semibold text-gray-900">+150-200%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Expected ROI</p>
              <p className="text-lg font-semibold text-gray-900">3.5x</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'brand-alignment',
      title: 'Brand Alignment Review',
      icon: <Briefcase className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Voice Consistency
            </label>
            <select
              value={brandAlignment.voice}
              onChange={(e) => setBrandAlignment({...brandAlignment, voice: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select assessment...</option>
              <option value="perfectly-aligned">Perfectly aligned with brand voice</option>
              <option value="mostly-aligned">Mostly aligned, minor adjustments needed</option>
              <option value="needs-work">Needs significant alignment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Messaging
            </label>
            <div className="space-y-2">
              {submission.key_differentiators?.map((diff: string, index: number) => (
                <label key={index} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>{diff}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={brandAlignment.guidelines}
                onChange={(e) => setBrandAlignment({...brandAlignment, guidelines: e.target.checked})}
                className="rounded text-blue-600"
              />
              <span>Complies with brand guidelines</span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'commercial-alignment',
      title: 'Commercial Strategy Alignment',
      icon: <LineChart className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience Appropriateness
            </label>
            <select
              value={commercialAlignment.targetAudience}
              onChange={(e) => setCommercialAlignment({...commercialAlignment, targetAudience: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select assessment...</option>
              <option value="perfectly-targeted">Perfectly targeted for our audience</option>
              <option value="well-suited">Well suited with minor refinements</option>
              <option value="needs-adjustment">Needs audience adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competitive Positioning
            </label>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Current positioning: <span className="font-medium">{submission.positioning}</span></p>
              <p className="text-sm text-gray-600">Key competitors:</p>
              <div className="flex flex-wrap gap-2">
                {submission.competitors?.map((comp: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ROI Confidence Level
            </label>
            <select
              value={commercialAlignment.roi}
              onChange={(e) => setCommercialAlignment({...commercialAlignment, roi: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select confidence level...</option>
              <option value="5">Very High - Exceeds projections likely</option>
              <option value="4">High - Meets projections</option>
              <option value="3">Moderate - Some uncertainty</option>
              <option value="2">Low - Significant concerns</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'target-markets',
      title: 'Target Markets & Geography',
      icon: <Globe className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Target Audiences</h4>
            <div className="flex flex-wrap gap-2">
              {submission.target_audience?.map((audience: string, index: number) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Target className="h-3 w-3 mr-1" />
                  {audience}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Launch Markets</h4>
            <div className="grid grid-cols-2 gap-2">
              {['United States', 'Canada', 'United Kingdom', 'Germany'].map((market) => (
                <label key={market} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked={market === 'United States'} className="rounded text-blue-600" />
                  <span>{market}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      title: 'Client Feedback',
      icon: <Building2 className="h-5 w-5" />,
      collapsible: false,
      content: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments or Revision Requests
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="Provide specific feedback for the SEO team or MLR reviewers..."
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
      disabled: submitReview.isPending || !brandAlignment.voice || !commercialAlignment.targetAudience
    },
    {
      label: 'Approve & Send to MLR',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('approve'),
      variant: 'primary' as const,
      disabled: submitReview.isPending || !brandAlignment.voice || !commercialAlignment.targetAudience || !commercialAlignment.roi
    }
  ]

  return (
    <UnifiedReviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Client Review: ${submission.product_name}`}
      subtitle={`${submission.therapeutic_area} • ${submission.stage}`}
      icon={<Building2 className="h-6 w-6 text-blue-600" />}
      headerBadge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Client Review
        </span>
      }
      sections={sections}
      actions={actions}
    />
  )
}
