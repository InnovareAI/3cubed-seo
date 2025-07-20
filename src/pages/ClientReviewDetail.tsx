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
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  FileText,
  Eye,
  Send,
  Edit3,
  Hash,
  Tag,
  HelpCircle,
  Code,
  Brain,
  Globe,
  Link2,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Building
} from 'lucide-react'

interface ClientComment {
  id: string
  section: string
  comment: string
  status: 'pending' | 'resolved' | 'wont_fix'
  created_at: string
  author: string
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
  priority_level: string
  client_name?: string
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  h2_tags?: string[]
  h3_tags?: string[]
  meta_title?: string
  meta_description?: string
  seo_strategy?: any
  client_comments?: ClientComment[]
  client_review_status?: string
  client_reviewed_by?: string
  client_reviewed_at?: string
}

export default function ClientReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [useDemoData] = useState(true)
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'strategy', 'keywords'])
  )
  const [clientFeedback, setClientFeedback] = useState('')
  const [sectionComments, setSectionComments] = useState<Record<string, string>>({})
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  // Get submission data
  const { data: submission, isLoading } = useQuery({
    queryKey: ['client-review-detail', id],
    queryFn: async () => {
      if (useDemoData) {
        const mockSubmission = mockSEOReviews.find(s => s.id === id)
        if (!mockSubmission) throw new Error('Submission not found')
        
        // Add client-specific fields
        return {
          ...mockSubmission,
          client_review_status: 'pending',
          client_comments: [
            {
              id: '1',
              section: 'h1_tag',
              comment: 'Can we make this more specific to our brand?',
              status: 'pending' as const,
              created_at: new Date().toISOString(),
              author: 'John Smith (Client)'
            },
            {
              id: '2',
              section: 'keywords',
              comment: 'Please add our branded terms',
              status: 'resolved' as const,
              created_at: new Date().toISOString(),
              author: 'Jane Doe (Client)'
            }
          ]
        }
      }
      
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
    mutationFn: async ({ status, feedback }: { status: string; feedback?: string }) => {
      const updateData: any = { 
        client_review_status: status,
        client_reviewed_at: new Date().toISOString(),
        client_reviewed_by: 'current-client-id' // TODO: Get from auth
      }
      
      if (status === 'approved') {
        updateData.workflow_stage = 'mlr_review'
      } else if (status === 'revision_requested') {
        updateData.workflow_stage = 'revision_requested'
        updateData.client_feedback = feedback
      }
      
      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-review-content'] })
      navigate('/client-review')
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
    updateWorkflowStage.mutate({ status: 'approved' })
  }

  const handleRequestRevision = () => {
    if (clientFeedback.trim() || Object.values(sectionComments).some(c => c.trim())) {
      const allFeedback = [
        clientFeedback,
        ...Object.entries(sectionComments)
          .filter(([_, comment]) => comment.trim())
          .map(([section, comment]) => `${section}: ${comment}`)
      ].filter(Boolean).join('\n\n')
      
      updateWorkflowStage.mutate({ 
        status: 'revision_requested', 
        feedback: allFeedback 
      })
    } else {
      setShowFeedbackModal(true)
    }
  }

  const addSectionComment = (section: string, comment: string) => {
    setSectionComments(prev => ({
      ...prev,
      [section]: comment
    }))
  }

  if (isLoading || !submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const hasComments = submission.client_comments && submission.client_comments.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/client-review')}
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
                Download PDF
              </CTAButton>
              <CTAButton variant="secondary" icon={<Eye className="h-4 w-4" />}>
                Preview Website
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      {/* Client Info Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{submission.client_name || 'Pharma Corp'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-900">Reviewing as: John Smith (Marketing Director)</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-900">Received: {new Date(submission.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {hasComments && (
            <span className="text-sm font-medium text-blue-900">
              {submission.client_comments.filter(c => c.status === 'pending').length} pending comments
            </span>
          )}
        </div>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Content Overview</h2>
              <p className="text-sm text-gray-500">Product information and positioning</p>
            </div>
          </div>
          {expandedSections.has('overview') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.has('overview') && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Product Name</dt>
                    <dd className="text-sm font-medium text-gray-900">{submission.product_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Therapeutic Area</dt>
                    <dd className="text-sm font-medium text-gray-900">{submission.therapeutic_area}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Stage</dt>
                    <dd className="text-sm font-medium text-gray-900">{submission.stage}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Target Audience</h3>
                <ul className="space-y-1">
                  {submission.target_audience?.map((audience, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <Target className="h-4 w-4 text-gray-400 mr-2" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Comment on Overview
              </label>
              <div className="relative">
                <textarea
                  value={sectionComments.overview || ''}
                  onChange={(e) => addSectionComment('overview', e.target.value)}
                  placeholder="Any feedback on the product positioning?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Strategy Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('strategy')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SEO Strategy</h2>
              <p className="text-sm text-gray-500">Recommended approach for search optimization</p>
            </div>
          </div>
          {expandedSections.has('strategy') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.has('strategy') && submission.seo_strategy && (
          <div className="p-6">
            {/* Strategy content - simplified for client view */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">
                Our SEO strategy focuses on establishing {submission.product_name} as a leading solution 
                in the {submission.therapeutic_area} space through targeted content optimization and 
                strategic keyword placement.
              </p>
              
              <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2">Key Objectives:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Improve visibility for branded and non-branded searches</li>
                <li>Target high-intent keywords for {submission.target_audience?.join(' and ')}</li>
                <li>Build authority through comprehensive content coverage</li>
                <li>Optimize for AI-powered search engines and voice search</li>
              </ul>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback on SEO Strategy
              </label>
              <textarea
                value={sectionComments.strategy || ''}
                onChange={(e) => addSectionComment('strategy', e.target.value)}
                placeholder="Does this align with your marketing objectives?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Keywords Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('keywords')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Hash className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Keywords & Content Elements</h2>
              <p className="text-sm text-gray-500">Review targeted keywords and page elements</p>
            </div>
          </div>
          {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.has('keywords') && (
          <div className="p-6 space-y-6">
            {/* Primary Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Primary Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {submission.seo_keywords?.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {/* H1 Tag */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Main Page Heading (H1)</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{submission.h1_tag}</p>
            </div>
            
            {/* Meta Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Search Result Description</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{submission.meta_description}</p>
              <p className="text-xs text-gray-500 mt-1">This appears in Google search results</p>
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback on Keywords & Content
              </label>
              <textarea
                value={sectionComments.keywords || ''}
                onChange={(e) => addSectionComment('keywords', e.target.value)}
                placeholder="Any specific terms or messaging you'd like to adjust?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* General Feedback Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Feedback</h3>
        <textarea
          value={clientFeedback}
          onChange={(e) => setClientFeedback(e.target.value)}
          placeholder="Please share any additional feedback or concerns about the content..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 py-6 bg-gray-50 rounded-lg">
        <CTAButton
          variant="secondary"
          icon={<MessageSquare className="h-4 w-4" />}
          onClick={() => {
            // Save feedback without changing status
            console.log('Saving feedback...', { clientFeedback, sectionComments })
          }}
        >
          Save Feedback
        </CTAButton>
        <CTAButton
          variant="warning"
          icon={<Edit3 className="h-4 w-4" />}
          onClick={handleRequestRevision}
        >
          Request Revisions
        </CTAButton>
        <CTAButton
          variant="success"
          icon={<ThumbsUp className="h-4 w-4" />}
          onClick={handleApprove}
          loading={updateWorkflowStage.isPending}
        >
          Approve Content
        </CTAButton>
      </div>

      {/* Feedback Required Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Required</h3>
            <p className="text-gray-600 mb-4">
              Please provide feedback on what needs to be revised before requesting changes.
            </p>
            <CTAButton
              variant="primary"
              onClick={() => setShowFeedbackModal(false)}
              className="w-full"
            >
              OK
            </CTAButton>
          </div>
        </div>
      )}
    </div>
  )
}