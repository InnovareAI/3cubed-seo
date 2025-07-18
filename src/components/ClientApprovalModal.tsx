import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  X,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Briefcase,
  Globe,
  BarChart3,
  AlertCircle,
  Info,
  Building2,
  ArrowRight
} from 'lucide-react'

interface ClientApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
  seoReviewData?: any
}

interface ReviewSection {
  id: string
  title: string
  icon: JSX.Element
  description: string
  items: ReviewItem[]
}

interface ReviewItem {
  id: string
  question: string
  helpText: string
  type: 'radio' | 'checkbox' | 'text' | 'scale'
  options?: string[]
  required: boolean
  businessImpact?: 'high' | 'medium' | 'low'
}

export default function ClientApprovalModal({ isOpen, onClose, submission }: ClientApprovalModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['brand']))
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [showSummary, setShowSummary] = useState(false)
  
  // Client review focuses on brand and business, NOT medical/legal (that's MLR's job)
  const reviewSections: ReviewSection[] = [
    {
      id: 'brand',
      title: 'Brand Alignment',
      icon: <Briefcase className="h-5 w-5" />,
      description: 'Ensure content aligns with brand guidelines and positioning',
      items: [
        {
          id: 'brand-voice',
          question: 'Does the content maintain our brand voice and tone?',
          helpText: 'Consider: Professional yet approachable, empathetic, innovative',
          type: 'radio',
          options: ['Perfectly aligned', 'Mostly aligned', 'Needs adjustment', 'Off-brand'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'key-messages',
          question: 'Are our three key brand messages clearly communicated?',
          helpText: 'Innovation in treatment, Patient-first approach, Proven efficacy',
          type: 'checkbox',
          options: ['Innovation highlighted', 'Patient focus clear', 'Efficacy emphasized', 'All messages present'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'differentiation',
          question: 'Is our competitive differentiation clear?',
          helpText: 'Without disparaging competitors, does content show our unique value?',
          type: 'radio',
          options: ['Very clear', 'Somewhat clear', 'Unclear', 'Missing'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'visual-guidelines',
          question: 'Do content references align with visual brand guidelines?',
          helpText: 'Colors, imagery descriptions, iconography references',
          type: 'radio',
          options: ['Fully compliant', 'Minor adjustments needed', 'Major changes required'],
          required: false,
          businessImpact: 'low'
        }
      ]
    },
    {
      id: 'audience',
      title: 'Target Audience Fit',
      icon: <Users className="h-5 w-5" />,
      description: 'Validate content resonates with intended audiences',
      items: [
        {
          id: 'hcp-appropriate',
          question: 'Is the content appropriate for our HCP audience?',
          helpText: 'Technical depth, clinical relevance, professional tone',
          type: 'radio',
          options: ['Perfectly targeted', 'Well suited', 'Needs refinement', 'Misaligned'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'patient-appropriate',
          question: 'Will patient-directed content resonate with our target demographics?',
          helpText: 'Age, health literacy, cultural sensitivity',
          type: 'radio',
          options: ['Excellent fit', 'Good fit', 'Needs adjustment', 'Poor fit'],
          required: true,
          businessImpact: 'medium'
        },
        {
          id: 'payer-considerations',
          question: 'Does content support payer value propositions?',
          helpText: 'Cost-effectiveness, outcomes data, economic value',
          type: 'radio',
          options: ['Strongly supports', 'Adequately supports', 'Weakly supports', 'Not addressed'],
          required: false,
          businessImpact: 'medium'
        }
      ]
    },
    {
      id: 'commercial',
      title: 'Commercial Strategy',
      icon: <Target className="h-5 w-5" />,
      description: 'Ensure SEO strategy supports business objectives',
      items: [
        {
          id: 'launch-timeline',
          question: 'Does the content strategy align with our launch timeline?',
          helpText: 'Consider pre-launch awareness building and post-launch momentum',
          type: 'radio',
          options: ['Perfectly timed', 'Well aligned', 'Minor timing issues', 'Major conflicts'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'sales-enablement',
          question: 'Will this content support our sales team efforts?',
          helpText: 'Provides value for HCP discussions, addresses common objections',
          type: 'radio',
          options: ['Excellent support', 'Good support', 'Limited support', 'No clear value'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'market-positioning',
          question: 'Does content reinforce our market positioning?',
          helpText: `As a ${submission.positioning || 'premium innovation'} in ${submission.therapeutic_area}`,
          type: 'scale',
          options: ['1', '2', '3', '4', '5'],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'conversion-path',
          question: 'Is there a clear path to commercial objectives?',
          helpText: 'HCP education → Trial interest → Prescribing consideration',
          type: 'radio',
          options: ['Very clear', 'Mostly clear', 'Somewhat unclear', 'No clear path'],
          required: true,
          businessImpact: 'medium'
        }
      ]
    },
    {
      id: 'regional',
      title: 'Regional & Market Considerations',
      icon: <Globe className="h-5 w-5" />,
      description: 'Account for geographic and market-specific needs',
      items: [
        {
          id: 'global-scalability',
          question: 'Can this content strategy scale globally?',
          helpText: 'Consider translation, cultural adaptation, regional regulations',
          type: 'radio',
          options: ['Easily scalable', 'Scalable with modifications', 'Limited scalability', 'US-only'],
          required: false,
          businessImpact: 'medium'
        },
        {
          id: 'market-dynamics',
          question: 'Does content account for local market dynamics?',
          helpText: 'Competitor presence, payer landscape, treatment patterns',
          type: 'checkbox',
          options: ['US market addressed', 'EU considerations', 'APAC relevance', 'LATAM applicability'],
          required: false,
          businessImpact: 'low'
        }
      ]
    },
    {
      id: 'measurement',
      title: 'Success Metrics & KPIs',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Validate alignment with business performance indicators',
      items: [
        {
          id: 'kpi-alignment',
          question: 'Which business KPIs will this SEO strategy impact?',
          helpText: 'Select all that apply',
          type: 'checkbox',
          options: [
            'Brand awareness lift',
            'HCP engagement rate',
            'Patient education metrics',
            'Lead generation volume',
            'Website traffic growth',
            'Share of voice'
          ],
          required: true,
          businessImpact: 'high'
        },
        {
          id: 'roi-confidence',
          question: 'Confidence level in achieving projected ROI?',
          helpText: 'Based on market conditions and competitive landscape',
          type: 'scale',
          options: ['1', '2', '3', '4', '5'],
          required: true,
          businessImpact: 'medium'
        }
      ]
    }
  ]

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const updateResponse = (itemId: string, value: any) => {
    setResponses(prev => ({ ...prev, [itemId]: value }))
  }

  const updateComment = (sectionId: string, comment: string) => {
    setComments(prev => ({ ...prev, [sectionId]: comment }))
  }

  // Calculate readiness for MLR
  const calculateReadiness = () => {
    const requiredItems = reviewSections.flatMap(s => s.items.filter(i => i.required))
    const completedRequired = requiredItems.filter(item => responses[item.id])
    const highImpactConcerns = requiredItems.filter(item => {
      const response = responses[item.id]
      if (!response) return false
      if (item.type === 'radio' && item.businessImpact === 'high') {
        const negativeResponses = ['Needs adjustment', 'Off-brand', 'Unclear', 'Missing', 'Misaligned', 'Poor fit', 'Major conflicts']
        return negativeResponses.includes(response)
      }
      return false
    })

    return {
      totalRequired: requiredItems.length,
      completed: completedRequired.length,
      highImpactConcerns: highImpactConcerns.length,
      isComplete: completedRequired.length === requiredItems.length,
      canProceed: completedRequired.length === requiredItems.length && highImpactConcerns.length === 0
    }
  }

  const readiness = calculateReadiness()

  const submitReview = useMutation({
    mutationFn: async (decision: 'approve' | 'revise') => {
      const updates = {
        workflow_stage: decision === 'approve' ? 'MLR_Review' : 'Client_Revision_Requested',
        client_review_responses: responses,
        client_review_comments: comments,
        client_reviewed_at: new Date().toISOString(),
        client_reviewed_by: 'Client User', // Would come from auth
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

  const renderReviewItem = (item: ReviewItem) => {
    const itemKey = item.id
    const value = responses[itemKey]

    return (
      <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {item.question}
              {item.required && <span className="text-red-500">*</span>}
              {item.businessImpact === 'high' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  High Impact
                </span>
              )}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>
          </div>
        </div>

        <div className="mt-3">
          {item.type === 'radio' && (
            <div className="space-y-2">
              {item.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={itemKey}
                    value={option}
                    checked={value === option}
                    onChange={(e) => updateResponse(itemKey, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {item.type === 'checkbox' && (
            <div className="space-y-2">
              {item.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : []
                      if (e.target.checked) {
                        updateResponse(itemKey, [...current, option])
                      } else {
                        updateResponse(itemKey, current.filter((v: string) => v !== option))
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {item.type === 'scale' && (
            <div className="flex items-center space-x-4">
              {item.options?.map((option) => (
                <label key={option} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name={itemKey}
                    value={option}
                    checked={value === option}
                    onChange={(e) => updateResponse(itemKey, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mt-1 text-sm text-gray-700">{option}</span>
                </label>
              ))}
              <span className="text-xs text-gray-500 ml-2">(1 = Low, 5 = High)</span>
            </div>
          )}

          {item.type === 'text' && (
            <textarea
              value={value || ''}
              onChange={(e) => updateResponse(itemKey, e.target.value)}
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              rows={2}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          Client Review: {submission.product_name}
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-gray-500">
                          Review SEO content for brand alignment and commercial objectives before MLR review
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>{readiness.completed} of {readiness.totalRequired} required items completed</span>
                        {readiness.highImpactConcerns > 0 && (
                          <span className="text-orange-600 font-medium">
                            {readiness.highImpactConcerns} high-impact concerns
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            readiness.canProceed ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${(readiness.completed / readiness.totalRequired) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Your Review Focus</p>
                          <p>As the brand owner, you're reviewing for:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>Brand voice and messaging consistency</li>
                            <li>Business and commercial alignment</li>
                            <li>Target audience appropriateness</li>
                          </ul>
                          <p className="mt-2 text-blue-800">
                            MLR will handle all medical accuracy, legal compliance, and regulatory requirements.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review Sections */}
                    <div className="space-y-4">
                      {reviewSections.map((section) => (
                        <div key={section.id} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-gray-600">{section.icon}</div>
                              <div className="text-left">
                                <h3 className="font-medium text-gray-900">{section.title}</h3>
                                <p className="text-sm text-gray-500">{section.description}</p>
                              </div>
                            </div>
                            {expandedSections.has(section.id) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>

                          {expandedSections.has(section.id) && (
                            <div className="p-4 space-y-4">
                              {section.items.map(renderReviewItem)}
                              
                              {/* Section Comments */}
                              <div className="mt-4 pt-4 border-t">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Additional Comments (Optional)
                                </label>
                                <textarea
                                  value={comments[section.id] || ''}
                                  onChange={(e) => updateComment(section.id, e.target.value)}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                  rows={2}
                                  placeholder="Any specific feedback for this section..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {readiness.isComplete ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-green-700 font-medium">
                                {readiness.canProceed 
                                  ? 'Ready for MLR review'
                                  : `${readiness.highImpactConcerns} high-impact concerns need addressing`
                                }
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-orange-600" />
                              <span className="text-orange-700 font-medium">
                                Complete all required items to proceed
                              </span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setShowSummary(true)}
                          disabled={!readiness.isComplete}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          Review Summary
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Summary
            </h3>
            
            {/* Key Findings */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Brand Alignment</h4>
                <p className="text-sm text-gray-700">
                  {responses['brand-voice'] || 'Not reviewed'} • 
                  Key messages: {(responses['key-messages'] as string[])?.length || 0}/4 present
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Commercial Readiness</h4>
                <p className="text-sm text-gray-700">
                  Launch alignment: {responses['launch-timeline'] || 'Not reviewed'} • 
                  Sales enablement: {responses['sales-enablement'] || 'Not reviewed'}
                </p>
              </div>

              {readiness.highImpactConcerns > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Areas Requiring Attention
                  </h4>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {reviewSections.flatMap(s => s.items).filter(item => {
                      const response = responses[item.id]
                      if (!response || item.businessImpact !== 'high') return false
                      const negativeResponses = ['Needs adjustment', 'Off-brand', 'Unclear', 'Missing', 'Misaligned', 'Poor fit', 'Major conflicts']
                      return negativeResponses.includes(response)
                    }).map(item => (
                      <li key={item.id}>{item.question}: {responses[item.id]}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                <p className="text-sm text-gray-700">
                  {readiness.canProceed 
                    ? "Content is ready for Medical, Legal, and Regulatory (MLR) review. The MLR team will verify all claims, ensure regulatory compliance, and confirm fair balance."
                    : "Address the identified concerns before proceeding to MLR review."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Back to Review
              </button>
              <button
                onClick={() => {
                  if (readiness.canProceed) {
                    submitReview.mutate('approve')
                  }
                }}
                disabled={!readiness.canProceed || submitReview.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2 inline" />
                Approve for MLR Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
