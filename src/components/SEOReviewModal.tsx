import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import UnifiedReviewModal from './UnifiedReviewModal'
import { 
  Search,
  Hash,
  MessageSquare,
  TrendingUp,
  FileText,
  Bot,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SEOReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export default function SEOReviewModal({ isOpen, onClose, submission }: SEOReviewModalProps) {
  const [keywordApprovals, setKeywordApprovals] = useState<Record<string, boolean>>({})
  const [internalNotes, setInternalNotes] = useState('')
  const [clientFeedback, setClientFeedback] = useState('')

  const submitReview = useMutation({
    mutationFn: async (decision: 'approve' | 'revise') => {
      const updates = {
        workflow_stage: decision === 'approve' ? 'Client_Review' : 'Revision_Requested',
        langchain_status: decision === 'approve' ? 'seo_approved' : 'revision_requested',
        seo_reviewed_at: new Date().toISOString(),
        seo_reviewed_by: 'SEO Specialist', // Would come from auth
        seo_keyword_approvals: keywordApprovals,
        seo_internal_notes: internalNotes,
        seo_client_feedback: clientFeedback
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

  // Generate product-specific GEO recommendations
  const getGeoRecommendations = () => {
    const recommendations: { [key: string]: string[] } = {
      'Xeltoris™ (evolocumab)': [
        'Create structured comparison table: "Xeltoris vs Statins: 60% Greater LDL Reduction" with clinical data points',
        'Implement dosing calculator: "Is Once-Monthly Xeltoris Right for You?" decision tree',
        'Add insurance coverage checker widget with state-specific formulary data',
        'Structure FAQ schema: "How does PCSK9 inhibition differ from statin therapy?" with mechanism diagrams'
      ],
      'NeurogeniX®': [
        'Build interactive cognitive assessment tool: "Track Alzheimer\'s Progression with NeurogeniX Therapy"',
        'Create caregiver resource hub: "Week-by-Week Guide to NeurogeniX Treatment"',
        'Structure clinical trial data: "Phase III Results: 43% Slower Cognitive Decline" with visual charts',
        'Implement voice-optimized Q&A: "What stage of Alzheimer\'s is NeurogeniX approved for?"'
      ],
      'ImmunoShield™': [
        'Develop RA symptom tracker: "Monitor Your Progress on ImmunoShield" with exportable reports',
        'Create safety comparison matrix: "ImmunoShield vs Other JAK Inhibitors: No Routine Monitoring"',
        'Structure onset timeline: "When to Expect Results: 2 Weeks vs 3 Months for DMARDs"',
        'Build medication interaction checker: "Can I Take ImmunoShield with My Current Medications?"'
      ],
      // Client review products
      'Nexafib': [
        'Structure lipid panel interpreter: "Understanding Your Results with Nexafib Treatment"',
        'Create dosing compliance tracker: "Once-Daily Nexafib Reminder System"',
        'Build comparison tool: "Nexafib vs Fenofibrate: Superior Triglyceride Reduction"',
        'Implement patient eligibility quiz: "Is Nexafib Right for Your Cardiovascular Risk?"'
      ],
      'OncoShield Plus': [
        'Develop treatment timeline: "Your First 12 Weeks on OncoShield Plus Immunotherapy"',
        'Create side effect management guide: "Managing Immune-Related Adverse Events" with action thresholds',
        'Structure survival data visualization: "OncoShield Plus: 18-Month Overall Survival Rates"',
        'Build patient support finder: "OncoShield Plus Financial Assistance Programs by State"'
      ],
      'CogniMax': [
        'Create cognitive improvement tracker: "Measure Your Progress with CogniMax"',
        'Structure dosing guide: "CogniMax Oral Solution: Proper Administration Technique"',
        'Build caregiver communication tool: "Share CogniMax Progress with Your Care Team"',
        'Implement FAQ schema: "CogniMax vs Traditional Alzheimer\'s Medications: Key Differences"'
      ]
    }

    // Default recommendations based on therapeutic area if product not found
    const defaultByArea: { [key: string]: string[] } = {
      'Cardiology': [
        `Structure ${submission.product_name} mechanism of action in numbered steps for AI comprehension`,
        `Create comparison table: "${submission.product_name} vs ${submission.competitors?.[0] || 'Standard Treatment'}"`,
        `Add clinical endpoint data with clear headers: "Primary Outcomes", "Safety Profile"`,
        `Implement Q&A schema for: "Who is eligible for ${submission.product_name} treatment?"`
      ],
      'Oncology': [
        `Build treatment journey timeline: "Week 1-12 on ${submission.product_name}"`,
        `Structure survival data: "${submission.product_name} Overall Survival vs Progression-Free Survival"`,
        `Create side effect comparison matrix with severity ratings`,
        `Add patient selection criteria in checklist format for AI extraction`
      ],
      'Neurology': [
        `Develop symptom improvement tracker: "Measuring ${submission.product_name} Efficacy"`,
        `Structure dosing information: "Starting Dose → Titration → Maintenance" flow`,
        `Create caregiver resource section with actionable bullet points`,
        `Build cognitive assessment integration: "Track Your Progress with ${submission.product_name}"`
      ]
    }

    return recommendations[submission.product_name] || 
           defaultByArea[submission.therapeutic_area] || 
           [
             `Create structured comparison: "${submission.product_name} vs Current Standard of Care"`,
             `Build Q&A content for: "How does ${submission.product_name} work?" with visual diagrams`,
             `Add patient eligibility checker with clear yes/no criteria`,
             `Structure clinical data with headers: "Efficacy", "Safety", "Quality of Life"`
           ]
  }

  const geoRecommendations = getGeoRecommendations()

  const sections = [
    {
      id: 'keywords',
      title: 'Keyword Strategy',
      icon: <Hash className="h-5 w-5" />,
      collapsible: false,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          {/* Primary Keywords */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Keywords</h4>
            <div className="space-y-2">
              {(submission.seo_keywords || []).map((keyword: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{keyword}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Search Vol: ~12K/mo</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={keywordApprovals[keyword] !== false}
                        onChange={(e) => setKeywordApprovals({
                          ...keywordApprovals,
                          [keyword]: e.target.checked
                        })}
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs">Approve</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long-tail Keywords */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Long-tail Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {(submission.long_tail_keywords || []).map((keyword: string, index: number) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'questions',
      title: 'Consumer Questions & Search Intent',
      icon: <MessageSquare className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-3">
          {(submission.consumer_questions || []).map((question: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-0.5 text-blue-500">
                <MessageSquare className="h-4 w-4" />
              </div>
              <p className="text-sm text-gray-700">{question}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'optimization',
      title: 'Content Optimization',
      icon: <TrendingUp className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">H1 Tag</h4>
            <p className="text-sm bg-gray-50 p-3 rounded font-medium">
              {submission.h1_tag || `${submission.product_name}: Revolutionary ${submission.therapeutic_area} Treatment`}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Meta Title</h4>
            <p className="text-sm bg-gray-50 p-3 rounded">
              {submission.meta_title || submission.h1_tag || `${submission.product_name}: ${submission.therapeutic_area} Treatment | Brand Name`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Character count: {(submission.meta_title || submission.h1_tag || `${submission.product_name}: ${submission.therapeutic_area} Treatment | Brand Name`).length} / 60 recommended</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Meta Description</h4>
            <p className="text-sm bg-gray-50 p-3 rounded">
              {submission.meta_description || `Discover ${submission.product_name}, a breakthrough treatment for ${submission.medical_indication}. Learn about efficacy, safety, and patient outcomes. Healthcare professionals click here.`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Character count: {(submission.meta_description || `Discover ${submission.product_name}, a breakthrough treatment for ${submission.medical_indication}. Learn about efficacy, safety, and patient outcomes. Healthcare professionals click here.`).length} / 160 recommended</p>
          </div>
        </div>
      )
    },
    {
      id: 'geo',
      title: 'Generative Engine Optimization (GEO)',
      icon: <Bot className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-900">
              <span className="font-medium">AI Optimization Score:</span> {submission.product_name === 'Xeltoris™ (evolocumab)' ? '94' : submission.product_name === 'NeurogeniX®' ? '91' : submission.product_name === 'ImmunoShield™' ? '93' : '89'}/100
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Product-specific optimizations for {submission.product_name} in {submission.therapeutic_area}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Specific GEO Recommendations:</p>
            {geoRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  id={`geo-${index}`}
                  className="rounded text-purple-600 mt-0.5" 
                />
                <label 
                  htmlFor={`geo-${index}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {recommendation}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-xs text-purple-800">
              <span className="font-semibold">Priority Action:</span> Implement structured data for {submission.key_differentiators?.[0] || 'key differentiator'} 
              to improve visibility in AI-powered search results and medical knowledge graphs.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      title: 'Review Notes',
      icon: <FileText className="h-5 w-5" />,
      collapsible: false,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal SEO Notes
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Technical notes for the SEO team..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback for Client
            </label>
            <textarea
              value={clientFeedback}
              onChange={(e) => setClientFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Recommendations for content optimization..."
            />
          </div>
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
      disabled: submitReview.isPending
    },
    {
      label: 'Approve & Send to Client',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('approve'),
      variant: 'primary' as const,
      disabled: submitReview.isPending
    }
  ]

  return (
    <UnifiedReviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`SEO Review: ${submission.product_name}`}
      subtitle={`${submission.therapeutic_area} • ${submission.stage}`}
      icon={<Search className="h-6 w-6 text-blue-600" />}
      headerBadge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          SEO Review
        </span>
      }
      sections={sections}
      actions={actions}
    />
  )
}
