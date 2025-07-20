import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flag,
  Search,
  Target,
  TrendingUp,
  Globe,
  FileText,
  BookOpen,
  AlertCircle,
  Save
} from 'lucide-react'

interface SEOContent {
  seo_keywords: string[]
  longtail_keywords: string[]
  consumer_questions: string[]
  h1_recommendations: string[]
  h2_recommendations: string[]
  schema_markup: any
  geo_recommendations: any
  seo_strategy: any
}

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  target_audience: string
  generated_seo_content?: SEOContent
  workflow_stage: string
  created_at: string
  submitter_name: string
  submitter_email: string
}

interface ItemApproval {
  [key: string]: {
    approved: boolean
    flagged: boolean
    comment: string
  }
}

export default function SEOReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['strategy']))
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [itemApprovals, setItemApprovals] = useState<ItemApproval>({})
  const [isDirty, setIsDirty] = useState(false)

  const { data: submission, isLoading } = useQuery({
    queryKey: ['seo-review-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Submission
    }
  })

  const updateWorkflowStage = useMutation({
    mutationFn: async ({ stage, reason }: { stage: string; reason?: string }) => {
      const updateData: any = { 
        workflow_stage: stage,
        seo_keyword_approvals: itemApprovals
      }
      if (reason) {
        updateData.rejection_reason = reason
        updateData.rejected_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      navigate('/seo-review')
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

  const handleItemAction = (itemKey: string, action: 'approve' | 'flag' | 'comment', value?: any) => {
    setItemApprovals(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        approved: action === 'approve' ? !prev[itemKey]?.approved : prev[itemKey]?.approved || false,
        flagged: action === 'flag' ? !prev[itemKey]?.flagged : prev[itemKey]?.flagged || false,
        comment: action === 'comment' ? value : prev[itemKey]?.comment || ''
      }
    }))
    setIsDirty(true)
  }

  const handleSaveProgress = () => {
    // Save current progress without changing workflow stage
    updateWorkflowStage.mutate({ stage: submission?.workflow_stage || 'SEO_Review' })
  }

  const handleComplete = () => {
    updateWorkflowStage.mutate({ stage: 'Client_Review' })
  }

  const handleRequestChanges = () => {
    updateWorkflowStage.mutate({ stage: 'Revision_Requested' })
  }

  const handleExport = () => {
    // Export functionality
    console.log('Exporting SEO review...')
  }

  if (isLoading || !submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Mock SEO content for demo purposes
  const seoContent: SEOContent = submission.generated_seo_content || {
    seo_keywords: [
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
    longtail_keywords: [
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
    consumer_questions: [
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
    schema_markup: {
      "@context": "https://schema.org",
      "@type": "MedicalStudy",
      "name": "Phase 3 Oncology Clinical Trial",
      "description": "A phase 3 clinical trial evaluating an innovative treatment for advanced cancer",
      "sponsor": {
        "@type": "Organization",
        "name": "Pharmaceutical Company"
      },
      "studyDesign": "Randomized controlled trial",
      "healthCondition": "Advanced Cancer",
      "phase": "Phase 3",
      "studyLocation": {
        "@type": "AdministrativeArea",
        "name": "Multiple locations across the United States"
      }
    },
    geo_recommendations: {
      primary_markets: ['United States', 'Canada'],
      city_targeting: [
        'New York, NY - High cancer research activity',
        'Houston, TX - Major cancer center presence',
        'Boston, MA - Academic medical centers',
        'Los Angeles, CA - Large patient population',
        'Chicago, IL - Multiple research hospitals'
      ],
      search_trends: 'Highest search volume for cancer clinical trials in urban areas with major cancer centers',
      local_seo_strategy: 'Create location-specific landing pages for each trial site'
    },
    seo_strategy: {
      content_architecture: [
        'Create a main clinical trial hub page targeting primary keywords',
        'Develop location-specific landing pages for each trial site',
        'Build disease education content to capture top-of-funnel traffic',
        'Implement FAQ schema for common patient questions'
      ],
      technical_seo: [
        'Implement MedicalStudy schema markup',
        'Ensure mobile-first design for patient accessibility',
        'Optimize page speed for better user experience',
        'Create XML sitemap for trial-related pages'
      ],
      content_strategy: [
        'Publish weekly blog posts about clinical trial process',
        'Create patient testimonial videos (with consent)',
        'Develop downloadable resources (eligibility checklist, trial guide)',
        'Regular updates on trial progress and milestones'
      ],
      link_building: [
        'Partner with patient advocacy groups',
        'Submit to clinical trial directories',
        'Collaborate with medical institutions',
        'Press releases for major trial milestones'
      ],
      local_seo: [
        'Optimize Google My Business for trial locations',
        'Create city-specific content for each site',
        'Target "clinical trials near me" searches',
        'Build local medical community relationships'
      ]
    }
  }

  const allItemsApproved = () => {
    const totalItems = seoContent.seo_keywords.length + 
                      seoContent.longtail_keywords.length + 
                      seoContent.consumer_questions.length +
                      seoContent.h1_recommendations.length +
                      seoContent.h2_recommendations.length
    const approvedItems = Object.values(itemApprovals).filter(item => item.approved).length
    return approvedItems === totalItems
  }

  const hasFlaggedItems = () => {
    return Object.values(itemApprovals).some(item => item.flagged)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/seo-review')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{submission.product_name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {submission.stage} • {submission.therapeutic_area} • {submission.target_audience}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-sm text-orange-600 font-medium">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Unsaved changes
            </span>
          )}
          <button 
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* SEO Strategy Recommendations - Top Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer bg-blue-50"
          onClick={() => toggleSection('strategy')}
        >
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">SEO Strategy Recommendations</h2>
          </div>
          {expandedSections.has('strategy') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('strategy') && (
          <div className="p-6 space-y-6">
            {Object.entries(seoContent.seo_strategy).map(([key, strategies]) => (
              <div key={key}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h3>
                <ul className="space-y-2">
                  {(strategies as string[]).map((strategy, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Keywords Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('keywords')}
        >
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">SEO Keywords ({seoContent.seo_keywords.length})</h2>
          </div>
          {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('keywords') && (
          <div className="p-6 space-y-3">
            {seoContent.seo_keywords.map((keyword, index) => {
              const itemKey = `keyword-${index}`
              const approval = itemApprovals[itemKey]
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                  approval?.flagged ? 'border-red-200 bg-red-50' : 
                  approval?.approved ? 'border-green-200 bg-green-50' : 
                  'border-gray-200 bg-gray-50'
                }`}>
                  <span className="text-sm font-medium text-gray-900">{keyword}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleItemAction(itemKey, 'approve')}
                      className={`p-1.5 rounded ${approval?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleItemAction(itemKey, 'flag')}
                      className={`p-1.5 rounded ${approval?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Flag for compliance"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                      title="Add comment"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Sparkles className="h-4 w-4" />
                      Ask AI
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Longtail Keywords Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('longtail')}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Longtail Keywords ({seoContent.longtail_keywords.length})</h2>
          </div>
          {expandedSections.has('longtail') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('longtail') && (
          <div className="p-6 space-y-3">
            {seoContent.longtail_keywords.map((keyword, index) => {
              const itemKey = `longtail-${index}`
              const approval = itemApprovals[itemKey]
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                  approval?.flagged ? 'border-red-200 bg-red-50' : 
                  approval?.approved ? 'border-green-200 bg-green-50' : 
                  'border-gray-200 bg-gray-50'
                }`}>
                  <span className="text-sm text-gray-900">{keyword}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleItemAction(itemKey, 'approve')}
                      className={`p-1.5 rounded ${approval?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleItemAction(itemKey, 'flag')}
                      className={`p-1.5 rounded ${approval?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Flag for compliance"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                      title="Add comment"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Sparkles className="h-4 w-4" />
                      Ask AI
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Consumer Questions Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('questions')}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Consumer Questions ({seoContent.consumer_questions.length})</h2>
          </div>
          {expandedSections.has('questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('questions') && (
          <div className="p-6 space-y-3">
            {seoContent.consumer_questions.map((question, index) => {
              const itemKey = `question-${index}`
              const approval = itemApprovals[itemKey]
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                  approval?.flagged ? 'border-red-200 bg-red-50' : 
                  approval?.approved ? 'border-green-200 bg-green-50' : 
                  'border-gray-200 bg-gray-50'
                }`}>
                  <span className="text-sm text-gray-900">{question}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleItemAction(itemKey, 'approve')}
                      className={`p-1.5 rounded ${approval?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleItemAction(itemKey, 'flag')}
                      className={`p-1.5 rounded ${approval?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Flag for compliance"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                      title="Add comment"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Sparkles className="h-4 w-4" />
                      Ask AI
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* H1 & H2 Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">H1 & H2 Recommendations</h2>
          </div>
          {expandedSections.has('recommendations') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('recommendations') && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">H1 Recommendations:</h3>
              <div className="space-y-3">
                {seoContent.h1_recommendations.map((h1, index) => {
                  const itemKey = `h1-${index}`
                  const approval = itemApprovals[itemKey]
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                      approval?.flagged ? 'border-red-200 bg-red-50' : 
                      approval?.approved ? 'border-green-200 bg-green-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <span className="text-sm text-gray-900">{h1}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleItemAction(itemKey, 'approve')}
                          className={`p-1.5 rounded ${approval?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleItemAction(itemKey, 'flag')}
                          className={`p-1.5 rounded ${approval?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                          title="Flag for compliance"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                          title="Add comment"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                          <Sparkles className="h-4 w-4" />
                          Ask AI
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">H2 Recommendations:</h3>
              <div className="space-y-3">
                {seoContent.h2_recommendations.map((h2, index) => {
                  const itemKey = `h2-${index}`
                  const approval = itemApprovals[itemKey]
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                      approval?.flagged ? 'border-red-200 bg-red-50' : 
                      approval?.approved ? 'border-green-200 bg-green-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <span className="text-sm text-gray-900">{h2}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleItemAction(itemKey, 'approve')}
                          className={`p-1.5 rounded ${approval?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleItemAction(itemKey, 'flag')}
                          className={`p-1.5 rounded ${approval?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                          title="Flag for compliance"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                          title="Add comment"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                          <Sparkles className="h-4 w-4" />
                          Ask AI
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schema Markup */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Schema Markup</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleItemAction('schema', 'approve')}
              className={`p-1.5 rounded ${itemApprovals['schema']?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Approve"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleItemAction('schema', 'flag')}
              className={`p-1.5 rounded ${itemApprovals['schema']?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Flag for compliance"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
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

      {/* GEO Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">GEO Recommendations (AI Search)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleItemAction('geo', 'approve')}
              className={`p-1.5 rounded ${itemApprovals['geo']?.approved ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Approve"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleItemAction('geo', 'flag')}
              className={`p-1.5 rounded ${itemApprovals['geo']?.flagged ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Flag for compliance"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Primary Markets:</h3>
            <p className="text-sm text-gray-700">{seoContent.geo_recommendations.primary_markets.join(', ')}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">City Targeting:</h3>
            <ul className="list-disc list-inside space-y-1">
              {seoContent.geo_recommendations.city_targeting.map((city: string, index: number) => (
                <li key={index} className="text-sm text-gray-700">{city}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Search Trends:</h3>
            <p className="text-sm text-gray-700">{seoContent.geo_recommendations.search_trends}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Local SEO Strategy:</h3>
            <p className="text-sm text-gray-700">{seoContent.geo_recommendations.local_seo_strategy}</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons - Fixed Position */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {hasFlaggedItems() && (
              <span className="text-sm text-red-600 font-medium">
                <Flag className="h-4 w-4 inline mr-1" />
                {Object.values(itemApprovals).filter(item => item.flagged).length} items flagged for compliance
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSaveProgress}
              disabled={!isDirty}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Save Progress
            </button>
            <button
              onClick={handleRequestChanges}
              className="px-6 py-2.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-300 rounded-md hover:bg-orange-100"
            >
              <MessageSquare className="h-4 w-4 mr-2 inline" />
              Request Changes
            </button>
            <button
              onClick={handleComplete}
              disabled={!allItemsApproved() || hasFlaggedItems()}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4 mr-2 inline" />
              Complete Review
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Changes</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide specific feedback for changes needed..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateWorkflowStage.mutate({ stage: 'Revision_Requested', reason: rejectionReason })
                }}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
