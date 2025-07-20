import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import CTAButton from '@/components/CTAButton'
import { mockSEOReviews } from '@/data/mockSEOReviews'
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
  Target,
  Globe,
  Link2,
  FileText,
  Lightbulb,
  BookOpen,
  Megaphone
} from 'lucide-react'

interface SEOStrategy {
  content_architecture: string[]
  technical_seo: string[]
  content_strategy: string[]
  link_building: string[]
  geo_optimization: string[]
}

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
  priority_level: string
  medical_indication?: string
  langchain_status?: string
  geography?: string[]
  client_name?: string
  mechanism_of_action?: string
  key_differentiators?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  h1_recommendations?: string[]
  h2_recommendations?: string[]
  meta_title?: string
  meta_description?: string
  schema_markup?: any
  geo_recommendations?: any
  seo_strategy?: SEOStrategy
}

export default function SEOReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [useDemoData] = useState(true) // Always use demo data for now
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['strategy']) // Strategy section expanded by default
  )
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Get submission from mock data or database
  const { data: submission, isLoading } = useQuery({
    queryKey: ['seo-review-detail', id],
    queryFn: async () => {
      if (useDemoData) {
        // Find submission in mock data
        const mockSubmission = mockSEOReviews.find(s => s.id === id)
        if (!mockSubmission) throw new Error('Submission not found')
        
        // Add mock SEO strategy if not present
        if (!mockSubmission.seo_strategy) {
          mockSubmission.seo_strategy = {
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
            geo_optimization: [
              'Structure content for AI snippet extraction',
              'Create concise, factual summaries for LLM consumption',
              'Implement medical entity recognition markup',
              'Optimize for voice search and conversational queries'
            ]
          }
        }
        
        return mockSubmission
      }
      
      // Real database query
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Submission
    },
    enabled: true
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
      queryClient.invalidateQueries({ queryKey: ['seo-review-content'] })
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

  const strategyIcons = {
    content_architecture: <FileText className="h-5 w-5" />,
    technical_seo: <Globe className="h-5 w-5" />,
    content_strategy: <BookOpen className="h-5 w-5" />,
    link_building: <Link2 className="h-5 w-5" />,
    geo_optimization: <Sparkles className="h-5 w-5" />
  }

  const strategyTitles = {
    content_architecture: 'Content Architecture',
    technical_seo: 'Technical SEO',
    content_strategy: 'Content Strategy',
    link_building: 'Link Building',
    geo_optimization: 'GEO (Generative Engine Optimization)'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/seo-review')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{submission.product_name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {submission.stage} • {submission.therapeutic_area} • {submission.target_audience?.join(', ')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CTAButton variant="secondary" icon={<Download className="h-4 w-4" />}>
                Export Report
              </CTAButton>
              <CTAButton 
                variant="success" 
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={handleApprove}
                loading={updateWorkflowStage.isPending}
              >
                Approve & Send to Client
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Strategy Section - FIRST */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('strategy')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">SEO Strategy</h2>
          </div>
          {expandedSections.has('strategy') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('strategy') && submission.seo_strategy && (
          <div className="p-6 space-y-6">
            {Object.entries(submission.seo_strategy).map(([key, strategies]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-100 rounded">
                    {strategyIcons[key as keyof typeof strategyIcons]}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {strategyTitles[key as keyof typeof strategyTitles]}
                  </h3>
                </div>
                <ul className="space-y-2 ml-9">
                  {(strategies as string[]).map((strategy, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-4 flex gap-3">
              <CTAButton variant="secondary" size="sm" icon={<Copy className="h-4 w-4" />}>
                Copy Strategy
              </CTAButton>
              <CTAButton variant="secondary" size="sm" icon={<Megaphone className="h-4 w-4" />}>
                View Comprehensive Plan
              </CTAButton>
            </div>
          </div>
        )}
      </div>

      {/* SEO Keywords Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('keywords')}
        >
          <h2 className="text-lg font-semibold text-gray-900">SEO Keywords ({submission.seo_keywords?.length || 0})</h2>
          {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('keywords') && (
          <div className="p-6 space-y-3">
            {submission.seo_keywords?.map((keyword, index) => (
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

      {/* Long-tail Keywords Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('longtail')}
        >
          <h2 className="text-lg font-semibold text-gray-900">Long-tail Keywords ({submission.long_tail_keywords?.length || 0})</h2>
          {expandedSections.has('longtail') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('longtail') && (
          <div className="p-6 space-y-3">
            {submission.long_tail_keywords?.map((keyword, index) => (
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('questions')}
        >
          <h2 className="text-lg font-semibold text-gray-900">Consumer Questions ({submission.consumer_questions?.length || 0})</h2>
          {expandedSections.has('questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('questions') && (
          <div className="p-6 space-y-3">
            {submission.consumer_questions?.map((question, index) => (
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 py-6 bg-gray-50 rounded-lg">
        <CTAButton
          variant="danger"
          icon={<XCircle className="h-4 w-4" />}
          onClick={() => setShowRejectModal(true)}
        >
          Reject All
        </CTAButton>
        <CTAButton
          variant="secondary"
          icon={<MessageSquare className="h-4 w-4" />}
          onClick={handleRequestChanges}
        >
          Request Changes
        </CTAButton>
        <CTAButton
          variant="success"
          icon={<CheckCircle className="h-4 w-4" />}
          onClick={handleApprove}
          loading={updateWorkflowStage.isPending}
        >
          Approve & Send to Client
        </CTAButton>
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
              <CTAButton
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </CTAButton>
              <CTAButton
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </CTAButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}