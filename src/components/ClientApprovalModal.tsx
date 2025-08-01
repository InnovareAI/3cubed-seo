import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/mockData'
import UnifiedReviewModal from './UnifiedReviewModal'
import { 
  Building2,
  CheckCircle,
  XCircle,
  Target,
  Users,
  Briefcase,
  Globe,
  BarChart3,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface ClientApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
  seoReviewData?: any
}

export default function ClientApprovalModal({ isOpen, onClose, submission }: ClientApprovalModalProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [comments, setComments] = useState('')

  const submitReview = useMutation({
    mutationFn: async (decision: 'approve' | 'revise') => {
      const updates = {
        workflow_stage: decision === 'approve' ? 'MLR_Review' : 'Client_Revision_Requested',
        langchain_status: decision === 'approve' ? 'client_approved' : 'revision_requested',
        client_reviewed_at: new Date().toISOString(),
        client_reviewed_by: 'Client User', // Would come from auth
        client_review_responses: responses,
        client_review_comments: comments,
        ready_for_mlr: decision === 'approve'
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

  const updateResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  // Check if all required fields are completed
  const requiredFields = ['brand-voice', 'target-audience', 'launch-alignment', 'roi-confidence']
  const isComplete = requiredFields.every(field => responses[field])

  const sections = [
    {
      id: 'seo-performance',
      title: 'SEO Performance Projections',
      icon: <TrendingUp className="h-5 w-5" />,
      collapsible: false,
      content: (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Organic Traffic</p>
            <p className="text-2xl font-bold text-gray-900">+150-200%</p>
            <p className="text-xs text-gray-500">Within 6 months</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Lead Generation</p>
            <p className="text-2xl font-bold text-gray-900">+80-120</p>
            <p className="text-xs text-gray-500">Inquiries/month</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Projected ROI</p>
            <p className="text-2xl font-bold text-gray-900">3.5x</p>
            <p className="text-xs text-gray-500">First year</p>
          </div>
        </div>
      )
    },
    {
      id: 'brand-alignment',
      title: 'Brand & Messaging Alignment',
      icon: <Briefcase className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Does the content maintain our brand voice and tone? *
            </label>
            <select
              value={responses['brand-voice'] || ''}
              onChange={(e) => updateResponse('brand-voice', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Select an option</option>
              <option value="perfectly-aligned">Perfectly aligned</option>
              <option value="mostly-aligned">Mostly aligned</option>
              <option value="needs-adjustment">Needs adjustment</option>
              <option value="off-brand">Off-brand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key brand messages emphasized:
            </label>
            <div className="space-y-2">
              {['Innovation in treatment', 'Patient-first approach', 'Proven efficacy', 'Safety profile'].map((message) => (
                <label key={message} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={responses['messages']?.[message] || false}
                    onChange={(e) => updateResponse('messages', {
                      ...responses['messages'],
                      [message]: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span>{message}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'audience-fit',
      title: 'Target Audience Appropriateness',
      icon: <Users className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Is the content appropriate for our target audiences? *
            </label>
            <select
              value={responses['target-audience'] || ''}
              onChange={(e) => updateResponse('target-audience', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Select an option</option>
              <option value="perfectly-targeted">Perfectly targeted</option>
              <option value="well-suited">Well suited</option>
              <option value="needs-refinement">Needs refinement</option>
              <option value="misaligned">Misaligned</option>
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Target Audiences:</p>
            <div className="flex flex-wrap gap-2">
              {(submission.target_audience || []).map((audience: string, index: number) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commercial-strategy',
      title: 'Commercial & Launch Strategy',
      icon: <Target className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Does the content align with our launch timeline? *
            </label>
            <select
              value={responses['launch-alignment'] || ''}
              onChange={(e) => updateResponse('launch-alignment', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Select an option</option>
              <option value="perfectly-timed">Perfectly timed</option>
              <option value="well-aligned">Well aligned</option>
              <option value="minor-issues">Minor timing issues</option>
              <option value="major-conflicts">Major conflicts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Will this content support our sales team?
            </label>
            <div className="space-y-2">
              {[
                'Provides value for HCP discussions',
                'Addresses common objections',
                'Supports value proposition',
                'Enables field force'
              ].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={responses['sales-support']?.[item] || false}
                    onChange={(e) => updateResponse('sales-support', {
                      ...responses['sales-support'],
                      [item]: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'kpis',
      title: 'Success Metrics & ROI',
      icon: <BarChart3 className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence in achieving projected ROI? *
            </label>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name="roi-confidence"
                    value={value}
                    checked={responses['roi-confidence'] === value}
                    onChange={() => updateResponse('roi-confidence', value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="mt-1 text-sm">{value}</span>
                </label>
              ))}
              <span className="text-xs text-gray-500 ml-2">(1 = Low, 5 = High)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which KPIs will this impact?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Brand awareness lift',
                'HCP engagement rate',
                'Patient education metrics',
                'Lead generation volume',
                'Website traffic growth',
                'Share of voice'
              ].map((kpi) => (
                <label key={kpi} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={responses['kpis']?.[kpi] || false}
                    onChange={(e) => updateResponse('kpis', {
                      ...responses['kpis'],
                      [kpi]: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span>{kpi}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'comments',
      title: 'Additional Comments',
      icon: <Globe className="h-5 w-5" />,
      collapsible: false,
      content: (
        <div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="Any additional feedback or concerns..."
          />
        </div>
      )
    }
  ]

  const actions = [
    {
      label: 'Request Changes',
      icon: <XCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('revise'),
      variant: 'secondary' as const,
      disabled: submitReview.isPending
    },
    {
      label: 'Approve for MLR',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('approve'),
      variant: 'primary' as const,
      disabled: !isComplete || submitReview.isPending
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
