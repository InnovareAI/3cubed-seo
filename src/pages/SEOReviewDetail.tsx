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
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
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

export default function SEOReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['keywords', 'questions', 'recommendations']))
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

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
      const updateData: any = { workflow_stage: stage }
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

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleApprove = () => {
    updateWorkflowStage.mutate({ stage: 'mlr_review' })
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      updateWorkflowStage.mutate({ stage: 'rejected', reason: rejectionReason })
    }
  }

  const handleRequestChanges = () => {
    updateWorkflowStage.mutate({ stage: 'revision_requested' })
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
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
          <button
            onClick={handleApprove}
            disabled={updateWorkflowStage.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Approve All
          </button>
        </div>
      </div>

      {/* SEO Keywords Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('keywords')}
        >
          <h2 className="text-lg font-medium text-gray-900">SEO Keywords ({seoContent.seo_keywords.length})</h2>
          {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('keywords') && (
          <div className="p-6 space-y-3">
            {seoContent.seo_keywords.map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{keyword}</span>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  Ask AI
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Longtail Keywords Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('longtail')}
        >
          <h2 className="text-lg font-medium text-gray-900">Longtail Keywords ({seoContent.longtail_keywords.length})</h2>
          {expandedSections.has('longtail') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('longtail') && (
          <div className="p-6 space-y-3">
            {seoContent.longtail_keywords.map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{keyword}</span>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  Ask AI
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consumer Questions Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('questions')}
        >
          <h2 className="text-lg font-medium text-gray-900">Consumer Questions ({seoContent.consumer_questions.length})</h2>
          {expandedSections.has('questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('questions') && (
          <div className="p-6 space-y-3">
            {seoContent.consumer_questions.map((question, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{question}</span>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  Ask AI
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* H1 & H2 Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
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
                {seoContent.h1_recommendations.map((h1, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">{h1}</span>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Sparkles className="h-4 w-4" />
                      Ask AI
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">H2 Recommendations:</h3>
              <div className="space-y-3">
                {seoContent.h2_recommendations.map((h2, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">{h2}</span>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Sparkles className="h-4 w-4" />
                      Ask AI
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schema Markup */}
      <div className="bg-white rounded-lg shadow">
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

      {/* GEO Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">GEO Recommendations (AI Search)</h2>
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

      {/* SEO Strategy */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">SEO Strategy</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Comprehensive Strategy
          </button>
        </div>
        <div className="p-6 space-y-6">
          {Object.entries(seoContent.seo_strategy).map(([key, strategies]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              <ul className="space-y-2">
                {(strategies as string[]).map((strategy, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-sm text-gray-700">• {strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            <Copy className="h-4 w-4 mr-2 inline" />
            Copy Strategy
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 py-6">
        <button
          onClick={() => setShowRejectModal(true)}
          className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          <XCircle className="h-4 w-4 mr-2 inline" />
          Reject All
        </button>
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
          Approve & Publish
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Submission</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}