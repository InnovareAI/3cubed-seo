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
  Globe,
  Link2,
  FileText,
  Lightbulb,
  BookOpen,
  Megaphone,
  Hash,
  HelpCircle,
  Tag,
  Code,
  Search,
  Brain,
  Shield,
  Send,
  Check,
  X
} from 'lucide-react'

interface ReviewableItem {
  id: string
  content: string
  approved: boolean
  rejected: boolean
  comment: string
  complianceFlag?: boolean
}

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
  h2_tags?: string[]
  h3_tags?: string[]
  meta_title?: string
  meta_description?: string
  schema_markup?: any
  geo_optimization?: any
  seo_strategy?: SEOStrategy
}

export default function SEOReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [useDemoData] = useState(true)
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['strategy', 'keywords', 'technical'])
  )
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [itemStates, setItemStates] = useState<Record<string, ReviewableItem>>({})

  // Get submission data
  const { data: submission, isLoading } = useQuery({
    queryKey: ['seo-review-detail', id],
    queryFn: async () => {
      if (useDemoData) {
        const mockSubmission = mockSEOReviews.find(s => s.id === id)
        if (!mockSubmission) throw new Error('Submission not found')
        
        // Add missing technical fields for demo with reduced tags
        return {
          ...mockSubmission,
          h2_tags: [
            'Understanding PCSK9 Inhibition',
            'Clinical Trial Results',
            'Safety and Administration'
          ],
          h3_tags: [
            'What is PCSK9?',
            'Insurance Coverage',
            'Patient Support'
          ],
          schema_markup: {
            "@context": "https://schema.org",
            "@type": "Drug",
            "name": "Xeltoris (evolocumab)",
            "activeIngredient": "evolocumab",
            "administrationRoute": "subcutaneous injection",
            "dosageForm": "injection"
          },
          geo_optimization: {
            ai_summary: "Xeltoris™ (evolocumab) is a PCSK9 inhibitor that reduces LDL cholesterol by up to 60% through monthly subcutaneous injections.",
            key_facts: [
              "FDA-approved for cardiovascular risk reduction",
              "60% average LDL cholesterol reduction",
              "Once-monthly dosing schedule",
              "Monoclonal antibody therapy"
            ]
          }
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

  const updateItemState = (itemId: string, field: keyof ReviewableItem, value: any) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        // Reset opposite state
        ...(field === 'approved' && value ? { rejected: false } : {}),
        ...(field === 'rejected' && value ? { approved: false } : {})
      }
    }))
  }

  const renderReviewableItem = (item: ReviewableItem, showCompliance = false) => (
    <div key={item.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-900 flex-1">{item.content}</p>
      </div>
      
      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        <CTAButton
          size="sm"
          variant={item.approved ? "success" : "secondary"}
          icon={<Check className="h-3 w-3" />}
          onClick={() => updateItemState(item.id, 'approved', !item.approved)}
          className={item.approved ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          Approve
        </CTAButton>
        
        <CTAButton
          size="sm"
          variant={item.rejected ? "danger" : "secondary"}
          icon={<X className="h-3 w-3" />}
          onClick={() => updateItemState(item.id, 'rejected', !item.rejected)}
          className={item.rejected ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        >
          Reject
        </CTAButton>
        
        {showCompliance && (
          <CTAButton
            size="sm"
            variant="secondary"
            icon={<Shield className="h-3 w-3" />}
            onClick={() => updateItemState(item.id, 'complianceFlag', !item.complianceFlag)}
            className={item.complianceFlag ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}
          >
            Compliance Check
          </CTAButton>
        )}
        
        <CTAButton
          size="sm"
          variant="primary"
          icon={<Sparkles className="h-3 w-3" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ask AI
        </CTAButton>
      </div>
      
      {/* Comment Field */}
      <div className="relative">
        <input
          type="text"
          value={item.comment}
          onChange={(e) => updateItemState(item.id, 'comment', e.target.value)}
          placeholder="Add a comment..."
          className="w-full pr-10 pl-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Send className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {/* Status Indicators */}
      {(item.approved || item.rejected || item.complianceFlag) && (
        <div className="flex gap-2 text-xs">
          {item.approved && <span className="text-green-600 font-medium">✓ Approved</span>}
          {item.rejected && <span className="text-red-600 font-medium">✗ Rejected</span>}
          {item.complianceFlag && <span className="text-yellow-600 font-medium">⚠ Compliance Review Required</span>}
        </div>
      )}
    </div>
  )

  if (isLoading || !submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Initialize item states
  if (Object.keys(itemStates).length === 0 && submission) {
    const initialStates: Record<string, ReviewableItem> = {}
    
    // Initialize keywords
    submission.seo_keywords?.forEach((keyword, index) => {
      initialStates[`seo_keyword_${index}`] = {
        id: `seo_keyword_${index}`,
        content: keyword,
        approved: false,
        rejected: false,
        comment: ''
      }
    })
    
    submission.long_tail_keywords?.forEach((keyword, index) => {
      initialStates[`long_tail_${index}`] = {
        id: `long_tail_${index}`,
        content: keyword,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    })
    
    submission.consumer_questions?.forEach((question, index) => {
      initialStates[`question_${index}`] = {
        id: `question_${index}`,
        content: question,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    })
    
    // Initialize technical items
    if (submission.h1_tag) {
      initialStates['h1_tag'] = {
        id: 'h1_tag',
        content: submission.h1_tag,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    }
    
    if (submission.meta_title) {
      initialStates['meta_title'] = {
        id: 'meta_title',
        content: submission.meta_title,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    }
    
    if (submission.meta_description) {
      initialStates['meta_description'] = {
        id: 'meta_description',
        content: submission.meta_description,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    }
    
    submission.h2_tags?.forEach((tag, index) => {
      initialStates[`h2_tag_${index}`] = {
        id: `h2_tag_${index}`,
        content: tag,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    })
    
    submission.h3_tags?.forEach((tag, index) => {
      initialStates[`h3_tag_${index}`] = {
        id: `h3_tag_${index}`,
        content: tag,
        approved: false,
        rejected: false,
        comment: '',
        complianceFlag: false
      }
    })
    
    setItemStates(initialStates)
  }

  const approvedCount = Object.values(itemStates).filter(item => item.approved).length
  const rejectedCount = Object.values(itemStates).filter(item => item.rejected).length
  const totalItems = Object.keys(itemStates).length

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
              <div className="text-sm text-gray-600">
                <span className="text-green-600 font-medium">{approvedCount}</span> approved, 
                <span className="text-red-600 font-medium ml-1">{rejectedCount}</span> rejected 
                of <span className="font-medium">{totalItems}</span> items
              </div>
              <CTAButton variant="secondary" icon={<Download className="h-4 w-4" />}>
                Export Report
              </CTAButton>
              <CTAButton 
                variant="success" 
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={() => updateWorkflowStage.mutate({ stage: 'Client_Review' })}
                loading={updateWorkflowStage.isPending}
              >
                Complete Review
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Strategy Section - MOVED TO TOP */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('strategy')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SEO Strategy Recommendations</h2>
              <p className="text-sm text-gray-500">Comprehensive strategy for content, technical SEO, and AI optimization</p>
            </div>
          </div>
          {expandedSections.has('strategy') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.has('strategy') && submission.seo_strategy && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content Architecture */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Content Architecture</h3>
                </div>
                <ul className="space-y-2">
                  {submission.seo_strategy.content_architecture.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Technical SEO */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Technical SEO</h3>
                </div>
                <ul className="space-y-2">
                  {submission.seo_strategy.technical_seo.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Content Strategy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Content Strategy</h3>
                </div>
                <ul className="space-y-2">
                  {submission.seo_strategy.content_strategy.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Link Building */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Link Building</h3>
                </div>
                <ul className="space-y-2">
                  {submission.seo_strategy.link_building.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* GEO Optimization - Full Width */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">GEO (Generative Engine Optimization)</h3>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {submission.seo_strategy.geo_optimization.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {submission.geo_optimization && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">AI-Optimized Summary</h4>
                    <p className="text-sm text-gray-700 mb-3">{submission.geo_optimization.ai_summary}</p>
                    <div className="flex gap-2">
                      <CTAButton size="sm" variant="secondary" icon={<Copy className="h-3 w-3" />}>
                        Copy GEO Data
                      </CTAButton>
                      <CTAButton size="sm" variant="secondary" icon={<Brain className="h-3 w-3" />}>
                        Test with AI
                      </CTAButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <CTAButton variant="secondary" icon={<Copy className="h-4 w-4" />}>
                Copy Full Strategy
              </CTAButton>
              <CTAButton variant="secondary" icon={<Megaphone className="h-4 w-4" />}>
                Generate Implementation Plan
              </CTAButton>
            </div>
          </div>
        )}
      </div>

      {/* Keywords & Questions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('keywords')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Keywords & Search Queries</h2>
              <p className="text-sm text-gray-500">SEO keywords, long-tail variations, and consumer questions</p>
            </div>
          </div>
          {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.has('keywords') && (
          <div className="p-6 space-y-6">
            {/* SEO Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Primary SEO Keywords ({submission.seo_keywords?.length || 0})
              </h3>
              <div className="space-y-3">
                {submission.seo_keywords?.map((keyword, index) => 
                  renderReviewableItem(itemStates[`seo_keyword_${index}`] || {
                    id: `seo_keyword_${index}`,
                    content: keyword,
                    approved: false,
                    rejected: false,
                    comment: ''
                  }, true)
                )}
              </div>
            </div>
            
            {/* Long-tail Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Long-tail Keywords ({submission.long_tail_keywords?.length || 0})
              </h3>
              <div className="space-y-3">
                {submission.long_tail_keywords?.map((keyword, index) => 
                  renderReviewableItem(itemStates[`long_tail_${index}`] || {
                    id: `long_tail_${index}`,
                    content: keyword,
                    approved: false,
                    rejected: false,
                    comment: ''
                  }, true)
                )}
              </div>
            </div>
            
            {/* Consumer Questions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Consumer Questions ({submission.consumer_questions?.length || 0})
              </h3>
              <div className="space-y-3">
                {submission.consumer_questions?.map((question, index) => 
                  renderReviewableItem(itemStates[`question_${index}`] || {
                    id: `question_${index}`,
                    content: question,
                    approved: false,
                    rejected: false,
                    comment: ''
                  }, true)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technical SEO Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('technical')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Code className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Technical SEO Elements</h2>
              <p className="text-sm text-gray-500">H1, H2, H3 tags, meta information, and schema markup</p>
            </div>
          </div>
          {expandedSections.has('technical') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.has('technical') && (
          <div className="p-6 space-y-6">
            {/* H1 Tag */}
            {submission.h1_tag && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">H1 Tag</h3>
                {renderReviewableItem(itemStates['h1_tag'] || {
                  id: 'h1_tag',
                  content: submission.h1_tag,
                  approved: false,
                  rejected: false,
                  comment: '',
                  complianceFlag: false
                }, true)}
              </div>
            )}
            
            {/* Meta Title */}
            {submission.meta_title && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Meta Title</h3>
                {renderReviewableItem(itemStates['meta_title'] || {
                  id: 'meta_title',
                  content: submission.meta_title,
                  approved: false,
                  rejected: false,
                  comment: '',
                  complianceFlag: false
                }, true)}
              </div>
            )}
            
            {/* Meta Description */}
            {submission.meta_description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Meta Description</h3>
                {renderReviewableItem(itemStates['meta_description'] || {
                  id: 'meta_description',
                  content: submission.meta_description,
                  approved: false,
                  rejected: false,
                  comment: '',
                  complianceFlag: false
                }, true)}
              </div>
            )}
            
            {/* H2 Tags - Reduced */}
            {submission.h2_tags && submission.h2_tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">H2 Tags ({submission.h2_tags.length})</h3>
                <div className="space-y-3">
                  {submission.h2_tags.map((tag, index) => 
                    renderReviewableItem(itemStates[`h2_tag_${index}`] || {
                      id: `h2_tag_${index}`,
                      content: tag,
                      approved: false,
                      rejected: false,
                      comment: '',
                      complianceFlag: false
                    }, true)
                  )}
                </div>
              </div>
            )}
            
            {/* H3 Tags - Reduced */}
            {submission.h3_tags && submission.h3_tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">H3 Tags ({submission.h3_tags.length})</h3>
                <div className="space-y-3">
                  {submission.h3_tags.map((tag, index) => 
                    renderReviewableItem(itemStates[`h3_tag_${index}`] || {
                      id: `h3_tag_${index}`,
                      content: tag,
                      approved: false,
                      rejected: false,
                      comment: '',
                      complianceFlag: false
                    }, true)
                  )}
                </div>
              </div>
            )}
            
            {/* Schema Markup */}
            {submission.schema_markup && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Schema Markup</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(submission.schema_markup, null, 2)}
                  </pre>
                  <div className="mt-3 flex gap-2">
                    <CTAButton size="sm" variant="secondary" icon={<Copy className="h-3 w-3" />}>
                      Copy Schema
                    </CTAButton>
                    <CTAButton size="sm" variant="secondary" icon={<CheckCircle className="h-3 w-3" />}>
                      Validate
                    </CTAButton>
                  </div>
                </div>
              </div>
            )}
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
          Reject Submission
        </CTAButton>
        <CTAButton
          variant="secondary"
          icon={<MessageSquare className="h-4 w-4" />}
          onClick={() => updateWorkflowStage.mutate({ stage: 'revision_requested' })}
        >
          Request Changes
        </CTAButton>
        <CTAButton
          variant="success"
          icon={<CheckCircle className="h-4 w-4" />}
          onClick={() => updateWorkflowStage.mutate({ stage: 'Client_Review' })}
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
                onClick={() => {
                  updateWorkflowStage.mutate({ stage: 'rejected', reason: rejectionReason })
                  setShowRejectModal(false)
                }}
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