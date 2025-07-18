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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MessageCircle,
  Shield,
  Users,
  Bot,
  TrendingUp,
  Target,
  Search,
  Globe,
  BarChart3
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['strategy', 'keywords']))
  const [keywordStatuses, setKeywordStatuses] = useState<KeywordStatus>({})
  const [activeCommentKey, setActiveCommentKey] = useState<string | null>(null)
  const [activeCommentType, setActiveCommentType] = useState<CommentType>('internal')
  const [commentText, setCommentText] = useState('')

  const updateWorkflowStage = useMutation({
    mutationFn: async ({ stage, reason }: { stage: string; reason?: string }) => {
      const updateData: any = { 
        workflow_stage: stage,
        keyword_statuses: keywordStatuses 
      }
      if (reason) {
        updateData.rejection_reason = reason
        updateData.rejected_at = new Date().toISOString()
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

  // Mock SEO content for demo
  const seoContent = {
    strategy_overview: {
      executive_summary: "Based on our comprehensive SEO analysis, this clinical trial has significant search visibility opportunities in the oncology treatment space. The competitive landscape shows moderate competition with clear differentiation opportunities through targeted long-tail keywords and local SEO optimization.",
      competitive_analysis: {
        summary: "Analysis of top 5 competitors reveals gaps in patient-focused content and local trial information",
        competitors: [
          { name: "ClinicalTrials.gov", domain_authority: 91, strengths: "Authority, comprehensive listings", weaknesses: "Poor user experience, generic content" },
          { name: "Mayo Clinic Trials", domain_authority: 89, strengths: "Brand trust, medical authority", weaknesses: "Limited to Mayo locations" },
          { name: "Cancer.org Trials", domain_authority: 87, strengths: "Patient resources, educational content", weaknesses: "Not trial-focused" }
        ],
        opportunities: [
          "Create location-specific landing pages for each trial site",
          "Develop patient journey content missing from competitor sites",
          "Target underserved long-tail keywords with high intent"
        ]
      },
      search_volume_analysis: {
        total_monthly_volume: 145000,
        growth_trend: "+23% YoY",
        seasonal_patterns: "Peak searches in January and September",
        top_queries: [
          { query: "cancer clinical trials near me", volume: 12100, difficulty: "Medium" },
          { query: "phase 3 oncology trials", volume: 8400, difficulty: "High" },
          { query: "clinical trial eligibility cancer", volume: 6700, difficulty: "Low" }
        ]
      },
      content_gap_analysis: [
        "Patient testimonial content (0 competitors have this)",
        "Trial timeline and process visualization",
        "Insurance and financial assistance information",
        "Family/caregiver resources"
      ],
      technical_recommendations: [
        "Implement structured data for clinical trials",
        "Optimize Core Web Vitals (current LCP: 3.2s, target: <2.5s)",
        "Create mobile-first experience (60% of searches are mobile)",
        "Implement local schema for each trial location"
      ],
      projected_impact: {
        traffic_increase: "150-200% in 6 months",
        qualified_leads: "80-120 additional inquiries/month",
        roi_estimate: "3.5x based on patient acquisition value"
      }
    },
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
    h1_recommendations: [
      'Join Our Phase 3 Cancer Clinical Trial | Advanced Oncology Treatment Study',
      'Breakthrough Cancer Treatment Clinical Trial Now Enrolling Patients',
      'Phase 3 Oncology Research Study | Help Advance Cancer Care'
    ],
    h2_recommendations: [
      'Who Can Participate in This Clinical Trial',
      'Understanding the Clinical Trial Process',
      'Benefits of Joining Our Research Study',
      'What to Expect During the Trial',
      'Safety Monitoring and Patient Care',
      'Frequently Asked Questions',
      'How to Apply for the Clinical Trial',
      'Contact Our Research Team'
    ],
    meta_description: submission.meta_description || {
      text: 'Join our Phase 3 clinical trial for advanced cancer treatment. Learn about eligibility, benefits, and how to participate in this groundbreaking oncology research study.',
      length: 158
    },
    schema_markup: {
      "@context": "https://schema.org",
      "@type": "MedicalStudy",
      "name": "Phase 3 Oncology Clinical Trial",
      "description": "A phase 3 clinical trial evaluating an innovative treatment for advanced cancer",
      "sponsor": {
        "@type": "Organization",
        "name": submission.client_name || "Pharmaceutical Company"
      },
      "studyDesign": "Randomized controlled trial",
      "healthCondition": submission.medical_indication || "Advanced Cancer",
      "phase": "Phase 3",
      "studyLocation": {
        "@type": "AdministrativeArea",
        "name": "Multiple locations across the United States"
      }
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
              
              <button
                className="p-1.5 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm transition-colors ml-2"
                title="Ask AI"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
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

                <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-6 space-y-6">
                  {/* Strategy Overview Section - First */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('strategy')}
                    >
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-medium text-gray-900">SEO Strategy Overview & Competitive Analysis</h2>
                      </div>
                      {expandedSections.has('strategy') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('strategy') && (
                      <div className="p-6 space-y-6">
                        {/* Executive Summary */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Executive Summary</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {seoContent.strategy_overview.executive_summary}
                          </p>
                        </div>

                        {/* Competitive Analysis */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Competitive Landscape
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <p className="text-sm text-gray-700">{seoContent.strategy_overview.competitive_analysis.summary}</p>
                            
                            <div className="space-y-2">
                              {seoContent.strategy_overview.competitive_analysis.competitors.map((comp, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{comp.name}</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">DA: {comp.domain_authority}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="text-green-600">Strengths: {comp.strengths}</span> • 
                                    <span className="text-red-600 ml-1">Weaknesses: {comp.weaknesses}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3">
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">Key Opportunities:</h4>
                              <ul className="space-y-1">
                                {seoContent.strategy_overview.competitive_analysis.opportunities.map((opp, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                                    <span className="text-green-500 mr-2">•</span>
                                    {opp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Search Volume Analysis */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search Volume Analysis
                          </h3>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600">Total Monthly Volume</p>
                              <p className="text-lg font-semibold text-gray-900">{seoContent.strategy_overview.search_volume_analysis.total_monthly_volume.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600">Growth Trend</p>
                              <p className="text-lg font-semibold text-green-700">{seoContent.strategy_overview.search_volume_analysis.growth_trend}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600">Peak Season</p>
                              <p className="text-sm font-medium text-gray-900">{seoContent.strategy_overview.search_volume_analysis.seasonal_patterns}</p>
                            </div>
                          </div>
                        </div>

                        {/* Content Gap Analysis */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Content Gap Opportunities
                          </h3>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <ul className="space-y-2">
                              {seoContent.strategy_overview.content_gap_analysis.map((gap, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-center">
                                  <CheckCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Projected Impact */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Projected Impact
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                              <p className="text-2xl font-bold text-blue-700">{seoContent.strategy_overview.projected_impact.traffic_increase}</p>
                              <p className="text-xs text-gray-600">Traffic Increase</p>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                              <p className="text-2xl font-bold text-green-700">{seoContent.strategy_overview.projected_impact.qualified_leads}</p>
                              <p className="text-xs text-gray-600">Qualified Leads</p>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                              <p className="text-2xl font-bold text-purple-700">{seoContent.strategy_overview.projected_impact.roi_estimate}</p>
                              <p className="text-xs text-gray-600">ROI Estimate</p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons for strategy section */}
                        <div className="pt-4 border-t flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleKeywordAction('strategy-overview', 'strategy', 'approved')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              getKeywordStatus('strategy-overview', 'strategy')?.status === 'approved'
                                ? 'bg-green-600 text-white' 
                                : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                            }`}
                          >
                            <Check className="h-4 w-4 mr-1 inline" />
                            Approve Strategy
                          </button>
                          
                          <button
                            onClick={() => handleKeywordAction('strategy-overview', 'strategy', 'rejected')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              getKeywordStatus('strategy-overview', 'strategy')?.status === 'rejected'
                                ? 'bg-red-600 text-white' 
                                : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                            }`}
                          >
                            <X className="h-4 w-4 mr-1 inline" />
                            Request Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEO Keywords Section */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('keywords')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">SEO Keywords ({seoContent.seo_keywords.length})</h2>
                      {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('keywords') && (
                      <div className="p-6 space-y-3">
                        {seoContent.seo_keywords.map((keyword: string, index: number) => 
                          renderKeywordItem(keyword, index, 'seo')
                        )}
                      </div>
                    )}
                  </div>

                  {/* Longtail Keywords Section */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('longtail')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">Longtail Keywords ({seoContent.longtail_keywords.length})</h2>
                      {expandedSections.has('longtail') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('longtail') && (
                      <div className="p-6 space-y-3">
                        {seoContent.longtail_keywords.map((keyword: string, index: number) => 
                          renderKeywordItem(keyword, index, 'longtail')
                        )}
                      </div>
                    )}
                  </div>

                  {/* Consumer Questions Section */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('questions')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">Consumer Questions ({seoContent.consumer_questions.length})</h2>
                      {expandedSections.has('questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('questions') && (
                      <div className="p-6 space-y-3">
                        {seoContent.consumer_questions.map((question: string, index: number) => 
                          renderKeywordItem(question, index, 'question')
                        )}
                      </div>
                    )}
                  </div>

                  {/* H1 & H2 Recommendations */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('recommendations')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">H1 & H2 Recommendations</h2>
                      {expandedSections.has('recommendations') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('recommendations') && (
                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">H1 Recommendations:</h3>
                          <div className="space-y-3">
                            {seoContent.h1_recommendations.map((h1, index) => 
                              renderKeywordItem(h1, index, 'h1')
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">H2 Recommendations:</h3>
                          <div className="space-y-3">
                            {seoContent.h2_recommendations.map((h2, index) => 
                              renderKeywordItem(h2, index, 'h2')
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Meta Description</h2>
                    </div>
                    <div className="p-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-900 mb-2">{seoContent.meta_description.text}</p>
                        <p className="text-xs text-gray-500">Character count: {seoContent.meta_description.length}/160</p>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <Copy className="h-4 w-4 mr-2 inline" />
                          Copy
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <Sparkles className="h-4 w-4 mr-2 inline" />
                          Optimize with AI
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Schema Markup */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Schema Markup</h2>
                    </div>
                    <div className="p-6">
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(seoContent.schema_markup, null, 2)}</code>
                      </pre>
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <Copy className="h-4 w-4 mr-2 inline" />
                          Copy Schema
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <CheckCircle className="h-4 w-4 mr-2 inline" />
                          Validate with AI
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}