import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  X,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  Shield,
  Users,
  Bot,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  AlertCircle,
  Hash,
  Heading1,
  Heading2,
  Code,
  Brain,
  Sparkles
} from 'lucide-react'

interface SEOReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

interface KeywordStatus {
  [key: string]: {
    status: 'approved' | 'rejected' | null
    comments?: {
      internal?: string
      client?: string
      ai?: string
    }
  }
}

type CommentType = 'internal' | 'client' | 'ai'

export default function SEOReviewModal({ isOpen, onClose, submission }: SEOReviewModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['strategy']))
  const [keywordStatuses, setKeywordStatuses] = useState<KeywordStatus>({})
  const [activeCommentKey, setActiveCommentKey] = useState<string | null>(null)
  const [activeCommentType, setActiveCommentType] = useState<CommentType>('internal')
  const [commentText, setCommentText] = useState('')
  const [showFinalReview, setShowFinalReview] = useState(false)
  const [finalComments, setFinalComments] = useState({
    internal: '',
    client: '',
    ai: ''
  })
  const [strategyComments, setStrategyComments] = useState({
    client: '',
    ai: ''
  })

  const updateWorkflowStage = useMutation({
    mutationFn: async ({ stage, comments }: { stage: string; comments?: any }) => {
      const updateData: any = { 
        workflow_stage: stage,
        keyword_statuses: keywordStatuses,
        review_comments: comments,
        strategy_comments: strategyComments
      }
      
      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submission.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      onClose()
    }
  })

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleKeywordAction = (keyword: string, type: string, action: 'approved' | 'rejected') => {
    const key = `${type}-${keyword}`
    setKeywordStatuses(prev => ({
      ...prev,
      [key]: { 
        ...prev[key],
        status: action 
      }
    }))
  }

  const handleKeywordComment = (keyword: string, type: string, commentType: CommentType) => {
    const key = `${type}-${keyword}`
    
    if (activeCommentKey === key && activeCommentType === commentType) {
      // Save comment
      if (commentText.trim()) {
        setKeywordStatuses(prev => ({
          ...prev,
          [key]: { 
            ...prev[key],
            comments: {
              ...prev[key]?.comments,
              [commentType]: commentText
            }
          }
        }))
      }
      setActiveCommentKey(null)
      setCommentText('')
    } else {
      // Open comment
      setActiveCommentKey(key)
      setActiveCommentType(commentType)
      setCommentText(keywordStatuses[key]?.comments?.[commentType] || '')
    }
  }

  const getKeywordStatus = (keyword: string, type: string) => {
    const key = `${type}-${keyword}`
    return keywordStatuses[key]
  }

  const handleApprove = () => {
    setFinalComments({ internal: '', client: '', ai: '' })
    updateWorkflowStage.mutate({ 
      stage: 'Client_Review',
      comments: { internal: '', client: 'Approved for client review', ai: '' }
    })
  }

  const handleReject = () => {
    setShowFinalReview(true)
  }

  const handleRequestChanges = () => {
    setShowFinalReview(true)
  }

  const submitWithComments = (action: 'reject' | 'request_changes') => {
    const stage = action === 'reject' ? 'Rejected' : 'Revision_Requested'
    updateWorkflowStage.mutate({ 
      stage,
      comments: finalComments
    })
  }

  // Generated SEO Strategy Content
  const strategyContent = {
    executive_summary: `
Based on our comprehensive SEO analysis for ${submission.product_name}, we've identified significant opportunities to capture high-intent search traffic in the ${submission.therapeutic_area} space. 

Key findings:
• Market opportunity: 145,000+ monthly searches for related terms
• Competition level: Moderate, with clear gaps in patient-focused content
• Projected impact: 150-200% traffic increase within 6 months
• Estimated ROI: 3.5x based on patient acquisition value
    `,
    competitive_landscape: {
      overview: "Analysis of top 5 competitors reveals strategic opportunities:",
      competitors: [
        {
          name: "ClinicalTrials.gov",
          domain_authority: 91,
          monthly_traffic: "2.3M",
          strengths: ["Government authority", "Comprehensive database", "High trust"],
          weaknesses: ["Poor UX", "No patient journey content", "Generic information"],
          opportunities: ["Create patient-friendly content", "Local SEO optimization", "Visual trial process guides"]
        },
        {
          name: "Mayo Clinic Trials",
          domain_authority: 89,
          monthly_traffic: "450K",
          strengths: ["Brand recognition", "Medical expertise", "Quality content"],
          weaknesses: ["Limited geographic reach", "Competitive space", "No testimonials"],
          opportunities: ["Target non-Mayo locations", "Patient success stories", "Cost/insurance content"]
        },
        {
          name: "Cancer.org Trials",
          domain_authority: 87,
          monthly_traffic: "380K",
          strengths: ["Non-profit trust", "Educational resources", "Community"],
          weaknesses: ["Not trial-focused", "Broad content", "Limited trial details"],
          opportunities: ["Specific trial information", "Enrollment process content", "Trial-specific FAQs"]
        }
      ]
    },
    keyword_strategy: {
      primary_focus: [
        { keyword: "phase 3 clinical trials [indication]", volume: 12100, difficulty: "Medium", opportunity: "High" },
        { keyword: "[drug name] clinical trial", volume: 8400, difficulty: "Low", opportunity: "Very High" },
        { keyword: "[indication] treatment studies near me", volume: 6700, difficulty: "Low", opportunity: "Very High" }
      ],
      content_gaps: [
        "Patient eligibility checker tool",
        "Trial timeline visualizations",
        "Insurance/financial assistance guides",
        "Caregiver resources",
        "Multi-language content",
        "Video testimonials"
      ]
    },
    technical_recommendations: [
      {
        priority: "High",
        item: "Implement MedicalStudy schema markup",
        impact: "Enables rich snippets in search results",
        effort: "Low"
      },
      {
        priority: "High",
        item: "Optimize Core Web Vitals",
        impact: "Improve rankings and user experience",
        effort: "Medium",
        details: "Current LCP: 3.2s → Target: <2.5s"
      },
      {
        priority: "Medium",
        item: "Create location-specific landing pages",
        impact: "Capture local search traffic",
        effort: "Medium"
      },
      {
        priority: "Medium",
        item: "Mobile-first redesign",
        impact: "60% of searches are mobile",
        effort: "High"
      }
    ],
    content_calendar: {
      month_1: [
        "Launch optimized main trial page",
        "Create 5 location-specific pages",
        "Publish patient eligibility guide"
      ],
      month_2: [
        "Add 10 FAQ pages",
        "Create insurance/cost guide",
        "Launch patient testimonial section"
      ],
      month_3: [
        "Develop trial process visualizations",
        "Add caregiver resources",
        "Implement chat functionality"
      ]
    },
    projected_results: {
      traffic: {
        month_1: "+25-35%",
        month_3: "+75-100%",
        month_6: "+150-200%"
      },
      conversions: {
        baseline: "Current: 2.3% inquiry rate",
        projected: "Target: 4.5-5.5% inquiry rate",
        volume: "80-120 additional qualified inquiries/month"
      },
      roi: {
        investment: "SEO implementation: $XX,XXX",
        return: "Projected value: $XXX,XXX (3.5x ROI)",
        breakeven: "Month 2-3"
      }
    }
  }

  // Mock SEO content for other sections
  const seoContent = {
    seo_keywords: submission.seo_keywords || [
      'cancer treatment clinical trial',
      'phase 3 oncology study',
      'advanced cancer therapy',
      'tumor treatment research',
      'cancer drug development',
      'oncology clinical research',
      'cancer patient recruitment',
      'innovative cancer treatment',
      'cancer therapy trial',
      'oncology drug testing'
    ],
    longtail_keywords: submission.long_tail_keywords || [
      'phase 3 cancer clinical trial near me',
      'how to join oncology research study',
      'advanced cancer treatment clinical trials 2024',
      'eligibility criteria for cancer drug trials',
      'benefits of participating in cancer research',
      'new cancer treatment options in development',
      'oncology clinical trial patient experiences',
      'cancer research study compensation and benefits',
      'what to expect in phase 3 cancer trials',
      'finding the right oncology clinical trial'
    ],
    consumer_questions: submission.consumer_questions || [
      'What are the eligibility requirements for this cancer clinical trial?',
      'How long does the clinical trial last?',
      'Are there any costs associated with participating?',
      'What are the potential side effects of the treatment?',
      'Will I receive a placebo or the actual treatment?',
      'How often will I need to visit the trial site?',
      'Can I continue my current cancer treatments?',
      'What happens after the trial ends?',
      'Is travel assistance available for trial participants?',
      'How is my privacy protected during the trial?'
    ],
    h1_tags: [
      submission.h1_tag || 'Advanced Cancer Treatment Clinical Trial - Phase 3 Study',
      'Join Our Groundbreaking Oncology Research Study',
      'Clinical Trial for [Drug Name]: New Hope for Cancer Patients'
    ],
    h2_tags: [
      'Eligibility Requirements and How to Apply',
      'What to Expect During the Clinical Trial',
      'Benefits of Participating in Our Study',
      'Frequently Asked Questions About the Trial',
      'Contact Our Research Team Today',
      'Financial Support and Travel Assistance Available'
    ],
    schema_markup: {
      type: 'MedicalStudy',
      properties: [
        '@context: "https://schema.org"',
        '@type: "MedicalStudy"',
        'name: "Phase 3 Clinical Trial for [Drug Name]"',
        'description: "Clinical trial description"',
        'sponsor: "Organization Name"',
        'status: "Recruiting"',
        'phase: "Phase 3"',
        'studyLocation: [Multiple locations]',
        'healthCondition: "[Medical Indication]"'
      ]
    },
    geo_optimization: {
      title: "Generative Engine Optimization (GEO)",
      description: "Optimizing content for AI-powered search engines and language models",
      strategies: [
        {
          category: "Content Structure",
          items: [
            "Clear, hierarchical information architecture",
            "Comprehensive FAQ sections with natural language",
            "Detailed explanations with context",
            "Structured data markup for AI comprehension"
          ]
        },
        {
          category: "Natural Language Optimization",
          items: [
            "Conversational tone and complete sentences",
            "Question-and-answer format content",
            "Contextual information for entity understanding",
            "Synonyms and related terminology"
          ]
        },
        {
          category: "AI-Friendly Features",
          items: [
            "Concise summaries at content beginning",
            "Bullet points for easy extraction",
            "Clear definitions and explanations",
            "Authoritative and factual content"
          ]
        },
        {
          category: "Technical Implementation",
          items: [
            "JSON-LD structured data",
            "OpenGraph and meta descriptions",
            "Clean, semantic HTML markup",
            "Fast page load times for crawlers"
          ]
        }
      ]
    }
  }

  const renderKeywordItem = (keyword: string, index: number, type: string) => {
    const status = getKeywordStatus(keyword, type)
    const key = `${type}-${keyword}`
    const isCommenting = activeCommentKey === key

    return (
      <div key={index} className="space-y-2">
        <div className={`p-3 rounded-lg transition-all ${
          status?.status === 'approved' ? 'bg-green-50 border border-green-200' : 
          status?.status === 'rejected' ? 'bg-red-50 border border-red-200' : 
          'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <span className="text-sm font-medium text-gray-900">{keyword}</span>
              {status?.status && (
                <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                  status.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleKeywordAction(keyword, type, 'approved')}
                className={`p-1.5 rounded text-sm transition-colors ${
                  status?.status === 'approved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                }`}
                title="Approve"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              
              <button
                onClick={() => handleKeywordAction(keyword, type, 'rejected')}
                className={`p-1.5 rounded text-sm transition-colors ${
                  status?.status === 'rejected' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                }`}
                title="Reject"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              <div className="flex items-center border-l pl-2 gap-1">
                <button
                  onClick={() => handleKeywordComment(keyword, type, 'internal')}
                  className={`p-1.5 rounded text-sm transition-colors ${
                    status?.comments?.internal || (isCommenting && activeCommentType === 'internal')
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                  }`}
                  title="Internal Comment"
                >
                  <Shield className="h-3.5 w-3.5" />
                </button>
                
                <button
                  onClick={() => handleKeywordComment(keyword, type, 'client')}
                  className={`p-1.5 rounded text-sm transition-colors ${
                    status?.comments?.client || (isCommenting && activeCommentType === 'client')
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                  title="Client Comment"
                >
                  <Users className="h-3.5 w-3.5" />
                </button>
                
                <button
                  onClick={() => handleKeywordComment(keyword, type, 'ai')}
                  className={`p-1.5 rounded text-sm transition-colors ${
                    status?.comments?.ai || (isCommenting && activeCommentType === 'ai')
                      ? 'bg-orange-600 text-white' 
                      : 'bg-white text-orange-600 border border-orange-600 hover:bg-orange-50'
                  }`}
                  title="AI Feedback"
                >
                  <Bot className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isCommenting && (
          <div className="ml-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-500">
                {activeCommentType === 'internal' && 'Internal Note (not visible to client)'}
                {activeCommentType === 'client' && 'Client Feedback (visible in client portal)'}
                {activeCommentType === 'ai' && 'AI Instructions (for regeneration)'}
              </span>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                activeCommentType === 'internal' ? 'Add internal notes...' :
                activeCommentType === 'client' ? 'Add feedback for client...' :
                'Add instructions for AI regeneration...'
              }
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setActiveCommentKey(null)
                  setCommentText('')
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleKeywordComment(keyword, type, activeCommentType)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
        
        {/* Display existing comments */}
        {status?.comments && (
          <div className="ml-4 space-y-2">
            {status.comments.internal && (
              <div className="p-2 bg-purple-50 border-l-2 border-purple-400 text-sm">
                <span className="font-medium text-purple-700">Internal: </span>
                <span className="text-gray-700">{status.comments.internal}</span>
              </div>
            )}
            {status.comments.client && (
              <div className="p-2 bg-blue-50 border-l-2 border-blue-400 text-sm">
                <span className="font-medium text-blue-700">Client: </span>
                <span className="text-gray-700">{status.comments.client}</span>
              </div>
            )}
            {status.comments.ai && (
              <div className="p-2 bg-orange-50 border-l-2 border-orange-400 text-sm">
                <span className="font-medium text-orange-700">AI: </span>
                <span className="text-gray-700">{status.comments.ai}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900">
                          {submission.product_name}
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-gray-500">
                          {submission.stage} • {submission.therapeutic_area} • {submission.target_audience?.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                          <Download className="h-4 w-4 mr-2 inline" />
                          Export
                        </button>
                        <button
                          onClick={onClose}
                          className="rounded-md p-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6 space-y-6">
                    {/* SEO Strategy Document - First */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-blue-200 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition-colors"
                        onClick={() => toggleSection('strategy')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">SEO Strategy & Competitive Analysis</h2>
                        </div>
                        {expandedSections.has('strategy') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('strategy') && (
                        <div className="p-6 bg-white/90">
                          {/* Executive Summary */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-line text-gray-700">{strategyContent.executive_summary}</p>
                            </div>
                          </div>

                          {/* Competitive Landscape */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Landscape</h3>
                            <p className="text-sm text-gray-600 mb-4">{strategyContent.competitive_landscape.overview}</p>
                            
                            <div className="space-y-4">
                              {strategyContent.competitive_landscape.competitors.map((comp, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                        <span>DA: {comp.domain_authority}</span>
                                        <span>Traffic: {comp.monthly_traffic}/mo</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-green-700 mb-1">Strengths:</p>
                                      <ul className="space-y-1">
                                        {comp.strengths.map((str, i) => (
                                          <li key={i} className="text-gray-600">• {str}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-medium text-red-700 mb-1">Weaknesses:</p>
                                      <ul className="space-y-1">
                                        {comp.weaknesses.map((weak, i) => (
                                          <li key={i} className="text-gray-600">• {weak}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-medium text-blue-700 mb-1">Our Opportunities:</p>
                                      <ul className="space-y-1">
                                        {comp.opportunities.map((opp, i) => (
                                          <li key={i} className="text-gray-600">• {opp}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Keyword Strategy */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Strategy</h3>
                            
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-900 mb-3">Primary Target Keywords:</h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monthly Volume</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {strategyContent.keyword_strategy.primary_focus.map((kw, idx) => (
                                      <tr key={idx}>
                                        <td className="px-4 py-2 text-sm text-gray-900">{kw.keyword}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{kw.volume.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-sm">
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            kw.difficulty === 'Low' ? 'bg-green-100 text-green-700' :
                                            kw.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            {kw.difficulty}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            kw.opportunity === 'Very High' ? 'bg-green-100 text-green-700' :
                                            'bg-blue-100 text-blue-700'
                                          }`}>
                                            {kw.opportunity}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Content Gap Opportunities:</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {strategyContent.keyword_strategy.content_gaps.map((gap, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{gap}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Technical Recommendations */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical SEO Recommendations</h3>
                            <div className="space-y-3">
                              {strategyContent.technical_recommendations.map((rec, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{rec.item}</h4>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {rec.priority} Priority
                                      </span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        rec.effort === 'Low' ? 'bg-green-100 text-green-700' :
                                        rec.effort === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {rec.effort} Effort
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600">{rec.impact}</p>
                                  {rec.details && (
                                    <p className="text-sm text-gray-500 mt-1">{rec.details}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Implementation Timeline */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">90-Day Implementation Timeline</h3>
                            <div className="grid grid-cols-3 gap-4">
                              {Object.entries(strategyContent.content_calendar).map(([month, tasks]) => (
                                <div key={month} className="bg-blue-50 rounded-lg p-4">
                                  <h4 className="font-medium text-blue-900 mb-3 capitalize">{month.replace('_', ' ')}</h4>
                                  <ul className="space-y-2">
                                    {tasks.map((task, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                                        <Check className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                        {task}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Projected Results */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projected Results</h3>
                            <div className="grid grid-cols-3 gap-6">
                              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                <h4 className="font-medium text-gray-900 mb-2">Traffic Growth</h4>
                                <div className="space-y-1 text-sm">
                                  <p>Month 1: {strategyContent.projected_results.traffic.month_1}</p>
                                  <p>Month 3: {strategyContent.projected_results.traffic.month_3}</p>
                                  <p className="font-semibold text-blue-700">Month 6: {strategyContent.projected_results.traffic.month_6}</p>
                                </div>
                              </div>
                              
                              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                                <h4 className="font-medium text-gray-900 mb-2">Conversion Impact</h4>
                                <div className="space-y-1 text-sm">
                                  <p>{strategyContent.projected_results.conversions.baseline}</p>
                                  <p className="font-semibold text-green-700">{strategyContent.projected_results.conversions.projected}</p>
                                  <p>{strategyContent.projected_results.conversions.volume}</p>
                                </div>
                              </div>
                              
                              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                                <h4 className="font-medium text-gray-900 mb-2">ROI Projection</h4>
                                <div className="space-y-1 text-sm">
                                  <p>{strategyContent.projected_results.roi.investment}</p>
                                  <p className="font-semibold text-purple-700">{strategyContent.projected_results.roi.return}</p>
                                  <p>Breakeven: {strategyContent.projected_results.roi.breakeven}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Strategy Comments Section */}
                          <div className="border-t pt-6">
                            <h4 className="font-medium text-gray-900 mb-4">Strategy Review Comments</h4>
                            <div className="space-y-4">
                              <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  Client Comments
                                </label>
                                <textarea
                                  value={strategyComments.client}
                                  onChange={(e) => setStrategyComments({ ...strategyComments, client: e.target.value })}
                                  placeholder="Add comments for the client about the strategy..."
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                                  <Bot className="h-4 w-4 text-orange-600" />
                                  AI Instructions
                                </label>
                                <textarea
                                  value={strategyComments.ai}
                                  onChange={(e) => setStrategyComments({ ...strategyComments, ai: e.target.value })}
                                  placeholder="Add instructions for AI to improve the strategy..."
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Strategy Review Actions */}
                          <div className="pt-6 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Review the complete SEO strategy above
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleKeywordAction('seo-strategy', 'strategy', 'approved')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  getKeywordStatus('seo-strategy', 'strategy')?.status === 'approved'
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                                }`}
                              >
                                <Check className="h-4 w-4 mr-1 inline" />
                                Approve Strategy
                              </button>
                              
                              <button
                                onClick={() => handleKeywordAction('seo-strategy', 'strategy', 'rejected')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  getKeywordStatus('seo-strategy', 'strategy')?.status === 'rejected'
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                                }`}
                              >
                                <X className="h-4 w-4 mr-1 inline" />
                                Request Strategy Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SEO Keywords Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-green-200 flex items-center justify-between cursor-pointer hover:bg-green-50/50 transition-colors"
                        onClick={() => toggleSection('keywords')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-600 rounded-lg">
                            <Hash className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">SEO Keywords ({seoContent.seo_keywords.length})</h2>
                        </div>
                        {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('keywords') && (
                        <div className="p-6 bg-white/90 space-y-3">
                          {seoContent.seo_keywords.map((keyword: string, index: number) => 
                            renderKeywordItem(keyword, index, 'seo')
                          )}
                        </div>
                      )}
                    </div>

                    {/* Longtail Keywords Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-purple-200 flex items-center justify-between cursor-pointer hover:bg-purple-50/50 transition-colors"
                        onClick={() => toggleSection('longtail')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-600 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Longtail Keywords ({seoContent.longtail_keywords.length})</h2>
                        </div>
                        {expandedSections.has('longtail') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('longtail') && (
                        <div className="p-6 bg-white/90 space-y-3">
                          {seoContent.longtail_keywords.map((keyword: string, index: number) => 
                            renderKeywordItem(keyword, index, 'longtail')
                          )}
                        </div>
                      )}
                    </div>

                    {/* Consumer Questions Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-orange-200 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors"
                        onClick={() => toggleSection('questions')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-600 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Consumer Questions ({seoContent.consumer_questions.length})</h2>
                        </div>
                        {expandedSections.has('questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('questions') && (
                        <div className="p-6 bg-white/90 space-y-3">
                          {seoContent.consumer_questions.map((question: string, index: number) => 
                            renderKeywordItem(question, index, 'question')
                          )}
                        </div>
                      )}
                    </div>

                    {/* H1 & H2 Tags Section */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-indigo-200 flex items-center justify-between cursor-pointer hover:bg-indigo-50/50 transition-colors"
                        onClick={() => toggleSection('headings')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-600 rounded-lg">
                            <Heading1 className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">H1 & H2 Tags</h2>
                        </div>
                        {expandedSections.has('headings') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('headings') && (
                        <div className="p-6 bg-white/90">
                          <div className="mb-6">
                            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Heading1 className="h-5 w-5 text-indigo-600" />
                              H1 Tags (Page Titles)
                            </h3>
                            <div className="space-y-3">
                              {seoContent.h1_tags.map((tag: string, index: number) => 
                                renderKeywordItem(tag, index, 'h1')
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Heading2 className="h-5 w-5 text-indigo-600" />
                              H2 Tags (Section Headers)
                            </h3>
                            <div className="space-y-3">
                              {seoContent.h2_tags.map((tag: string, index: number) => 
                                renderKeywordItem(tag, index, 'h2')
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Schema Markup Section */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-300 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                        onClick={() => toggleSection('schema')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-600 rounded-lg">
                            <Code className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Schema Markup</h2>
                        </div>
                        {expandedSections.has('schema') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('schema') && (
                        <div className="p-6 bg-white/90">
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-3">
                              Structured data implementation for enhanced search visibility:
                            </p>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-sm text-gray-100">
                                <code>{`{
  ${seoContent.schema_markup.properties.join(',\n  ')}
}`}</code>
                              </pre>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-gray-500">
                              Review the schema markup structure
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleKeywordAction('schema-markup', 'schema', 'approved')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  getKeywordStatus('schema-markup', 'schema')?.status === 'approved'
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                                }`}
                              >
                                <Check className="h-4 w-4 mr-1 inline" />
                                Approve Schema
                              </button>
                              
                              <button
                                onClick={() => handleKeywordAction('schema-markup', 'schema', 'rejected')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  getKeywordStatus('schema-markup', 'schema')?.status === 'rejected'
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                                }`}
                              >
                                <X className="h-4 w-4 mr-1 inline" />
                                Request Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GEO (Generative Engine Optimization) Section */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 shadow-sm">
                      <div
                        className="px-6 py-4 border-b border-teal-200 flex items-center justify-between cursor-pointer hover:bg-teal-50/50 transition-colors"
                        onClick={() => toggleSection('geo')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-600 rounded-lg">
                            <Brain className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Generative Engine Optimization (GEO)</h2>
                        </div>
                        {expandedSections.has('geo') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      {expandedSections.has('geo') && (
                        <div className="p-6 bg-white/90">
                          <div className="mb-6">
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                              <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">{seoContent.geo_optimization.title}</h3>
                                  <p className="text-sm text-gray-700">{seoContent.geo_optimization.description}</p>
                                </div>
                              </div>
                            </div>

                            {seoContent.geo_optimization.strategies.map((strategy, idx) => (
                              <div key={idx} className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  {strategy.category === 'Content Structure' && <FileText className="h-4 w-4 text-teal-600" />}
                                  {strategy.category === 'Natural Language Optimization' && <MessageSquare className="h-4 w-4 text-teal-600" />}
                                  {strategy.category === 'AI-Friendly Features' && <Bot className="h-4 w-4 text-teal-600" />}
                                  {strategy.category === 'Technical Implementation' && <Code className="h-4 w-4 text-teal-600" />}
                                  {strategy.category}
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {strategy.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                      <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t">
                            <div className="text-sm text-gray-500">
                              Review the GEO optimization strategy
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleKeywordAction('geo-strategy', 'geo', 'approved')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  getKeywordStatus('geo-strategy', 'geo')?.status === 'approved'
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                                }`}
                              >
                                <Check className="h-4 w-4 mr-1 inline" />
                                Approve GEO Strategy
                              </button>
                              
                              <button
                                onClick={() => handleKeywordAction('geo-strategy', 'geo', 'rejected')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  getKeywordStatus('geo-strategy', 'geo')?.status === 'rejected'
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                                }`}
                              >
                                <X className="h-4 w-4 mr-1 inline" />
                                Request Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <button
                        onClick={handleReject}
                        className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2 inline" />
                        Reject All
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={handleRequestChanges}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                          <MessageSquare className="h-4 w-4 mr-2 inline" />
                          Request Changes
                        </button>
                        <button
                          onClick={handleApprove}
                          disabled={updateWorkflowStage.isPending}
                          className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 inline" />
                          Approve & Send to Client
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

      {/* Final Review Modal */}
      {showFinalReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {finalComments === finalComments ? 'Request Changes' : 'Reject Submission'}
            </h3>
            
            <div className="space-y-6">
              {/* Internal Comments */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Internal Comments (Team Only)
                </label>
                <textarea
                  value={finalComments.internal}
                  onChange={(e) => setFinalComments({ ...finalComments, internal: e.target.value })}
                  placeholder="Add notes for the internal team..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              {/* Client Comments */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Client Feedback (Visible to Client)
                </label>
                <textarea
                  value={finalComments.client}
                  onChange={(e) => setFinalComments({ ...finalComments, client: e.target.value })}
                  placeholder="Add feedback for the client..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* AI Instructions */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  <Bot className="h-4 w-4 text-orange-600" />
                  AI Regeneration Instructions
                </label>
                <textarea
                  value={finalComments.ai}
                  onChange={(e) => setFinalComments({ ...finalComments, ai: e.target.value })}
                  placeholder="Add specific instructions for AI to improve the content..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFinalReview(false)
                  setFinalComments({ internal: '', client: '', ai: '' })
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => submitWithComments('request_changes')}
                disabled={!finalComments.client.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Change Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
